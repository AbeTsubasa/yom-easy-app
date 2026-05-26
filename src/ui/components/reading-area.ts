import { copy } from '../copy/ja';

export interface ReadingAreaOptions {
  initialText: string;
  onTextChange: (text: string) => void;
  /** empty state の「ファイルを開く」CTA から呼ばれる */
  onRequestOpenFile?: () => void;
}

export interface ReadingAreaController {
  element: HTMLElement;
  /** toolbar の DOM 参照。app.ts から TTS コントロール等を slot 的に挿入する */
  toolbar: HTMLElement;
  setText: (text: string) => void;
  /** 編集モード（textarea 表示）に入る / 抜ける */
  setEditing: (editing: boolean) => void;
  focusTextarea: () => void;
}

/**
 * 3状態を持つ読みエリア。
 * - empty: テキストなし → 中央に CTA 2つ
 * - read:  テキストあり、preview 表示、「編集する」ボタン
 * - edit:  textarea 表示、「読みに戻る」ボタン
 *
 * 設計方針：
 * - preview をデフォルトに（設定変更の効果を即座に視認できる）
 * - 編集は明示的なアクションでのみ
 * - innerHTML を使う preview は必ず escapeHtml を通す
 * - aria-live=polite で読みモードの内容変化を SR に通知
 */
export function createReadingArea(opts: ReadingAreaOptions): ReadingAreaController {
  const wrapper = document.createElement('section');
  wrapper.className = 'reading-area';
  wrapper.setAttribute('aria-label', copy.reader.textareaLabel);

  // --- Toolbar (toggle 編集) ---
  const toolbar = document.createElement('div');
  toolbar.className = 'reading-area__toolbar';

  const editToggle = document.createElement('button');
  editToggle.type = 'button';
  editToggle.className = 'reading-area__edit-toggle';

  toolbar.appendChild(editToggle);

  // --- Empty state ---
  const emptyState = document.createElement('div');
  emptyState.className = 'reading-area__empty';
  const emptyTitle = document.createElement('h2');
  emptyTitle.className = 'reading-area__empty-title';
  emptyTitle.textContent = copy.emptyState.title;
  const emptyBody = document.createElement('p');
  emptyBody.className = 'reading-area__empty-body';
  emptyBody.textContent = copy.emptyState.body;
  const emptyActions = document.createElement('div');
  emptyActions.className = 'reading-area__empty-actions';

  const emptyPasteButton = document.createElement('button');
  emptyPasteButton.type = 'button';
  emptyPasteButton.className = 'reading-area__empty-button';
  emptyPasteButton.textContent = copy.emptyState.paste;
  emptyPasteButton.addEventListener('click', () => {
    setEditing(true);
    setTimeout(() => textarea.focus(), 0);
  });

  const emptyOpenButton = document.createElement('button');
  emptyOpenButton.type = 'button';
  emptyOpenButton.className = 'reading-area__empty-button reading-area__empty-button--secondary';
  emptyOpenButton.textContent = copy.emptyState.openFile;
  emptyOpenButton.addEventListener('click', () => {
    opts.onRequestOpenFile?.();
  });

  emptyActions.appendChild(emptyPasteButton);
  emptyActions.appendChild(emptyOpenButton);
  emptyState.appendChild(emptyTitle);
  emptyState.appendChild(emptyBody);
  emptyState.appendChild(emptyActions);

  // --- Textarea (edit) ---
  const textarea = document.createElement('textarea');
  textarea.className = 'reading-area__textarea';
  textarea.setAttribute('aria-label', copy.reader.textareaLabel);
  textarea.placeholder = copy.reader.textareaPlaceholder;
  textarea.spellcheck = false;
  textarea.value = opts.initialText;
  textarea.rows = 14;
  textarea.autocomplete = 'off';

  // --- Preview (read) ---
  const preview = document.createElement('article');
  preview.className = 'reading-area__preview';
  preview.setAttribute('aria-live', 'polite');

  // --- Footer (char count) ---
  const footer = document.createElement('div');
  footer.className = 'reading-area__footer';
  const charCount = document.createElement('p');
  charCount.className = 'reading-area__char-count';
  charCount.setAttribute('aria-live', 'polite');
  footer.appendChild(charCount);

  // --- State ---
  let currentText = opts.initialText;
  /** 編集モード（textarea 表示）。初期は常に false（空 → empty state、非空 → preview） */
  let editing = false;

  const renderEditToggle = (): void => {
    if (editing) {
      editToggle.textContent = copy.editToggle.close;
      editToggle.setAttribute('aria-label', copy.editToggle.closeAria);
      editToggle.dataset.state = 'editing';
    } else {
      editToggle.textContent = copy.editToggle.open;
      editToggle.setAttribute('aria-label', copy.editToggle.openAria);
      editToggle.dataset.state = 'reading';
    }
  };

  const renderPreview = (): void => {
    if (!currentText.trim()) {
      preview.innerHTML = '';
      return;
    }
    const html = currentText
      .split(/\n{2,}/)
      .map((p) => `<p>${nl2br(escapeHtml(p))}</p>`)
      .join('');
    preview.innerHTML = html;
  };

  const updateCharCount = (): void => {
    const n = Array.from(currentText.trim()).length;
    charCount.textContent = copy.reader.charCount(n);
  };

  const renderState = (): void => {
    const isEmpty = !currentText.trim();
    wrapper.dataset.state = isEmpty && !editing ? 'empty' : editing ? 'editing' : 'reading';

    // empty state: テキストなし、編集中でもない
    emptyState.style.display = isEmpty && !editing ? '' : 'none';
    // textarea: 編集中
    textarea.style.display = editing ? '' : 'none';
    // preview: テキストあり、編集中でない
    preview.style.display = !editing && !isEmpty ? '' : 'none';
    // toolbar: empty state でないときに表示
    toolbar.style.display = isEmpty && !editing ? 'none' : '';
    // footer: empty state でないときに表示
    footer.style.display = isEmpty && !editing ? 'none' : '';

    renderEditToggle();
    if (!editing) renderPreview();
    updateCharCount();
  };

  const setEditing = (next: boolean): void => {
    editing = next;
    renderState();
    if (next) {
      setTimeout(() => textarea.focus(), 0);
    }
  };

  editToggle.addEventListener('click', () => setEditing(!editing));

  textarea.addEventListener('input', () => {
    currentText = textarea.value;
    updateCharCount();
    opts.onTextChange(currentText);
  });

  // --- Mount ---
  wrapper.appendChild(toolbar);
  wrapper.appendChild(emptyState);
  wrapper.appendChild(textarea);
  wrapper.appendChild(preview);
  wrapper.appendChild(footer);

  renderState();

  return {
    element: wrapper,
    toolbar,
    setText: (text) => {
      currentText = text;
      textarea.value = text;
      // ファイル読み込み完了などで text がセットされたら、自動的に read モードへ
      editing = false;
      renderState();
    },
    setEditing,
    focusTextarea: () => textarea.focus(),
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function nl2br(s: string): string {
  return s.replace(/\n/g, '<br>');
}

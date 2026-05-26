import { copy } from '../copy/ja';
import type { Token } from '../../modules/morphology';

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
  /**
   * 単語ごとに span 分割した描画モードに切り替える。
   * tokens を渡すと preview を span 分割で再描画、null で通常描画（段落のみ）に戻す。
   * zebra や TTS 同期ハイライトを使うには span 分割が必要。
   */
  setHighlightTokens: (tokens: Token[] | null) => void;
  /**
   * 現在ハイライトする token のインデックス。-1 でハイライト解除。
   * setHighlightTokens で span 描画している必要がある。
   */
  setHighlightIndex: (index: number) => void;
  /** zebra（偶数 token に薄い背景）を有効/無効 */
  setZebraEnabled: (enabled: boolean) => void;
  /** 行ハイライト（段落 hover）を有効/無効 */
  setLineHighlightEnabled: (enabled: boolean) => void;
}

/**
 * 3状態を持つ読みエリア。
 * - empty: テキストなし → 中央に CTA 2つ
 * - read:  テキストあり、preview 表示、「編集する」ボタン
 * - edit:  textarea 表示、「読みに戻る」ボタン
 *
 * Sprint 2 Day 3-4 で、ハイライト対応モードを追加：
 * - setHighlightTokens(tokens) で preview を <span> 分割描画
 * - setHighlightIndex(i) で該当 span にハイライトクラス付与＋scrollIntoView
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
  let editing = false;
  /** ハイライト対応モードのトークン配列。null = 通常描画 */
  let highlightTokens: Token[] | null = null;
  let lineZebraEnabled = false;
  let lineHighlightEnabled = false;

  const updateModifierClasses = (): void => {
    wrapper.classList.toggle('reading-area--line-zebra', lineZebraEnabled);
    wrapper.classList.toggle('reading-area--line-highlight', lineHighlightEnabled);
  };

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
    if (highlightTokens) {
      preview.innerHTML = renderTextWithTokens(currentText, highlightTokens);
    } else {
      const html = currentText
        .split(/\n{2,}/)
        .map((p) => `<p>${nl2br(escapeHtml(p))}</p>`)
        .join('');
      preview.innerHTML = html;
    }
  };

  const updateCharCount = (): void => {
    const n = Array.from(currentText.trim()).length;
    charCount.textContent = copy.reader.charCount(n);
  };

  const renderState = (): void => {
    const isEmpty = !currentText.trim();
    wrapper.dataset.state = isEmpty && !editing ? 'empty' : editing ? 'editing' : 'reading';

    emptyState.style.display = isEmpty && !editing ? '' : 'none';
    textarea.style.display = editing ? '' : 'none';
    preview.style.display = !editing && !isEmpty ? '' : 'none';
    toolbar.style.display = isEmpty && !editing ? 'none' : '';
    footer.style.display = isEmpty && !editing ? 'none' : '';

    renderEditToggle();
    if (!editing) renderPreview();
    updateCharCount();
  };

  const setEditing = (next: boolean): void => {
    editing = next;
    // 編集モードに入る時は、ハイライト状態をクリアする（読み上げ整合性のため）
    if (next && highlightTokens) {
      highlightTokens = null;
    }
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
      editing = false;
      highlightTokens = null; // テキスト差し替え時にハイライト解除
      renderState();
    },
    setEditing,
    focusTextarea: () => textarea.focus(),
    setHighlightTokens: (tokens) => {
      highlightTokens = tokens;
      if (!editing) renderPreview();
    },
    setHighlightIndex: (index) => {
      // 旧ハイライトを解除
      preview.querySelectorAll('.reading-area__token--highlighted').forEach((el) => {
        el.classList.remove('reading-area__token--highlighted');
      });
      if (index < 0) return;
      const el = preview.querySelector<HTMLElement>(
        `.reading-area__token[data-i="${index}"]`,
      );
      if (el) {
        el.classList.add('reading-area__token--highlighted');
        // 画面外に出ていたら中央付近にスクロール
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    },
    setZebraEnabled: (enabled) => {
      // 旧 API 互換：単語 zebra → 行 zebra として動かす
      lineZebraEnabled = enabled;
      updateModifierClasses();
    },
    setLineHighlightEnabled: (enabled) => {
      lineHighlightEnabled = enabled;
      updateModifierClasses();
    },
  };
}

/**
 * text を tokens で span 分割しつつ、段落構造（\n\n）を <p> として保持する。
 * 段落ごとに、その範囲に含まれる tokens だけを span 化する。
 * 行ハイライト（段落 hover）を機能させるため、必ず複数 <p> 構造を維持する。
 */
function renderTextWithTokens(text: string, tokens: Token[]): string {
  // 段落境界を保ったまま分割
  const paragraphs: { charStart: number; text: string }[] = [];
  let pos = 0;
  for (const part of text.split(/(\n{2,})/)) {
    if (/^\n{2,}$/.test(part)) {
      pos += part.length; // 区切り自体は描画しない
    } else if (part.length > 0) {
      paragraphs.push({ charStart: pos, text: part });
      pos += part.length;
    }
  }

  if (tokens.length === 0) {
    return paragraphs.map((p) => `<p>${nl2br(escapeHtml(p.text))}</p>`).join('');
  }

  return paragraphs
    .map((p) => {
      const pStart = p.charStart;
      const pEnd = p.charStart + p.text.length;
      let html = '';
      let cursor = pStart;
      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (t.charEnd <= pStart) continue;
        if (t.charStart >= pEnd) break;
        if (cursor < t.charStart) {
          html += nl2br(escapeHtml(text.slice(cursor, t.charStart)));
        }
        html += `<span class="reading-area__token" data-i="${i}">${nl2br(escapeHtml(t.surface))}</span>`;
        cursor = t.charEnd;
      }
      if (cursor < pEnd) {
        html += nl2br(escapeHtml(text.slice(cursor, pEnd)));
      }
      return `<p>${html}</p>`;
    })
    .join('');
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

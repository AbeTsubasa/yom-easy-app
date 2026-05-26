import { copy } from '../copy/ja';
import type { ViewMode } from '../../types/settings';

export interface ReadingAreaOptions {
  initialText: string;
  initialMode: ViewMode;
  onTextChange: (text: string) => void;
}

export interface ReadingAreaController {
  element: HTMLElement;
  setMode: (mode: ViewMode) => void;
  setText: (text: string) => void;
  focusTextarea: () => void;
}

/**
 * テキスト入力エリア（textarea）と読み表示エリア（div）を1つの section にまとめる。
 * mode に応じて表示を切り替え、edit↔read どちらでも同じテキストを保持する。
 *
 * 設計メモ：
 * - innerHTML を使う箇所では必ず escapeHtml を通す（ユーザー入力をそのまま流さない）
 * - aria-live=polite で読みモードの内容変化をスクリーンリーダーに通知
 * - 段落区切りは「空行（\n\n 以上）」で判定。Sprint 3 で kuromoji を使った段落判定に差し替え可能
 */
export function createReadingArea(opts: ReadingAreaOptions): ReadingAreaController {
  const wrapper = document.createElement('section');
  wrapper.className = 'reading-area';
  wrapper.setAttribute('aria-label', copy.reader.textareaLabel);

  const textarea = document.createElement('textarea');
  textarea.className = 'reading-area__textarea';
  textarea.setAttribute('aria-label', copy.reader.textareaLabel);
  textarea.placeholder = copy.reader.textareaPlaceholder;
  textarea.spellcheck = false;
  textarea.value = opts.initialText;
  textarea.rows = 12;
  textarea.autocomplete = 'off';

  const preview = document.createElement('article');
  preview.className = 'reading-area__preview';
  preview.setAttribute('aria-live', 'polite');

  const charCount = document.createElement('p');
  charCount.className = 'reading-area__char-count';
  charCount.setAttribute('aria-live', 'polite');

  let currentMode: ViewMode = opts.initialMode;
  let currentText = opts.initialText;

  const renderPreview = () => {
    if (!currentText.trim()) {
      preview.innerHTML = `<p class="reading-area__empty">${nl2br(escapeHtml(copy.reader.emptyReadView))}</p>`;
      return;
    }
    const html = currentText
      .split(/\n{2,}/)
      .map((p) => `<p>${nl2br(escapeHtml(p))}</p>`)
      .join('');
    preview.innerHTML = html;
  };

  const updateCharCount = () => {
    const n = Array.from(currentText.trim()).length;
    charCount.textContent = copy.reader.charCount(n);
  };

  const applyMode = (mode: ViewMode) => {
    currentMode = mode;
    wrapper.dataset.mode = mode;
    if (mode === 'edit') {
      textarea.style.display = '';
      preview.style.display = 'none';
    } else {
      textarea.style.display = 'none';
      preview.style.display = '';
      renderPreview();
    }
  };

  textarea.addEventListener('input', () => {
    currentText = textarea.value;
    updateCharCount();
    opts.onTextChange(currentText);
  });

  wrapper.appendChild(textarea);
  wrapper.appendChild(preview);
  wrapper.appendChild(charCount);

  applyMode(opts.initialMode);
  updateCharCount();

  return {
    element: wrapper,
    setMode: applyMode,
    setText: (text: string) => {
      currentText = text;
      textarea.value = text;
      updateCharCount();
      if (currentMode === 'read') {
        renderPreview();
      }
    },
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

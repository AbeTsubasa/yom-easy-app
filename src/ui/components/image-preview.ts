import { copy } from '../copy/ja';
import { createFocusTrap, type FocusTrapHandle } from '../../modules/focus-trap';

export interface ImagePreviewOptions {
  /** 表示する画像の Object URL */
  objectURL: string;
  /** 「文字を読み取る」ボタン押下時 */
  onRecognize: () => void;
  /** 「撮り直し」ボタン押下時 */
  onRetake: () => void;
  /** モーダルを閉じる（✕ / Esc / 背景クリック） */
  onClose: () => void;
  /** 「キャンセル」ボタン押下時（processing 中だけ表示される） */
  onCancel?: () => void;
}

export interface ImagePreviewController {
  element: HTMLElement;
  /** OCR 実行中の状態。true で recognize ボタンが「キャンセル」になり、進捗バー表示 */
  setProcessing: (processing: boolean) => void;
  /** 進捗の更新（processing 中のみ意味あり）。pct は 0.0–1.0 */
  setProgress: (status: string, pct: number) => void;
}

/**
 * 撮影/選択した画像のプレビューモーダル。
 *
 * 状態：
 * - 通常：[撮り直す] [文字を読み取る]
 * - processing：[キャンセル]（recognize ボタンが置き換わる）＋ 進捗バー表示
 *
 * 画像はサーバーに送らず、Object URL でローカル表示のみ。
 */
export function createImagePreview(opts: ImagePreviewOptions): ImagePreviewController {
  const overlay = document.createElement('div');
  overlay.className = 'image-preview';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'image-preview-title');

  const card = document.createElement('div');
  card.className = 'image-preview__card';

  const titleEl = document.createElement('h2');
  titleEl.id = 'image-preview-title';
  titleEl.className = 'image-preview__title';
  titleEl.textContent = copy.imagePreview.title;

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'image-preview__close';
  closeButton.textContent = copy.drawer.closeLabel;
  closeButton.setAttribute('aria-label', copy.drawer.closeAria);
  closeButton.addEventListener('click', () => opts.onClose());

  const img = document.createElement('img');
  img.className = 'image-preview__image';
  img.src = opts.objectURL;
  img.alt = copy.imagePreview.imageAlt;

  const hint = document.createElement('p');
  hint.className = 'image-preview__hint';
  hint.textContent = copy.imagePreview.hint;

  // --- Progress (hidden until processing) ---
  const progressWrap = document.createElement('div');
  progressWrap.className = 'image-preview__progress';
  progressWrap.hidden = true;
  progressWrap.setAttribute('role', 'status');
  progressWrap.setAttribute('aria-live', 'polite');

  const progressStatus = document.createElement('p');
  progressStatus.className = 'image-preview__progress-status';
  progressStatus.textContent = copy.ocr.initializing;

  const progressBar = document.createElement('div');
  progressBar.className = 'image-preview__progress-bar';
  progressBar.setAttribute('role', 'progressbar');
  progressBar.setAttribute('aria-valuemin', '0');
  progressBar.setAttribute('aria-valuemax', '100');
  progressBar.setAttribute('aria-valuenow', '0');

  const progressFill = document.createElement('div');
  progressFill.className = 'image-preview__progress-fill';
  progressFill.style.width = '0%';
  progressBar.appendChild(progressFill);

  progressWrap.appendChild(progressStatus);
  progressWrap.appendChild(progressBar);

  // --- Actions ---
  const actions = document.createElement('div');
  actions.className = 'image-preview__actions';

  const retakeButton = document.createElement('button');
  retakeButton.type = 'button';
  retakeButton.className = 'image-preview__button image-preview__button--secondary';
  retakeButton.textContent = copy.imagePreview.retake;
  retakeButton.addEventListener('click', () => opts.onRetake());

  const recognizeButton = document.createElement('button');
  recognizeButton.type = 'button';
  recognizeButton.className = 'image-preview__button image-preview__button--primary';
  recognizeButton.textContent = copy.imagePreview.recognize;
  recognizeButton.addEventListener('click', () => opts.onRecognize());

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'image-preview__button image-preview__button--secondary';
  cancelButton.textContent = copy.imagePreview.cancel;
  cancelButton.setAttribute('aria-label', copy.imagePreview.cancelAria);
  cancelButton.addEventListener('click', () => opts.onCancel?.());

  actions.appendChild(retakeButton);
  actions.appendChild(recognizeButton);
  // cancelButton はデフォルト非表示、setProcessing(true) で挿入

  card.appendChild(closeButton);
  card.appendChild(titleEl);
  card.appendChild(img);
  card.appendChild(hint);
  card.appendChild(progressWrap);
  card.appendChild(actions);
  overlay.appendChild(card);

  // Esc / 背景クリックで閉じる
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) opts.onClose();
  });
  const onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') opts.onClose();
  };
  document.addEventListener('keydown', onKeyDown);

  // フォーカストラップ。初期フォーカスは「文字を読み取る」ボタン（主要アクション）に。
  // 閉じる ✕ ではなく、ユーザーが期待する操作にカーソルを置く。
  let trap: FocusTrapHandle | null = null;
  const observer = new MutationObserver(() => {
    if (overlay.isConnected) {
      if (!trap) {
        trap = createFocusTrap({
          container: overlay,
          initialFocus: recognizeButton,
        });
      }
    } else {
      document.removeEventListener('keydown', onKeyDown);
      if (trap) {
        trap.detach();
        trap = null;
      }
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  let processing = false;

  const setProcessing = (next: boolean): void => {
    processing = next;
    if (next) {
      progressWrap.hidden = false;
      // recognize → cancel に差し替え
      actions.innerHTML = '';
      actions.appendChild(cancelButton);
    } else {
      progressWrap.hidden = true;
      progressFill.style.width = '0%';
      progressBar.setAttribute('aria-valuenow', '0');
      progressStatus.textContent = copy.ocr.initializing;
      // 通常ボタンに戻す
      actions.innerHTML = '';
      actions.appendChild(retakeButton);
      actions.appendChild(recognizeButton);
    }
    // 閉じるボタンも processing 中は無効化（中断は cancel ボタンで）
    closeButton.disabled = next;
  };

  /** Tesseract.js / 前処理 のステータス文字列を、ユーザー向けの日本語に翻訳する */
  const translateStatus = (raw: string): string => {
    const lower = raw.toLowerCase();
    if (lower.includes('preprocess')) return copy.ocr.preprocessing;
    if (lower.includes('loading')) return copy.ocr.loadingModel;
    if (lower.includes('initializing')) return copy.ocr.initializing;
    if (lower.includes('recognizing')) return copy.ocr.recognizing;
    return copy.ocr.statusFallback;
  };

  const setProgress = (status: string, pct: number): void => {
    if (!processing) return;
    progressStatus.textContent = translateStatus(status);
    const clamped = Math.max(0, Math.min(1, pct));
    const percentInt = Math.round(clamped * 100);
    progressFill.style.width = `${percentInt}%`;
    progressBar.setAttribute('aria-valuenow', String(percentInt));
  };

  return {
    element: overlay,
    setProcessing,
    setProgress,
  };
}

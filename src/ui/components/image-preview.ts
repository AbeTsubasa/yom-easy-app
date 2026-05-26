import { copy } from '../copy/ja';

export interface ImagePreviewOptions {
  /** 表示する画像の Object URL */
  objectURL: string;
  /** 「文字を読み取る」ボタン押下時 */
  onRecognize: () => void;
  /** 「撮り直し」ボタン押下時 */
  onRetake: () => void;
  /** モーダルを閉じる（✕ / Esc / 背景クリック） */
  onClose: () => void;
}

export interface ImagePreviewController {
  element: HTMLElement;
  /** OCR 実行中の状態を反映（ボタンを無効化、進捗表示など） */
  setProcessing: (processing: boolean) => void;
}

/**
 * 撮影/選択した画像のプレビューモーダル。
 * - 画像を中央に表示
 * - 「撮り直し」「文字を読み取る」「✕（閉じる）」
 * - 画像はサーバーに送らず、Object URL でローカル表示のみ
 *
 * Day 1-2 では「文字を読み取る」は placeholder（実 OCR は Day 3-4）
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

  actions.appendChild(retakeButton);
  actions.appendChild(recognizeButton);

  card.appendChild(closeButton);
  card.appendChild(titleEl);
  card.appendChild(img);
  card.appendChild(hint);
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
  // overlay が remove されるときにリスナー解除（呼び出し側で remove を呼ぶ）
  const observer = new MutationObserver(() => {
    if (!overlay.isConnected) {
      document.removeEventListener('keydown', onKeyDown);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  return {
    element: overlay,
    setProcessing: (processing) => {
      retakeButton.disabled = processing;
      recognizeButton.disabled = processing;
      recognizeButton.textContent = processing
        ? copy.imagePreview.recognizing
        : copy.imagePreview.recognize;
    },
  };
}

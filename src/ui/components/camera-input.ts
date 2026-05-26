import { copy } from '../copy/ja';
import { ACCEPT_IMAGE_ATTR } from '../../modules/image-loader';

export interface CameraInputOptions {
  onImageSelected: (file: File) => void;
}

/**
 * 「📷 カメラで撮影」ボタン。
 * - スマホ：背面カメラを起動（capture="environment"）
 * - PC：通常のファイル選択ダイアログが開く
 *
 * label + 視覚的に隠した input でクリックを誘導。
 * 既存の file-input と同じパターン。
 */
export function createCameraInput(opts: CameraInputOptions): HTMLElement {
  const container = document.createElement('div');
  container.className = 'camera-input';

  const inputId = 'camera-input-control';
  const input = document.createElement('input');
  input.type = 'file';
  input.id = inputId;
  input.accept = ACCEPT_IMAGE_ATTR;
  // スマホで背面カメラを起動。PC では無視される
  input.setAttribute('capture', 'environment');
  input.className = 'camera-input__native';

  const label = document.createElement('label');
  label.htmlFor = inputId;
  label.className = 'camera-input__button';
  label.setAttribute('aria-label', copy.actions.captureAria);
  label.textContent = copy.actions.capture;

  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (file) {
      opts.onImageSelected(file);
      input.value = ''; // 同じファイルを再選択しても change が発火するように
    }
  });

  container.appendChild(input);
  container.appendChild(label);
  return container;
}

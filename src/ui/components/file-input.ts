import { copy } from '../copy/ja';
import { ACCEPT_ATTR } from '../../modules/file-loader';

export interface FileInputOptions {
  onFileSelected: (file: File) => void;
}

/**
 * ファイル選択ボタン（クリック / Enter キーで開く）。
 * D&D は画面全体で受け付ける別仕掛けを app.ts に置く。
 *
 * label と input を組み合わせて、CSS で input を視覚的に隠す（DOM 上は残す）方式。
 * これにより a11y のラベリングを保ったまま、見た目をボタンとしてカスタマイズできる。
 */
export function createFileInput(opts: FileInputOptions): HTMLElement {
  const container = document.createElement('div');
  container.className = 'file-input';

  const inputId = 'file-input-control';
  const input = document.createElement('input');
  input.type = 'file';
  input.id = inputId;
  input.accept = ACCEPT_ATTR;
  input.className = 'file-input__native';

  const label = document.createElement('label');
  label.htmlFor = inputId;
  label.className = 'file-input__button';
  label.setAttribute('aria-label', copy.actions.openFileAria);
  label.textContent = copy.actions.openFile;

  const hint = document.createElement('p');
  hint.className = 'file-input__hint';
  hint.textContent = copy.hints.acceptedTypes;

  input.addEventListener('change', () => {
    const file = input.files?.[0];
    if (file) {
      opts.onFileSelected(file);
      input.value = ''; // 同じファイルを再選択しても change が発火するように
    }
  });

  container.appendChild(input);
  container.appendChild(label);
  container.appendChild(hint);
  return container;
}

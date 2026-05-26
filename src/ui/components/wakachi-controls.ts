import { copy } from '../copy/ja';

export interface WakachiControlsOptions {
  initial: boolean;
  onChange: (enabled: boolean) => void;
}

export interface WakachiControlsController {
  element: HTMLElement;
  setEnabled: (enabled: boolean) => void;
}

/**
 * 分かち書き ON/OFF トグル。
 * 設定パネルの「分かち書き」（7つ目の親 accordion）内に置く。
 * 初回 ON で kuromoji 初期化が走る（ふりがなと共有なので再利用可）。
 */
export function createWakachiControls(opts: WakachiControlsOptions): WakachiControlsController {
  const wrapper = document.createElement('div');
  wrapper.className = 'wakachi-controls';

  const intro = document.createElement('p');
  intro.className = 'wakachi-controls__intro';
  intro.textContent = copy.settings.wakachiHint;
  wrapper.appendChild(intro);

  const field = document.createElement('div');
  field.className = 'wakachi-controls__field';

  const labelEl = document.createElement('label');
  labelEl.className = 'wakachi-controls__toggle';
  labelEl.htmlFor = 'toggle-wakachi';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = 'toggle-wakachi';
  input.className = 'wakachi-controls__checkbox';
  input.checked = opts.initial;
  input.addEventListener('change', () => opts.onChange(input.checked));

  const text = document.createElement('span');
  text.className = 'wakachi-controls__toggle-label';
  text.textContent = copy.settings.wakachiEnableLabel;

  labelEl.appendChild(input);
  labelEl.appendChild(text);
  field.appendChild(labelEl);
  wrapper.appendChild(field);

  return {
    element: wrapper,
    setEnabled: (enabled) => {
      input.checked = enabled;
    },
  };
}

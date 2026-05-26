import { copy } from '../copy/ja';

export interface RubyControlsOptions {
  initial: boolean;
  onChange: (enabled: boolean) => void;
}

export interface RubyControlsController {
  element: HTMLElement;
  setEnabled: (enabled: boolean) => void;
}

/**
 * ふりがな（ルビ）ON/OFF トグル。
 * 設定パネルの5つ目の親 accordion「ふりがな」内に置く。
 * 初回 ON で kuroshiro 初期化が走る（数秒）。
 */
export function createRubyControls(opts: RubyControlsOptions): RubyControlsController {
  const wrapper = document.createElement('div');
  wrapper.className = 'ruby-controls';

  const intro = document.createElement('p');
  intro.className = 'ruby-controls__intro';
  intro.textContent = copy.settings.rubyHint;
  wrapper.appendChild(intro);

  const field = document.createElement('div');
  field.className = 'ruby-controls__field';

  const labelEl = document.createElement('label');
  labelEl.className = 'ruby-controls__toggle';
  labelEl.htmlFor = 'toggle-ruby';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = 'toggle-ruby';
  input.className = 'ruby-controls__checkbox';
  input.checked = opts.initial;
  input.addEventListener('change', () => opts.onChange(input.checked));

  const text = document.createElement('span');
  text.className = 'ruby-controls__toggle-label';
  text.textContent = copy.settings.rubyEnableLabel;

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

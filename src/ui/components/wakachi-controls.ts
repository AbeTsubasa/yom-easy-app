import { copy } from '../copy/ja';

export interface WakachiControlsOptions {
  initial: boolean;
  initialChunked: boolean;
  onChange: (enabled: boolean) => void;
  onChunkedChange: (enabled: boolean) => void;
}

export interface WakachiControlsController {
  element: HTMLElement;
  setEnabled: (enabled: boolean) => void;
  setChunked: (enabled: boolean) => void;
}

/**
 * 分かち書き＋文節改行のトグル群。
 *
 * 同じ accordion（settings-panel の「分かち書き・文節改行」）内に並ぶ。
 * 両方とも kuromoji を必要とするため、どちらかが初めて ON になったときに
 * 形態素解析エンジンの初期化が走る（ふりがなと共有なので再利用可）。
 *
 * 文節改行は接続助詞・接続詞・句読点の後で目に見える改行を入れる機能。
 * Tate, Collins & Williamson (2019) で chunked text の効果が示されている。
 */
export function createWakachiControls(opts: WakachiControlsOptions): WakachiControlsController {
  const wrapper = document.createElement('div');
  wrapper.className = 'wakachi-controls';

  const intro = document.createElement('p');
  intro.className = 'wakachi-controls__intro';
  intro.textContent = copy.settings.wakachiHint;
  wrapper.appendChild(intro);

  // 分かち書きトグル
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

  // 文節改行トグル（Sprint 7）
  const chunkedIntro = document.createElement('p');
  chunkedIntro.className = 'wakachi-controls__sub-hint';
  chunkedIntro.textContent = copy.settings.chunkedHint;
  wrapper.appendChild(chunkedIntro);

  const chunkedField = document.createElement('div');
  chunkedField.className = 'wakachi-controls__field';

  const chunkedLabel = document.createElement('label');
  chunkedLabel.className = 'wakachi-controls__toggle';
  chunkedLabel.htmlFor = 'toggle-chunked';

  const chunkedInput = document.createElement('input');
  chunkedInput.type = 'checkbox';
  chunkedInput.id = 'toggle-chunked';
  chunkedInput.className = 'wakachi-controls__checkbox';
  chunkedInput.checked = opts.initialChunked;
  chunkedInput.addEventListener('change', () =>
    opts.onChunkedChange(chunkedInput.checked),
  );

  const chunkedText = document.createElement('span');
  chunkedText.className = 'wakachi-controls__toggle-label';
  chunkedText.textContent = copy.settings.chunkedEnableLabel;

  chunkedLabel.appendChild(chunkedInput);
  chunkedLabel.appendChild(chunkedText);
  chunkedField.appendChild(chunkedLabel);
  wrapper.appendChild(chunkedField);

  return {
    element: wrapper,
    setEnabled: (enabled) => {
      input.checked = enabled;
    },
    setChunked: (enabled) => {
      chunkedInput.checked = enabled;
    },
  };
}

export interface RangeControlOptions {
  /** input 要素の id（label と関連付けるため、画面内でユニークに） */
  id: string;
  /** ラベルに表示する説明（ユーザー向け、優しい日本語で） */
  label: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  /** 現在値の表示書式。省略時は `${n}${unit}` */
  unit?: string;
  formatValue?: (n: number) => string;
  onChange: (value: number) => void;
}

export interface RangeControlController {
  element: HTMLElement;
  setValue: (value: number) => void;
}

/**
 * 汎用スライダー。
 * - ラベル＋現在値（aria-live で読み上げ）＋ input[type=range]
 * - Day 4 では4つ（文字サイズ・字間・行間・語間）に使う
 * - Day 5 以降の数値設定（行幅・段落間など）にも転用可能
 */
export function createRangeControl(opts: RangeControlOptions): RangeControlController {
  const wrapper = document.createElement('div');
  wrapper.className = 'range-control';

  const labelRow = document.createElement('div');
  labelRow.className = 'range-control__label-row';

  const labelEl = document.createElement('label');
  labelEl.className = 'range-control__label';
  labelEl.htmlFor = opts.id;
  labelEl.textContent = opts.label;

  const valueEl = document.createElement('span');
  valueEl.className = 'range-control__value';
  valueEl.setAttribute('aria-live', 'polite');
  valueEl.setAttribute('aria-atomic', 'true');

  const formatter = opts.formatValue ?? ((n: number) => `${n}${opts.unit ?? ''}`);
  const updateValueDisplay = (n: number): void => {
    valueEl.textContent = formatter(n);
  };

  labelRow.appendChild(labelEl);
  labelRow.appendChild(valueEl);

  const input = document.createElement('input');
  input.type = 'range';
  input.id = opts.id;
  input.className = 'range-control__input';
  input.min = String(opts.min);
  input.max = String(opts.max);
  input.step = String(opts.step);
  input.value = String(opts.initial);

  input.addEventListener('input', () => {
    const value = Number(input.value);
    updateValueDisplay(value);
    opts.onChange(value);
  });

  wrapper.appendChild(labelRow);
  wrapper.appendChild(input);

  updateValueDisplay(opts.initial);

  return {
    element: wrapper,
    setValue: (value: number) => {
      input.value = String(value);
      updateValueDisplay(value);
    },
  };
}

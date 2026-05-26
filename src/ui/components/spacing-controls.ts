import { copy } from '../copy/ja';
import { createRangeControl } from './range-control';

export interface SpacingControlsOptions {
  initial: {
    fontSize: number;
    letterSpacing: number;
    lineHeight: number;
    wordSpacing: number;
  };
  onChange: {
    fontSize: (value: number) => void;
    letterSpacing: (value: number) => void;
    lineHeight: (value: number) => void;
    wordSpacing: (value: number) => void;
  };
}

export interface SpacingControlsController {
  element: HTMLElement;
  setFontSize: (value: number) => void;
  setLetterSpacing: (value: number) => void;
  setLineHeight: (value: number) => void;
  setWordSpacing: (value: number) => void;
}

/**
 * 文字サイズ・字間・行間・語間の4スライダーをまとめる。
 *
 * 範囲・stepはFT_MVP仕様準拠：
 * - fontSize     14–32px   step 1
 * - letterSpacing 0–0.25em step 0.01
 * - lineHeight   1.2–2.0   step 0.1
 * - wordSpacing  0–0.5em   step 0.01
 *
 * デフォルト値はWCAG 2.1 AAA相当（DEFAULT_SETTINGS / CSS 変数初期値）。
 */
export function createSpacingControls(opts: SpacingControlsOptions): SpacingControlsController {
  const wrapper = document.createElement('div');
  wrapper.className = 'spacing-controls';

  const heading = document.createElement('h3');
  heading.className = 'spacing-controls__heading';
  heading.textContent = copy.settings.spacingHeading;
  wrapper.appendChild(heading);

  const hint = document.createElement('p');
  hint.className = 'spacing-controls__hint';
  hint.textContent = copy.settings.spacingHint;
  wrapper.appendChild(hint);

  const fontSize = createRangeControl({
    id: 'slider-font-size',
    label: copy.settings.fontSizeLabel,
    min: 14,
    max: 32,
    step: 1,
    initial: opts.initial.fontSize,
    unit: 'px',
    onChange: opts.onChange.fontSize,
  });

  const letterSpacing = createRangeControl({
    id: 'slider-letter-spacing',
    label: copy.settings.letterSpacingLabel,
    min: 0,
    max: 0.25,
    step: 0.01,
    initial: opts.initial.letterSpacing,
    formatValue: (n) => `${n.toFixed(2)} em`,
    onChange: opts.onChange.letterSpacing,
  });

  const lineHeight = createRangeControl({
    id: 'slider-line-height',
    label: copy.settings.lineHeightLabel,
    min: 1.2,
    max: 2.0,
    step: 0.1,
    initial: opts.initial.lineHeight,
    formatValue: (n) => n.toFixed(1),
    onChange: opts.onChange.lineHeight,
  });

  const wordSpacing = createRangeControl({
    id: 'slider-word-spacing',
    label: copy.settings.wordSpacingLabel,
    min: 0,
    max: 0.5,
    step: 0.01,
    initial: opts.initial.wordSpacing,
    formatValue: (n) => `${n.toFixed(2)} em`,
    onChange: opts.onChange.wordSpacing,
  });

  wrapper.appendChild(fontSize.element);
  wrapper.appendChild(letterSpacing.element);
  wrapper.appendChild(lineHeight.element);
  wrapper.appendChild(wordSpacing.element);

  return {
    element: wrapper,
    setFontSize: fontSize.setValue,
    setLetterSpacing: letterSpacing.setValue,
    setLineHeight: lineHeight.setValue,
    setWordSpacing: wordSpacing.setValue,
  };
}

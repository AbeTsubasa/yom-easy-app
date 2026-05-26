import { copy } from '../copy/ja';
import { THEME_PRESETS, THEME_MAP, type ThemePreset } from '../../modules/theme-registry';
import type { ThemeKey } from '../../types/settings';

export interface ColorControlsOptions {
  initial: {
    theme: ThemeKey;
    customBg: string | null;
    customText: string | null;
  };
  onPresetChange: (key: ThemeKey) => void;
  onCustomBgChange: (color: string) => void;
  onCustomTextChange: (color: string) => void;
  onResetCustom: () => void;
}

export interface ColorControlsController {
  element: HTMLElement;
  setPreset: (key: ThemeKey) => void;
  setCustomBg: (color: string) => void;
  setCustomText: (color: string) => void;
}

/**
 * 色テーマ選択 UI。
 * - 6プリセット：色見本ボタン（背景色 + 文字色 + 「あ」のプレビュー）
 * - 自由カラーピッカー：背景色と文字色を input[type=color] で個別指定
 * - 「プリセットに戻す」ボタンで自由ピッカーをリセット
 */
export function createColorControls(opts: ColorControlsOptions): ColorControlsController {
  const wrapper = document.createElement('div');
  wrapper.className = 'color-controls';

  const heading = document.createElement('h3');
  heading.className = 'color-controls__heading';
  heading.textContent = copy.settings.colorHeading;
  wrapper.appendChild(heading);

  const hint = document.createElement('p');
  hint.className = 'color-controls__hint';
  hint.textContent = copy.settings.colorHint;
  wrapper.appendChild(hint);

  // === プリセット選択 ===
  const presetGroup = document.createElement('div');
  presetGroup.className = 'color-controls__preset-group';
  presetGroup.setAttribute('role', 'radiogroup');
  presetGroup.setAttribute('aria-label', copy.settings.colorHeading);

  let currentKey: ThemeKey = opts.initial.theme;
  const buttons: HTMLButtonElement[] = [];

  THEME_PRESETS.forEach((preset) => {
    const button = makePresetButton(preset);
    button.addEventListener('click', () => selectPreset(preset.key));
    presetGroup.appendChild(button);
    buttons.push(button);
  });

  presetGroup.addEventListener('keydown', (e) => {
    const isPrev = e.key === 'ArrowUp' || e.key === 'ArrowLeft';
    const isNext = e.key === 'ArrowDown' || e.key === 'ArrowRight';
    if (!isPrev && !isNext) return;
    const activeIdx = buttons.findIndex((b) => b.getAttribute('aria-checked') === 'true');
    if (activeIdx === -1) return;
    e.preventDefault();
    const delta = isPrev ? -1 : 1;
    const nextIdx = (activeIdx + delta + buttons.length) % buttons.length;
    const nextKey = buttons[nextIdx].dataset.key as ThemeKey;
    selectPreset(nextKey);
    buttons[nextIdx].focus();
  });

  wrapper.appendChild(presetGroup);

  function selectPreset(key: ThemeKey): void {
    if (key === currentKey) return;
    currentKey = key;
    applyPresetState();
    opts.onPresetChange(key);
    // プリセット選択時は、自由ピッカーの値もそのプリセットに揃える
    const preset = THEME_MAP[key];
    bgInput.value = preset.bg;
    textInput.value = preset.text;
  }

  function applyPresetState(): void {
    buttons.forEach((btn) => {
      const isActive = btn.dataset.key === currentKey;
      btn.setAttribute('aria-checked', String(isActive));
      btn.classList.toggle('color-controls__preset--active', isActive);
      btn.tabIndex = isActive ? 0 : -1;
    });
  }

  // === 自由カラーピッカー ===
  const customHeading = document.createElement('h4');
  customHeading.className = 'color-controls__custom-heading';
  customHeading.textContent = copy.settings.customColorHeading;
  wrapper.appendChild(customHeading);

  const customHint = document.createElement('p');
  customHint.className = 'color-controls__custom-hint';
  customHint.textContent = copy.settings.customColorHint;
  wrapper.appendChild(customHint);

  const customRow = document.createElement('div');
  customRow.className = 'color-controls__custom-row';

  const initialBg = opts.initial.customBg ?? THEME_MAP[opts.initial.theme].bg;
  const initialText = opts.initial.customText ?? THEME_MAP[opts.initial.theme].text;

  const { wrap: bgWrap, input: bgInput } = makeColorInput(
    'custom-bg',
    copy.settings.bgColorLabel,
    initialBg,
  );
  bgInput.addEventListener('input', () => opts.onCustomBgChange(bgInput.value));

  const { wrap: textWrap, input: textInput } = makeColorInput(
    'custom-text',
    copy.settings.textColorLabel,
    initialText,
  );
  textInput.addEventListener('input', () => opts.onCustomTextChange(textInput.value));

  customRow.appendChild(bgWrap);
  customRow.appendChild(textWrap);
  wrapper.appendChild(customRow);

  const resetButton = document.createElement('button');
  resetButton.type = 'button';
  resetButton.className = 'color-controls__reset';
  resetButton.textContent = copy.settings.resetToPreset;
  resetButton.addEventListener('click', () => {
    opts.onResetCustom();
    const preset = THEME_MAP[currentKey];
    bgInput.value = preset.bg;
    textInput.value = preset.text;
  });
  wrapper.appendChild(resetButton);

  applyPresetState();

  return {
    element: wrapper,
    setPreset: (key) => {
      currentKey = key;
      applyPresetState();
    },
    setCustomBg: (color) => {
      bgInput.value = color;
    },
    setCustomText: (color) => {
      textInput.value = color;
    },
  };
}

function makePresetButton(preset: ThemePreset): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'color-controls__preset';
  button.setAttribute('role', 'radio');
  button.setAttribute('aria-label', `${preset.label} — ${preset.description}`);
  button.dataset.key = preset.key;

  const swatch = document.createElement('span');
  swatch.className = 'color-controls__swatch';
  swatch.style.backgroundColor = preset.bg;
  swatch.style.color = preset.text;
  swatch.textContent = 'あ';
  swatch.setAttribute('aria-hidden', 'true');

  const labelEl = document.createElement('span');
  labelEl.className = 'color-controls__preset-label';
  labelEl.textContent = preset.label;

  button.appendChild(swatch);
  button.appendChild(labelEl);
  return button;
}

function makeColorInput(
  id: string,
  labelText: string,
  initial: string,
): { wrap: HTMLElement; input: HTMLInputElement } {
  const wrap = document.createElement('div');
  wrap.className = 'color-controls__custom-input';

  const label = document.createElement('label');
  label.className = 'color-controls__custom-label';
  label.htmlFor = id;
  label.textContent = labelText;

  const input = document.createElement('input');
  input.type = 'color';
  input.id = id;
  input.value = initial;
  input.className = 'color-controls__color-input';

  wrap.appendChild(label);
  wrap.appendChild(input);
  return { wrap, input };
}

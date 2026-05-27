import { copy } from '../copy/ja';
import type { LineMode, HighlightColorKey } from '../../types/settings';
import {
  HIGHLIGHT_COLOR_PRESETS,
  type HighlightColorPreset,
} from '../../modules/highlight-color-registry';

export interface HighlightControlsOptions {
  initialMode: LineMode;
  initialColor: HighlightColorKey;
  initialFocusMode: boolean;
  onModeChange: (mode: LineMode) => void;
  onColorChange: (color: HighlightColorKey) => void;
  onFocusModeChange: (enabled: boolean) => void;
}

export interface HighlightControlsController {
  element: HTMLElement;
  setMode: (mode: LineMode) => void;
  setColor: (color: HighlightColorKey) => void;
  setFocusMode: (enabled: boolean) => void;
}

/**
 * 行ハイライト設定。2つのラジオグループ：
 * 1. モード（off / zebra / flat）
 * 2. 色（7プリセット、見本付き）
 *
 * 設計：
 * - 個人差が大きいので、どちらも選べる
 * - 各色の hint で研究的位置づけを正直に伝える
 * - 「正解はない」を明示
 */
export function createHighlightControls(
  opts: HighlightControlsOptions,
): HighlightControlsController {
  const wrapper = document.createElement('div');
  wrapper.className = 'highlight-controls';

  // --- Mode intro ---
  const intro = document.createElement('p');
  intro.className = 'highlight-controls__intro';
  intro.textContent = copy.settings.highlightHint;
  wrapper.appendChild(intro);

  // --- Mode radio group ---
  const modeGroup = document.createElement('div');
  modeGroup.className = 'highlight-controls__radio-group';
  modeGroup.setAttribute('role', 'radiogroup');
  modeGroup.setAttribute('aria-label', copy.settings.highlightHeading);

  const modeFields: Record<LineMode, ReturnType<typeof makeModeOption>> = {
    off: makeModeOption({
      value: 'off',
      label: copy.settings.lineModeOffLabel,
      hint: copy.settings.lineModeOffHint,
    }),
    zebra: makeModeOption({
      value: 'zebra',
      label: copy.settings.lineModeZebraLabel,
      hint: copy.settings.lineModeZebraHint,
    }),
    flat: makeModeOption({
      value: 'flat',
      label: copy.settings.lineModeFlatLabel,
      hint: copy.settings.lineModeFlatHint,
    }),
  };

  let currentMode: LineMode = opts.initialMode;
  const applyModeState = (): void => {
    (Object.entries(modeFields) as [LineMode, ReturnType<typeof makeModeOption>][]).forEach(
      ([mode, field]) => {
        const isActive = mode === currentMode;
        field.input.checked = isActive;
        field.input.tabIndex = isActive ? 0 : -1;
        field.root.classList.toggle('highlight-controls__option--active', isActive);
      },
    );
  };
  const selectMode = (mode: LineMode): void => {
    if (mode === currentMode) return;
    currentMode = mode;
    applyModeState();
    opts.onModeChange(mode);
  };

  (['off', 'zebra', 'flat'] as const).forEach((mode) => {
    const field = modeFields[mode];
    field.input.addEventListener('change', () => {
      if (field.input.checked) selectMode(mode);
    });
    modeGroup.appendChild(field.root);
  });

  const modeOrder: LineMode[] = ['off', 'zebra', 'flat'];
  modeGroup.addEventListener('keydown', (e) => {
    const isPrev = e.key === 'ArrowUp' || e.key === 'ArrowLeft';
    const isNext = e.key === 'ArrowDown' || e.key === 'ArrowRight';
    if (!isPrev && !isNext) return;
    e.preventDefault();
    const idx = modeOrder.indexOf(currentMode);
    const delta = isPrev ? -1 : 1;
    const next = modeOrder[(idx + delta + modeOrder.length) % modeOrder.length];
    selectMode(next);
    modeFields[next].input.focus();
  });

  wrapper.appendChild(modeGroup);

  // --- Color selection ---
  const colorSection = document.createElement('div');
  colorSection.className = 'highlight-controls__color-section';

  const colorHeading = document.createElement('h4');
  colorHeading.className = 'highlight-controls__color-heading';
  colorHeading.textContent = copy.settings.highlightColorHeading;

  const colorHint = document.createElement('p');
  colorHint.className = 'highlight-controls__color-hint';
  colorHint.textContent = copy.settings.highlightColorHint;

  const colorGroup = document.createElement('div');
  colorGroup.className = 'highlight-controls__color-group';
  colorGroup.setAttribute('role', 'radiogroup');
  colorGroup.setAttribute('aria-label', copy.settings.highlightColorHeading);

  const colorFields: Map<HighlightColorKey, ReturnType<typeof makeColorOption>> = new Map();
  let currentColor: HighlightColorKey = opts.initialColor;

  const applyColorState = (): void => {
    colorFields.forEach((field, key) => {
      const isActive = key === currentColor;
      field.input.checked = isActive;
      field.input.tabIndex = isActive ? 0 : -1;
      field.root.classList.toggle('highlight-controls__color-option--active', isActive);
    });
  };

  const selectColor = (key: HighlightColorKey): void => {
    if (key === currentColor) return;
    currentColor = key;
    applyColorState();
    opts.onColorChange(key);
  };

  HIGHLIGHT_COLOR_PRESETS.forEach((preset) => {
    const field = makeColorOption(preset);
    field.input.addEventListener('change', () => {
      if (field.input.checked) selectColor(preset.key);
    });
    colorFields.set(preset.key, field);
    colorGroup.appendChild(field.root);
  });

  const colorOrder: HighlightColorKey[] = HIGHLIGHT_COLOR_PRESETS.map((p) => p.key);
  colorGroup.addEventListener('keydown', (e) => {
    const isPrev = e.key === 'ArrowUp' || e.key === 'ArrowLeft';
    const isNext = e.key === 'ArrowDown' || e.key === 'ArrowRight';
    if (!isPrev && !isNext) return;
    e.preventDefault();
    const idx = colorOrder.indexOf(currentColor);
    const delta = isPrev ? -1 : 1;
    const next = colorOrder[(idx + delta + colorOrder.length) % colorOrder.length];
    selectColor(next);
    colorFields.get(next)?.input.focus();
  });

  colorSection.appendChild(colorHeading);
  colorSection.appendChild(colorHint);
  colorSection.appendChild(colorGroup);
  wrapper.appendChild(colorSection);

  // --- Focus モード（Sprint 7） ---
  const focusSection = document.createElement('div');
  focusSection.className = 'highlight-controls__focus-section';

  const focusHeading = document.createElement('h4');
  focusHeading.className = 'highlight-controls__focus-heading';
  focusHeading.textContent = copy.settings.focusModeHeading;

  const focusHint = document.createElement('p');
  focusHint.className = 'highlight-controls__focus-hint';
  focusHint.textContent = copy.settings.focusModeHint;

  const focusToggleLabel = document.createElement('label');
  focusToggleLabel.className = 'highlight-controls__focus-toggle';
  focusToggleLabel.htmlFor = 'toggle-focus-mode';

  const focusInput = document.createElement('input');
  focusInput.type = 'checkbox';
  focusInput.id = 'toggle-focus-mode';
  focusInput.className = 'highlight-controls__focus-checkbox';
  focusInput.checked = opts.initialFocusMode;
  focusInput.addEventListener('change', () =>
    opts.onFocusModeChange(focusInput.checked),
  );

  const focusToggleText = document.createElement('span');
  focusToggleText.className = 'highlight-controls__focus-toggle-label';
  focusToggleText.textContent = copy.settings.focusModeLabel;

  focusToggleLabel.appendChild(focusInput);
  focusToggleLabel.appendChild(focusToggleText);

  focusSection.appendChild(focusHeading);
  focusSection.appendChild(focusHint);
  focusSection.appendChild(focusToggleLabel);
  wrapper.appendChild(focusSection);

  applyModeState();
  applyColorState();

  return {
    element: wrapper,
    setMode: (mode) => {
      currentMode = mode;
      applyModeState();
    },
    setColor: (color) => {
      currentColor = color;
      applyColorState();
    },
    setFocusMode: (enabled) => {
      focusInput.checked = enabled;
    },
  };
}

interface ModeOptionArgs {
  value: LineMode;
  label: string;
  hint: string;
}

function makeModeOption(args: ModeOptionArgs): {
  root: HTMLElement;
  input: HTMLInputElement;
} {
  const root = document.createElement('label');
  root.className = 'highlight-controls__option';
  root.htmlFor = `line-mode-${args.value}`;

  const input = document.createElement('input');
  input.type = 'radio';
  input.id = `line-mode-${args.value}`;
  input.name = 'line-mode';
  input.value = args.value;
  input.className = 'highlight-controls__radio';
  input.setAttribute('role', 'radio');

  const labelText = document.createElement('span');
  labelText.className = 'highlight-controls__option-label';
  labelText.textContent = args.label;

  const hintText = document.createElement('span');
  hintText.className = 'highlight-controls__option-hint';
  hintText.textContent = args.hint;

  root.appendChild(input);
  root.appendChild(labelText);
  root.appendChild(hintText);

  return { root, input };
}

function makeColorOption(preset: HighlightColorPreset): {
  root: HTMLElement;
  input: HTMLInputElement;
} {
  const root = document.createElement('label');
  root.className = 'highlight-controls__color-option';
  root.htmlFor = `highlight-color-${preset.key}`;

  const input = document.createElement('input');
  input.type = 'radio';
  input.id = `highlight-color-${preset.key}`;
  input.name = 'highlight-color';
  input.value = preset.key;
  input.className = 'highlight-controls__radio';
  input.setAttribute('role', 'radio');

  // 色見本（実際の rgba を背景に）
  const swatch = document.createElement('span');
  swatch.className = 'highlight-controls__color-swatch';
  swatch.style.backgroundColor = preset.rgba;
  swatch.setAttribute('aria-hidden', 'true');

  const labelText = document.createElement('span');
  labelText.className = 'highlight-controls__color-option-label';
  labelText.textContent = preset.label;

  const hintText = document.createElement('span');
  hintText.className = 'highlight-controls__color-option-hint';
  hintText.textContent = preset.description;

  root.appendChild(input);
  root.appendChild(swatch);
  root.appendChild(labelText);
  root.appendChild(hintText);

  return { root, input };
}

import { copy } from '../copy/ja';
import type { LineMode } from '../../types/settings';

export interface HighlightControlsOptions {
  initial: LineMode;
  onChange: (mode: LineMode) => void;
}

export interface HighlightControlsController {
  element: HTMLElement;
  setMode: (mode: LineMode) => void;
}

/**
 * 行ハイライト設定。off / zebra / flat の3択ラジオ。
 *
 * 設計判断：
 * - zebra と flat は同時 ON だと打ち消し合うのでラジオで排他選択
 * - 各オプションに短い hint を添え、選ぶ前に効果が分かる
 * - role=radiogroup、↑↓←→ キーで移動
 */
export function createHighlightControls(opts: HighlightControlsOptions): HighlightControlsController {
  const wrapper = document.createElement('div');
  wrapper.className = 'highlight-controls';

  const intro = document.createElement('p');
  intro.className = 'highlight-controls__intro';
  intro.textContent = copy.settings.highlightHint;
  wrapper.appendChild(intro);

  const radioGroup = document.createElement('div');
  radioGroup.className = 'highlight-controls__radio-group';
  radioGroup.setAttribute('role', 'radiogroup');
  radioGroup.setAttribute('aria-label', copy.settings.highlightHeading);

  const fields: Record<LineMode, ReturnType<typeof makeOption>> = {
    off: makeOption({
      value: 'off',
      label: copy.settings.lineModeOffLabel,
      hint: copy.settings.lineModeOffHint,
    }),
    zebra: makeOption({
      value: 'zebra',
      label: copy.settings.lineModeZebraLabel,
      hint: copy.settings.lineModeZebraHint,
    }),
    flat: makeOption({
      value: 'flat',
      label: copy.settings.lineModeFlatLabel,
      hint: copy.settings.lineModeFlatHint,
    }),
  };

  let currentMode: LineMode = opts.initial;

  const applyState = (): void => {
    (Object.entries(fields) as [LineMode, ReturnType<typeof makeOption>][]).forEach(
      ([mode, field]) => {
        const isActive = mode === currentMode;
        field.input.checked = isActive;
        field.input.tabIndex = isActive ? 0 : -1;
        field.root.classList.toggle('highlight-controls__option--active', isActive);
      },
    );
  };

  const select = (mode: LineMode): void => {
    if (mode === currentMode) return;
    currentMode = mode;
    applyState();
    opts.onChange(mode);
  };

  (['off', 'zebra', 'flat'] as const).forEach((mode) => {
    const field = fields[mode];
    field.input.addEventListener('change', () => {
      if (field.input.checked) select(mode);
    });
    radioGroup.appendChild(field.root);
  });

  // キーボード ↑↓←→ で前後移動
  const order: LineMode[] = ['off', 'zebra', 'flat'];
  radioGroup.addEventListener('keydown', (e) => {
    const isPrev = e.key === 'ArrowUp' || e.key === 'ArrowLeft';
    const isNext = e.key === 'ArrowDown' || e.key === 'ArrowRight';
    if (!isPrev && !isNext) return;
    e.preventDefault();
    const idx = order.indexOf(currentMode);
    const delta = isPrev ? -1 : 1;
    const next = order[(idx + delta + order.length) % order.length];
    select(next);
    fields[next].input.focus();
  });

  wrapper.appendChild(radioGroup);
  applyState();

  return {
    element: wrapper,
    setMode: (mode) => {
      currentMode = mode;
      applyState();
    },
  };
}

interface OptionArgs {
  value: LineMode;
  label: string;
  hint: string;
}

function makeOption(args: OptionArgs): {
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

import { copy } from '../copy/ja';

export interface HighlightControlsOptions {
  initial: {
    lineZebra: boolean;
  };
  onLineZebraChange: (enabled: boolean) => void;
}

export interface HighlightControlsController {
  element: HTMLElement;
  setLineZebra: (enabled: boolean) => void;
}

/**
 * ハイライト設定セクション。v1.0 では「行ごとの色分け」1つだけ。
 *
 * 設計判断：
 * - 単語境界（kuromoji）ハイライトは形態素分割が「単語」と一致せず、
 *   英語にも対応できなかったため UI から削除
 * - 行ハイライト（hover）と TTS 同期ハイライトも、現状では十分な精度・
 *   一貫性を提供できないため UI から削除（Settings 型には残し、将来の
 *   オプション再有効化に備える）
 * - 残った「行ごとの色分け」は言語非依存・CSS のみで動作・研究で支持あり
 */
export function createHighlightControls(opts: HighlightControlsOptions): HighlightControlsController {
  const wrapper = document.createElement('div');
  wrapper.className = 'highlight-controls';

  const intro = document.createElement('p');
  intro.className = 'highlight-controls__intro';
  intro.textContent = copy.settings.highlightHint;
  wrapper.appendChild(intro);

  const zebraField = makeField({
    id: 'toggle-line-zebra',
    label: copy.settings.lineZebraLabel,
    hint: copy.settings.lineZebraHint,
    initial: opts.initial.lineZebra,
    onChange: opts.onLineZebraChange,
  });
  wrapper.appendChild(zebraField.element);

  return {
    element: wrapper,
    setLineZebra: zebraField.setChecked,
  };
}

interface FieldOptions {
  id: string;
  label: string;
  hint: string;
  initial: boolean;
  onChange: (checked: boolean) => void;
}

interface FieldHandle {
  element: HTMLElement;
  setChecked: (checked: boolean) => void;
}

function makeField(opts: FieldOptions): FieldHandle {
  const field = document.createElement('div');
  field.className = 'highlight-controls__field';

  const labelEl = document.createElement('label');
  labelEl.className = 'highlight-controls__toggle';
  labelEl.htmlFor = opts.id;

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = opts.id;
  input.className = 'highlight-controls__checkbox';
  input.checked = opts.initial;
  input.addEventListener('change', () => opts.onChange(input.checked));

  const text = document.createElement('span');
  text.className = 'highlight-controls__toggle-label';
  text.textContent = opts.label;

  labelEl.appendChild(input);
  labelEl.appendChild(text);
  field.appendChild(labelEl);

  const hintEl = document.createElement('p');
  hintEl.className = 'highlight-controls__hint';
  hintEl.textContent = opts.hint;
  field.appendChild(hintEl);

  return {
    element: field,
    setChecked: (checked) => {
      input.checked = checked;
    },
  };
}

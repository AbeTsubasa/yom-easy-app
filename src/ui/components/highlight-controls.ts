import { copy } from '../copy/ja';

export interface HighlightControlsOptions {
  initial: {
    wordBoundary: boolean;
    lineHighlight: boolean;
    ttsSync: boolean;
  };
  onWordBoundaryChange: (enabled: boolean) => void;
  onLineHighlightChange: (enabled: boolean) => void;
  onTtsSyncChange: (enabled: boolean) => void;
}

export interface HighlightControlsController {
  element: HTMLElement;
  setWordBoundary: (enabled: boolean) => void;
  setLineHighlight: (enabled: boolean) => void;
  setTtsSync: (enabled: boolean) => void;
}

/**
 * ハイライト3種の ON/OFF をまとめた設定セクション。
 * - 単語境界（zebra）
 * - 行ハイライト
 * - 読み上げ同期ハイライト（ベストエフォート）
 *
 * 設計方針：
 * - 各設定はチェックボックスベース（toggle スイッチではなく、操作が明快な checkbox）
 * - 各設定の下に1〜2行の hint で「何が起きるか」を伝える
 * - 読み上げ同期だけは「動かないこともあります」と正直に書く
 */
export function createHighlightControls(opts: HighlightControlsOptions): HighlightControlsController {
  const wrapper = document.createElement('div');
  wrapper.className = 'highlight-controls';

  const hint = document.createElement('p');
  hint.className = 'highlight-controls__intro';
  hint.textContent = copy.settings.highlightHint;
  wrapper.appendChild(hint);

  const wordField = makeField({
    id: 'toggle-word-boundary',
    label: copy.settings.wordBoundaryLabel,
    hint: copy.settings.wordBoundaryHint,
    initial: opts.initial.wordBoundary,
    onChange: opts.onWordBoundaryChange,
  });
  const lineField = makeField({
    id: 'toggle-line-highlight',
    label: copy.settings.lineHighlightLabel,
    hint: copy.settings.lineHighlightHint,
    initial: opts.initial.lineHighlight,
    onChange: opts.onLineHighlightChange,
  });
  const ttsSyncField = makeField({
    id: 'toggle-tts-sync',
    label: copy.settings.ttsSyncHighlightLabel,
    hint: copy.settings.ttsSyncHighlightHint,
    initial: opts.initial.ttsSync,
    onChange: opts.onTtsSyncChange,
  });

  wrapper.appendChild(wordField.element);
  wrapper.appendChild(lineField.element);
  wrapper.appendChild(ttsSyncField.element);

  return {
    element: wrapper,
    setWordBoundary: wordField.setChecked,
    setLineHighlight: lineField.setChecked,
    setTtsSync: ttsSyncField.setChecked,
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

import { copy } from '../copy/ja';
import { groupFontDefinitions, type FontDefinition } from '../../modules/font-registry';
import type { FontFamilyKey } from '../../types/settings';

export interface FontPickerOptions {
  initial: FontFamilyKey;
  onChange: (key: FontFamilyKey) => void;
}

export interface FontPickerController {
  element: HTMLElement;
  setSelection: (key: FontFamilyKey) => void;
}

/**
 * フォント選択 UI。
 * - 各ボタンは「そのフォント自体で描画」されるので、選択行為がそのままプレビュー
 * - role=radiogroup / role=radio で SR 対応
 * - キーボード ↑↓ ←→ で移動
 * - 「専用フォント（オプション）」グループには研究上の留意点を1行添える
 */
export function createFontPicker(opts: FontPickerOptions): FontPickerController {
  const wrapper = document.createElement('div');
  wrapper.className = 'font-picker';

  const heading = document.createElement('h3');
  heading.className = 'font-picker__heading';
  heading.textContent = copy.settings.fontHeading;
  wrapper.appendChild(heading);

  const hint = document.createElement('p');
  hint.className = 'font-picker__hint';
  hint.textContent = copy.settings.fontHint;
  wrapper.appendChild(hint);

  const groups = groupFontDefinitions();
  const groupLabels: Record<FontDefinition['group'], string> = {
    jp: copy.settings.groupJp,
    en: copy.settings.groupEn,
    option: copy.settings.groupOption,
  };

  let currentKey: FontFamilyKey = opts.initial;
  const buttons: HTMLButtonElement[] = [];

  (['jp', 'en', 'option'] as const).forEach((group) => {
    const groupContainer = document.createElement('section');
    groupContainer.className = `font-picker__group font-picker__group--${group}`;

    const groupHeading = document.createElement('h4');
    groupHeading.className = 'font-picker__group-heading';
    groupHeading.textContent = groupLabels[group];
    groupContainer.appendChild(groupHeading);

    if (group === 'option') {
      const disclaimer = document.createElement('p');
      disclaimer.className = 'font-picker__disclaimer';
      disclaimer.textContent = copy.settings.optionDisclaimer;
      groupContainer.appendChild(disclaimer);

      const pending = document.createElement('p');
      pending.className = 'font-picker__pending';
      pending.textContent = copy.settings.webFontPending;
      groupContainer.appendChild(pending);
    }

    const radioGroup = document.createElement('div');
    radioGroup.className = 'font-picker__radio-group';
    radioGroup.setAttribute('role', 'radiogroup');
    radioGroup.setAttribute('aria-label', groupLabels[group]);

    groups[group].forEach((def) => {
      const button = makeFontButton(def);
      button.addEventListener('click', () => selectKey(def.key));
      radioGroup.appendChild(button);
      buttons.push(button);
    });

    groupContainer.appendChild(radioGroup);
    wrapper.appendChild(groupContainer);
  });

  // キーボード操作：↑↓←→ で前後移動
  wrapper.addEventListener('keydown', (e) => {
    const isPrev = e.key === 'ArrowUp' || e.key === 'ArrowLeft';
    const isNext = e.key === 'ArrowDown' || e.key === 'ArrowRight';
    if (!isPrev && !isNext) return;
    const activeIdx = buttons.findIndex((b) => b.getAttribute('aria-checked') === 'true');
    if (activeIdx === -1) return;
    e.preventDefault();
    const delta = isPrev ? -1 : 1;
    const nextIdx = (activeIdx + delta + buttons.length) % buttons.length;
    const nextKey = buttons[nextIdx].dataset.key as FontFamilyKey;
    selectKey(nextKey);
    buttons[nextIdx].focus();
  });

  function selectKey(key: FontFamilyKey): void {
    if (key === currentKey) return;
    currentKey = key;
    applyState();
    opts.onChange(key);
  }

  function applyState(): void {
    buttons.forEach((btn) => {
      const isActive = btn.dataset.key === currentKey;
      btn.setAttribute('aria-checked', String(isActive));
      btn.classList.toggle('font-picker__option--active', isActive);
      btn.tabIndex = isActive ? 0 : -1;
    });
  }

  applyState();

  return {
    element: wrapper,
    setSelection: (key) => {
      currentKey = key;
      applyState();
    },
  };
}

function makeFontButton(def: FontDefinition): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'font-picker__option';
  button.setAttribute('role', 'radio');
  button.dataset.key = def.key;
  button.style.fontFamily = def.stack;

  const labelEl = document.createElement('span');
  labelEl.className = 'font-picker__option-label';
  labelEl.textContent = def.label;
  button.appendChild(labelEl);

  return button;
}

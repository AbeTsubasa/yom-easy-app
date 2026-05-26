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
 * フォント選択 UI（入れ子アコーディオン）。
 *
 * 親アコーディオン（settings-panel 側）で「フォント」を開くと、ここに
 * 3つの子アコーディオン（日本語 / 英語 / 専用）が現れる。
 * さらにその一つを開くと、その分類のフォント選択肢が見える。
 *
 * 設計方針：
 * - 階層は「親 > 子 > 孫」の3階層
 * - 一度に開く子は1つだけ（exclusive accordion）
 * - 各ボタンは「そのフォント自体で描画」される（選択 = プレビュー）
 * - 専用グループには研究上の留意点を本体内に添える
 */
export function createFontPicker(opts: FontPickerOptions): FontPickerController {
  const wrapper = document.createElement('div');
  wrapper.className = 'font-picker';

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

  interface GroupItem {
    root: HTMLElement;
    toggle: HTMLButtonElement;
    body: HTMLElement;
    icon: HTMLElement;
  }
  const groupItems: GroupItem[] = [];

  (['jp', 'en', 'option'] as const).forEach((group, idx) => {
    const item = document.createElement('div');
    item.className = 'accordion-item font-picker__group';

    const bodyId = `font-group-body-${group}`;

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'accordion-item__button font-picker__group-toggle';
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-controls', bodyId);

    const labelEl = document.createElement('span');
    labelEl.className = 'accordion-item__label';
    labelEl.textContent = groupLabels[group];

    const icon = document.createElement('span');
    icon.className = 'accordion-item__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '▶';

    toggleBtn.appendChild(labelEl);
    toggleBtn.appendChild(icon);

    const body = document.createElement('div');
    body.id = bodyId;
    body.className = 'accordion-item__body';
    body.hidden = true;

    // 専用フォントグループには研究上の注意書きを添える
    if (group === 'option') {
      const disclaimer = document.createElement('p');
      disclaimer.className = 'font-picker__disclaimer';
      disclaimer.textContent = copy.settings.optionDisclaimer;
      body.appendChild(disclaimer);

      const pending = document.createElement('p');
      pending.className = 'font-picker__pending';
      pending.textContent = copy.settings.webFontPending;
      body.appendChild(pending);
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

    body.appendChild(radioGroup);

    toggleBtn.addEventListener('click', () => toggleGroup(idx));

    item.appendChild(toggleBtn);
    item.appendChild(body);
    wrapper.appendChild(item);

    groupItems.push({ root: item, toggle: toggleBtn, body, icon });
  });

  function applyGroupOpenState(targetIdx: number | null): void {
    groupItems.forEach((g, i) => {
      const isOpen = i === targetIdx;
      g.toggle.setAttribute('aria-expanded', String(isOpen));
      g.body.hidden = !isOpen;
      g.icon.textContent = isOpen ? '▼' : '▶';
      g.root.classList.toggle('accordion-item--open', isOpen);
    });
  }

  function toggleGroup(targetIdx: number): void {
    const isOpen = groupItems[targetIdx].toggle.getAttribute('aria-expanded') === 'true';
    applyGroupOpenState(isOpen ? null : targetIdx);
  }

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

  // キーボード：↑↓←→ で前後移動（フォントボタン内）
  wrapper.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains('font-picker__option')) return;
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

import { copy } from '../copy/ja';

export interface SettingsSection {
  /** アコーディオンの親見出し（ユーザー向けラベル） */
  title: string;
  /** 展開時に表示する中身（ピッカー本体など） */
  body: HTMLElement;
}

export interface SettingsPanelOptions {
  sections: SettingsSection[];
  /** 最初に展開しておくセクション index（省略時は全て閉じる） */
  initialOpenIndex?: number;
}

export interface SettingsPanelController {
  element: HTMLElement;
  openSection: (index: number) => void;
  closeAll: () => void;
}

/**
 * 設定パネル（アコーディオン式）。
 *
 * 設計方針：
 * - 一度に展開するのは1つだけ（accordion behavior）
 * - 閉じているセクションも見出しは見えるので「何が変更できるか」は常に可視
 * - 占有スペースを最小化、スマホ drawer / PC sidebar の双方で実用的
 * - aria-expanded / aria-controls で SR にも正しく状態を伝える
 */
export function createSettingsPanel(opts: SettingsPanelOptions): SettingsPanelController {
  const panel = document.createElement('section');
  panel.className = 'settings-panel';
  panel.setAttribute('aria-labelledby', 'settings-panel-heading');

  const heading = document.createElement('h2');
  heading.id = 'settings-panel-heading';
  heading.className = 'settings-panel__heading';
  heading.textContent = copy.settings.panelHeading;
  panel.appendChild(heading);

  const accordion = document.createElement('div');
  accordion.className = 'settings-panel__accordion';

  interface AccordionItem {
    root: HTMLElement;
    button: HTMLButtonElement;
    body: HTMLElement;
    icon: HTMLElement;
  }
  const items: AccordionItem[] = [];

  opts.sections.forEach((section, idx) => {
    const item = document.createElement('div');
    item.className = 'accordion-item';

    const bodyId = `accordion-body-${idx}`;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'accordion-item__button';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', bodyId);

    const label = document.createElement('span');
    label.className = 'accordion-item__label';
    label.textContent = section.title;

    const icon = document.createElement('span');
    icon.className = 'accordion-item__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '▶';

    button.appendChild(label);
    button.appendChild(icon);

    const body = document.createElement('div');
    body.id = bodyId;
    body.className = 'accordion-item__body';
    body.hidden = true;
    body.appendChild(section.body);

    button.addEventListener('click', () => toggle(idx));

    item.appendChild(button);
    item.appendChild(body);
    accordion.appendChild(item);

    items.push({ root: item, button, body, icon });
  });

  panel.appendChild(accordion);

  function applyOpenState(targetIdx: number | null): void {
    items.forEach((item, i) => {
      const isOpen = i === targetIdx;
      item.button.setAttribute('aria-expanded', String(isOpen));
      item.body.hidden = !isOpen;
      item.icon.textContent = isOpen ? '▼' : '▶';
      item.root.classList.toggle('accordion-item--open', isOpen);
    });
  }

  function toggle(targetIdx: number): void {
    const isCurrentlyOpen = items[targetIdx].button.getAttribute('aria-expanded') === 'true';
    applyOpenState(isCurrentlyOpen ? null : targetIdx);
  }

  if (opts.initialOpenIndex !== undefined) {
    applyOpenState(opts.initialOpenIndex);
  }

  return {
    element: panel,
    openSection: (index) => applyOpenState(index),
    closeAll: () => applyOpenState(null),
  };
}

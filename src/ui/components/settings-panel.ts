import { copy } from '../copy/ja';

/**
 * 設定パネルのアコーディオンセクション（1 つの機能カテゴリ）。
 */
export interface SettingsSection {
  kind: 'section';
  /** アコーディオンの親見出し（ユーザー向けラベル） */
  title: string;
  /** 展開時に表示する中身（ピッカー本体など） */
  body: HTMLElement;
}

/**
 * 設定パネルのグループ見出し（複数セクションを束ねる説明ブロック）。
 * Sprint 8：機能名で並んでいるパネルに「目的の名前」のラベルを挟む。
 * アコーディオンではないので開閉しない。
 */
export interface SettingsGroup {
  kind: 'group';
  /** グループ名（例：A. 見やすさを整える） */
  label: string;
  /** 1 行の案内文 */
  hint: string;
}

export type SettingsItem = SettingsSection | SettingsGroup;

export interface SettingsPanelOptions {
  /** items は section と group の混合配列。先頭から順に描画される */
  items: SettingsItem[];
  /** 「💡 読みやすさナビ」ボタンを冒頭に置きたいときに渡す */
  onNavigatorClick?: () => void;
  /** 最初に展開しておくセクション index（group は数えない。省略時は全て閉じる） */
  initialOpenIndex?: number;
}

export interface SettingsPanelController {
  element: HTMLElement;
  /** セクションのみを通し番号で指定（group は除外） */
  openSection: (index: number) => void;
  closeAll: () => void;
}

/**
 * 設定パネル（アコーディオン式 + グループ見出し）。
 *
 * 設計方針：
 * - 一度に展開するのは1つだけ（accordion behavior）
 * - グループ見出しは展開しない単純なラベル＋ヒント。視覚的階層を作る
 * - 閉じているセクションも見出しは見えるので「何が変更できるか」は常に可視
 * - 「💡 読みやすさナビ」ボタンはセクションより上に置き、迷ったらここから戻れる導線に
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

  // ナビボタン（任意）。設定パネル冒頭から困りごとガイドへ戻れる導線。
  if (opts.onNavigatorClick) {
    const navWrap = document.createElement('div');
    navWrap.className = 'settings-panel__nav';

    const navButton = document.createElement('button');
    navButton.type = 'button';
    navButton.className = 'settings-panel__nav-button';
    navButton.textContent = copy.settings.navigatorButton;
    navButton.setAttribute('aria-label', copy.settings.navigatorButtonAria);
    navButton.addEventListener('click', () => opts.onNavigatorClick?.());

    const navHint = document.createElement('p');
    navHint.className = 'settings-panel__nav-hint';
    navHint.textContent = copy.settings.navigatorButtonHint;

    navWrap.appendChild(navButton);
    navWrap.appendChild(navHint);
    panel.appendChild(navWrap);
  }

  const list = document.createElement('div');
  list.className = 'settings-panel__list';

  interface AccordionItem {
    root: HTMLElement;
    button: HTMLButtonElement;
    body: HTMLElement;
    icon: HTMLElement;
  }
  const accordionItems: AccordionItem[] = [];

  opts.items.forEach((item) => {
    if (item.kind === 'group') {
      const groupEl = document.createElement('div');
      groupEl.className = 'settings-group';
      // aria 的にはグループの境界を heading で表す
      const groupHeading = document.createElement('h3');
      groupHeading.className = 'settings-group__heading';
      groupHeading.textContent = item.label;

      const groupHint = document.createElement('p');
      groupHint.className = 'settings-group__hint';
      groupHint.textContent = item.hint;

      groupEl.appendChild(groupHeading);
      groupEl.appendChild(groupHint);
      list.appendChild(groupEl);
      return;
    }

    // section
    const idx = accordionItems.length; // section の通し index
    const root = document.createElement('div');
    root.className = 'accordion-item';

    const bodyId = `accordion-body-${idx}`;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'accordion-item__button';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', bodyId);

    const label = document.createElement('span');
    label.className = 'accordion-item__label';
    label.textContent = item.title;

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
    body.appendChild(item.body);

    button.addEventListener('click', () => toggle(idx));

    root.appendChild(button);
    root.appendChild(body);
    list.appendChild(root);

    accordionItems.push({ root, button, body, icon });
  });

  panel.appendChild(list);

  function applyOpenState(targetIdx: number | null): void {
    accordionItems.forEach((item, i) => {
      const isOpen = i === targetIdx;
      item.button.setAttribute('aria-expanded', String(isOpen));
      item.body.hidden = !isOpen;
      item.icon.textContent = isOpen ? '▼' : '▶';
      item.root.classList.toggle('accordion-item--open', isOpen);
    });
  }

  function toggle(targetIdx: number): void {
    const isCurrentlyOpen =
      accordionItems[targetIdx].button.getAttribute('aria-expanded') === 'true';
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

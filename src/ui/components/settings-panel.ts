import { copy } from '../copy/ja';

export interface SettingsPanelOptions {
  /** 中に並べるサブセクション要素群（Day 3: フォント / Day 4: 字間・行間 / Day 5: 色） */
  children: HTMLElement[];
}

/**
 * 設定セクションをまとめるコンテナ。
 * Day 3 ではフォント1つだけ、Day 4-5 で字間・行間・色テーマを追加する想定。
 *
 * 設計方針：
 * - 「設定」というラベルは使わず、「読み方の設定」とユーザーの目線で表現
 * - aria-labelledby で見出しと領域を関連付け、スクリーンリーダーで認識可能に
 * - 常時表示。スマホで縦長になりすぎる場合は Day 5 で折りたたみ化を検討
 */
export function createSettingsPanel(opts: SettingsPanelOptions): HTMLElement {
  const panel = document.createElement('section');
  panel.className = 'settings-panel';
  panel.setAttribute('aria-labelledby', 'settings-panel-heading');

  const heading = document.createElement('h2');
  heading.id = 'settings-panel-heading';
  heading.className = 'settings-panel__heading';
  heading.textContent = copy.settings.panelHeading;
  panel.appendChild(heading);

  opts.children.forEach((child) => panel.appendChild(child));

  return panel;
}

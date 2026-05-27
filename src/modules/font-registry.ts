import type { FontFamilyKey } from '../types/settings';

/**
 * フォント1種の定義。
 * - stack：CSS の font-family に流す文字列（OS にあれば使い、なければフォールバック）
 * - label：UI 表示用のラベル
 * - group：UI 上のグルーピング（和文 / 欧文 / オプション）
 * - note：選択ボタンに添える注釈（任意）
 *
 * 設計方針：
 * - 「これが最適」と推す表現は使わない（個人差の尊重）
 * - OpenDyslexic / Dyslexie は研究で効果が否定的に評価されているため、
 *   "おすすめ" とは書かず "選択肢のひとつ" として並べる
 */
export interface FontDefinition {
  readonly key: FontFamilyKey;
  readonly label: string;
  readonly stack: string;
  readonly group: 'jp' | 'en' | 'option';
  readonly note?: string;
}

/**
 * Fallback chain shared by all definitions.
 * 純粋なフォント名のあとに、汎用 system-ui / sans-serif を必ず置く。
 */
const FALLBACK = 'system-ui, sans-serif';

export const FONT_DEFINITIONS: readonly FontDefinition[] = [
  // 和文
  {
    key: 'ud-kyokasho',
    label: 'UD デジタル教科書体',
    // BIZ UDPGothic は Sprint 11 で配信から外したため、フォールバックは
    // Noto Sans JP（Web フォント）→ system-ui へ。
    stack: `"UD Digi Kyokasho NK-R", "UD デジタル 教科書体 N-R", "Noto Sans JP", ${FALLBACK}`,
    group: 'jp',
  },
  // Sprint 11 で `biz-udp` は font 一覧から削除（実機で表示が安定しなかったため）。
  // FontFamilyKey 型からも削除し、保存値が biz-udp の既存ユーザーは
  // storage.ts のマイグレで ud-kyokasho へ自動移行。
  {
    key: 'noto-sans-jp',
    label: 'Noto Sans JP',
    stack: `"Noto Sans JP", "Hiragino Sans", ${FALLBACK}`,
    group: 'jp',
  },
  {
    key: 'meiryo',
    label: 'メイリオ',
    stack: `"Meiryo", "メイリオ", ${FALLBACK}`,
    group: 'jp',
  },
  {
    key: 'mincho',
    label: '明朝体',
    stack: `"Hiragino Mincho ProN", "Hiragino Mincho Pro", "Yu Mincho", "YuMincho", "MS PMincho", "MS Mincho", serif`,
    group: 'jp',
    note: 'うろこ（線の端の飾り）があり、読みにくく感じる方が多いと言われています。',
  },
  // 欧文
  {
    key: 'arial',
    label: 'Arial',
    stack: `Arial, Helvetica, ${FALLBACK}`,
    group: 'en',
  },
  {
    key: 'verdana',
    label: 'Verdana',
    stack: `Verdana, Geneva, ${FALLBACK}`,
    group: 'en',
  },
  {
    key: 'open-sans',
    label: 'Open Sans',
    stack: `"Open Sans", ${FALLBACK}`,
    group: 'en',
  },
  {
    key: 'helvetica',
    label: 'Helvetica',
    stack: `Helvetica, Arial, ${FALLBACK}`,
    group: 'en',
  },
  // オプション（ディスレクシア向け専用フォント。研究では評価が分かれる）
  {
    key: 'open-dyslexic',
    label: 'OpenDyslexic',
    stack: `"OpenDyslexic", ${FALLBACK}`,
    group: 'option',
    note: '合う方には合う、という声があります。試してみて選んでください。',
  },
  {
    key: 'dyslexie',
    label: 'Dyslexie',
    stack: `"Dyslexie", ${FALLBACK}`,
    group: 'option',
    note: '合う方には合う、という声があります。試してみて選んでください。',
  },
];

/** key で索ける map */
export const FONT_MAP: Readonly<Record<FontFamilyKey, FontDefinition>> = Object.freeze(
  FONT_DEFINITIONS.reduce(
    (acc, def) => {
      acc[def.key] = def;
      return acc;
    },
    {} as Record<FontFamilyKey, FontDefinition>,
  ),
);

/** group ごとに分けたい場面のためのユーティリティ */
export function groupFontDefinitions(): Record<FontDefinition['group'], FontDefinition[]> {
  return {
    jp: FONT_DEFINITIONS.filter((d) => d.group === 'jp'),
    en: FONT_DEFINITIONS.filter((d) => d.group === 'en'),
    option: FONT_DEFINITIONS.filter((d) => d.group === 'option'),
  };
}

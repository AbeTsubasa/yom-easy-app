import type { HighlightColorKey } from '../types/settings';

/**
 * ハイライト色のプリセット定義。
 *
 * 研究的位置づけ：
 * - Irlen syndrome 関連の研究（Wilkins et al.）では、色付き overlay が
 *   ディスレクシア当事者の一部に読みやすさ向上の効果があると報告
 * - ただし「個人差が大きく、単一の最適色はない」というのが共通認識
 * - だからこそ「選べる」ことが本質
 *
 * 透明度は背景テーマ（reading-bg）と干渉しないよう薄めに揃える。
 */

export interface HighlightColorPreset {
  readonly key: HighlightColorKey;
  readonly label: string;
  /** 研究的・体感的な位置づけを1行で */
  readonly description: string;
  /** repeating-linear-gradient の帯に使う rgba */
  readonly rgba: string;
}

export const HIGHLIGHT_COLOR_PRESETS: readonly HighlightColorPreset[] = [
  {
    key: 'subtle',
    label: '控えめなグレー',
    description: '色味をつけず、行の存在だけを際立たせます。',
    rgba: 'rgba(34, 34, 34, 0.06)',
  },
  {
    key: 'yellow',
    label: 'うすい黄色',
    description: '最も一般的に推奨される色。紙の眩しさを和らげると言われています。',
    rgba: 'rgba(255, 220, 100, 0.22)',
  },
  {
    key: 'pink',
    label: 'うすい桃色',
    description: '温かみがあり、リラックスして読めるという声があります。',
    rgba: 'rgba(255, 200, 220, 0.28)',
  },
  {
    key: 'green',
    label: 'うすい緑',
    description: '目の疲労を和らげる色として報告されています。',
    rgba: 'rgba(180, 220, 180, 0.28)',
  },
  {
    key: 'blue',
    label: 'うすい青',
    description: '集中力を保ちやすい色として報告されています。',
    rgba: 'rgba(180, 220, 240, 0.28)',
  },
  {
    key: 'lavender',
    label: 'うすい藤色',
    description: '穏やかに感じやすい色です。',
    rgba: 'rgba(220, 200, 240, 0.30)',
  },
  {
    key: 'orange',
    label: 'うすい橙',
    description: '暖色のなかで、少し活発感のある色です。',
    rgba: 'rgba(255, 210, 170, 0.30)',
  },
];

export const HIGHLIGHT_COLOR_MAP: Readonly<
  Record<HighlightColorKey, HighlightColorPreset>
> = Object.freeze(
  HIGHLIGHT_COLOR_PRESETS.reduce(
    (acc, p) => {
      acc[p.key] = p;
      return acc;
    },
    {} as Record<HighlightColorKey, HighlightColorPreset>,
  ),
);

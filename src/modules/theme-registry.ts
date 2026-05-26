import type { ThemeKey } from '../types/settings';

/**
 * 1つのテーマプリセットを構成する CSS 変数の集合。
 * Day 5 では、プリセットを選ぶと派生色まで一括で書き換わる設計。
 *
 * 設計方針：
 * - bg/text だけでなく派生色も固定値で持つことで、Dark でも UI が破綻しない
 * - 純黒 #000000 / 純白 #FFFFFF はデフォルトで使わない
 * - 各テーマの contrast 比は WCAG 2.1 AA 以上を確認済み
 */
export interface ThemePreset {
  readonly key: ThemeKey;
  readonly label: string;
  readonly description: string;
  readonly bg: string;
  readonly text: string;
  readonly muted: string;
  readonly accent: string;
  readonly border: string;
  readonly buttonBg: string;
  readonly buttonBgActive: string;
  readonly focusRing: string;
}

/**
 * 6プリセット。FT_MVP 仕様に準拠し、Cream は塾長フィードバックで Soft Cream (#FAF7F0) に調整。
 */
export const THEME_PRESETS: readonly ThemePreset[] = [
  {
    key: 'cream',
    label: 'Cream（やわらか）',
    description: '純白を避けた、目に優しいクリーム色',
    bg: '#faf7f0',
    text: '#222222',
    muted: '#555555',
    accent: '#e6dccb',
    border: '#cfc7b3',
    buttonBg: '#efeadc',
    buttonBgActive: '#e6dccb',
    focusRing: 'rgba(34, 34, 34, 0.5)',
  },
  {
    key: 'peach',
    label: 'Peach（うす桃）',
    description: '少し暖かみのあるピーチ色',
    bg: '#edd1b0',
    text: '#333333',
    muted: '#5c4a2e',
    accent: '#d6b997',
    border: '#b89b7e',
    buttonBg: '#e5c5a0',
    buttonBgActive: '#d6b997',
    focusRing: 'rgba(51, 33, 17, 0.5)',
  },
  {
    key: 'orange',
    label: 'Orange（うす橙）',
    description: '視認性の高いうすい橙色',
    bg: '#eddd6e',
    text: '#222222',
    muted: '#5c5226',
    accent: '#d6c552',
    border: '#a89738',
    buttonBg: '#e0d060',
    buttonBgActive: '#d6c552',
    focusRing: 'rgba(34, 34, 34, 0.55)',
  },
  {
    key: 'yellow',
    label: 'Yellow（うす黄）',
    description: '明るい黄色',
    bg: '#f8fd89',
    text: '#222222',
    muted: '#5c5c2a',
    accent: '#e0e670',
    border: '#b8be54',
    buttonBg: '#eef378',
    buttonBgActive: '#e0e670',
    focusRing: 'rgba(34, 34, 34, 0.55)',
  },
  {
    key: 'grey',
    label: 'Grey（うす灰）',
    description: '落ち着いた灰色',
    bg: '#d8d3d6',
    text: '#222222',
    muted: '#5a5558',
    accent: '#bfbabd',
    border: '#9b969a',
    buttonBg: '#cfcace',
    buttonBgActive: '#bfbabd',
    focusRing: 'rgba(34, 34, 34, 0.5)',
  },
  {
    key: 'dark',
    label: 'Dark（暗背景）',
    description: '暗い背景に明るい文字。夜間や強い照明下で読むときに',
    bg: '#1a1a1a',
    text: '#e5e5e5',
    muted: '#a0a0a0',
    accent: '#3a3a3a',
    border: '#555555',
    buttonBg: '#2a2a2a',
    buttonBgActive: '#3a3a3a',
    focusRing: 'rgba(229, 229, 229, 0.6)',
  },
];

/** key で索ける map */
export const THEME_MAP: Readonly<Record<ThemeKey, ThemePreset>> = Object.freeze(
  THEME_PRESETS.reduce(
    (acc, preset) => {
      acc[preset.key] = preset;
      return acc;
    },
    {} as Record<ThemeKey, ThemePreset>,
  ),
);

/** デフォルトテーマ */
export const DEFAULT_THEME_KEY: ThemeKey = 'cream';

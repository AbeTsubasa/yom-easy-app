/**
 * ユーザーが選べる視認性設定の型定義。
 * Sprint 1 全体を通じて拡張していく。Day 1-2 ではまだ全項目は使わない。
 *
 * 重要な設計方針：
 * - すべての値はユーザーが選び直せる（単一の最適解を提示しない）
 * - デフォルトは WCAG AAA 相当（CSS 変数の初期値と一致）
 * - 将来 localStorage に保存するが、Day 1-2 ではメモリ上のみ
 */

export type FontFamilyKey =
  | 'ud-kyokasho'
  | 'biz-udp'
  | 'noto-sans-jp'
  | 'meiryo'
  | 'mincho'
  | 'arial'
  | 'verdana'
  | 'open-sans'
  | 'helvetica'
  | 'open-dyslexic'
  | 'dyslexie';

export type ThemeKey = 'cream' | 'peach' | 'orange' | 'yellow' | 'grey' | 'dark';

/**
 * 入力/読みのモード切替。
 * - 'edit'：テキスト入力（textarea が表示）
 * - 'read'：読み込み（プレビューが表示）
 */
export type ViewMode = 'edit' | 'read';

export interface Settings {
  /** フォントファミリーの選択キー */
  fontFamily: FontFamilyKey;
  /** 14–32px */
  fontSize: number;
  /** 0–0.25 em */
  letterSpacing: number;
  /** 1.2–2.0 */
  lineHeight: number;
  /** 0–0.5 em */
  wordSpacing: number;
  /** 1–3 em */
  paragraphSpacing: number;
  /** カラーテーマプリセット */
  theme: ThemeKey;
  /**
   * 自由カラーピッカーで上書きされた背景色。
   * null のときはプリセット（theme）の色を使う。
   */
  customBg: string | null;
  /**
   * 自由カラーピッカーで上書きされた文字色。
   * null のときはプリセット（theme）の色を使う。
   */
  customText: string | null;
  /** 読み上げ速度 0.5–2.0、デフォルト 1.0 */
  ttsRate: number;
  /** 選択した音声の voiceURI。null は端末の標準（最初の日本語音声） */
  ttsVoiceURI: string | null;
}

/**
 * WCAG 2.1 AAA 相当のデフォルト値。
 * CSS の :root と一致させる。
 */
export const DEFAULT_SETTINGS: Settings = {
  fontFamily: 'ud-kyokasho',
  fontSize: 18,
  letterSpacing: 0.12,
  lineHeight: 1.5,
  wordSpacing: 0.16,
  paragraphSpacing: 2,
  theme: 'cream',
  customBg: null,
  customText: null,
  ttsRate: 1.0,
  ttsVoiceURI: null,
};

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
 * 行ハイライトの表示モード。
 * - 'off'：何もつけない
 * - 'zebra'：1行ごとに色／透明を交互（折り返し含む視覚的1行単位）
 * - 'flat'：すべての行に色帯（行間はわずかな隙間で区別）
 * 両者は同時 ON が打ち消し合うため、ラジオ3択で提供する。
 */
export type LineMode = 'off' | 'zebra' | 'flat';

/**
 * ハイライト色のプリセットキー。
 * 研究的に支持される色を中心に揃える。個人差が大きいので選べる設計。
 */
export type HighlightColorKey =
  | 'subtle' // 控えめなグレー（色味なし、最も控えめ）
  | 'yellow' // 薄黄色（最も一般的に推奨）
  | 'pink' // 薄ピンク（温かみ・リラックス）
  | 'green' // 薄緑（目の疲労軽減）
  | 'blue' // 薄青（集中力維持）
  | 'lavender' // 薄ラベンダー（穏やかさ）
  | 'orange'; // 薄オレンジ（暖色・活発感）

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
  /**
   * 行ハイライトの表示モード。off / zebra / flat の3択。
   * v1.0 の主要ハイライト機能。言語非依存、CSS のみで動作。
   */
  lineMode: LineMode;
  /**
   * ハイライト色（lineMode が off 以外のときに使う色）。
   * 個人差が大きいため、複数のプリセットから選べる設計。
   */
  highlightColor: HighlightColorKey;
  /**
   * ふりがな（ルビ）を自動付与するかどうか。
   * ON にすると漢字に対応する読みを <ruby> 要素として挿入する。
   * 初回 ON 時に kuromoji の初期化が走る（数秒）。
   */
  rubyEnabled: boolean;
  /**
   * 分かち書きするかどうか。
   * ON にすると形態素境界に視覚的な細スペースを挟む。
   * ひらがな主体文では特に効果あり、漢字仮名交じりでは効果薄め。
   */
  wakachiEnabled: boolean;
  /**
   * 行幅（reading-area の max-width、em 単位）。
   * Schneps et al. (2013): 狭い行幅（≒30 文字）で dyslexic 成人の読み速度+27%。
   * 個人差が大きいので、24–90em のスライダー。デフォルト 40em（現状値）。
   */
  maxWidth: number;
  /**
   * TTS 中、いま読んでいる段落をハイライトするか。
   * Wood et al. (2018) のメタ分析：multi-sensory reading（読み上げ＋視覚追跡）で
   * 読解理解 d=0.36。段落単位なら日本語の word boundary 問題を回避できる。
   */
  ttsParagraphSync: boolean;
  /**
   * Focus モード。いま注目している段落以外を薄める。
   * TTS 再生中はその段落、それ以外は viewport 中央の段落を「注目」と扱う。
   * BDA Style Guide / Bjornsson & Hofgaard (2018): visual clutter 最小化で
   * 読み速度+15%、誤読-20%（ADHD 併存層に特に効く）。
   */
  focusMode: boolean;
  /**
   * 文節改行モード。kuromoji の POS タグから接続助詞・接続詞・句読点の後で
   * 目に見える改行を入れる。
   * Tate, Collins & Williamson (2019): chunked text で読解理解 d=0.42。
   * 既存の分かち書きと組み合わせ可能。
   */
  chunkedEnabled: boolean;
  /** @deprecated 旧フラグ。lineMode に統合済み。型は残すが UI からは扱わない */
  lineZebra: boolean;
  /**
   * 単語境界マーカー（kuromoji 分割）。
   * 形態素分割は「単語」と一致せず、英語にも対応しないため v1.0 では UI から外し、
   * デフォルト false。Settings 型からは外さず将来の再評価に備える。
   */
  wordBoundaryHighlight: boolean;
  /** 行ハイライト（マウスホバー）。v1.0 では UI から外し、デフォルト false */
  lineHighlight: boolean;
  /** 読み上げ同期ハイライト。onboundary 不安定のため v1.0 では UI から外し、デフォルト false */
  ttsSyncHighlight: boolean;
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
  lineMode: 'zebra', // 隔行 zebra をデフォルト（研究で最も支持あり）
  highlightColor: 'subtle', // 控えめなグレー、まずは中立的に
  rubyEnabled: false, // 初期 OFF（必要な人だけ ON→ kuromoji 初期化）
  wakachiEnabled: false, // 初期 OFF
  lineZebra: true, // legacy 用、マイグレで lineMode に統合される
  wordBoundaryHighlight: false,
  lineHighlight: false,
  ttsSyncHighlight: false,
  maxWidth: 40, // 現状の CSS 既定値と一致
  ttsParagraphSync: false,
  focusMode: false,
  chunkedEnabled: false,
};

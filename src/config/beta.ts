/**
 * ベータ期間の運用フラグ。
 *
 * ベータが終わったら IS_BETA = false にするだけで、
 * アプリ内のテスター案内 UI（フッターの「💌 テスターさんへ」など）が
 * すべて自動で消えます。
 *
 * フィードバックフォームの URL は、Google Forms 等で塾長が作成したら
 * BETA_FEEDBACK_FORM_URL に入れてください。空文字のままなら、
 * アプリ内では「塾長から個別にお伝えします」と表示されます。
 */

/** ベータ期間中か */
export const IS_BETA = true;

/**
 * フィードバックフォーム URL（Google Forms 等）。
 * 空文字 = 未設定。アプリは「塾長から個別にお伝えします」と表示する。
 *
 * 例：
 *   export const BETA_FEEDBACK_FORM_URL = 'https://docs.google.com/forms/d/e/.../viewform';
 */
export const BETA_FEEDBACK_FORM_URL = '';

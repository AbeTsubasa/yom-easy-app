import { ensureTokenizer, tokenize } from './morphology';

/**
 * ふりがな（ルビ）生成。
 *
 * 設計方針：
 * - kuroshiro は classic kuromoji 経由で Node の path モジュールに依存しており、
 *   ブラウザでは動かない。代わりに既存の @sglkc/kuromoji を使い、
 *   tokenize 結果の reading（カタカナ）から自前で <ruby> を組み立てる。
 * - 送り仮名分離（漢字部分だけにルビを付ける）は v1.0 ではしない。
 *   token 単位で <ruby>学び<rt>まなび</rt></ruby> のように付与する。
 *   日本語学習者にとって「漢字とその読み」が見えるだけで十分有用。
 * - 漢字を含まない token はそのまま出力（ルビ不要）
 * - reading が空 / surface と同じ なら ルビ不要
 */

const KANJI_REGEX = /[一-鿿㐀-䶿]/;
const KATAKANA_REGEX = /[ァ-ヶ]/g;

function containsKanji(s: string): boolean {
  return KANJI_REGEX.test(s);
}

/** カタカナ → ひらがな（ふりがな表示はひらがなが一般的） */
function katakanaToHiragana(s: string): string {
  return s.replace(KATAKANA_REGEX, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0x60),
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 日本語テキストに HTML ruby タグでひらがな読みを付与する。
 * 戻り値は信頼できる HTML（kuromoji の出力 + 自前 escape）。
 */
export async function addFurigana(text: string): Promise<string> {
  await ensureTokenizer();
  const tokens = tokenize(text);
  let html = '';
  let cursor = 0;
  for (const token of tokens) {
    // tokens がカバーしない隙間（whitespace 等）は plain で出力
    if (cursor < token.charStart) {
      html += escapeHtml(text.slice(cursor, token.charStart)).replace(/\n/g, '<br>');
    }
    if (!containsKanji(token.surface)) {
      html += escapeHtml(token.surface).replace(/\n/g, '<br>');
    } else {
      const reading = katakanaToHiragana(token.reading);
      if (reading === token.surface || reading.length === 0) {
        html += escapeHtml(token.surface).replace(/\n/g, '<br>');
      } else {
        html += `<ruby>${escapeHtml(token.surface)}<rt>${escapeHtml(reading)}</rt></ruby>`;
      }
    }
    cursor = token.charEnd;
  }
  if (cursor < text.length) {
    html += escapeHtml(text.slice(cursor)).replace(/\n/g, '<br>');
  }
  return html;
}

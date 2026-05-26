import { ensureTokenizer, tokenize } from './morphology';

/**
 * ふりがな（ルビ）／分かち書きの HTML 生成エンジン。
 *
 * 設計方針：
 * - kuromoji の tokenize 結果から直接 HTML を組み立てる（kuroshiro 不要）
 * - ふりがなと分かち書きは独立した ON/OFF。両方 ON にも対応
 * - 句読点・改行の前後では分かち書きスペースを入れない（自然な見た目）
 * - 送り仮名分離は v1.0 では未対応：「学び」→<ruby>学び<rt>まなび</rt></ruby>
 *   学年フィルタ実装（Day 4-5）時に併せて検討予定
 */

const KANJI_REGEX = /[一-鿿㐀-䶿]/;
const KATAKANA_REGEX = /[ァ-ヶ]/g;
/** 分かち書きスペースを「挟まない」境界（句読点・括弧など） */
const NO_WAKACHI_BOUNDARY = /^[、。！？，．・「」『』（）()「」\s]+$/;

function containsKanji(s: string): boolean {
  return KANJI_REGEX.test(s);
}

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

export interface ReadingHtmlOptions {
  withFurigana?: boolean;
  withWakachi?: boolean;
}

/**
 * 日本語テキストに、ふりがな / 分かち書き / 両方 を施した HTML を返す。
 * 両方 false の場合でも tokenize は走るので、呼び出し側で判定して
 * このメソッドを呼ばないのが理想（通常描画にフォールバック）。
 */
export async function generateReadingHtml(
  text: string,
  options: ReadingHtmlOptions = {},
): Promise<string> {
  await ensureTokenizer();
  const tokens = tokenize(text);
  const wakachiSep = options.withWakachi
    ? '<span class="reading-area__wakachi"> </span>'
    : '';

  let html = '';
  let cursor = 0;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    // tokens がカバーしない隙間（whitespace 等）は plain で出力
    if (cursor < token.charStart) {
      html += escapeHtml(text.slice(cursor, token.charStart)).replace(/\n/g, '<br>');
    }
    // token を ruby か plain で出力
    if (options.withFurigana && containsKanji(token.surface)) {
      const reading = katakanaToHiragana(token.reading);
      if (reading.length > 0 && reading !== token.surface) {
        html += `<ruby>${escapeHtml(token.surface)}<rt>${escapeHtml(reading)}</rt></ruby>`;
      } else {
        html += escapeHtml(token.surface).replace(/\n/g, '<br>');
      }
    } else {
      html += escapeHtml(token.surface).replace(/\n/g, '<br>');
    }
    // wakachi separator（次の token がある & 句読点境界でない場合だけ）
    if (wakachiSep && i < tokens.length - 1) {
      const next = tokens[i + 1];
      const here = token.surface;
      const there = next.surface;
      if (!NO_WAKACHI_BOUNDARY.test(here) && !NO_WAKACHI_BOUNDARY.test(there)) {
        html += wakachiSep;
      }
    }
    cursor = token.charEnd;
  }
  if (cursor < text.length) {
    html += escapeHtml(text.slice(cursor)).replace(/\n/g, '<br>');
  }
  return html;
}

/** 後方互換：ふりがなのみ */
export async function addFurigana(text: string): Promise<string> {
  return generateReadingHtml(text, { withFurigana: true });
}

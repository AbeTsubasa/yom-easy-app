import { ensureTokenizer, tokenize, type Token } from './morphology';

/**
 * 読みエリア用 HTML 生成エンジン。
 *
 * 担当：
 *   - ふりがな（漢字に <ruby><rt> を付与）
 *   - 分かち書き（形態素境界に視覚的細スペース）
 *   - 文節改行（接続助詞・接続詞・句読点のあとに目に見える改行）
 *   - 段落ラップ（<p data-paragraph-i=N>）
 *
 * 段落ラップは Sprint 7 で追加：パラグラフ単位 TTS 同期 / Focus モードが
 * `[data-paragraph-i]` を頼りに「現在の段落」を識別するため、本文を
 * 必ず 1 段落 = 1 つの <p> で囲んで返す。
 *
 * 設計方針：
 * - 1 度の tokenize 結果から、4 機能（ふりがな・分かち書き・文節改行・段落）
 *   を独立 ON/OFF で組み上げる
 * - 句読点・括弧の前後では分かち書きスペースを入れない（自然な見た目）
 * - 文節改行が発火した場合、その境界では分かち書きスペースを出さない
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

function nl2br(s: string): string {
  return s.replace(/\n/g, '<br>');
}

/**
 * 文節（chunk）境界か。
 *
 * Tate, Collins & Williamson (2019) ベースで、ワーキングメモリ負荷を減らす
 * 単位で切る。日本語では次のいずれか。
 *
 *  - 句読点（、。，）
 *  - 接続詞（しかし／だから／そして 等）
 *  - 接続助詞（が／ので／から／けど／て／で／し／ば 等。IPA 辞書の pos_detail_1）
 *
 * 単独の助詞（格助詞「は」「を」「に」など）は意味の分節として弱いので切らない。
 */
function isChunkBoundary(token: Token): boolean {
  if (token.surface === '、' || token.surface === '，' || token.surface === '。') {
    return true;
  }
  if (token.pos === '接続詞') return true;
  if (token.pos === '助詞' && token.posDetail1 === '接続助詞') return true;
  return false;
}

export interface ReadingHtmlOptions {
  withFurigana?: boolean;
  withWakachi?: boolean;
  /** 文節（句読点・接続助詞・接続詞）の後で目に見える改行を入れる */
  withChunked?: boolean;
}

/**
 * 段落のメタ情報。`generateReadingHtml` が同時に返し、`reading-area` の
 * パラグラフ同期 / Focus モードが利用する。
 */
export interface ParagraphMeta {
  /** 0 起点。段落 index（空段落をスキップした順番） */
  index: number;
  /** 原文 text 上での開始 char offset（end は含まない） */
  charStart: number;
  /** 原文 text 上での終了 char offset（exclusive） */
  charEnd: number;
  /** 段落の生テキスト（TTS にそのまま渡せる） */
  text: string;
}

export interface ReadingHtmlResult {
  html: string;
  paragraphs: ParagraphMeta[];
}

/**
 * 日本語テキストに、ふりがな / 分かち書き / 文節改行 / 段落ラップ を施した
 * HTML と、段落メタ情報を返す。
 *
 * 返す HTML は常に <p data-paragraph-i="N">...</p> の連結。
 * 単一段落のテキストでも <p data-paragraph-i="0">...</p> で囲まれる。
 */
export async function generateReadingHtml(
  text: string,
  options: ReadingHtmlOptions = {},
): Promise<ReadingHtmlResult> {
  await ensureTokenizer();
  const tokens = tokenize(text);

  // 段落境界を計算（原文 text 上での charStart / charEnd）
  const paragraphMetas: ParagraphMeta[] = [];
  let cursor = 0;
  for (const part of text.split(/(\n{2,})/)) {
    if (/^\n{2,}$/.test(part)) {
      cursor += part.length; // 区切り自体は描画しない
    } else if (part.length > 0) {
      if (part.trim().length > 0) {
        paragraphMetas.push({
          index: paragraphMetas.length,
          charStart: cursor,
          charEnd: cursor + part.length,
          text: part,
        });
      }
      cursor += part.length;
    }
  }

  // 段落が一つも無い（全部空白）場合は空の HTML を返す
  if (paragraphMetas.length === 0) {
    return { html: '', paragraphs: [] };
  }

  const wakachiSep = '<span class="reading-area__wakachi"> </span>';
  const chunkBreak = '<span class="reading-area__chunk-break" aria-hidden="true"></span>';

  let html = '';
  for (const p of paragraphMetas) {
    // この段落に属する tokens
    const pTokens = tokens.filter(
      (t) => t.charStart >= p.charStart && t.charEnd <= p.charEnd,
    );

    let inner = '';
    let pCursor = p.charStart;

    for (let i = 0; i < pTokens.length; i++) {
      const token = pTokens[i];

      // token 開始までの隙間（空白・記号等）を出力
      if (pCursor < token.charStart) {
        inner += nl2br(escapeHtml(text.slice(pCursor, token.charStart)));
      }

      // token 本体：ふりがな or プレーン
      if (options.withFurigana && containsKanji(token.surface)) {
        const reading = katakanaToHiragana(token.reading);
        if (reading.length > 0 && reading !== token.surface) {
          inner += `<ruby>${escapeHtml(token.surface)}<rt>${escapeHtml(reading)}</rt></ruby>`;
        } else {
          inner += nl2br(escapeHtml(token.surface));
        }
      } else {
        inner += nl2br(escapeHtml(token.surface));
      }

      pCursor = token.charEnd;

      // 段落内の最後の token なら、文節改行も分かち書きも入れない
      if (i === pTokens.length - 1) continue;

      // 文節改行（chunked）と分かち書き（wakachi）は排他：
      // 改行が優先（改行のあとに見えないスペースは不要）。
      const next = pTokens[i + 1];
      const chunkHere = options.withChunked && isChunkBoundary(token);
      if (chunkHere) {
        inner += chunkBreak;
      } else if (
        options.withWakachi &&
        !NO_WAKACHI_BOUNDARY.test(token.surface) &&
        !NO_WAKACHI_BOUNDARY.test(next.surface)
      ) {
        inner += wakachiSep;
      }
    }

    // 末尾の余り（最後の token から段落末まで）
    if (pCursor < p.charEnd) {
      inner += nl2br(escapeHtml(text.slice(pCursor, p.charEnd)));
    }

    html += `<p data-paragraph-i="${p.index}">${inner}</p>`;
  }

  return { html, paragraphs: paragraphMetas };
}

/** 後方互換：ふりがなのみ。HTML 部分だけ返す。 */
export async function addFurigana(text: string): Promise<string> {
  const { html } = await generateReadingHtml(text, { withFurigana: true });
  return html;
}

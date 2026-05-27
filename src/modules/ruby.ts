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
/**
 * 句読点判定（小ヘルパ）。接続助詞の直後にこれが来る場合は、改行を
 * 句読点側に任せて二重改行を防ぐ。
 */
function isPunctuation(surface: string): boolean {
  return surface === '、' || surface === '，' || surface === '。' || surface === '？' || surface === '！';
}

/**
 * 「token のあと」で文節改行を入れるべきか。next を見て、接続助詞のあとに
 * 句読点が続く場合は false にする（句読点側で 1 度だけ改行する）。
 *
 *   例：「起きると、段落」→ 「と」のあと FALSE、「、」のあと TRUE
 *        結果：「起きると、↵ 段落」（「、」が孤立しない）
 */
function shouldBreakAfter(token: Token, next: Token | undefined): boolean {
  // 句読点本体：常に「あと」で改行
  if (isPunctuation(token.surface)) return true;
  // 接続詞・接続助詞：次が句読点なら改行を句読点に譲る
  const isConjunctive =
    token.pos === '接続詞' ||
    (token.pos === '助詞' && token.posDetail1 === '接続助詞');
  if (isConjunctive) {
    if (next && isPunctuation(next.surface)) return false;
    return true;
  }
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
 * 英文かどうかを大まかに判定（Sprint 11：英文対応）。
 * ASCII の英字が CJK 文字より十分多ければ英文扱い。
 * 完全な言語判定ではないが、教科書・配布資料の英文／和文を見分けるには十分。
 */
function isEnglishDominant(text: string): boolean {
  let asciiLetters = 0;
  let cjk = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code === undefined) continue;
    if ((code >= 0x41 && code <= 0x5a) || (code >= 0x61 && code <= 0x7a)) {
      asciiLetters++;
    } else if (
      // ひらがな・カタカナ・漢字（CJK 統合漢字を含む）・全角記号
      (code >= 0x3040 && code <= 0x9fff) ||
      (code >= 0xff00 && code <= 0xffef)
    ) {
      cjk++;
    }
  }
  // 英字が CJK の 2 倍以上、かつ最低 5 文字あれば英文扱い
  return asciiLetters >= 5 && asciiLetters > cjk * 2;
}

/**
 * 英文用の文節改行 HTML を生成（Sprint 11）。
 * kuromoji は使わず、句読点・接続詞をパターンマッチで切る。
 *
 * 切る箇所：
 *   - カンマ／セミコロン／コロンの直後（数字内の `1.5` などは除く）
 *   - センテンス末（. ! ?）の直後（次の語が大文字で始まる場合）
 *   - 接続詞 and / but / or / so / because / while / although / however /
 *     therefore / moreover / nor / yet / whereas の直前
 */
function applyEnglishChunkedHtml(escapedHtml: string): string {
  const chunkBreak =
    '<span class="reading-area__chunk-break" aria-hidden="true"></span>';
  let out = escapedHtml;
  // 1) 句読点 + 空白 → 句読点 + chunkBreak。数字内の小数点等は前後の空白条件で
  //    自然と除外される（`1, 234` のような桁区切りは英文では稀）。
  out = out.replace(/([,;:])\s+/g, `$1${chunkBreak}`);
  // 2) 文末（. ! ?）の後ろが大文字なら次文の頭で改行
  out = out.replace(/([.!?])\s+(?=[A-Z])/g, `$1${chunkBreak}`);
  // 3) 接続詞の直前で改行（語境界判定）
  out = out.replace(
    /\s+(?=\b(?:and|but|or|so|because|while|although|however|therefore|moreover|nor|yet|whereas)\b)/gi,
    chunkBreak,
  );
  return out;
}

/** 段落分割を 1 か所にまとめたヘルパ（日英いずれも同じ規則）。 */
function splitIntoParagraphMetas(text: string): ParagraphMeta[] {
  const metas: ParagraphMeta[] = [];
  let cursor = 0;
  for (const part of text.split(/(\n{2,})/)) {
    if (/^\n{2,}$/.test(part)) {
      cursor += part.length;
    } else if (part.length > 0) {
      if (part.trim().length > 0) {
        metas.push({
          index: metas.length,
          charStart: cursor,
          charEnd: cursor + part.length,
          text: part,
        });
      }
      cursor += part.length;
    }
  }
  return metas;
}

/**
 * 日本語段落 1 つを HTML 化（ふりがな / 分かち書き / 文節改行を反映）。
 * tokens は段落範囲に絞り込み済みのものを渡してもよいが、ここでは「全文の
 * tokens から charStart/charEnd でフィルタ」する方が呼び出し側がシンプル。
 */
function renderJapaneseParagraph(
  p: ParagraphMeta,
  allText: string,
  allTokens: Token[],
  options: ReadingHtmlOptions,
): string {
  const wakachiSep = '<span class="reading-area__wakachi"> </span>';
  const chunkBreak = '<span class="reading-area__chunk-break" aria-hidden="true"></span>';

  const pTokens = allTokens.filter(
    (t) => t.charStart >= p.charStart && t.charEnd <= p.charEnd,
  );

  let inner = '';
  let pCursor = p.charStart;

  for (let i = 0; i < pTokens.length; i++) {
    const token = pTokens[i];

    if (pCursor < token.charStart) {
      inner += nl2br(escapeHtml(allText.slice(pCursor, token.charStart)));
    }

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

    if (i === pTokens.length - 1) continue;

    const next = pTokens[i + 1];
    const chunkHere = options.withChunked && shouldBreakAfter(token, next);
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

  if (pCursor < p.charEnd) {
    inner += nl2br(escapeHtml(allText.slice(pCursor, p.charEnd)));
  }

  return `<p data-paragraph-i="${p.index}">${inner}</p>`;
}

/**
 * 英語段落 1 つを HTML 化（文節改行のみ反映）。
 * ふりがな・分かち書きは英文では自然に不要。
 */
function renderEnglishParagraph(
  p: ParagraphMeta,
  options: ReadingHtmlOptions,
): string {
  let inner = nl2br(escapeHtml(p.text));
  if (options.withChunked) {
    inner = applyEnglishChunkedHtml(inner);
  }
  return `<p data-paragraph-i="${p.index}">${inner}</p>`;
}

/**
 * 日英混在テキストに、ふりがな / 分かち書き / 文節改行 / 段落ラップ を施した
 * HTML と、段落メタ情報を返す。
 *
 * 返す HTML は常に <p data-paragraph-i="N">...</p> の連結。
 * 単一段落のテキストでも <p data-paragraph-i="0">...</p> で囲まれる。
 *
 * Sprint 12：**段落ごとに**英文・和文を判定する。日英が同じ文書に混じっていても
 * 英語段落には英語規則、日本語段落には kuromoji 規則を適用する。
 * 全段落が英文なら kuromoji を一切起動しない（辞書ロード待ちなし）。
 */
export async function generateReadingHtml(
  text: string,
  options: ReadingHtmlOptions = {},
): Promise<ReadingHtmlResult> {
  const paragraphMetas = splitIntoParagraphMetas(text);
  if (paragraphMetas.length === 0) {
    return { html: '', paragraphs: [] };
  }

  // 段落ごとに言語を判定。日本語段落が 1 つでもあれば kuromoji 起動。
  const langs = paragraphMetas.map((p) => (isEnglishDominant(p.text) ? 'en' : 'ja'));
  const hasJapanese = langs.includes('ja');
  const needsTokenize =
    hasJapanese && (options.withFurigana || options.withWakachi || options.withChunked);

  let allTokens: Token[] = [];
  if (needsTokenize) {
    await ensureTokenizer();
    allTokens = tokenize(text);
  }

  let html = '';
  for (let i = 0; i < paragraphMetas.length; i++) {
    const p = paragraphMetas[i];
    if (langs[i] === 'en') {
      html += renderEnglishParagraph(p, options);
    } else {
      html += renderJapaneseParagraph(p, text, allTokens, options);
    }
  }

  return { html, paragraphs: paragraphMetas };
}

/* Sprint 12：旧 generateEnglishReadingHtml は段落単位処理に統合され、
   renderEnglishParagraph ＋ generateReadingHtml で代替済み。削除。 */

/** 後方互換：ふりがなのみ。HTML 部分だけ返す。 */
export async function addFurigana(text: string): Promise<string> {
  const { html } = await generateReadingHtml(text, { withFurigana: true });
  return html;
}

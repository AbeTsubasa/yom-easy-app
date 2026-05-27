/**
 * .docx ファイルから本文テキストを取り出す（mammoth.js 経由）。
 *
 * 設計方針：
 * - 動的 import：.docx を選んだときだけ mammoth (~150KB) をロード。
 *   普段使い（.txt / .md / .pdf 等）の初期バンドルには載らない。
 * - mammoth.extractRawText は <span class="x">…</span> 等を全部捨てて、
 *   段落構造を改行で表現したプレーンテキストを返す。Yom-easy は本文を
 *   読みやすくするツールなので、書式は不要（プレーンが正解）。
 * - すべて端末内で完結。サーバーには送らない（プライバシー第 1 原則）。
 * - mammoth が warnings を返した場合（フォント情報の欠落など）も、
 *   本文が取れていれば成功として扱う。
 */

export interface DocxExtractResult {
  ok: true;
  text: string;
  /** 何ら本文が取れなかった = ファイルが空 / 壊れている可能性 */
  isEmpty: boolean;
}

export interface DocxExtractFailure {
  ok: false;
  reason: 'unreadable';
}

/**
 * .docx の File を受け取り、本文テキストを返す。
 *
 * mammoth は `Buffer` ではなく `ArrayBuffer` でも受けてくれる。
 * （ブラウザ向け：mammoth.browser ではなく、最近の mammoth は両対応）
 */
export async function extractDocxText(
  file: File,
): Promise<DocxExtractResult | DocxExtractFailure> {
  try {
    const buffer = await file.arrayBuffer();
    // 動的 import：CJS/ESM の差を吸収する shape guard。
    const mod: unknown = await import('mammoth');
    const candidate =
      (typeof mod === 'object' && mod !== null && 'default' in mod
        ? (mod as { default: unknown }).default
        : null) ?? mod;
    if (
      !candidate ||
      typeof candidate !== 'object' ||
      typeof (candidate as { extractRawText?: unknown }).extractRawText !== 'function'
    ) {
      console.error('[extract-docx] mammoth loaded but extractRawText is missing');
      return { ok: false, reason: 'unreadable' };
    }
    const mammoth = candidate as {
      extractRawText: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
    };
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    const text = (result.value ?? '').trim();
    return { ok: true, text, isEmpty: text.length === 0 };
  } catch (e) {
    console.error('[extract-docx] failed:', e);
    return { ok: false, reason: 'unreadable' };
  }
}

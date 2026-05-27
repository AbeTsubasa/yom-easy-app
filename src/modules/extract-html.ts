/**
 * .html / .htm から本文テキストを取り出す。
 *
 * 設計：
 * - ライブラリ不要。ブラウザ標準の DOMParser を使う。
 * - script / style / noscript / template / iframe を除去してから textContent。
 * - 段落っぽい要素（p / pre / h1-h6 / li / br など）の末尾に改行を入れる軽い後処理。
 * - 「保存したウェブページ」「学校配布の HTML 教材」が対象。
 */

const BLOCK_TAGS = new Set([
  'P',
  'DIV',
  'SECTION',
  'ARTICLE',
  'HEADER',
  'FOOTER',
  'NAV',
  'ASIDE',
  'MAIN',
  'BLOCKQUOTE',
  'PRE',
  'LI',
  'TR',
  'TD',
  'TH',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HR',
]);

export interface HtmlExtractResult {
  ok: true;
  text: string;
  isEmpty: boolean;
}

export interface HtmlExtractFailure {
  ok: false;
  reason: 'unreadable';
}

export async function extractHtmlText(
  file: File,
): Promise<HtmlExtractResult | HtmlExtractFailure> {
  try {
    const raw = await file.text();
    const doc = new DOMParser().parseFromString(raw, 'text/html');
    // 不要な要素を除去
    doc
      .querySelectorAll('script, style, noscript, template, iframe, svg, link, meta')
      .forEach((el) => el.remove());

    // body をベースに、ブロック要素の境目で改行を入れる軽い変換
    const root = doc.body ?? doc.documentElement;
    const text = extractWithLineBreaks(root).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
    const trimmed = text.trim();
    return { ok: true, text: trimmed, isEmpty: trimmed.length === 0 };
  } catch (e) {
    console.error('[extract-html] failed:', e);
    return { ok: false, reason: 'unreadable' };
  }
}

function extractWithLineBreaks(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent ?? '').replace(/\s+/g, ' ');
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return '';
  const el = node as Element;
  const tag = el.tagName.toUpperCase();
  if (tag === 'BR') return '\n';
  let inner = '';
  for (const child of Array.from(el.childNodes)) {
    inner += extractWithLineBreaks(child);
  }
  // ブロック要素の前後に改行（連続改行は後処理で潰す）
  if (BLOCK_TAGS.has(tag)) {
    return `\n${inner}\n`;
  }
  return inner;
}

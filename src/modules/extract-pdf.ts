/**
 * PDF（テキスト系）からテキストを取り出す（pdfjs-dist 経由）。
 *
 * 大切な区別：
 *  - **テキスト PDF**：本文が文字データとして埋め込まれている。これは取れる。
 *  - **スキャン PDF**：本文がページ画像。文字データが無いので、ここでは取れない。
 *    返り値の isLikelyScanned が true で、UI 側で「カメラ機能で 1 ページずつ
 *    読み取ってください」と案内する。
 *
 * 設計方針：
 * - 動的 import：PDF を選んだときだけ pdfjs (~300KB) を読む。
 * - Worker は Vite の `?url` インポートで別アセット化。ローカル配信のみ。
 *   CDN フォールバックには頼らない（プライバシー第 1 原則）。
 * - 全ページ走査。各 page.getTextContent() の items を空白で連結し、
 *   行末ヒント（hasEOL）で改行を入れる。ページ間は空段落（\n\n）で区切る。
 */

// 静的 import：Vite がワーカーを別ファイルとしてバンドル＆指紋付き URL を返す。
// extract-pdf.ts 自体が file-loader から動的 import されるので、ここに置いても
// 初期バンドルには載らない（このモジュール本体が遅延ロードされる時に同時に解決される）。
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

export interface PdfExtractResult {
  ok: true;
  text: string;
  /**
   * テキストがほぼ取れなかった場合 true。
   * → ユーザーに「スキャン PDF はカメラ機能で 1 ページずつ」と案内する判定に使う。
   */
  isLikelyScanned: boolean;
  /** ページ数（情報表示用） */
  pageCount: number;
}

export interface PdfExtractFailure {
  ok: false;
  reason: 'unreadable';
}

/** テキストがほぼ無い PDF を「スキャン」と判定する閾値（文字数）。 */
const SCANNED_THRESHOLD_CHARS = 20;

export async function extractPdfText(
  file: File,
): Promise<PdfExtractResult | PdfExtractFailure> {
  try {
    const buffer = await file.arrayBuffer();

    // pdfjs-dist は ESM only（v5+）。動的 import で読み、worker は静的 URL で設定。
    const pdfjs = await import('pdfjs-dist');
    // worker は 1 度だけセットすればよい（idempotent）
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

    const loadingTask = pdfjs.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;

    const pageTexts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      // items は TextItem または TextMarkedContent。本文は TextItem の str。
      let pageText = '';
      for (const item of content.items) {
        if (!('str' in item)) continue;
        pageText += item.str;
        // hasEOL: その item が行末で終わっている → 改行を入れる
        if ((item as { hasEOL?: boolean }).hasEOL) {
          pageText += '\n';
        } else {
          // 単語間スペースを失わないために 1 文字スペース（PDF は基本そうなる）
          // 日本語は文字どうしくっつくので、半角空白が増えても弊害少ない
          pageText += ' ';
        }
      }
      pageTexts.push(pageText.trim());
      // 早めにメモリ解放
      page.cleanup();
    }
    // PDF のクリーンアップ
    await pdf.cleanup();
    await pdf.destroy();

    const text = pageTexts.filter((t) => t.length > 0).join('\n\n').trim();
    const isLikelyScanned = text.length < SCANNED_THRESHOLD_CHARS && pdf.numPages > 0;
    return {
      ok: true,
      text,
      isLikelyScanned,
      pageCount: pdf.numPages,
    };
  } catch (e) {
    console.error('[extract-pdf] failed:', e);
    return { ok: false, reason: 'unreadable' };
  }
}

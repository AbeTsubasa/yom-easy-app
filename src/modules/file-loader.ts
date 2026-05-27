/**
 * テキスト・文書ファイルの読み込みラッパー（Sprint 9：複数形式対応）。
 *
 * 受け入れる形式：
 *  - .txt / .md  → そのまま読む（UTF-8）
 *  - .docx       → mammoth.js でテキスト抽出（動的 import）
 *  - .pdf        → pdfjs-dist でテキスト抽出（動的 import）。スキャン PDF は
 *                  isLikelyScanned で識別し、カメラ機能への案内を返す
 *  - .html/.htm  → DOMParser でタグ剥がし（ライブラリ不要）
 *
 * 受け入れない形式（FileLoadResult.reason で UI に丁寧な代替案内を出す）：
 *  - .doc        → 「Word で『.docx で保存し直して』」
 *  - .pages      → 「Pages で『.docx 形式で書き出して』」
 *  - .odt / .rtf → 「他のテキスト形式に変換してください」
 *
 * 設計方針：
 * - 形式判定は拡張子ベース（MIME は不安定でブラウザ差大）
 * - 抽出処理はすべて端末内（プライバシー第 1 原則）
 * - エラーは Discriminated Union で UI 側に渡し、文言は呼び出し側で組む
 */

import { extractDocxText } from './extract-docx';
import { extractHtmlText } from './extract-html';
import { extractPdfText } from './extract-pdf';

/** UI 表示・accept 属性で使う対応拡張子の一覧 */
export const ACCEPTED_EXTENSIONS = [
  '.txt',
  '.md',
  '.docx',
  '.pdf',
  '.html',
  '.htm',
] as const;
export const ACCEPT_ATTR = ACCEPTED_EXTENSIONS.join(',');

/** ファイルサイズ上限（PDF は重いので少し緩める） */
export const MAX_BYTES_TEXT = 2 * 1024 * 1024; // 2 MB（.txt / .md / .html）
export const MAX_BYTES_DOC = 10 * 1024 * 1024; // 10 MB（.docx / .pdf）

/**
 * 失敗理由。UI 側で丁寧な日本語メッセージに展開される。
 *  - 'wrong-type'             : 知らない拡張子
 *  - 'too-large'              : サイズ上限超え
 *  - 'unreadable'             : 中身を取り出せなかった
 *  - 'doc-legacy'             : .doc（旧 Word）→ .docx に保存し直す案内
 *  - 'pages-proprietary'      : .pages → 書き出し案内
 *  - 'other-doc-format'       : .odt / .rtf 等の汎用「他形式変換」案内
 *  - 'pdf-likely-scanned'     : テキストが取れない PDF（カメラ案内）
 */
export type FileLoadFailureReason =
  | 'wrong-type'
  | 'too-large'
  | 'unreadable'
  | 'doc-legacy'
  | 'pages-proprietary'
  | 'other-doc-format'
  | 'pdf-likely-scanned';

export type FileLoadResult =
  | { ok: true; text: string; fileName: string }
  | { ok: false; reason: FileLoadFailureReason };

type Extension = '.txt' | '.md' | '.docx' | '.pdf' | '.html' | '.htm';

function detectExtension(name: string): Extension | null {
  const lower = name.toLowerCase();
  for (const ext of ACCEPTED_EXTENSIONS) {
    if (lower.endsWith(ext)) return ext;
  }
  return null;
}

/** ガイダンス対象の「対応していないが、案内を出したい」拡張子 */
function detectGuidedRejection(name: string): FileLoadFailureReason | null {
  const lower = name.toLowerCase();
  if (lower.endsWith('.doc')) return 'doc-legacy';
  if (lower.endsWith('.pages')) return 'pages-proprietary';
  if (lower.endsWith('.odt') || lower.endsWith('.rtf')) return 'other-doc-format';
  return null;
}

function readPlainText(file: File): Promise<FileLoadResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve({ ok: false, reason: 'unreadable' });
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        resolve({ ok: false, reason: 'unreadable' });
        return;
      }
      resolve({ ok: true, text: result, fileName: file.name });
    };
    try {
      reader.readAsText(file, 'utf-8');
    } catch {
      resolve({ ok: false, reason: 'unreadable' });
    }
  });
}

/**
 * 単一の File を読み込んでテキストを返す。
 * 失敗しても throw せず、必ず FileLoadResult で結果を返す。
 */
export async function loadTextFile(file: File): Promise<FileLoadResult> {
  // 1) 拡張子で対応／非対応を判定
  const ext = detectExtension(file.name);
  if (!ext) {
    // 「丁寧に断る」拡張子はそれ専用の reason
    const guided = detectGuidedRejection(file.name);
    return { ok: false, reason: guided ?? 'wrong-type' };
  }

  // 2) サイズ上限
  const isDocOrPdf = ext === '.docx' || ext === '.pdf';
  const maxBytes = isDocOrPdf ? MAX_BYTES_DOC : MAX_BYTES_TEXT;
  if (file.size > maxBytes) {
    return { ok: false, reason: 'too-large' };
  }

  // 3) 形式別ディスパッチ
  if (ext === '.txt' || ext === '.md') {
    return readPlainText(file);
  }
  if (ext === '.html' || ext === '.htm') {
    const r = await extractHtmlText(file);
    if (!r.ok) return { ok: false, reason: r.reason };
    if (r.isEmpty) return { ok: false, reason: 'unreadable' };
    return { ok: true, text: r.text, fileName: file.name };
  }
  if (ext === '.docx') {
    const r = await extractDocxText(file);
    if (!r.ok) return { ok: false, reason: r.reason };
    if (r.isEmpty) return { ok: false, reason: 'unreadable' };
    return { ok: true, text: r.text, fileName: file.name };
  }
  if (ext === '.pdf') {
    const r = await extractPdfText(file);
    if (!r.ok) return { ok: false, reason: r.reason };
    if (r.isLikelyScanned) {
      return { ok: false, reason: 'pdf-likely-scanned' };
    }
    return { ok: true, text: r.text, fileName: file.name };
  }

  // ここには到達しないはず（TypeScript の網羅チェック）
  return { ok: false, reason: 'unreadable' };
}

/**
 * DragEvent から最初の受け入れ可能なファイルを取り出して読み込む。
 * 複数ファイルがドロップされた場合は最初の 1 つだけを対象にする。
 */
export function loadFromDropEvent(event: DragEvent): Promise<FileLoadResult> | null {
  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return null;
  return loadTextFile(files[0]);
}

/**
 * テキストファイル（.txt / .md）の読み込みラッパー。
 *
 * 設計方針：
 * - 受け入れる形式は .txt / .md のみ（v1.0、Sprint 5 で OCR/画像追加）
 * - 最大サイズ 2MB（ブラウザの負荷とユーザー体験のバランス）
 * - エラーは Discriminated Union で UI 側に渡し、UI 側がコピーを選ぶ
 * - 「責めない」メッセージング前提：reason はキーだけ、文言は呼び出し側で
 */

export const ACCEPTED_EXTENSIONS = ['.txt', '.md'] as const;
export const ACCEPT_ATTR = ACCEPTED_EXTENSIONS.join(',');
export const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export type FileLoadResult =
  | { ok: true; text: string; fileName: string }
  | { ok: false; reason: 'wrong-type' | 'too-large' | 'unreadable' };

function hasAcceptedExtension(name: string): boolean {
  const lower = name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/**
 * 単一の File を読み込んでテキストを返す。
 * 失敗しても throw せず、必ず FileLoadResult で結果を返す（呼び出し側を try/catch から解放）。
 */
export function loadTextFile(file: File): Promise<FileLoadResult> {
  return new Promise((resolve) => {
    if (!hasAcceptedExtension(file.name)) {
      resolve({ ok: false, reason: 'wrong-type' });
      return;
    }
    if (file.size > MAX_BYTES) {
      resolve({ ok: false, reason: 'too-large' });
      return;
    }

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
 * DragEvent から最初の受け入れ可能なファイルを取り出して読み込む。
 * 複数ファイルがドロップされた場合は最初の1つだけを対象にする（v1.0）。
 */
export function loadFromDropEvent(event: DragEvent): Promise<FileLoadResult> | null {
  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return null;
  return loadTextFile(files[0]);
}

/**
 * カメラ/ファイル選択で取得した画像の読み込みラッパー。
 *
 * 設計方針：
 * - 画像はサーバーに送らず端末内で完結（CLAUDE.md「プライバシー・ローカルファースト」）
 * - URL.createObjectURL で <img> に表示できる URL に変換
 * - 呼び出し側は使い終わったら revokeObjectURL を必ず呼ぶこと（メモリリーク防止）
 * - 形式とサイズを早期チェック、責めないエラーメッセージのキーを返す
 */

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const ACCEPT_IMAGE_ATTR = 'image/*';
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB（高解像度の写真でも十分）

export type ImageLoadResult =
  | {
      ok: true;
      objectURL: string;
      file: File;
    }
  | {
      ok: false;
      reason: 'wrong-type' | 'too-large' | 'unreadable';
    };

function isAcceptedImageType(type: string): boolean {
  // image/* を受け入れる（HEIC など将来対応含むため広めに）
  return type.startsWith('image/');
}

/**
 * File を読み込んで Object URL を返す。
 * 失敗しても throw せず、必ず ImageLoadResult で結果を返す。
 */
export function loadImageFile(file: File): ImageLoadResult {
  if (!isAcceptedImageType(file.type)) {
    return { ok: false, reason: 'wrong-type' };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, reason: 'too-large' };
  }
  try {
    const objectURL = URL.createObjectURL(file);
    return { ok: true, objectURL, file };
  } catch {
    return { ok: false, reason: 'unreadable' };
  }
}

/** 使い終わった objectURL を解放（メモリリーク防止） */
export function disposeImage(objectURL: string): void {
  try {
    URL.revokeObjectURL(objectURL);
  } catch {
    // ignore
  }
}

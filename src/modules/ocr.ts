import type { Worker, ImageLike } from 'tesseract.js';

/**
 * Tesseract.js (OCR) のラッパー。
 *
 * 設計方針：
 * - Worker は lazy 初期化（初回 recognize 時にだけ作る）→ OCR を使わない利用者の通信量節約
 * - 言語データ（jpn + eng）は Tesseract.js が CDN（jsDelivr）から取得し、
 *   ブラウザの cache に残る（2回目以降は高速化）
 * - 画像はブラウザの Web Worker 内で完結処理。サーバーへは一切送らない
 *   （CLAUDE.md「OCR 画像はサーバーに送らない」）
 * - dynamic import で kuromoji と同じく CJS/ESM 両対応
 * - 進捗 callback はモジュールスコープ変数で「最後に渡されたもの」を使う
 *   （Tesseract.js v5 の createWorker logger は init 時固定のため）
 */

export interface OcrProgressEvent {
  /** 'loading tesseract core' / 'initializing api' / 'recognizing text' などのフェーズ名 */
  status: string;
  /** 0.0 - 1.0 */
  progress: number;
}

interface TesseractLog {
  status: string;
  progress: number;
}

interface TesseractModuleShape {
  createWorker: (
    langs?: string,
    oem?: number,
    options?: {
      logger?: (message: TesseractLog) => void;
    },
  ) => Promise<Worker>;
}

let cachedWorker: Worker | null = null;
let initPromise: Promise<Worker> | null = null;
/** 現在進行中の recognize に紐づく progress callback（recognize ごとに差し替え） */
let activeProgressCallback: ((event: OcrProgressEvent) => void) | null = null;

async function loadTesseract(): Promise<TesseractModuleShape> {
  const mod: unknown = await import('tesseract.js');
  const candidate =
    (typeof mod === 'object' && mod !== null && 'default' in mod
      ? (mod as { default: unknown }).default
      : null) ?? mod;
  if (
    !candidate ||
    typeof candidate !== 'object' ||
    typeof (candidate as { createWorker?: unknown }).createWorker !== 'function'
  ) {
    throw new Error('tesseract.js module loaded but createWorker() is missing');
  }
  return candidate as TesseractModuleShape;
}

/**
 * Worker を必要なら初期化して返す（once）。
 * 失敗時は initPromise を null に戻して、再試行可能に。
 */
export function ensureOcrWorker(): Promise<Worker> {
  if (cachedWorker) return Promise.resolve(cachedWorker);
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const tesseract = await loadTesseract();
      // jpn+eng で日本語の印刷物 + 英語混在文章をカバー
      const worker = await tesseract.createWorker('jpn+eng', 1, {
        logger: (m) => {
          if (activeProgressCallback) {
            activeProgressCallback({ status: m.status, progress: m.progress });
          }
        },
      });
      cachedWorker = worker;
      return worker;
    } catch (e) {
      initPromise = null;
      throw e;
    }
  })();
  return initPromise;
}

/**
 * 画像から文字を読み取り、トリム済みのテキストを返す。
 * progress 通知は recognize 開始から完了まで活性化。
 */
export async function recognizeImage(
  source: ImageLike,
  onProgress?: (event: OcrProgressEvent) => void,
): Promise<string> {
  activeProgressCallback = onProgress ?? null;
  try {
    const worker = await ensureOcrWorker();
    const result = await worker.recognize(source);
    return result.data.text.trim();
  } finally {
    activeProgressCallback = null;
  }
}

/**
 * Worker を破棄。キャンセル時 or アプリ終了時に呼ぶ。
 * 次回 recognize 時に再初期化される（言語データはブラウザ cache に残るので
 * 2回目以降はずっと速い）。
 */
export async function terminateOcr(): Promise<void> {
  if (cachedWorker) {
    try {
      await cachedWorker.terminate();
    } catch {
      // ignore
    }
    cachedWorker = null;
  }
  initPromise = null;
  activeProgressCallback = null;
}

export function isOcrInitialized(): boolean {
  return cachedWorker !== null;
}

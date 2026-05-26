import * as kuromoji from '@sglkc/kuromoji';

/**
 * 日本語形態素解析（kuromoji.js）のラッパー。
 *
 * 設計方針：
 * - 17MB の辞書を gunzip するため初期化は数秒かかる。
 *   ensureTokenizer() を await すれば1度だけ走り、以降は同じ tokenizer を再利用。
 * - メインスレッドで動かす（Web Worker 化は将来検討、まずは動くものを）
 * - 失敗しても throw を catch しやすいよう Promise で返す
 * - kuromoji の word_position は 1-based。ここで 0-based に変換して扱う
 */

export interface Token {
  /** 表層形（実際の文字列） */
  surface: string;
  /** 0-based 開始文字インデックス */
  charStart: number;
  /** charStart + surface.length */
  charEnd: number;
  /** 品詞（名詞・動詞・助詞...） */
  pos: string;
}

let cachedTokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null;
let initPromise: Promise<void> | null = null;

/** 辞書のパス。base URL を含めて Vite の本番ビルドでも正しく解決される */
function dictPath(): string {
  // import.meta.env.BASE_URL は末尾に '/' を含む（'/yom-easy-app/' or '/'）
  return `${import.meta.env.BASE_URL}dict`;
}

/**
 * tokenizer を初期化（once）。
 * 既に初期化済みなら即 resolve。
 * 初期化中なら同じ Promise を返す（複数 caller を共有）。
 */
export function ensureTokenizer(): Promise<void> {
  if (cachedTokenizer) return Promise.resolve();
  if (initPromise) return initPromise;

  initPromise = new Promise<void>((resolve, reject) => {
    kuromoji.builder({ dicPath: dictPath() }).build((err, tokenizer) => {
      if (err) {
        initPromise = null;
        reject(err);
        return;
      }
      cachedTokenizer = tokenizer;
      resolve();
    });
  });
  return initPromise;
}

/** 初期化済みかどうか */
export function isTokenizerReady(): boolean {
  return cachedTokenizer !== null;
}

/**
 * text を形態素配列に分解する。
 * 事前に ensureTokenizer() を呼んでおくこと（未初期化なら throw）。
 */
export function tokenize(text: string): Token[] {
  if (!cachedTokenizer) {
    throw new Error('Tokenizer not initialized. await ensureTokenizer() first.');
  }
  return cachedTokenizer.tokenize(text).map((t) => ({
    surface: t.surface_form,
    charStart: t.word_position - 1, // 1-based → 0-based
    charEnd: t.word_position - 1 + t.surface_form.length,
    pos: t.pos,
  }));
}

/**
 * charIndex から対応する token のインデックスを返す（2分探索、O(log n)）。
 * 見つからない場合（範囲外など）は、最も近い手前の token インデックスを返す。
 */
export function findTokenIndex(tokens: Token[], charIndex: number): number {
  if (tokens.length === 0) return -1;
  let lo = 0;
  let hi = tokens.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    const t = tokens[mid];
    if (charIndex < t.charStart) {
      hi = mid - 1;
    } else if (charIndex >= t.charEnd) {
      lo = mid + 1;
    } else {
      return mid;
    }
  }
  // 見つからなければ最近傍（手前寄り）
  return Math.max(0, Math.min(tokens.length - 1, lo - 1));
}

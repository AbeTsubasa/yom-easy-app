import type { Tokenizer, IpadicFeatures } from '@sglkc/kuromoji';

/**
 * 日本語形態素解析（kuromoji.js）のラッパー。
 *
 * 設計方針：
 * - kuromoji の import は dynamic import で「初回 ensureTokenizer 時のみ」評価。
 *   これにより、@sglkc/kuromoji の CJS 形式が原因で初期化エラーになっても
 *   アプリ全体（特にスマホ）が真っ白にならず、TTS 機能だけが落ちる範囲に閉じる。
 * - CJS と ESM の両モジュール形式に対応するため、default プロパティを揺れ吸収。
 * - 17MB の辞書を gunzip するため初期化は数秒かかる。一度だけ走り、以降は再利用。
 */

export interface Token {
  surface: string;
  charStart: number;
  charEnd: number;
  pos: string;
  /**
   * POS の下位分類 1（例：助詞 → '接続助詞' / '格助詞' など）。
   * 文節改行モードで「接続助詞のあと」で改行を入れるために必要。
   * IPA 辞書で未定義の語では '*' になる。
   */
  posDetail1: string;
  /** 読み（カタカナ）。kuromoji 辞書ベース。未知語は surface へフォールバック */
  reading: string;
}

let cachedTokenizer: Tokenizer<IpadicFeatures> | null = null;
let initPromise: Promise<void> | null = null;

function dictPath(): string {
  // import.meta.env.BASE_URL は末尾に '/' を含む（'/yom-easy-app/' or '/'）
  return `${import.meta.env.BASE_URL}dict`;
}

/** kuromoji のグローバル shape（CJS と ESM のどちらでもアクセスできる形に正規化） */
interface KuromojiModuleShape {
  builder: (opts: { dicPath: string }) => {
    build: (
      callback: (err: Error | null, tokenizer: Tokenizer<IpadicFeatures>) => void,
    ) => void;
  };
}

async function loadKuromoji(): Promise<KuromojiModuleShape> {
  const mod: unknown = await import('@sglkc/kuromoji');
  // CJS なら mod.default に本体、ESM なら mod 自体に named exports
  const candidate =
    (typeof mod === 'object' && mod !== null && 'default' in mod
      ? (mod as { default: unknown }).default
      : null) ?? mod;
  if (
    !candidate ||
    typeof candidate !== 'object' ||
    typeof (candidate as { builder?: unknown }).builder !== 'function'
  ) {
    throw new Error('kuromoji module loaded but builder() is missing');
  }
  return candidate as KuromojiModuleShape;
}

export function ensureTokenizer(): Promise<void> {
  if (cachedTokenizer) return Promise.resolve();
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const kuromoji = await loadKuromoji();
      await new Promise<void>((resolve, reject) => {
        kuromoji.builder({ dicPath: dictPath() }).build((err, tokenizer) => {
          if (err) {
            reject(err);
            return;
          }
          cachedTokenizer = tokenizer;
          resolve();
        });
      });
    } catch (e) {
      initPromise = null; // 失敗時はリセットして次回再試行可能に
      throw e;
    }
  })();
  return initPromise;
}

export function isTokenizerReady(): boolean {
  return cachedTokenizer !== null;
}

export function tokenize(text: string): Token[] {
  if (!cachedTokenizer) {
    throw new Error('Tokenizer not initialized. await ensureTokenizer() first.');
  }
  return cachedTokenizer.tokenize(text).map((t) => ({
    surface: t.surface_form,
    charStart: t.word_position - 1,
    charEnd: t.word_position - 1 + t.surface_form.length,
    pos: t.pos,
    posDetail1: t.pos_detail_1 ?? '*',
    reading: t.reading ?? t.surface_form,
  }));
}

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
  return Math.max(0, Math.min(tokens.length - 1, lo - 1));
}

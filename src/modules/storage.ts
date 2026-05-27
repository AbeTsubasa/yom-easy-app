import { DEFAULT_SETTINGS, type Settings } from '../types/settings';

/**
 * localStorage の Safe ラッパー。
 *
 * 設計方針：
 * - プライベートブラウジングや quota 超過などで localStorage が使えなくても、
 *   アプリ自体は動き続ける（保存に失敗しても throw しない）
 * - 個人情報は一切保存しない（設定値のみ）
 * - 保存先キーはバージョン付き。将来スキーマ変更時に v2 に切り替える
 */

export const STORAGE_KEYS = {
  settings: 'yom-easy:settings:v1',
  onboarding: 'yom-easy:onboarding:v1',
} as const;

/** localStorage が読み書きできるかをテスト */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__yom_easy_storage_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/**
 * 設定を localStorage から読み込む。
 * 失敗（JSON パースエラー、storage 不能等）の場合は null を返す。
 * 部分的に壊れた値は無視し、デフォルトとマージして返す。
 *
 * マイグレーション：v1 から v2 への移行で、単語境界/行hover/TTS同期は
 * 一旦すべて OFF に強制リセット（既存ユーザーが古い不正確なハイライトを
 * 引きずらないように）。lineZebra は未設定なら DEFAULT(true) で初期化される。
 */
export function loadSettings(): Settings | null {
  const raw = safeGet(STORAGE_KEYS.settings);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const merged: Settings = { ...DEFAULT_SETTINGS, ...(parsed as Partial<Settings>) };
    // 旧3ハイライトは強制 OFF（v1.0 では UI から削除済み）
    merged.wordBoundaryHighlight = false;
    merged.lineHighlight = false;
    merged.ttsSyncHighlight = false;
    // lineZebra → lineMode のマイグレ（保存値に lineMode がなければ lineZebra を見る）
    if (!('lineMode' in (parsed as object))) {
      merged.lineMode = merged.lineZebra ? 'zebra' : 'off';
    }
    // Sprint 7 で追加した 4 フラグは、保存値に無ければ DEFAULT_SETTINGS の値
    // （maxWidth=40, ttsParagraphSync=false, focusMode=false, chunkedEnabled=false）
    // で初期化される。spread の初期化で自動で埋まるので、明示的なマイグレは不要。
    // ただし、maxWidth が想定外の値（NaN や負値）になっていたら安全側に倒す。
    if (typeof merged.maxWidth !== 'number' || !Number.isFinite(merged.maxWidth)) {
      merged.maxWidth = DEFAULT_SETTINGS.maxWidth;
    }
    merged.maxWidth = Math.max(24, Math.min(90, merged.maxWidth));
    return merged;
  } catch {
    return null;
  }
}

/** 設定を localStorage に保存。失敗してもエラーにしない */
export function saveSettings(settings: Settings): boolean {
  return safeSet(STORAGE_KEYS.settings, JSON.stringify(settings));
}

/** 設定を消す */
export function clearSettings(): void {
  safeRemove(STORAGE_KEYS.settings);
}

/** オンボーディング完了済みか */
export function isOnboardingDone(): boolean {
  return safeGet(STORAGE_KEYS.onboarding) === 'done';
}

/** オンボーディング完了を記録 */
export function markOnboardingDone(): void {
  safeSet(STORAGE_KEYS.onboarding, 'done');
}

/**
 * debounce ラッパー。
 * onboarding やスライダー操作のように連続発火するイベントの保存を間引く。
 */
export function debounce<T extends unknown[]>(
  fn: (...args: T) => void,
  delayMs: number,
): (...args: T) => void {
  let timer: number | null = null;
  return (...args: T) => {
    if (timer !== null) window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      timer = null;
      fn(...args);
    }, delayMs);
  };
}

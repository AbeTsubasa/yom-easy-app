import { DEFAULT_SETTINGS, type Settings } from '../types/settings';

/**
 * 設定を URL hash で共有する仕組み。
 *
 * 設計方針：
 * - 設定値のみを Base64 で URL hash (#s=...) に格納
 * - テキスト本文は一切含めない（CLAUDE.md「個人情報非収集」）
 * - hash は HTTP リクエストに含まれないので、サーバーには到達しない
 * - 起動時、hash があれば localStorage より優先して適用
 * - 不正な hash は黙って無視（壊れたリンクでもアプリは動く）
 */

const HASH_KEY = 's';

function toBase64Url(str: string): string {
  // UTF-8 安全な Base64 エンコード（btoa は ASCII 専用なので encodeURIComponent でラップ）
  const utf8 = unescape(encodeURIComponent(str));
  return btoa(utf8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64: string): string {
  const padded = b64.replace(/-/g, '+').replace(/_/g, '/');
  const utf8 = atob(padded + '==='.slice((padded.length + 3) % 4));
  return decodeURIComponent(escape(utf8));
}

/**
 * 現在の設定で共有可能な URL を生成する。
 * 例：'https://abetsubasa.github.io/yom-easy-app/#s=eyJmb250...'
 */
export function buildShareUrl(settings: Settings): string {
  const json = JSON.stringify(settings);
  const encoded = toBase64Url(json);
  // 同じドメインの現在のパスに hash を付与
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#${HASH_KEY}=${encoded}`;
}

/**
 * 現在の URL hash から設定を復元する（あれば）。
 * 不正な hash は null を返す（呼び出し側はデフォルトにフォールバック）。
 */
export function readSettingsFromHash(): Settings | null {
  const hash = window.location.hash;
  if (!hash) return null;
  const match = hash.match(new RegExp(`(?:^#|&)${HASH_KEY}=([^&]+)`));
  if (!match) return null;
  try {
    const json = fromBase64Url(match[1]);
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object') return null;
    // 不足キーは DEFAULT で補う（前方互換）
    return { ...DEFAULT_SETTINGS, ...(parsed as Partial<Settings>) };
  } catch {
    return null;
  }
}

/** 適用済みの hash をクリア（次回起動で localStorage を使うため） */
export function clearHash(): void {
  try {
    history.replaceState(null, '', window.location.pathname);
  } catch {
    // ignore
  }
}

/**
 * テキストをクリップボードにコピー。
 * Clipboard API が使えない環境では textarea 経由でフォールバック。
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to legacy method
    }
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

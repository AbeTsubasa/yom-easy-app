import { copy } from '../copy/ja';

/**
 * アプリ最上部のヘッダー。
 * Sprint 1 では名前と短いタグラインのみ。
 * Sprint 1 後半以降に、設定パネル開閉ボタンなどをここに追加する想定。
 */
export function createHeader(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'app-header';
  header.setAttribute('role', 'banner');

  const inner = document.createElement('div');
  inner.className = 'app-header__inner';

  const title = document.createElement('h1');
  title.className = 'app-header__title';
  title.textContent = copy.app.name;

  const tagline = document.createElement('p');
  tagline.className = 'app-header__tagline';
  tagline.textContent = copy.app.tagline;

  inner.appendChild(title);
  inner.appendChild(tagline);
  header.appendChild(inner);
  return header;
}

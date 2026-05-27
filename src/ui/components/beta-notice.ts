import { copy } from '../copy/ja';
import { createFocusTrap, type FocusTrapHandle } from '../../modules/focus-trap';

/**
 * ベータ版テスター向けの案内モーダル（Sprint 13）。
 *
 * BETA_TESTERS.md の内容をアプリ内で見せるための表示専用モーダル。
 * IS_BETA フラグが true のときだけ、フッターのトリガーから開く。
 *
 * 設計：
 * - 既存の aid-navigator と同じ overlay + card の見せ方
 * - focus-trap モジュールで Tab を内側に閉じ、Esc / ✕ / 背景クリックで閉じる
 * - フィードバックフォーム URL が設定されていれば「フォームを開く」ボタン、
 *   未設定なら「塾長から個別にお伝えします」と説明だけ
 * - クライシス連絡先は `tel:` リンク化（スマホでタップ即発信）
 */

export interface BetaNoticeOptions {
  /** Google Forms 等の URL。空文字なら案内テキストのみ表示 */
  feedbackUrl: string;
  /** モーダルを閉じる（呼び出し側で DOM から取り除く） */
  onClose: () => void;
}

export function createBetaNotice(opts: BetaNoticeOptions): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'beta-notice';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'beta-notice-title');

  const card = document.createElement('div');
  card.className = 'beta-notice__card';

  // ヘッダー（タイトル＋ ✕）
  const header = document.createElement('div');
  header.className = 'beta-notice__header';

  const titleEl = document.createElement('h2');
  titleEl.id = 'beta-notice-title';
  titleEl.className = 'beta-notice__title';
  titleEl.textContent = copy.betaNotice.title;

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'beta-notice__close';
  closeButton.textContent = copy.drawer.closeLabel; // 既存の ✕ を流用
  closeButton.setAttribute('aria-label', copy.betaNotice.closeAria);
  closeButton.addEventListener('click', () => opts.onClose());

  header.appendChild(titleEl);
  header.appendChild(closeButton);

  // 本文（縦スクロール可能）
  const body = document.createElement('div');
  body.className = 'beta-notice__body';

  // イントロ
  appendParagraph(body, copy.betaNotice.intro);

  // 各セクション
  appendSection(body, copy.betaNotice.whatHeading, copy.betaNotice.whatBody);
  appendSectionWithBullets(
    body,
    copy.betaNotice.privacyHeading,
    copy.betaNotice.privacyBullets,
    copy.betaNotice.privacyTail,
  );
  appendSectionWithBullets(body, copy.betaNotice.rightsHeading, copy.betaNotice.rightsBullets);

  // フィードバック節（テキスト＋ CTA）
  const feedbackSection = document.createElement('section');
  feedbackSection.className = 'beta-notice__section';
  const feedbackHeading = document.createElement('h3');
  feedbackHeading.className = 'beta-notice__section-heading';
  feedbackHeading.textContent = copy.betaNotice.feedbackHeading;
  feedbackSection.appendChild(feedbackHeading);
  const feedbackP = document.createElement('p');
  feedbackP.className = 'beta-notice__paragraph';
  feedbackP.textContent = copy.betaNotice.feedbackBody;
  feedbackSection.appendChild(feedbackP);

  if (opts.feedbackUrl) {
    const cta = document.createElement('a');
    cta.className = 'beta-notice__feedback-cta';
    cta.href = opts.feedbackUrl;
    cta.target = '_blank';
    cta.rel = 'noopener noreferrer';
    cta.textContent = copy.betaNotice.feedbackCta;
    cta.setAttribute('aria-label', copy.betaNotice.feedbackCtaAria);
    feedbackSection.appendChild(cta);
  } else {
    const pending = document.createElement('p');
    pending.className = 'beta-notice__feedback-pending';
    pending.textContent = copy.betaNotice.feedbackFormPending;
    feedbackSection.appendChild(pending);
  }
  body.appendChild(feedbackSection);

  // クライシス連絡先
  const crisisSection = document.createElement('section');
  crisisSection.className = 'beta-notice__section beta-notice__section--crisis';
  const crisisHeading = document.createElement('h3');
  crisisHeading.className = 'beta-notice__section-heading';
  crisisHeading.textContent = copy.betaNotice.crisisHeading;
  crisisSection.appendChild(crisisHeading);
  appendParagraph(crisisSection, copy.betaNotice.crisisIntro);

  const crisisList = document.createElement('ul');
  crisisList.className = 'beta-notice__crisis-list';
  for (const contact of copy.betaNotice.crisisContacts) {
    const item = document.createElement('li');
    item.className = 'beta-notice__crisis-item';

    const label = document.createElement('span');
    label.className = 'beta-notice__crisis-label';
    label.textContent = contact.label;

    const telLink = document.createElement('a');
    telLink.className = 'beta-notice__crisis-tel';
    // tel: リンクで、空白を除いた数字のみ
    telLink.href = `tel:${contact.tel.replace(/[^0-9]/g, '')}`;
    telLink.textContent = contact.tel;
    telLink.setAttribute('aria-label', `${contact.label}に電話をかける`);

    item.appendChild(label);
    item.appendChild(telLink);
    if (contact.note) {
      const note = document.createElement('span');
      note.className = 'beta-notice__crisis-note';
      note.textContent = contact.note;
      item.appendChild(note);
    }
    crisisList.appendChild(item);
  }
  crisisSection.appendChild(crisisList);
  body.appendChild(crisisSection);

  // 締めの言葉
  const closing = document.createElement('p');
  closing.className = 'beta-notice__closing';
  closing.textContent = copy.betaNotice.closing;
  body.appendChild(closing);

  const signature = document.createElement('p');
  signature.className = 'beta-notice__signature';
  signature.textContent = copy.betaNotice.signature;
  body.appendChild(signature);

  // フッター（閉じるボタン）
  const footer = document.createElement('div');
  footer.className = 'beta-notice__footer';
  const footerClose = document.createElement('button');
  footerClose.type = 'button';
  footerClose.className = 'beta-notice__footer-close';
  footerClose.textContent = copy.betaNotice.close;
  footerClose.addEventListener('click', () => opts.onClose());
  footer.appendChild(footerClose);

  card.appendChild(header);
  card.appendChild(body);
  card.appendChild(footer);
  overlay.appendChild(card);

  // 背景クリックで閉じる（card 外側）
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) opts.onClose();
  });

  // Esc で閉じる
  const onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') opts.onClose();
  };
  document.addEventListener('keydown', onKeyDown);

  // focus trap。初期フォーカスは ✕ ではなく本文先頭、と思ったが、
  // 「閉じる」アクションが最も使う可能性が高いので、フッターの「閉じる」に当てる。
  let trap: FocusTrapHandle | null = null;
  const observer = new MutationObserver(() => {
    if (overlay.isConnected) {
      if (!trap) {
        trap = createFocusTrap({
          container: overlay,
          initialFocus: footerClose,
        });
      }
    } else {
      document.removeEventListener('keydown', onKeyDown);
      if (trap) {
        trap.detach();
        trap = null;
      }
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  return overlay;
}

// --- 小さなヘルパ ---

function appendParagraph(parent: HTMLElement, text: string): void {
  const p = document.createElement('p');
  p.className = 'beta-notice__paragraph';
  // \n を改行扱いするため、<br> ではなく white-space で対応
  p.style.whiteSpace = 'pre-wrap';
  p.textContent = text;
  parent.appendChild(p);
}

function appendSection(parent: HTMLElement, heading: string, body: string): void {
  const section = document.createElement('section');
  section.className = 'beta-notice__section';
  const h = document.createElement('h3');
  h.className = 'beta-notice__section-heading';
  h.textContent = heading;
  section.appendChild(h);
  appendParagraph(section, body);
  parent.appendChild(section);
}

function appendSectionWithBullets(
  parent: HTMLElement,
  heading: string,
  bullets: readonly string[],
  tail?: string,
): void {
  const section = document.createElement('section');
  section.className = 'beta-notice__section';
  const h = document.createElement('h3');
  h.className = 'beta-notice__section-heading';
  h.textContent = heading;
  section.appendChild(h);
  const ul = document.createElement('ul');
  ul.className = 'beta-notice__bullets';
  for (const b of bullets) {
    const li = document.createElement('li');
    li.className = 'beta-notice__bullet';
    li.textContent = b;
    ul.appendChild(li);
  }
  section.appendChild(ul);
  if (tail) {
    appendParagraph(section, tail);
  }
  parent.appendChild(section);
}

/**
 * モーダル用フォーカストラップ。
 *
 * 仕事は 4 つ：
 *  1. モーダルを開く直前のフォーカス要素を覚える。
 *  2. モーダル内の最初の focusable に初期フォーカスを当てる。
 *  3. Tab / Shift+Tab がモーダルの外に出ないように循環させる。
 *  4. detach() でモーダルを閉じたあと、開く前の要素へフォーカスを戻す。
 *
 * Esc キーは呼び出し側で扱う（image-preview のように既存のロジックがある場合、
 * 二重に処理すると混乱するため、ここでは扱わない）。
 *
 * 受け入れ基準（Sprint 6 Day 5）：
 *  - WCAG 2.4.3 Focus Order: モーダル内に閉じている限り Tab 順は予測可能
 *  - WCAG 2.4.7 Focus Visible: トラップ自体は :focus-visible のスタイルを上書きしない
 *  - WCAG 3.2.1 On Focus: フォーカス遷移だけで状態を変えない（クリック時のみ）
 */

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export interface FocusTrapOptions {
  /** モーダルのルート要素（この中だけにフォーカスを閉じる） */
  container: HTMLElement;
  /** 最初にフォーカスする要素（省略時：container 内の最初の focusable） */
  initialFocus?: HTMLElement | null;
  /** detach() 時に戻す要素を明示したいとき。省略時は activeElement を覚えておく */
  returnFocusTo?: HTMLElement | null;
}

export interface FocusTrapHandle {
  /** トラップを解除し、元のフォーカスへ戻す */
  detach: () => void;
}

function getFocusable(container: HTMLElement): HTMLElement[] {
  const nodes = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
  );
  return nodes.filter((el) => {
    // visibility / disabled / display:none を除外
    if (el.hasAttribute('disabled')) return false;
    if (el.getAttribute('aria-hidden') === 'true') return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    return true;
  });
}

/**
 * フォーカストラップを取り付ける。
 *
 * 使い方：
 *   const trap = createFocusTrap({ container: overlay });
 *   // ...モーダルを閉じるとき
 *   trap.detach();
 */
export function createFocusTrap(opts: FocusTrapOptions): FocusTrapHandle {
  const previouslyFocused =
    opts.returnFocusTo ?? (document.activeElement as HTMLElement | null);

  // 初期フォーカス
  const setInitialFocus = (): void => {
    if (opts.initialFocus && opts.container.contains(opts.initialFocus)) {
      opts.initialFocus.focus();
      return;
    }
    const focusables = getFocusable(opts.container);
    if (focusables.length > 0) {
      focusables[0].focus();
    } else {
      // フォーカス可能要素が無い場合、コンテナ自身に tabindex=-1 でフォーカス
      opts.container.setAttribute('tabindex', '-1');
      opts.container.focus();
    }
  };
  // DOM 反映を待ってフォーカス（マウント直後の競合対策）
  window.requestAnimationFrame(setInitialFocus);

  const onKeyDown = (e: KeyboardEvent): void => {
    if (e.key !== 'Tab') return;
    const focusables = getFocusable(opts.container);
    if (focusables.length === 0) {
      e.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;

    // Shift+Tab：最初の要素から後ろにはみ出そうとしたら、最後の要素へ
    if (e.shiftKey) {
      if (active === first || !opts.container.contains(active)) {
        e.preventDefault();
        last.focus();
      }
      return;
    }
    // Tab：最後の要素から前にはみ出そうとしたら、最初の要素へ
    if (active === last || !opts.container.contains(active)) {
      e.preventDefault();
      first.focus();
    }
  };

  // 万一フォーカスが外に逃げたら戻す（mousedown 等での逃避対策）
  const onFocusIn = (e: FocusEvent): void => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    if (opts.container.contains(target)) return;
    // 範囲外にフォーカスが移ったら、最初の focusable に戻す
    const focusables = getFocusable(opts.container);
    if (focusables.length > 0) {
      focusables[0].focus();
    } else {
      opts.container.focus();
    }
  };

  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('focusin', onFocusIn);

  return {
    detach: (): void => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('focusin', onFocusIn);
      if (previouslyFocused && document.contains(previouslyFocused)) {
        // フォーカスを戻す前に、要素が見えていることを念のため確認
        try {
          previouslyFocused.focus({ preventScroll: false });
        } catch {
          // ignore
        }
      }
    },
  };
}

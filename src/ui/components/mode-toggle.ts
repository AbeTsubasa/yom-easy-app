import { copy } from '../copy/ja';
import type { ViewMode } from '../../types/settings';

export interface ModeToggleOptions {
  initial: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export interface ModeToggleController {
  element: HTMLElement;
  setMode: (mode: ViewMode) => void;
}

/**
 * 「入力 / 読む」のモード切替タブ。
 * role=tablist + aria-selected で実装。キーボード ←→ でも切替可能。
 */
export function createModeToggle(opts: ModeToggleOptions): ModeToggleController {
  const container = document.createElement('div');
  container.className = 'mode-toggle';
  container.setAttribute('role', 'tablist');
  container.setAttribute('aria-label', '表示モードの切替');

  const editButton = makeButton('edit', copy.modes.edit, copy.modes.editAria);
  const readButton = makeButton('read', copy.modes.read, copy.modes.readAria);

  const buttons: Record<ViewMode, HTMLButtonElement> = {
    edit: editButton,
    read: readButton,
  };

  let currentMode: ViewMode = opts.initial;

  const applyState = (mode: ViewMode) => {
    currentMode = mode;
    (Object.entries(buttons) as [ViewMode, HTMLButtonElement][]).forEach(([key, btn]) => {
      const isActive = key === mode;
      btn.classList.toggle('mode-toggle__button--active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
      btn.tabIndex = isActive ? 0 : -1;
    });
  };

  const switchTo = (mode: ViewMode) => {
    if (mode === currentMode) return;
    applyState(mode);
    opts.onChange(mode);
  };

  editButton.addEventListener('click', () => switchTo('edit'));
  readButton.addEventListener('click', () => switchTo('read'));

  container.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const next: ViewMode = currentMode === 'edit' ? 'read' : 'edit';
    switchTo(next);
    buttons[next].focus();
  });

  container.appendChild(editButton);
  container.appendChild(readButton);
  applyState(opts.initial);

  return {
    element: container,
    setMode: applyState,
  };
}

function makeButton(mode: ViewMode, label: string, ariaLabel: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'mode-toggle__button';
  button.setAttribute('role', 'tab');
  button.setAttribute('aria-label', ariaLabel);
  button.dataset.mode = mode;
  button.textContent = label;
  return button;
}

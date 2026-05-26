import { copy } from './ui/copy/ja';
import {
  DEFAULT_SETTINGS,
  type FontFamilyKey,
  type Settings,
  type ViewMode,
} from './types/settings';
import { createHeader } from './ui/components/header';
import { createModeToggle } from './ui/components/mode-toggle';
import { createReadingArea } from './ui/components/reading-area';
import { createFileInput } from './ui/components/file-input';
import { createFontPicker } from './ui/components/font-picker';
import { createSettingsPanel } from './ui/components/settings-panel';
import { createSpacingControls } from './ui/components/spacing-controls';
import { loadTextFile, loadFromDropEvent, type FileLoadResult } from './modules/file-loader';
import { FONT_MAP } from './modules/font-registry';

interface AppState {
  text: string;
  mode: ViewMode;
  settings: Settings;
}

export function initApp(): void {
  const root = document.getElementById('app');
  if (!root) return;

  const state: AppState = {
    text: '',
    mode: 'edit',
    settings: { ...DEFAULT_SETTINGS },
  };

  // --- Style application helpers (CSS variable mutations) ---
  const applyFontFamily = (key: FontFamilyKey): void => {
    document.documentElement.style.setProperty('--font-family', FONT_MAP[key].stack);
  };
  const applyFontSize = (px: number): void => {
    document.documentElement.style.setProperty('--font-size', `${px}px`);
  };
  const applyLetterSpacing = (em: number): void => {
    document.documentElement.style.setProperty('--letter-spacing', `${em}em`);
  };
  const applyLineHeight = (ratio: number): void => {
    document.documentElement.style.setProperty('--line-height', String(ratio));
  };
  const applyWordSpacing = (em: number): void => {
    document.documentElement.style.setProperty('--word-spacing', `${em}em`);
  };

  applyFontFamily(state.settings.fontFamily);
  applyFontSize(state.settings.fontSize);
  applyLetterSpacing(state.settings.letterSpacing);
  applyLineHeight(state.settings.lineHeight);
  applyWordSpacing(state.settings.wordSpacing);

  // --- Error region ---
  const errorRegion = document.createElement('div');
  errorRegion.className = 'app-error';
  errorRegion.setAttribute('role', 'alert');
  errorRegion.setAttribute('aria-live', 'assertive');
  errorRegion.hidden = true;

  let errorTimer: number | null = null;
  const showError = (message: string): void => {
    errorRegion.textContent = message;
    errorRegion.hidden = false;
    if (errorTimer !== null) window.clearTimeout(errorTimer);
    errorTimer = window.setTimeout(() => {
      errorRegion.hidden = true;
      errorRegion.textContent = '';
      errorTimer = null;
    }, 6000);
  };
  const clearError = (): void => {
    if (errorTimer !== null) {
      window.clearTimeout(errorTimer);
      errorTimer = null;
    }
    errorRegion.hidden = true;
    errorRegion.textContent = '';
  };

  // --- Reading area ---
  const readingArea = createReadingArea({
    initialText: state.text,
    initialMode: state.mode,
    onTextChange: (text) => {
      state.text = text;
    },
  });

  // --- Mode toggle ---
  const modeToggle = createModeToggle({
    initial: state.mode,
    onChange: (mode) => {
      state.mode = mode;
      readingArea.setMode(mode);
      if (mode === 'edit') {
        readingArea.focusTextarea();
      }
    },
  });

  // --- File handling (shared between picker and drag&drop) ---
  const applyLoadResult = (result: FileLoadResult): void => {
    if (result.ok) {
      state.text = result.text;
      readingArea.setText(result.text);
      clearError();
    } else {
      const message =
        result.reason === 'wrong-type'
          ? copy.errors.fileWrongType
          : result.reason === 'too-large'
            ? copy.errors.fileTooLarge
            : copy.errors.fileUnreadable;
      showError(message);
    }
  };

  const fileInput = createFileInput({
    onFileSelected: async (file) => {
      const result = await loadTextFile(file);
      applyLoadResult(result);
    },
  });

  // --- Settings panel (Day 3: font picker; Day 4-5 でスライダー/色テーマを追加) ---
  const fontPicker = createFontPicker({
    initial: state.settings.fontFamily,
    onChange: (key) => {
      state.settings.fontFamily = key;
      applyFontFamily(key);
    },
  });

  const spacingControls = createSpacingControls({
    initial: {
      fontSize: state.settings.fontSize,
      letterSpacing: state.settings.letterSpacing,
      lineHeight: state.settings.lineHeight,
      wordSpacing: state.settings.wordSpacing,
    },
    onChange: {
      fontSize: (v) => {
        state.settings.fontSize = v;
        applyFontSize(v);
      },
      letterSpacing: (v) => {
        state.settings.letterSpacing = v;
        applyLetterSpacing(v);
      },
      lineHeight: (v) => {
        state.settings.lineHeight = v;
        applyLineHeight(v);
      },
      wordSpacing: (v) => {
        state.settings.wordSpacing = v;
        applyWordSpacing(v);
      },
    },
  });

  const settingsPanel = createSettingsPanel({
    children: [fontPicker.element, spacingControls.element],
  });

  // --- Layout ---
  const header = createHeader();

  const main = document.createElement('main');
  main.className = 'app-main';
  main.setAttribute('role', 'main');

  const controls = document.createElement('div');
  controls.className = 'app-controls';
  controls.appendChild(modeToggle.element);
  controls.appendChild(fileInput);

  main.appendChild(controls);
  main.appendChild(errorRegion);
  main.appendChild(readingArea.element);
  main.appendChild(settingsPanel);

  // --- Drag & Drop overlay (window-wide) ---
  const dropOverlay = document.createElement('div');
  dropOverlay.className = 'drop-overlay';
  dropOverlay.setAttribute('aria-hidden', 'true');
  const dropMessage = document.createElement('p');
  dropMessage.className = 'drop-overlay__message';
  dropMessage.textContent = copy.hints.dropToOpen;
  dropOverlay.appendChild(dropMessage);
  dropOverlay.hidden = true;

  let dragDepth = 0;
  const showOverlay = (): void => {
    dropOverlay.hidden = false;
  };
  const hideOverlay = (): void => {
    dragDepth = 0;
    dropOverlay.hidden = true;
  };
  const isFileDrag = (e: DragEvent): boolean =>
    Array.from(e.dataTransfer?.types ?? []).includes('Files');

  window.addEventListener('dragenter', (e) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    dragDepth += 1;
    showOverlay();
  });
  window.addEventListener('dragover', (e) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
  });
  window.addEventListener('dragleave', () => {
    dragDepth -= 1;
    if (dragDepth <= 0) hideOverlay();
  });
  window.addEventListener('drop', async (e) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    hideOverlay();
    const pending = loadFromDropEvent(e);
    if (!pending) {
      showError(copy.errors.fileUnreadable);
      return;
    }
    const result = await pending;
    applyLoadResult(result);
  });

  // --- Mount ---
  root.innerHTML = '';
  root.appendChild(header);
  root.appendChild(main);
  root.appendChild(dropOverlay);
}

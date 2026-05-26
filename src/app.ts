import { copy } from './ui/copy/ja';
import {
  DEFAULT_SETTINGS,
  type FontFamilyKey,
  type Settings,
  type ThemeKey,
  type ViewMode,
} from './types/settings';
import { createHeader } from './ui/components/header';
import { createModeToggle } from './ui/components/mode-toggle';
import { createReadingArea } from './ui/components/reading-area';
import { createFileInput } from './ui/components/file-input';
import { createFontPicker } from './ui/components/font-picker';
import { createSettingsPanel } from './ui/components/settings-panel';
import { createSpacingControls } from './ui/components/spacing-controls';
import { createColorControls } from './ui/components/color-controls';
import { createOnboarding } from './ui/components/onboarding';
import { loadTextFile, loadFromDropEvent, type FileLoadResult } from './modules/file-loader';
import { FONT_MAP } from './modules/font-registry';
import { THEME_MAP } from './modules/theme-registry';
import {
  loadSettings,
  saveSettings,
  isOnboardingDone,
  markOnboardingDone,
  debounce,
} from './modules/storage';

interface AppState {
  text: string;
  mode: ViewMode;
  settings: Settings;
}

export function initApp(): void {
  const root = document.getElementById('app');
  if (!root) return;

  // localStorage から復元。失敗時はデフォルト。
  const persisted = loadSettings();
  const state: AppState = {
    text: '',
    mode: 'edit',
    settings: persisted ?? { ...DEFAULT_SETTINGS },
  };

  /** 設定変更を localStorage に debounce 保存（連続スライダー操作などをまとめる） */
  const persistSettings = debounce(() => {
    saveSettings(state.settings);
  }, 300);

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
  /**
   * 色テーマは reading-area（textarea / プレビュー）にだけ適用する。
   * UI 部品（ヘッダー・設定パネル・ボタン等）は :root のデフォルト値で固定。
   * 派生色（accent / border / button 等）は触らない。
   */
  const applyThemePreset = (key: ThemeKey): void => {
    const preset = THEME_MAP[key];
    const root = document.documentElement.style;
    root.setProperty('--reading-bg', preset.bg);
    root.setProperty('--reading-text', preset.text);
  };
  const applyCustomBg = (color: string): void => {
    document.documentElement.style.setProperty('--reading-bg', color);
  };
  const applyCustomText = (color: string): void => {
    document.documentElement.style.setProperty('--reading-text', color);
  };

  applyFontFamily(state.settings.fontFamily);
  applyFontSize(state.settings.fontSize);
  applyLetterSpacing(state.settings.letterSpacing);
  applyLineHeight(state.settings.lineHeight);
  applyWordSpacing(state.settings.wordSpacing);
  applyThemePreset(state.settings.theme);
  if (state.settings.customBg) applyCustomBg(state.settings.customBg);
  if (state.settings.customText) applyCustomText(state.settings.customText);

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
      persistSettings();
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
        persistSettings();
      },
      letterSpacing: (v) => {
        state.settings.letterSpacing = v;
        applyLetterSpacing(v);
        persistSettings();
      },
      lineHeight: (v) => {
        state.settings.lineHeight = v;
        applyLineHeight(v);
        persistSettings();
      },
      wordSpacing: (v) => {
        state.settings.wordSpacing = v;
        applyWordSpacing(v);
        persistSettings();
      },
    },
  });

  const colorControls = createColorControls({
    initial: {
      theme: state.settings.theme,
      customBg: state.settings.customBg,
      customText: state.settings.customText,
    },
    onPresetChange: (key) => {
      state.settings.theme = key;
      state.settings.customBg = null;
      state.settings.customText = null;
      applyThemePreset(key);
      persistSettings();
    },
    onCustomBgChange: (color) => {
      state.settings.customBg = color;
      applyCustomBg(color);
      persistSettings();
    },
    onCustomTextChange: (color) => {
      state.settings.customText = color;
      applyCustomText(color);
      persistSettings();
    },
    onResetCustom: () => {
      state.settings.customBg = null;
      state.settings.customText = null;
      applyThemePreset(state.settings.theme);
      persistSettings();
    },
  });

  const settingsPanel = createSettingsPanel({
    children: [fontPicker.element, spacingControls.element, colorControls.element],
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

  // --- Onboarding (初回のみ表示) ---
  if (!isOnboardingDone()) {
    const onboardingEl = createOnboarding({
      onComplete: (result) => {
        state.settings.fontFamily = result.fontFamily;
        state.settings.theme = result.theme;
        state.settings.lineHeight = result.lineHeight;
        state.settings.customBg = null;
        state.settings.customText = null;
        applyFontFamily(result.fontFamily);
        applyThemePreset(result.theme);
        applyLineHeight(result.lineHeight);
        fontPicker.setSelection(result.fontFamily);
        colorControls.setPreset(result.theme);
        spacingControls.setLineHeight(result.lineHeight);
        markOnboardingDone();
        saveSettings(state.settings);
        onboardingEl.remove();
      },
      onSkip: () => {
        markOnboardingDone();
        onboardingEl.remove();
      },
    });
    root.appendChild(onboardingEl);
  }
}

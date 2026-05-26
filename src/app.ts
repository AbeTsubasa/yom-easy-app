import { copy } from './ui/copy/ja';
import {
  DEFAULT_SETTINGS,
  type FontFamilyKey,
  type Settings,
  type ThemeKey,
} from './types/settings';
import { createHeader } from './ui/components/header';
import { createReadingArea } from './ui/components/reading-area';
import { createFileInput } from './ui/components/file-input';
import { createFontPicker } from './ui/components/font-picker';
import { createSettingsPanel } from './ui/components/settings-panel';
import { createSpacingControls } from './ui/components/spacing-controls';
import { createColorControls } from './ui/components/color-controls';
import { createOnboarding } from './ui/components/onboarding';
import { createTtsControls, type TtsControlsController } from './ui/components/tts-controls';
import { createTtsSettings } from './ui/components/tts-settings';
import { loadTextFile, loadFromDropEvent, type FileLoadResult } from './modules/file-loader';
import { FONT_MAP } from './modules/font-registry';
import { THEME_MAP } from './modules/theme-registry';
import { createTts } from './modules/tts';
import {
  ensureTokenizer,
  tokenize,
  findTokenIndex,
  isTokenizerReady,
  type Token,
} from './modules/morphology';
import {
  loadSettings,
  saveSettings,
  isOnboardingDone,
  markOnboardingDone,
  debounce,
} from './modules/storage';

interface AppState {
  text: string;
  settings: Settings;
}

export function initApp(): void {
  const root = document.getElementById('app');
  if (!root) return;

  // localStorage から復元。失敗時はデフォルト。
  const persisted = loadSettings();
  const state: AppState = {
    text: '',
    settings: persisted ?? { ...DEFAULT_SETTINGS },
  };

  /** 設定変更を localStorage に debounce 保存 */
  const persistSettings = debounce(() => {
    saveSettings(state.settings);
  }, 300);

  // --- Style application helpers (CSS variable mutations) ---
  // すべて --reading-* 系を書き換え、textarea / preview のみに反映させる。
  // UI 部品（ヘッダー・設定パネル・ボタン）の見た目は決して変わらない。
  const applyFontFamily = (key: FontFamilyKey): void => {
    document.documentElement.style.setProperty('--reading-font-family', FONT_MAP[key].stack);
  };
  const applyFontSize = (px: number): void => {
    document.documentElement.style.setProperty('--reading-font-size', `${px}px`);
  };
  const applyLetterSpacing = (em: number): void => {
    document.documentElement.style.setProperty('--reading-letter-spacing', `${em}em`);
  };
  const applyLineHeight = (ratio: number): void => {
    document.documentElement.style.setProperty('--reading-line-height', String(ratio));
  };
  const applyWordSpacing = (em: number): void => {
    document.documentElement.style.setProperty('--reading-word-spacing', `${em}em`);
  };
  /**
   * 色テーマは reading-area（textarea / プレビュー）にだけ適用する。
   * UI 部品（ヘッダー・設定パネル・ボタン等）は :root のデフォルト値で固定。
   */
  const applyThemePreset = (key: ThemeKey): void => {
    const preset = THEME_MAP[key];
    const docStyle = document.documentElement.style;
    docStyle.setProperty('--reading-bg', preset.bg);
    docStyle.setProperty('--reading-text', preset.text);
  };
  const applyCustomBg = (color: string): void => {
    document.documentElement.style.setProperty('--reading-bg', color);
  };
  const applyCustomText = (color: string): void => {
    document.documentElement.style.setProperty('--reading-text', color);
  };

  // 初回適用
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

  // --- File handling ---
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
  const nativeFileInput = fileInput.querySelector(
    'input[type="file"]',
  ) as HTMLInputElement | null;

  // --- Reading area (preview-first, edit on demand) ---
  const readingArea = createReadingArea({
    initialText: state.text,
    onTextChange: (text) => {
      state.text = text;
    },
    onRequestOpenFile: () => {
      nativeFileInput?.click();
    },
  });

  // --- Settings components ---
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

  // --- TTS (Web Speech API) ---
  // ttsControls は後で代入するため、let で受けて onStateChange 内では遅延参照
  let ttsControlsRef: TtsControlsController | null = null;
  /** 現在再生中のトークン列。idle に戻ったらクリア */
  let currentTokens: Token[] | null = null;

  const tts = createTts({
    rate: state.settings.ttsRate,
    voiceURI: state.settings.ttsVoiceURI,
    onStateChange: (ttsState) => {
      ttsControlsRef?.syncToState(ttsState);
      if (ttsState === 'idle') {
        // 読み上げ終了：ハイライトを解除し、preview を通常描画に戻す
        currentTokens = null;
        readingArea.setHighlightTokens(null);
      }
    },
    onBoundary: (ev) => {
      if (!currentTokens) return;
      const idx = findTokenIndex(currentTokens, ev.charIndex);
      if (idx >= 0) readingArea.setHighlightIndex(idx);
    },
    onError: (reason) => {
      if (reason === 'unsupported') showError(copy.tts.unsupported);
      else if (reason === 'no-voice') showError(copy.tts.noJapaneseVoice);
    },
  });

  /** 「読み上げる」を押した時の処理：tokenize → preview に span 描画 → TTS 再生 */
  const startReading = async (): Promise<void> => {
    const text = state.text;
    if (!text.trim()) {
      showError(copy.tts.nothingToRead);
      return;
    }
    if (!tts.isSupported()) {
      showError(copy.tts.unsupported);
      return;
    }
    // kuromoji 未初期化なら準備中表示
    if (!isTokenizerReady()) {
      ttsControlsRef?.syncToState('loading');
    }
    try {
      await ensureTokenizer();
      currentTokens = tokenize(text);
      readingArea.setHighlightTokens(currentTokens);
      tts.play(text);
    } catch (e) {
      console.error('TTS preparation failed:', e);
      showError(copy.tts.preparingError);
      ttsControlsRef?.syncToState('idle');
    }
  };

  const ttsControls = createTtsControls({
    initialState: tts.state(),
    onPlay: () => {
      void startReading();
    },
    onPause: () => tts.pause(),
    onResume: () => tts.resume(),
    onStop: () => tts.stop(),
  });
  ttsControlsRef = ttsControls;

  const ttsSettings = createTtsSettings({
    initialRate: state.settings.ttsRate,
    initialVoiceURI: state.settings.ttsVoiceURI,
    tts,
    onRateChange: (rate) => {
      state.settings.ttsRate = rate;
      tts.updateOptions({ rate });
      persistSettings();
    },
    onVoiceChange: (voiceURI) => {
      state.settings.ttsVoiceURI = voiceURI;
      tts.updateOptions({ voiceURI });
      persistSettings();
    },
  });

  // reading-area の toolbar の先頭に TTS コントロールを差し込む
  readingArea.toolbar.insertBefore(ttsControls.element, readingArea.toolbar.firstChild);

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
    sections: [
      { title: copy.settings.fontHeading, body: fontPicker.element },
      { title: copy.settings.spacingHeading, body: spacingControls.element },
      { title: copy.settings.colorHeading, body: colorControls.element },
      { title: copy.settings.ttsHeading, body: ttsSettings.element },
    ],
    // initialOpenIndex は指定しない → 最初は全て閉じる
  });

  // --- Drawer state (mobile only — controlled by CSS media queries + JS toggle) ---
  const drawerBackdrop = document.createElement('div');
  drawerBackdrop.className = 'settings-backdrop';
  drawerBackdrop.dataset.open = 'false';
  drawerBackdrop.setAttribute('aria-hidden', 'true');

  const drawerCloseButton = document.createElement('button');
  drawerCloseButton.type = 'button';
  drawerCloseButton.className = 'settings-panel__close';
  drawerCloseButton.textContent = copy.drawer.closeLabel;
  drawerCloseButton.setAttribute('aria-label', copy.drawer.closeAria);
  settingsPanel.element.insertBefore(drawerCloseButton, settingsPanel.element.firstChild);

  settingsPanel.element.dataset.open = 'false';

  const settingsFab = document.createElement('button');
  settingsFab.type = 'button';
  settingsFab.className = 'settings-fab';
  settingsFab.textContent = copy.drawer.openLabel;
  settingsFab.setAttribute('aria-label', copy.drawer.openAria);

  const openDrawer = (): void => {
    settingsPanel.element.dataset.open = 'true';
    drawerBackdrop.dataset.open = 'true';
    settingsFab.setAttribute('aria-expanded', 'true');
  };
  const closeDrawer = (): void => {
    settingsPanel.element.dataset.open = 'false';
    drawerBackdrop.dataset.open = 'false';
    settingsFab.setAttribute('aria-expanded', 'false');
    settingsPanel.closeAll(); // drawer を閉じる時にアコーディオンも全て閉じる
  };
  settingsFab.addEventListener('click', openDrawer);
  drawerBackdrop.addEventListener('click', closeDrawer);
  drawerCloseButton.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsPanel.element.dataset.open === 'true') {
      closeDrawer();
    }
  });

  // --- Layout ---
  const header = createHeader();

  const main = document.createElement('main');
  main.className = 'app-main';
  main.setAttribute('role', 'main');

  const readingColumn = document.createElement('div');
  readingColumn.className = 'app-main__reading-column';

  const actionsBar = document.createElement('div');
  actionsBar.className = 'app-main__actions';
  actionsBar.appendChild(fileInput);

  readingColumn.appendChild(actionsBar);
  readingColumn.appendChild(errorRegion);
  readingColumn.appendChild(readingArea.element);

  main.appendChild(readingColumn);
  main.appendChild(settingsPanel.element);

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
  root.appendChild(drawerBackdrop);
  root.appendChild(settingsFab);
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

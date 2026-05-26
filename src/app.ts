import { copy } from './ui/copy/ja';
import {
  DEFAULT_SETTINGS,
  type FontFamilyKey,
  type HighlightColorKey,
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
import { createHighlightControls } from './ui/components/highlight-controls';
import { createCameraInput } from './ui/components/camera-input';
import { createImagePreview, type ImagePreviewController } from './ui/components/image-preview';
import { loadImageFile, disposeImage } from './modules/image-loader';
import { recognizeImage, terminateOcr } from './modules/ocr';
import { loadTextFile, loadFromDropEvent, type FileLoadResult } from './modules/file-loader';
import { FONT_MAP } from './modules/font-registry';
import { THEME_MAP } from './modules/theme-registry';
import { HIGHLIGHT_COLOR_MAP } from './modules/highlight-color-registry';
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
  /** ハイライト帯の色を切替（CSS 変数）。zebra / flat 共通で参照される */
  const applyHighlightColor = (key: HighlightColorKey): void => {
    document.documentElement.style.setProperty(
      '--highlight-band-color',
      HIGHLIGHT_COLOR_MAP[key].rgba,
    );
  };

  // 初回適用
  applyFontFamily(state.settings.fontFamily);
  applyFontSize(state.settings.fontSize);
  applyLetterSpacing(state.settings.letterSpacing);
  applyLineHeight(state.settings.lineHeight);
  applyWordSpacing(state.settings.wordSpacing);
  applyThemePreset(state.settings.theme);
  applyHighlightColor(state.settings.highlightColor);
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

  // --- Notice region (穏やかなフィードバック、読了通知など) ---
  const noticeRegion = document.createElement('div');
  noticeRegion.className = 'app-notice';
  noticeRegion.setAttribute('role', 'status');
  noticeRegion.setAttribute('aria-live', 'polite');
  noticeRegion.hidden = true;

  let noticeTimer: number | null = null;
  const showNotice = (message: string, ariaLabel?: string): void => {
    noticeRegion.textContent = message;
    if (ariaLabel) noticeRegion.setAttribute('aria-label', ariaLabel);
    noticeRegion.hidden = false;
    if (noticeTimer !== null) window.clearTimeout(noticeTimer);
    noticeTimer = window.setTimeout(() => {
      noticeRegion.hidden = true;
      noticeRegion.textContent = '';
      noticeTimer = null;
    }, 5000);
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

  // --- Camera / image preview (Sprint 5) ---
  /** 表示中の image-preview モーダルと、ObjectURL / File の組 */
  let currentImagePreview: {
    controller: ImagePreviewController;
    objectURL: string;
    file: File;
  } | null = null;
  /** OCR 実行中フラグ。キャンセル時に terminate を呼ぶための識別 */
  let ocrInFlight = false;

  const closeImagePreview = (): void => {
    if (!currentImagePreview) return;
    currentImagePreview.controller.element.remove();
    disposeImage(currentImagePreview.objectURL);
    currentImagePreview = null;
  };

  const runOcr = async (): Promise<void> => {
    if (!currentImagePreview || ocrInFlight) return;
    const { controller, file } = currentImagePreview;
    ocrInFlight = true;
    controller.setProcessing(true);
    try {
      const text = await recognizeImage(file, (ev) => {
        controller.setProgress(ev.status, ev.progress);
      });
      if (!ocrInFlight) {
        // キャンセル後に到着した結果は破棄
        return;
      }
      if (!text) {
        showError(copy.ocr.noText);
        controller.setProcessing(false);
        ocrInFlight = false;
        return;
      }
      // テキスト投入 → reading-area が自動で read モードへ
      state.text = text;
      readingArea.setText(text);
      clearError();
      ocrInFlight = false;
      closeImagePreview();
    } catch (e) {
      console.error('OCR failed:', e);
      if (ocrInFlight) {
        showError(copy.ocr.failed);
        controller.setProcessing(false);
      }
      ocrInFlight = false;
    }
  };

  const cancelOcr = async (): Promise<void> => {
    if (!ocrInFlight) return;
    ocrInFlight = false;
    // Worker を破棄。次回 recognize で再 init される（言語データは cache 済）
    await terminateOcr();
    if (currentImagePreview) {
      currentImagePreview.controller.setProcessing(false);
    }
  };

  const openImagePreview = (file: File): void => {
    closeImagePreview();
    const loaded = loadImageFile(file);
    if (!loaded.ok) {
      const message =
        loaded.reason === 'wrong-type'
          ? copy.errors.imageWrongType
          : loaded.reason === 'too-large'
            ? copy.errors.imageTooLarge
            : copy.errors.imageUnreadable;
      showError(message);
      return;
    }
    const controller = createImagePreview({
      objectURL: loaded.objectURL,
      onRecognize: () => {
        void runOcr();
      },
      onCancel: () => {
        void cancelOcr();
      },
      onRetake: () => {
        // OCR 実行中なら一旦キャンセル
        if (ocrInFlight) void cancelOcr();
        closeImagePreview();
        nativeCameraInput?.click();
      },
      onClose: () => {
        if (ocrInFlight) void cancelOcr();
        closeImagePreview();
      },
    });
    currentImagePreview = { controller, objectURL: loaded.objectURL, file: loaded.file };
    document.body.appendChild(controller.element);
  };

  const cameraInput = createCameraInput({
    onImageSelected: openImagePreview,
  });
  const nativeCameraInput = cameraInput.querySelector(
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

  // 初期 modifier 反映：
  // - setLineMode で off/zebra/flat を切り替え
  // - 行ホバー強調は v1.0 では UI から削除済 → false 固定
  readingArea.setLineMode(state.settings.lineMode);
  readingArea.setLineHighlightEnabled(state.settings.lineHighlight);

  /**
   * TTS 同期ハイライトのために kuromoji で tokenize した結果を保持。
   * lineZebra は CSS のみで動くので kuromoji 不要。
   */
  let currentTokens: Token[] | null = null;

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

  const tts = createTts({
    rate: state.settings.ttsRate,
    voiceURI: state.settings.ttsVoiceURI,
    onStateChange: (ttsState) => {
      ttsControlsRef?.syncToState(ttsState);
      if (ttsState === 'idle') {
        // 読み上げ終了：TTS 同期ハイライトのみ解除（wordBoundary span は残す）
        readingArea.setHighlightIndex(-1);
      }
    },
    onBoundary: (ev) => {
      // ベストエフォート：ttsSyncHighlight が ON のときだけ追従
      if (!state.settings.ttsSyncHighlight) return;
      if (!currentTokens) return;
      const idx = findTokenIndex(currentTokens, ev.charIndex);
      if (idx >= 0) readingArea.setHighlightIndex(idx);
    },
    onError: (reason) => {
      if (reason === 'unsupported') showError(copy.tts.unsupported);
      else if (reason === 'no-voice') showError(copy.tts.noJapaneseVoice);
    },
    onComplete: () => {
      // 自然完了時のみ穏やかな労いを5秒だけ表示。ユーザー stop では出ない
      showNotice(copy.tts.completed, copy.tts.completedAria);
    },
  });

  /**
   * 「読み上げる」を押した時の処理。
   * - TTS 同期ハイライト ON 時：kuromoji 初期化＋tokenize → 同期ハイライト準備
   * - OFF 時（=v1.0 デフォルト）：tokenize を省略して即 play
   */
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
    if (state.settings.ttsSyncHighlight && !currentTokens) {
      if (!isTokenizerReady()) {
        ttsControlsRef?.syncToState('loading');
      }
      try {
        await ensureTokenizer();
        currentTokens = tokenize(text);
        readingArea.setHighlightTokens(currentTokens);
      } catch (e) {
        console.error('TTS preparation failed:', e);
        showError(copy.tts.preparingError);
        ttsControlsRef?.syncToState('idle');
        return;
      }
    }
    tts.play(text);
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

  const highlightControls = createHighlightControls({
    initialMode: state.settings.lineMode,
    initialColor: state.settings.highlightColor,
    onModeChange: (mode) => {
      state.settings.lineMode = mode;
      // legacy フラグも同期（後方互換）
      state.settings.lineZebra = mode === 'zebra';
      readingArea.setLineMode(mode);
      persistSettings();
    },
    onColorChange: (color) => {
      state.settings.highlightColor = color;
      applyHighlightColor(color);
      persistSettings();
    },
  });

  const settingsPanel = createSettingsPanel({
    sections: [
      { title: copy.settings.fontHeading, body: fontPicker.element },
      { title: copy.settings.spacingHeading, body: spacingControls.element },
      { title: copy.settings.colorHeading, body: colorControls.element },
      { title: copy.settings.ttsHeading, body: ttsSettings.element },
      { title: copy.settings.highlightHeading, body: highlightControls.element },
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
  actionsBar.appendChild(cameraInput);

  readingColumn.appendChild(actionsBar);
  readingColumn.appendChild(errorRegion);
  readingColumn.appendChild(noticeRegion);
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

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
import { createAidNavigator } from './ui/components/aid-navigator';
import { createSpacingControls } from './ui/components/spacing-controls';
import { createColorControls } from './ui/components/color-controls';
// Sprint 8: 従来の 3 問オンボーディングは、読みやすさナビ（aid-navigator）に置き換え。
// コンポーネントファイル自体はリポジトリに残しておく（将来差し替えやすいよう）。
import { createTtsControls, type TtsControlsController } from './ui/components/tts-controls';
import { createTtsSettings } from './ui/components/tts-settings';
import { createHighlightControls } from './ui/components/highlight-controls';
import { createCameraInput } from './ui/components/camera-input';
import { createImagePreview, type ImagePreviewController } from './ui/components/image-preview';
import { createRubyControls } from './ui/components/ruby-controls';
import { createWakachiControls } from './ui/components/wakachi-controls';
import { loadImageFile, disposeImage } from './modules/image-loader';
import { recognizeImage, terminateOcr } from './modules/ocr';
import { generateReadingHtml } from './modules/ruby';
import { buildShareUrl, readSettingsFromHash, clearHash, copyToClipboard } from './modules/share';
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

  // 優先順：URL hash → localStorage → デフォルト
  const fromHash = readSettingsFromHash();
  const persisted = loadSettings();
  const state: AppState = {
    text: '',
    settings: fromHash ?? persisted ?? { ...DEFAULT_SETTINGS },
  };
  /** 共有リンク経由で起動したか。後で showNotice 呼び出しに使う */
  const startedFromShareLink = fromHash !== null;
  if (fromHash) {
    // 共有リンク経由の起動：localStorage 上書き＋hash 消去（次回からは保存値が使われる）
    saveSettings(state.settings);
    clearHash();
  }

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
  /** 行幅（Sprint 7：Schneps et al. 2013 の根拠で、狭め選択を許可）。 */
  const applyMaxWidth = (em: number): void => {
    document.documentElement.style.setProperty('--reading-max-width', `${em}em`);
  };
  /** 段落間（Sprint 8 で apply 関数化。読みやすさナビが触れるよう公開）。 */
  const applyParagraphSpacing = (em: number): void => {
    document.documentElement.style.setProperty('--reading-paragraph-spacing', `${em}em`);
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
  applyMaxWidth(state.settings.maxWidth);
  applyParagraphSpacing(state.settings.paragraphSpacing);
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
      // ふりがな / 分かち書き ON なら再生成
      if (isReadingEnhanced()) {
        lastReadingKey = null;
        void refreshReading();
      }
    } else {
      // Sprint 9：拡張子別に親切なエラー文へ振り分け
      let message: string;
      switch (result.reason) {
        case 'wrong-type':
          message = copy.errors.fileWrongType;
          break;
        case 'too-large':
          message = copy.errors.fileTooLarge;
          break;
        case 'doc-legacy':
          message = copy.errors.fileDocLegacy;
          break;
        case 'pages-proprietary':
          message = copy.errors.filePages;
          break;
        case 'other-doc-format':
          message = copy.errors.fileOtherDocFormat;
          break;
        case 'pdf-likely-scanned':
          message = copy.errors.pdfLikelyScanned;
          break;
        case 'unreadable':
        default:
          message = copy.errors.fileUnreadable;
          break;
      }
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
      if (isReadingEnhanced()) debouncedRefreshReading();
    },
    onRequestOpenFile: () => {
      nativeFileInput?.click();
    },
    onRequestCamera: () => {
      nativeCameraInput?.click();
    },
    onRequestAidNavigator: () => {
      openAidNavigator();
    },
  });

  // --- Reading HTML generation (ふりがな / 分かち書きの両対応) ---
  /** 最後に reading HTML を生成したテキスト＋オプションの組み合わせ */
  let lastReadingKey: string | null = null;

  const isReadingEnhanced = (): boolean =>
    state.settings.rubyEnabled ||
    state.settings.wakachiEnabled ||
    state.settings.chunkedEnabled;

  const refreshReading = async (): Promise<void> => {
    if (!isReadingEnhanced()) {
      readingArea.setRubyHtml(null);
      lastReadingKey = null;
      return;
    }
    const text = state.text;
    if (!text.trim()) {
      readingArea.setRubyHtml(null);
      lastReadingKey = null;
      return;
    }
    // ふりがな・分かち書き・文節改行の組み合わせをキーに含めて、不要な再生成を避ける
    const key = `${state.settings.rubyEnabled ? 'r' : ''}${state.settings.wakachiEnabled ? 'w' : ''}${state.settings.chunkedEnabled ? 'c' : ''}|${text}`;
    if (key === lastReadingKey) return;
    try {
      // 新 generateReadingHtml は段落ラップ（<p data-paragraph-i>）付きの
      // HTML を 1 度の tokenize で組み立てて返す。app 側でのループは不要。
      const { html } = await generateReadingHtml(text, {
        withFurigana: state.settings.rubyEnabled,
        withWakachi: state.settings.wakachiEnabled,
        withChunked: state.settings.chunkedEnabled,
      });
      if (text !== state.text) return; // race condition
      lastReadingKey = key;
      readingArea.setRubyHtml(html);
    } catch (e) {
      console.error('[app] reading html generation failed:', e);
      showError(copy.settings.rubyError);
      state.settings.rubyEnabled = false;
      state.settings.wakachiEnabled = false;
      state.settings.chunkedEnabled = false;
      rubyControls.setEnabled(false);
      wakachiControls.setEnabled(false);
      wakachiControls.setChunked(false);
      persistSettings();
    }
  };
  const debouncedRefreshReading = debounce(() => {
    void refreshReading();
  }, 350);

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

  // --- Focus モード（Sprint 7 Feature 2）---
  // IntersectionObserver で viewport 中央付近の段落 index を追跡し、
  // reading-area の focused パラグラフを動的に更新する。
  // TTS 同期 ON＋再生中は観察を抑制し、TTS 側に主導権を渡す。
  let focusObserver: IntersectionObserver | null = null;
  let focusMutationObserver: MutationObserver | null = null;
  let observerSuppressedByTts = false;

  const pickClosestParagraph = (): number | null => {
    const preview = readingArea.element.querySelector(
      '.reading-area__preview',
    ) as HTMLElement | null;
    if (!preview) return null;
    const viewportCenter = window.innerHeight / 2;
    let bestIdx: number | null = null;
    let bestDistance = Infinity;
    preview.querySelectorAll<HTMLElement>('p[data-paragraph-i]').forEach((p) => {
      const rect = p.getBoundingClientRect();
      // 段落が画面外ならスキップ
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const paraCenter = (rect.top + rect.bottom) / 2;
      const d = Math.abs(paraCenter - viewportCenter);
      if (d < bestDistance) {
        bestDistance = d;
        const i = Number(p.dataset.paragraphI);
        if (!Number.isNaN(i)) bestIdx = i;
      }
    });
    return bestIdx;
  };

  const updateFocusFromObserver = (): void => {
    if (observerSuppressedByTts) return;
    const idx = pickClosestParagraph();
    if (idx !== null) readingArea.setFocusedParagraphIndex(idx);
  };

  const startFocusObserver = (): void => {
    if (!state.settings.focusMode) return;
    stopFocusObserver();
    const preview = readingArea.element.querySelector(
      '.reading-area__preview',
    ) as HTMLElement | null;
    if (!preview) return;
    // 段落の出入りで再評価。threshold は粗く、scroll では別途 listener で補完。
    focusObserver = new IntersectionObserver(updateFocusFromObserver, {
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });
    preview.querySelectorAll<HTMLElement>('p[data-paragraph-i]').forEach((p) => {
      focusObserver?.observe(p);
    });
    // preview の段落が差し替わったら observer を貼り直す
    focusMutationObserver = new MutationObserver(() => {
      focusObserver?.disconnect();
      preview.querySelectorAll<HTMLElement>('p[data-paragraph-i]').forEach((p) => {
        focusObserver?.observe(p);
      });
      updateFocusFromObserver();
    });
    focusMutationObserver.observe(preview, { childList: true });
    // scroll でも viewport 中央の段落を更新（IntersectionObserver は threshold で離散的）
    window.addEventListener('scroll', updateFocusFromObserver, { passive: true });
    // 初回評価
    updateFocusFromObserver();
  };

  const stopFocusObserver = (): void => {
    if (focusObserver) {
      focusObserver.disconnect();
      focusObserver = null;
    }
    if (focusMutationObserver) {
      focusMutationObserver.disconnect();
      focusMutationObserver = null;
    }
    window.removeEventListener('scroll', updateFocusFromObserver);
  };

  // 初期 focus モード反映
  readingArea.setFocusMode(state.settings.focusMode);
  if (state.settings.focusMode) {
    // observer の起動は DOM 描画完了後に
    window.requestAnimationFrame(() => startFocusObserver());
  }

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
      maxWidth: state.settings.maxWidth,
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
      maxWidth: (v) => {
        state.settings.maxWidth = v;
        applyMaxWidth(v);
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
        // TTS が終わったら、focus mode が ON なら observer に主導権を戻す。
        // OFF なら段落フォーカスをクリア。
        if (state.settings.focusMode) {
          observerSuppressedByTts = false;
          // 直近の viewport を観察し直したいので observer を再起動
          startFocusObserver();
        } else {
          readingArea.setFocusedParagraphIndex(null);
        }
      } else if (ttsState === 'playing' && state.settings.ttsParagraphSync) {
        // TTS が始まり、かつ段落同期 ON なら observer を抑制（フォーカスを TTS に渡す）
        observerSuppressedByTts = true;
      }
    },
    onBoundary: (ev) => {
      // ベストエフォート：ttsSyncHighlight が ON のときだけ追従（v1.0 では UI から外したが、
      // 設定としては残っており、true にすると単語境界ハイライトを試みる）
      if (!state.settings.ttsSyncHighlight) return;
      if (!currentTokens) return;
      const idx = findTokenIndex(currentTokens, ev.charIndex);
      if (idx >= 0) readingArea.setHighlightIndex(idx);
    },
    onParagraphStart: (paragraphIndex) => {
      // 段落同期が OFF のときは何もしない（tts.ts は paragraphIndex を毎回通知してくる）
      if (!state.settings.ttsParagraphSync) return;
      readingArea.setFocusedParagraphIndex(paragraphIndex);
      readingArea.scrollParagraphIntoView(paragraphIndex);
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
    initialParagraphSync: state.settings.ttsParagraphSync,
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
    onParagraphSyncChange: (enabled) => {
      state.settings.ttsParagraphSync = enabled;
      persistSettings();
      // OFF にしたとき、観察を再開して focus を整える（focusMode が ON なら）
      if (!enabled) {
        observerSuppressedByTts = false;
        if (state.settings.focusMode) updateFocusFromObserver();
        else readingArea.setFocusedParagraphIndex(null);
      }
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
    initialFocusMode: state.settings.focusMode,
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
    onFocusModeChange: (enabled) => {
      state.settings.focusMode = enabled;
      readingArea.setFocusMode(enabled);
      persistSettings();
      if (enabled) {
        startFocusObserver();
      } else {
        stopFocusObserver();
        readingArea.setFocusedParagraphIndex(null);
      }
    },
  });

  const rubyControls = createRubyControls({
    initial: state.settings.rubyEnabled,
    onChange: (enabled) => {
      state.settings.rubyEnabled = enabled;
      persistSettings();
      lastReadingKey = null;
      void refreshReading();
    },
  });

  const wakachiControls = createWakachiControls({
    initial: state.settings.wakachiEnabled,
    initialChunked: state.settings.chunkedEnabled,
    onChange: (enabled) => {
      state.settings.wakachiEnabled = enabled;
      persistSettings();
      lastReadingKey = null;
      void refreshReading();
    },
    onChunkedChange: (enabled) => {
      state.settings.chunkedEnabled = enabled;
      persistSettings();
      lastReadingKey = null;
      void refreshReading();
    },
  });

  // 設定パネルは Sprint 8 で「機能名で並ぶ 7 個」から「目的別 3 グループ」に整理。
  // アコーディオン階層は変えず、グループ見出しで束ねるだけ（既存ユーザーが迷わない）。
  const settingsPanel = createSettingsPanel({
    onNavigatorClick: () => openAidNavigator(),
    items: [
      // A. 見やすさを整える — 文字そのものの見え方
      {
        kind: 'group',
        label: copy.settings.groupSeeingLabel,
        hint: copy.settings.groupSeeingHint,
      },
      { kind: 'section', title: copy.settings.fontHeading, body: fontPicker.element },
      { kind: 'section', title: copy.settings.spacingHeading, body: spacingControls.element },
      { kind: 'section', title: copy.settings.colorHeading, body: colorControls.element },
      // B. 読むのを助ける — 読んでいる場所と区切り
      {
        kind: 'group',
        label: copy.settings.groupReadingLabel,
        hint: copy.settings.groupReadingHint,
      },
      {
        kind: 'section',
        title: copy.settings.highlightHeading,
        body: highlightControls.element,
      },
      { kind: 'section', title: copy.settings.rubyHeading, body: rubyControls.element },
      { kind: 'section', title: copy.settings.wakachiHeading, body: wakachiControls.element },
      // C. 音と読み取り — 聞いて読む / 写真から
      {
        kind: 'group',
        label: copy.settings.groupAudioLabel,
        hint: copy.settings.groupAudioHint,
      },
      { kind: 'section', title: copy.settings.ttsHeading, body: ttsSettings.element },
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

  // <main> はネイティブで role=main を持つので、setAttribute は冗長。削除済み。
  const main = document.createElement('main');
  main.className = 'app-main';

  const readingColumn = document.createElement('div');
  readingColumn.className = 'app-main__reading-column';

  const actionsBar = document.createElement('div');
  actionsBar.className = 'app-main__actions';
  actionsBar.appendChild(fileInput);
  actionsBar.appendChild(cameraInput);

  // --- Print button ---
  const printButton = document.createElement('button');
  printButton.type = 'button';
  printButton.className = 'app-action-button';
  printButton.textContent = copy.actions.print;
  printButton.setAttribute('aria-label', copy.actions.printAria);
  printButton.addEventListener('click', () => {
    window.print();
  });
  actionsBar.appendChild(printButton);

  // --- Share button ---
  const shareButton = document.createElement('button');
  shareButton.type = 'button';
  shareButton.className = 'app-action-button';
  shareButton.textContent = copy.actions.share;
  shareButton.setAttribute('aria-label', copy.actions.shareAria);
  shareButton.addEventListener('click', async () => {
    const url = buildShareUrl(state.settings);
    const ok = await copyToClipboard(url);
    if (ok) {
      showNotice(copy.hints.shareCopied);
    } else {
      showError(copy.hints.shareFailed);
    }
  });
  actionsBar.appendChild(shareButton);

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

  // --- Footer（静かにバージョンと PRIVACY / CREDITS / LICENSE / Issues へのリンク） ---
  const REPO_URL = 'https://github.com/AbeTsubasa/yom-easy-app';
  const footer = document.createElement('footer');
  footer.className = 'app-footer';
  footer.setAttribute('role', 'contentinfo');

  const version = document.createElement('span');
  version.className = 'app-footer__version';
  version.textContent = copy.footer.version;
  version.setAttribute('aria-label', copy.footer.versionAria);
  footer.appendChild(version);

  const footerNav = document.createElement('nav');
  footerNav.className = 'app-footer__links';
  footerNav.setAttribute('aria-label', 'About this app');

  const makeFooterLink = (href: string, label: string, ariaLabel: string): HTMLAnchorElement => {
    const a = document.createElement('a');
    a.className = 'app-footer__link';
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = label;
    a.setAttribute('aria-label', ariaLabel);
    return a;
  };

  footerNav.appendChild(
    makeFooterLink(`${REPO_URL}/blob/main/PRIVACY.md`, copy.footer.privacy, copy.footer.privacyAria)
  );
  footerNav.appendChild(
    makeFooterLink(`${REPO_URL}/blob/main/CREDITS.md`, copy.footer.credits, copy.footer.creditsAria)
  );
  footerNav.appendChild(
    makeFooterLink(`${REPO_URL}/blob/main/LICENSE`, copy.footer.license, copy.footer.licenseAria)
  );
  footerNav.appendChild(
    makeFooterLink(`${REPO_URL}/issues`, copy.footer.feedback, copy.footer.feedbackAria)
  );
  footer.appendChild(footerNav);

  // --- Mount ---
  root.innerHTML = '';
  root.appendChild(header);
  root.appendChild(main);
  root.appendChild(footer);
  root.appendChild(drawerBackdrop);
  root.appendChild(settingsFab);
  root.appendChild(dropOverlay);

  // --- Share-link notice ---
  if (startedFromShareLink) {
    showNotice(copy.hints.shareNotice);
  }

  // --- 読みやすさナビ（Sprint 8）---
  // 困りごとから設定を試せるモーダル。empty-state CTA / 設定パネル先頭 /
  // 初回起動時に呼ばれる。初回は dismiss でも markOnboardingDone する。
  let currentNavigator: HTMLElement | null = null;

  /**
   * 「困りごと → 設定」の overrides を、state.settings へマージしつつ、
   * CSS 変数 / UI コントロール / observer を一斉に同期する。
   * 1 つの困りごとが複数キーを触るので、まとめて反映するこのヘルパーは必須。
   */
  const applyOverrides = (overrides: Partial<Settings>): void => {
    Object.assign(state.settings, overrides);

    // フォント・間隔・色・行幅・段落間：CSS 変数 + コントロール表示同期
    if ('fontFamily' in overrides && overrides.fontFamily) {
      applyFontFamily(overrides.fontFamily);
      fontPicker.setSelection(overrides.fontFamily);
    }
    if (typeof overrides.fontSize === 'number') {
      applyFontSize(overrides.fontSize);
      spacingControls.setFontSize(overrides.fontSize);
    }
    if (typeof overrides.letterSpacing === 'number') {
      applyLetterSpacing(overrides.letterSpacing);
      spacingControls.setLetterSpacing(overrides.letterSpacing);
    }
    if (typeof overrides.lineHeight === 'number') {
      applyLineHeight(overrides.lineHeight);
      spacingControls.setLineHeight(overrides.lineHeight);
    }
    if (typeof overrides.wordSpacing === 'number') {
      applyWordSpacing(overrides.wordSpacing);
      spacingControls.setWordSpacing(overrides.wordSpacing);
    }
    if (typeof overrides.maxWidth === 'number') {
      applyMaxWidth(overrides.maxWidth);
      spacingControls.setMaxWidth(overrides.maxWidth);
    }
    if (typeof overrides.paragraphSpacing === 'number') {
      applyParagraphSpacing(overrides.paragraphSpacing);
    }
    // 色テーマ
    if ('theme' in overrides && overrides.theme) {
      applyThemePreset(overrides.theme);
      colorControls.setPreset(overrides.theme);
      // 自由カラーは null に戻すのが筋（プリセット選び直したら）
      if (overrides.customBg === null) state.settings.customBg = null;
      if (overrides.customText === null) state.settings.customText = null;
    }
    if ('highlightColor' in overrides && overrides.highlightColor) {
      applyHighlightColor(overrides.highlightColor);
      highlightControls.setColor(overrides.highlightColor);
    }
    // ハイライト・フォーカス
    if ('lineMode' in overrides && overrides.lineMode) {
      readingArea.setLineMode(overrides.lineMode);
      highlightControls.setMode(overrides.lineMode);
      state.settings.lineZebra = overrides.lineMode === 'zebra';
    }
    if (typeof overrides.focusMode === 'boolean') {
      readingArea.setFocusMode(overrides.focusMode);
      highlightControls.setFocusMode(overrides.focusMode);
      if (overrides.focusMode) startFocusObserver();
      else {
        stopFocusObserver();
        readingArea.setFocusedParagraphIndex(null);
      }
    }
    // TTS 同期
    if (typeof overrides.ttsParagraphSync === 'boolean') {
      ttsSettings.setParagraphSync(overrides.ttsParagraphSync);
    }
    // ふりがな / 分かち書き / 文節改行：refreshReading が必要
    let needsRefresh = false;
    if (typeof overrides.rubyEnabled === 'boolean') {
      rubyControls.setEnabled(overrides.rubyEnabled);
      needsRefresh = true;
    }
    if (typeof overrides.wakachiEnabled === 'boolean') {
      wakachiControls.setEnabled(overrides.wakachiEnabled);
      needsRefresh = true;
    }
    if (typeof overrides.chunkedEnabled === 'boolean') {
      wakachiControls.setChunked(overrides.chunkedEnabled);
      needsRefresh = true;
    }
    if (needsRefresh) {
      lastReadingKey = null;
      void refreshReading();
    }
    persistSettings();
  };

  const openAidNavigator = (isFirstVisit = false): void => {
    if (currentNavigator) return; // 多重起動防止
    const navEl = createAidNavigator({
      onApply: (overrides) => {
        applyOverrides(overrides);
        showNotice(copy.aidNavigator.noticeApplied);
        if (isFirstVisit) markOnboardingDone();
        closeNavigator();
      },
      onClose: () => {
        if (isFirstVisit) markOnboardingDone();
        closeNavigator();
      },
    });
    currentNavigator = navEl;
    root.appendChild(navEl);
  };

  const closeNavigator = (): void => {
    if (!currentNavigator) return;
    currentNavigator.remove();
    currentNavigator = null;
  };

  // --- First visit：従来の 3 問オンボーディングではなく、読みやすさナビを開く ---
  if (!isOnboardingDone()) {
    openAidNavigator(true);
  }
}

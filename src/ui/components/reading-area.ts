import { copy } from '../copy/ja';
import type { Token } from '../../modules/morphology';
import type { LineMode } from '../../types/settings';

export interface ReadingAreaOptions {
  initialText: string;
  onTextChange: (text: string) => void;
  /** empty state の「📁 ファイル」CTA から呼ばれる */
  onRequestOpenFile?: () => void;
  /** empty state の「📷 カメラ」CTA から呼ばれる（Sprint 8） */
  onRequestCamera?: () => void;
  /** empty state の「💡 読みやすさナビ」CTA から呼ばれる（Sprint 8） */
  onRequestAidNavigator?: () => void;
}

export interface ReadingAreaController {
  element: HTMLElement;
  /** toolbar の DOM 参照。app.ts から TTS コントロール等を slot 的に挿入する */
  toolbar: HTMLElement;
  setText: (text: string) => void;
  /** 編集モード（textarea 表示）に入る / 抜ける */
  setEditing: (editing: boolean) => void;
  focusTextarea: () => void;
  /**
   * 単語ごとに span 分割した描画モードに切り替える。
   * tokens を渡すと preview を span 分割で再描画、null で通常描画（段落のみ）に戻す。
   * zebra や TTS 同期ハイライトを使うには span 分割が必要。
   */
  setHighlightTokens: (tokens: Token[] | null) => void;
  /**
   * 現在ハイライトする token のインデックス。-1 でハイライト解除。
   * setHighlightTokens で span 描画している必要がある。
   */
  setHighlightIndex: (index: number) => void;
  /**
   * ふりがな（ルビ）HTML を preview にセット。
   * null で通常描画に戻す。文字列は kuroshiro が生成した <ruby>...</ruby> を
   * 段落単位で <p> で囲んだもの（呼び出し側で組み立てる）。
   */
  setRubyHtml: (html: string | null) => void;
  /**
   * 行モードの設定（off / zebra / flat）。
   * v1.0 の主要ハイライト機能。CSS のみで動作するので軽量。
   */
  setLineMode: (mode: LineMode) => void;
  /** @deprecated setLineMode を使ってください。古い API 互換のため残しています */
  setZebraEnabled: (enabled: boolean) => void;
  /** 行ハイライト（段落 hover）を有効/無効。v1.0 では UI から削除済 */
  setLineHighlightEnabled: (enabled: boolean) => void;
  /**
   * Focus モード（注目段落以外を薄める）の ON/OFF（Sprint 7）。
   * ON のときは `.reading-area--focus-mode` クラスが付き、focused 以外の
   * `<p>` が CSS で opacity 低下する。
   */
  setFocusMode: (enabled: boolean) => void;
  /**
   * 現在「注目している段落」の index を設定。
   * null で全段落のフォーカスを解除（読み終わり時など）。
   * 該当する `<p data-paragraph-i="N">` に focused クラスを付与する。
   * 自動スクロールはしない（呼び出し側で必要なら scrollParagraphIntoView）。
   */
  setFocusedParagraphIndex: (index: number | null) => void;
  /**
   * 指定 index の段落を画面中央へスムーズスクロール。
   * TTS 同期で「次の段落へ移った」ことを視覚で示すために使う。
   */
  scrollParagraphIntoView: (index: number) => void;
}

/**
 * 3状態を持つ読みエリア。
 * - empty: テキストなし → 中央に CTA 2つ
 * - read:  テキストあり、preview 表示、「編集する」ボタン
 * - edit:  textarea 表示、「読みに戻る」ボタン
 *
 * Sprint 2 Day 3-4 で、ハイライト対応モードを追加：
 * - setHighlightTokens(tokens) で preview を <span> 分割描画
 * - setHighlightIndex(i) で該当 span にハイライトクラス付与＋scrollIntoView
 */
export function createReadingArea(opts: ReadingAreaOptions): ReadingAreaController {
  const wrapper = document.createElement('section');
  wrapper.className = 'reading-area';
  wrapper.setAttribute('aria-label', copy.reader.textareaLabel);

  // --- Toolbar (toggle 編集) ---
  const toolbar = document.createElement('div');
  toolbar.className = 'reading-area__toolbar';

  const editToggle = document.createElement('button');
  editToggle.type = 'button';
  editToggle.className = 'reading-area__edit-toggle';

  toolbar.appendChild(editToggle);

  // --- Empty state（Sprint 8：迎える設計に） ---
  // 上から：タイトル → 説明 → reassurance → ナビCTA（主役）→ 区切り
  // → 3 つの入力方法（paste / file / camera）並列。
  const emptyState = document.createElement('div');
  emptyState.className = 'reading-area__empty';

  const emptyTitle = document.createElement('h2');
  emptyTitle.className = 'reading-area__empty-title';
  emptyTitle.textContent = copy.emptyState.title;

  const emptyBody = document.createElement('p');
  emptyBody.className = 'reading-area__empty-body';
  emptyBody.textContent = copy.emptyState.body;

  const emptyReassurance = document.createElement('p');
  emptyReassurance.className = 'reading-area__empty-reassurance';
  emptyReassurance.textContent = copy.emptyState.reassurance;

  // ナビ CTA（主役）：初めての方をやさしく迎える入口。
  // onRequestAidNavigator が渡されたときだけ表示する。
  const navPrompt = document.createElement('p');
  navPrompt.className = 'reading-area__empty-nav-prompt';
  navPrompt.textContent = copy.emptyState.navigatorPrompt;

  const navCtaButton = document.createElement('button');
  navCtaButton.type = 'button';
  navCtaButton.className = 'reading-area__empty-nav-cta';
  navCtaButton.textContent = copy.emptyState.navigatorCta;
  navCtaButton.setAttribute('aria-label', copy.emptyState.navigatorCtaAria);
  navCtaButton.addEventListener('click', () => opts.onRequestAidNavigator?.());

  // 区切り：「または、直接入れる」を出す
  const divider = document.createElement('div');
  divider.className = 'reading-area__empty-divider';
  divider.setAttribute('aria-hidden', 'true');
  divider.textContent = 'または';

  const emptyActions = document.createElement('div');
  emptyActions.className = 'reading-area__empty-actions';

  const emptyPasteButton = document.createElement('button');
  emptyPasteButton.type = 'button';
  emptyPasteButton.className = 'reading-area__empty-button';
  emptyPasteButton.textContent = copy.emptyState.paste;
  emptyPasteButton.setAttribute('aria-label', copy.emptyState.pasteAria);
  emptyPasteButton.addEventListener('click', () => {
    setEditing(true);
    setTimeout(() => textarea.focus(), 0);
  });

  const emptyOpenButton = document.createElement('button');
  emptyOpenButton.type = 'button';
  emptyOpenButton.className = 'reading-area__empty-button';
  emptyOpenButton.textContent = copy.emptyState.openFile;
  emptyOpenButton.setAttribute('aria-label', copy.emptyState.openFileAria);
  emptyOpenButton.addEventListener('click', () => {
    opts.onRequestOpenFile?.();
  });

  const emptyCameraButton = document.createElement('button');
  emptyCameraButton.type = 'button';
  emptyCameraButton.className = 'reading-area__empty-button';
  emptyCameraButton.textContent = copy.emptyState.camera;
  emptyCameraButton.setAttribute('aria-label', copy.emptyState.cameraAria);
  emptyCameraButton.addEventListener('click', () => {
    opts.onRequestCamera?.();
  });

  emptyActions.appendChild(emptyPasteButton);
  emptyActions.appendChild(emptyOpenButton);
  emptyActions.appendChild(emptyCameraButton);

  emptyState.appendChild(emptyTitle);
  emptyState.appendChild(emptyBody);
  emptyState.appendChild(emptyReassurance);
  // ナビ周りはコールバックが渡されたときだけ表示する（後方互換）
  if (opts.onRequestAidNavigator) {
    emptyState.appendChild(navPrompt);
    emptyState.appendChild(navCtaButton);
    emptyState.appendChild(divider);
  }
  emptyState.appendChild(emptyActions);

  // --- Textarea (edit) ---
  const textarea = document.createElement('textarea');
  textarea.className = 'reading-area__textarea';
  textarea.setAttribute('aria-label', copy.reader.textareaLabel);
  textarea.placeholder = copy.reader.textareaPlaceholder;
  textarea.spellcheck = false;
  textarea.value = opts.initialText;
  textarea.rows = 14;
  textarea.autocomplete = 'off';

  // --- Preview (read) ---
  const preview = document.createElement('article');
  preview.className = 'reading-area__preview';
  preview.setAttribute('aria-live', 'polite');

  // --- Footer (char count) ---
  const footer = document.createElement('div');
  footer.className = 'reading-area__footer';
  const charCount = document.createElement('p');
  charCount.className = 'reading-area__char-count';
  charCount.setAttribute('aria-live', 'polite');
  footer.appendChild(charCount);

  // --- State ---
  let currentText = opts.initialText;
  let editing = false;
  /** ハイライト対応モードのトークン配列。null = 通常描画 */
  let highlightTokens: Token[] | null = null;
  /** ふりがなモードの HTML（既に <p><ruby>...</ruby></p> 構造）。null = 通常描画 */
  let rubyHtml: string | null = null;
  let currentLineMode: LineMode = 'off';
  let lineHighlightEnabled = false;
  let focusModeEnabled = false;
  /** 現在「注目」している段落 index。-1 / null は未設定 */
  let focusedParagraphIndex: number | null = null;

  const updateModifierClasses = (): void => {
    wrapper.classList.toggle('reading-area--line-zebra', currentLineMode === 'zebra');
    wrapper.classList.toggle('reading-area--line-flat', currentLineMode === 'flat');
    wrapper.classList.toggle('reading-area--line-highlight', lineHighlightEnabled);
    wrapper.classList.toggle('reading-area--focus-mode', focusModeEnabled);
  };

  const applyFocusedClass = (): void => {
    preview
      .querySelectorAll('.reading-area__paragraph--focused')
      .forEach((el) => el.classList.remove('reading-area__paragraph--focused'));
    if (focusedParagraphIndex === null) return;
    const el = preview.querySelector<HTMLElement>(
      `p[data-paragraph-i="${focusedParagraphIndex}"]`,
    );
    if (el) el.classList.add('reading-area__paragraph--focused');
  };

  const renderEditToggle = (): void => {
    if (editing) {
      editToggle.textContent = copy.editToggle.close;
      editToggle.setAttribute('aria-label', copy.editToggle.closeAria);
      editToggle.dataset.state = 'editing';
    } else {
      editToggle.textContent = copy.editToggle.open;
      editToggle.setAttribute('aria-label', copy.editToggle.openAria);
      editToggle.dataset.state = 'reading';
    }
  };

  const renderPreview = (): void => {
    if (!currentText.trim()) {
      preview.innerHTML = '';
      return;
    }
    // 優先順：ふりがな/分かち書き/文節改行 HTML > kuromoji span > 通常段落描画
    if (rubyHtml) {
      preview.innerHTML = rubyHtml;
    } else if (highlightTokens) {
      preview.innerHTML = renderTextWithTokens(currentText, highlightTokens);
    } else {
      // 通常描画。段落単位の TTS 同期 / Focus モードに対応するため、
      // <p data-paragraph-i="N"> 形式で出力（空段落はスキップして連番）。
      const nonEmpty = currentText.split(/\n{2,}/).filter((p) => p.trim().length > 0);
      preview.innerHTML = nonEmpty
        .map((p, i) => `<p data-paragraph-i="${i}">${nl2br(escapeHtml(p))}</p>`)
        .join('');
    }
    // 描画後に focused クラスを再付与（DOM 再生成で消えるため）
    applyFocusedClass();
    // 行ハイライト帯を per-line overlay として描き直す。
    scheduleRenderLineBands();
  };

  /**
   * Sprint 11：行ハイライト帯の完全アライメント（per-line overlay）。
   *
   * これまでの CSS repeating-linear-gradient は「等間隔の帯」を描くため、
   * 各行の box 高が等しいことを前提にしていた。実際には、ふりがな・フォント
   * 差・字間・行間・行幅・文節改行の組み合わせで、ブラウザは行ごとに box
   * 高を可変に決める。そのため等間隔では原理的にズレる。
   *
   * 新方式：各段落で、本文 text node の rect を Range で測り、Y 位置で
   * グルーピングして「visual line」の上下境界を求める。各 line に専用の
   * &lt;div class="reading-area__line-band"&gt; を絶対配置で被せる。これで
   * どんな条件でも、帯は常にその行の実 box にぴったり一致する。
   *
   * `rt`（ruby 注釈）は意図的に走査から除外。kanji 本文の行位置だけを取る。
   */
  let renderLineBandsScheduled = false;
  const scheduleRenderLineBands = (): void => {
    if (renderLineBandsScheduled) return;
    renderLineBandsScheduled = true;
    // requestAnimationFrame でレイアウト確定後に 1 度だけ実行
    requestAnimationFrame(() => {
      renderLineBandsScheduled = false;
      renderLineBands();
    });
  };

  /** すべての段落から既存の line overlay を撤去 */
  const clearLineBands = (): void => {
    preview
      .querySelectorAll('.reading-area__line-overlay')
      .forEach((el) => el.remove());
  };

  /**
   * 1 つの段落について、本文 text node を走査して visual line の rect を返す。
   * `<rt>` 内の text node はスキップ（ruby 注釈は行高に関与しない位置にある）。
   * 同じ Y を共有する rect をグルーピングして 1 行扱いする。
   */
  const measureParagraphLines = (
    p: HTMLElement,
  ): { topInP: number; height: number }[] => {
    const pRect = p.getBoundingClientRect();

    const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        // `<rt>` の中身は除外（ruby 注釈の rect は本文行高と無関係に並ぶ）
        let cur: Node | null = node;
        while (cur && cur !== p) {
          if ((cur as Element).tagName === 'RT') return NodeFilter.FILTER_REJECT;
          cur = cur.parentNode;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const rawRects: { top: number; bottom: number }[] = [];
    let n: Node | null;
    while ((n = walker.nextNode())) {
      const range = document.createRange();
      range.selectNodeContents(n);
      const clientRects = range.getClientRects();
      for (let i = 0; i < clientRects.length; i++) {
        const r = clientRects[i];
        // 0 width/height の rect は無視（先頭の余白など）
        if (r.width <= 0 || r.height <= 0) continue;
        rawRects.push({ top: r.top, bottom: r.bottom });
      }
    }

    if (rawRects.length === 0) return [];

    // Y 位置でソート → 同じ行に属する rect を merge（top が近いものを束ねる）
    rawRects.sort((a, b) => a.top - b.top);
    const lines: { top: number; bottom: number }[] = [];
    // line-height の半分くらいの許容差。最小フォントサイズ 14px、line-height 1.2
    // で 1 行 ~17px。それより小さい差は同じ行とみなす。
    const tolerance = 4;
    for (const r of rawRects) {
      const last = lines[lines.length - 1];
      if (last && Math.abs(r.top - last.top) < tolerance) {
        last.bottom = Math.max(last.bottom, r.bottom);
        last.top = Math.min(last.top, r.top);
      } else {
        lines.push({ top: r.top, bottom: r.bottom });
      }
    }

    // 段落座標系に変換。隣接 line の bottom と次 top に隙間がある場合は
    // 行間（line-height による余白）。帯は line box の高さを完全に覆うのが
    // ふさわしいが、ここでは「本文行の実 rect」だけを返し、ZEBRA / FLAT の
    // 描画側で行間の扱いを決める。
    return lines.map((l) => ({
      topInP: l.top - pRect.top,
      height: l.bottom - l.top,
    }));
  };

  const renderLineBands = (): void => {
    clearLineBands();
    if (currentLineMode === 'off') return;

    const paragraphs = preview.querySelectorAll<HTMLElement>('p[data-paragraph-i]');
    paragraphs.forEach((p) => {
      const lines = measureParagraphLines(p);
      if (lines.length === 0) return;

      const overlay = document.createElement('div');
      overlay.className = 'reading-area__line-overlay';
      overlay.setAttribute('aria-hidden', 'true');

      // ZEBRA：偶数 index（0, 2, 4 …）の行だけに帯
      // FLAT： すべての行に帯
      lines.forEach((line, i) => {
        if (currentLineMode === 'zebra' && i % 2 === 1) return;
        const band = document.createElement('div');
        band.className = 'reading-area__line-band';
        // 行間（leading）も帯に含めるため、上下に半行間ずつ余裕を持たせる。
        // 隣の行帯と重ならない範囲で、文字の上下を包み込む見た目になる。
        // ただし行間が 0 や負になる極端な設定では height のみで描画。
        const nextLine = lines[i + 1];
        const prevLine = lines[i - 1];
        // 上の余白：前の行との中点まで
        const padTop = prevLine
          ? (line.topInP - (prevLine.topInP + prevLine.height)) / 2
          : 0;
        // 下の余白：次の行との中点まで
        const padBottom = nextLine
          ? (nextLine.topInP - (line.topInP + line.height)) / 2
          : 0;
        band.style.top = `${line.topInP - Math.max(0, padTop)}px`;
        band.style.height = `${line.height + Math.max(0, padTop) + Math.max(0, padBottom)}px`;
        overlay.appendChild(band);
      });

      p.appendChild(overlay);
    });
  };

  // preview の寸法やレイアウトが変わったら overlay を貼り直す。
  // 文字サイズ・行間・字間・行幅・フォント変更などを ResizeObserver が拾う。
  const previewResizeObserver = new ResizeObserver(() => scheduleRenderLineBands());
  previewResizeObserver.observe(preview);

  const updateCharCount = (): void => {
    const n = Array.from(currentText.trim()).length;
    charCount.textContent = copy.reader.charCount(n);
  };

  const renderState = (): void => {
    const isEmpty = !currentText.trim();
    wrapper.dataset.state = isEmpty && !editing ? 'empty' : editing ? 'editing' : 'reading';

    emptyState.style.display = isEmpty && !editing ? '' : 'none';
    textarea.style.display = editing ? '' : 'none';
    preview.style.display = !editing && !isEmpty ? '' : 'none';
    toolbar.style.display = isEmpty && !editing ? 'none' : '';
    footer.style.display = isEmpty && !editing ? 'none' : '';

    renderEditToggle();
    if (!editing) renderPreview();
    updateCharCount();
  };

  const setEditing = (next: boolean): void => {
    editing = next;
    // 編集モードに入る時は、ハイライト状態をクリアする（読み上げ整合性のため）
    if (next && highlightTokens) {
      highlightTokens = null;
    }
    renderState();
    if (next) {
      setTimeout(() => textarea.focus(), 0);
    }
  };

  editToggle.addEventListener('click', () => setEditing(!editing));

  textarea.addEventListener('input', () => {
    currentText = textarea.value;
    updateCharCount();
    opts.onTextChange(currentText);
  });

  // --- Mount ---
  wrapper.appendChild(toolbar);
  wrapper.appendChild(emptyState);
  wrapper.appendChild(textarea);
  wrapper.appendChild(preview);
  wrapper.appendChild(footer);

  renderState();

  return {
    element: wrapper,
    toolbar,
    setText: (text) => {
      currentText = text;
      textarea.value = text;
      editing = false;
      highlightTokens = null; // テキスト差し替え時にハイライト解除
      rubyHtml = null; // ふりがなも一旦解除（app.ts が必要なら再生成）
      renderState();
    },
    setEditing,
    focusTextarea: () => textarea.focus(),
    setHighlightTokens: (tokens) => {
      highlightTokens = tokens;
      if (!editing) renderPreview();
    },
    setHighlightIndex: (index) => {
      // 旧ハイライトを解除
      preview.querySelectorAll('.reading-area__token--highlighted').forEach((el) => {
        el.classList.remove('reading-area__token--highlighted');
      });
      if (index < 0) return;
      const el = preview.querySelector<HTMLElement>(
        `.reading-area__token[data-i="${index}"]`,
      );
      if (el) {
        el.classList.add('reading-area__token--highlighted');
        // 画面外に出ていたら中央付近にスクロール
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    },
    setRubyHtml: (html) => {
      rubyHtml = html;
      if (!editing) renderPreview();
    },
    setLineMode: (mode) => {
      currentLineMode = mode;
      updateModifierClasses();
      // モード切替（off → zebra / flat、または逆）でも overlay を直ちに更新
      scheduleRenderLineBands();
    },
    setZebraEnabled: (enabled) => {
      // 旧 API 互換：boolean → LineMode へマップ
      currentLineMode = enabled ? 'zebra' : 'off';
      updateModifierClasses();
      scheduleRenderLineBands();
    },
    setLineHighlightEnabled: (enabled) => {
      lineHighlightEnabled = enabled;
      updateModifierClasses();
    },
    setFocusMode: (enabled) => {
      focusModeEnabled = enabled;
      updateModifierClasses();
      if (!enabled) {
        // OFF にしたら focused 解除も済ませる（CSS でも opacity 戻るので保険）
        focusedParagraphIndex = null;
        applyFocusedClass();
      }
    },
    setFocusedParagraphIndex: (index) => {
      focusedParagraphIndex = index;
      applyFocusedClass();
    },
    scrollParagraphIntoView: (index) => {
      const el = preview.querySelector<HTMLElement>(`p[data-paragraph-i="${index}"]`);
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    },
  };
}

/**
 * text を tokens で span 分割しつつ、段落構造（\n\n）を <p> として保持する。
 * 段落ごとに、その範囲に含まれる tokens だけを span 化する。
 * 行ハイライト（段落 hover）を機能させるため、必ず複数 <p> 構造を維持する。
 */
function renderTextWithTokens(text: string, tokens: Token[]): string {
  // 段落境界を保ったまま分割。空段落（trim 後 0 文字）はスキップして、
  // 連番の data-paragraph-i を割り当てる（ruby.ts / tts.ts と同じルール）。
  const paragraphs: { charStart: number; text: string }[] = [];
  let pos = 0;
  for (const part of text.split(/(\n{2,})/)) {
    if (/^\n{2,}$/.test(part)) {
      pos += part.length;
    } else if (part.length > 0) {
      if (part.trim().length > 0) {
        paragraphs.push({ charStart: pos, text: part });
      }
      pos += part.length;
    }
  }

  if (tokens.length === 0) {
    return paragraphs
      .map((p, i) => `<p data-paragraph-i="${i}">${nl2br(escapeHtml(p.text))}</p>`)
      .join('');
  }

  return paragraphs
    .map((p, pi) => {
      const pStart = p.charStart;
      const pEnd = p.charStart + p.text.length;
      let html = '';
      let cursor = pStart;
      for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];
        if (t.charEnd <= pStart) continue;
        if (t.charStart >= pEnd) break;
        if (cursor < t.charStart) {
          html += nl2br(escapeHtml(text.slice(cursor, t.charStart)));
        }
        html += `<span class="reading-area__token" data-i="${i}">${nl2br(escapeHtml(t.surface))}</span>`;
        cursor = t.charEnd;
      }
      if (cursor < pEnd) {
        html += nl2br(escapeHtml(text.slice(cursor, pEnd)));
      }
      return `<p data-paragraph-i="${pi}">${html}</p>`;
    })
    .join('');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function nl2br(s: string): string {
  return s.replace(/\n/g, '<br>');
}

/**
 * Web Speech API (SpeechSynthesis) のラッパー。
 *
 * 設計方針：
 * - state は内部的に管理し、UI からは play / pause / resume / stop の4つだけ
 * - 状態変化は onStateChange コールバックで通知（UI が表示を切り替える）
 * - 単語同期ハイライト用の onBoundary は Sprint 2 Day 3-4 で利用、今は通すだけ
 * - 日本語音声がない端末でも throw せず、isSupported / hasJapaneseVoice で UI が判断
 * - 失敗系のメッセージは EM_Tone-Principles に準拠（責めない・代替を示す）
 */

export type TtsState = 'idle' | 'playing' | 'paused';

export interface BoundaryEvent {
  charIndex: number;
  charLength: number;
}

export interface TtsOptions {
  /** 0.5 – 2.0、デフォルト 1.0 */
  rate?: number;
  /** voiceURI（getVoices で取得できるもの） */
  voiceURI?: string | null;
  /** 0.0 – 1.0 */
  volume?: number;
  /** 0.0 – 2.0 */
  pitch?: number;
  /** state 変化通知 */
  onStateChange?: (state: TtsState) => void;
  /** 単語境界の通知（Sprint 2 Day 3-4 で使用） */
  onBoundary?: (event: BoundaryEvent) => void;
  /** エラー（音声未対応など）の通知 */
  onError?: (reason: 'unsupported' | 'no-voice' | 'unknown') => void;
  /**
   * 読み上げが「自然に終わった」ときに発火（ユーザー stop は対象外）。
   * UI 側で「お疲れさま」式の控えめなフィードバックを出すために使う。
   */
  onComplete?: () => void;
  /**
   * 段落単位 TTS 同期（Sprint 7）。set されると play() は本文を段落で分割し、
   * 段落 utterance を順番に queue し、各段落の発話開始時に index を通知する。
   * 段落の境界は \n{2,}。空段落はスキップ。
   *
   * 設計判断：
   *   - SpeechSynthesisUtterance.onboundary は日本語で「段落」境界を返さず、
   *     さらにブラウザ実装差が大きい。代わりに「段落ごとに発話を切る」方式で、
   *     段落境界が確実に同期される
   *   - speechSynthesis.cancel() は queue 全体を破棄するので、stop は従来通り
   */
  onParagraphStart?: (paragraphIndex: number) => void;
}

export interface TtsController {
  isSupported: () => boolean;
  hasJapaneseVoice: () => boolean;
  /** 日本語音声の一覧。voiceschanged 後に更新される */
  getJapaneseVoices: () => SpeechSynthesisVoice[];
  /** voiceschanged イベントが発生したら通知（音声リスト初期化用） */
  onVoicesChanged: (cb: () => void) => () => void;
  state: () => TtsState;
  play: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  /** 再生中の設定変更（次回 play から有効） */
  updateOptions: (opts: Partial<TtsOptions>) => void;
}

/**
 * TtsController のファクトリ。
 * SpeechSynthesis が無いブラウザでは isSupported が false を返すだけで、
 * play / pause などは no-op になる（throw しない）。
 */
export function createTts(initialOptions: TtsOptions = {}): TtsController {
  const supported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window;

  let state: TtsState = 'idle';
  let currentUtterance: SpeechSynthesisUtterance | null = null;
  let options: TtsOptions = { ...initialOptions };
  /** ユーザーが stop を押した直後の onend を「完了」扱いしないためのフラグ */
  let wasStopped = false;
  const voicesChangedListeners = new Set<() => void>();

  if (supported) {
    // voices は遅延ロードされることがあるので、変更通知を待つ
    window.speechSynthesis.onvoiceschanged = () => {
      voicesChangedListeners.forEach((cb) => cb());
    };
  }

  const setState = (next: TtsState): void => {
    if (state === next) return;
    state = next;
    options.onStateChange?.(next);
  };

  const getJapaneseVoices = (): SpeechSynthesisVoice[] => {
    if (!supported) return [];
    return window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('ja'));
  };

  /**
   * 1 つの utterance を構築。
   *
   * paragraphIndex / totalParagraphs を渡すと「段落モード」になり、最後の段落
   * の onend だけが onComplete を発火する。null の場合は単発モード（従来の挙動）。
   */
  const buildUtterance = (
    text: string,
    paragraphIndex: number | null,
    totalParagraphs: number,
  ): SpeechSynthesisUtterance => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = options.rate ?? 1.0;
    utterance.volume = options.volume ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;

    // voiceURI 指定があれば、それに一致する voice を選ぶ
    if (options.voiceURI) {
      const matched = window.speechSynthesis
        .getVoices()
        .find((v) => v.voiceURI === options.voiceURI);
      if (matched) utterance.voice = matched;
    } else {
      // 未指定なら最初の日本語音声を選ぶ
      const ja = getJapaneseVoices()[0];
      if (ja) utterance.voice = ja;
    }

    utterance.onstart = () => {
      setState('playing');
      if (paragraphIndex !== null) {
        options.onParagraphStart?.(paragraphIndex);
      }
    };
    utterance.onend = () => {
      const isLast = paragraphIndex === null || paragraphIndex === totalParagraphs - 1;
      if (!isLast) return; // 段落モード：中間 utterance の onend は無視
      const naturallyFinished = !wasStopped;
      wasStopped = false;
      setState('idle');
      currentUtterance = null;
      if (naturallyFinished) {
        options.onComplete?.();
      }
    };
    utterance.onerror = (e) => {
      // 'interrupted' (= 別の発話で中断) はエラー扱いしない
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        options.onError?.('unknown');
      }
      setState('idle');
      currentUtterance = null;
    };
    utterance.onboundary = (event) => {
      if (event.name === 'word' || event.name === 'sentence') {
        options.onBoundary?.({
          charIndex: event.charIndex,
          // charLength は Safari など一部ブラウザで undefined のことがある
          charLength: event.charLength ?? 0,
        });
      }
    };

    return utterance;
  };

  const play = (text: string): void => {
    if (!supported) {
      options.onError?.('unsupported');
      return;
    }
    if (!text.trim()) return;

    if (getJapaneseVoices().length === 0) {
      // 一旦 voiceschanged を待ってからもう一度試す
      // それでも無ければ no-voice エラー
      const tryPlay = (): void => {
        if (getJapaneseVoices().length === 0) {
          options.onError?.('no-voice');
          return;
        }
        startSpeaking(text);
      };
      const off = onVoicesChangedOnce(tryPlay, 500);
      // タイムアウト後に解除（既に試行済みなら何もしない）
      window.setTimeout(off, 600);
      return;
    }

    startSpeaking(text);
  };

  const startSpeaking = (text: string): void => {
    // 前のがあれば止める。これも onend を発火させるが、新しい発話の開始扱いなので
    // wasStopped は立てない（直後の onend は補正対象外）
    if (currentUtterance) wasStopped = true;
    window.speechSynthesis.cancel();

    // 段落モード判定：onParagraphStart が登録されていて、本文に段落境界が
    // ある場合のみ、段落 utterance を queue する。
    const useParagraphMode = !!options.onParagraphStart;
    const paragraphs = useParagraphMode
      ? text.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p.length > 0)
      : [text];
    if (paragraphs.length === 0) return;

    if (paragraphs.length === 1) {
      // 段落が 1 つしかない（または通常モード）。単発で投入。
      // 段落モードでも index 0 を必ず通知したいので、paragraphIndex は 0/1 を渡す。
      const u = buildUtterance(paragraphs[0], useParagraphMode ? 0 : null, 1);
      currentUtterance = u;
      window.speechSynthesis.speak(u);
      return;
    }

    // 段落モード：全段落を queue。各 utterance.onstart で index を通知する。
    // currentUtterance は queue の先頭を入れておく（pause/resume/stop の参照用）。
    currentUtterance = null;
    for (let i = 0; i < paragraphs.length; i++) {
      const u = buildUtterance(paragraphs[i], i, paragraphs.length);
      if (i === 0) currentUtterance = u;
      window.speechSynthesis.speak(u);
    }
  };

  const pause = (): void => {
    if (!supported || state !== 'playing') return;
    window.speechSynthesis.pause();
    setState('paused');
  };

  const resume = (): void => {
    if (!supported || state !== 'paused') return;
    window.speechSynthesis.resume();
    setState('playing');
  };

  const stop = (): void => {
    if (!supported) return;
    wasStopped = true; // 直後の onend を「完了」と誤判定しないため
    window.speechSynthesis.cancel();
    currentUtterance = null;
    setState('idle');
  };

  const onVoicesChanged = (cb: () => void): (() => void) => {
    voicesChangedListeners.add(cb);
    return () => voicesChangedListeners.delete(cb);
  };

  /** 一度きりの voiceschanged リスナー（タイムアウトつき） */
  const onVoicesChangedOnce = (cb: () => void, _timeoutMs: number): (() => void) => {
    let fired = false;
    const wrapper = (): void => {
      if (fired) return;
      fired = true;
      cb();
    };
    return onVoicesChanged(wrapper);
  };

  return {
    isSupported: () => supported,
    hasJapaneseVoice: () => getJapaneseVoices().length > 0,
    getJapaneseVoices,
    onVoicesChanged,
    state: () => state,
    play,
    pause,
    resume,
    stop,
    updateOptions: (next: Partial<TtsOptions>) => {
      options = { ...options, ...next };
    },
  };
}

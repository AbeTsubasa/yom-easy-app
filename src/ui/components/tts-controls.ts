import { copy } from '../copy/ja';
import type { TtsState } from '../../modules/tts';

/**
 * TTS コントロールが表示する視覚状態。
 * tts モジュールの TtsState (idle/playing/paused) に、UI 専用の 'loading' を加える。
 * 'loading' は kuromoji 初期化など、再生開始までの待ち時間を表す。
 */
export type TtsViewState = TtsState | 'loading';

export interface TtsControlsOptions {
  initialState: TtsViewState;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export interface TtsControlsController {
  element: HTMLElement;
  /** 外から状態に応じてボタン表示を更新 */
  syncToState: (state: TtsViewState) => void;
}

/**
 * 読み上げの再生／一時停止／再開／停止ボタン。
 * state に応じてボタンを差し替える。
 * 再生フロー（tokenize + play）は app.ts に委譲し、ここはイベントを発火するだけ。
 */
export function createTtsControls(opts: TtsControlsOptions): TtsControlsController {
  const wrapper = document.createElement('div');
  wrapper.className = 'tts-controls';
  wrapper.setAttribute('role', 'group');
  wrapper.setAttribute('aria-label', '読み上げ操作');

  const playButton = makeButton('tts-controls__primary', copy.tts.play, copy.tts.playAria);
  const pauseButton = makeButton('tts-controls__primary', copy.tts.pause, copy.tts.pauseAria);
  const resumeButton = makeButton('tts-controls__primary', copy.tts.resume, copy.tts.resumeAria);
  const stopButton = makeButton('tts-controls__secondary', copy.tts.stop, copy.tts.stopAria);
  const loadingButton = makeButton(
    'tts-controls__primary',
    copy.tts.preparing,
    copy.tts.preparingAria,
  );
  loadingButton.disabled = true;

  playButton.addEventListener('click', () => opts.onPlay());
  pauseButton.addEventListener('click', () => opts.onPause());
  resumeButton.addEventListener('click', () => opts.onResume());
  stopButton.addEventListener('click', () => opts.onStop());

  const applyState = (state: TtsViewState): void => {
    wrapper.innerHTML = '';
    if (state === 'loading') {
      wrapper.appendChild(loadingButton);
      return;
    }
    if (state === 'idle') {
      wrapper.appendChild(playButton);
    } else if (state === 'playing') {
      wrapper.appendChild(pauseButton);
      wrapper.appendChild(stopButton);
    } else {
      wrapper.appendChild(resumeButton);
      wrapper.appendChild(stopButton);
    }
  };

  applyState(opts.initialState);

  return {
    element: wrapper,
    syncToState: applyState,
  };
}

function makeButton(extraClass: string, label: string, ariaLabel: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `tts-controls__button ${extraClass}`;
  button.textContent = label;
  button.setAttribute('aria-label', ariaLabel);
  return button;
}

import { copy } from '../copy/ja';
import type { TtsController, TtsState } from '../../modules/tts';

export interface TtsControlsOptions {
  /** 読み上げ対象テキストを取得する getter（呼び出し時の最新を返す） */
  getText: () => string;
  /** 共通の TtsController（app.ts で1つだけ作る） */
  tts: TtsController;
  /** 文章が空などで再生できない時に呼ぶ（外側でメッセージ表示） */
  onCannotPlay?: (reason: 'empty' | 'unsupported' | 'no-voice') => void;
}

export interface TtsControlsController {
  element: HTMLElement;
  /** state 変化時に外から表示更新するためのフック（通常は内部で完結） */
  syncToState: (state: TtsState) => void;
}

/**
 * 読み上げの再生／一時停止／再開／停止ボタン。
 * state に応じて「再生」or「一時停止/再開＋停止」に表示を切替。
 * reading-area の toolbar に挿入する想定。
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

  playButton.addEventListener('click', () => {
    const text = opts.getText();
    if (!text.trim()) {
      opts.onCannotPlay?.('empty');
      return;
    }
    if (!opts.tts.isSupported()) {
      opts.onCannotPlay?.('unsupported');
      return;
    }
    opts.tts.play(text);
  });
  pauseButton.addEventListener('click', () => opts.tts.pause());
  resumeButton.addEventListener('click', () => opts.tts.resume());
  stopButton.addEventListener('click', () => opts.tts.stop());

  const applyState = (state: TtsState): void => {
    // ボタンを全部消してから、状態に応じて必要なものだけ追加
    wrapper.innerHTML = '';
    if (state === 'idle') {
      wrapper.appendChild(playButton);
    } else if (state === 'playing') {
      wrapper.appendChild(pauseButton);
      wrapper.appendChild(stopButton);
    } else {
      // paused
      wrapper.appendChild(resumeButton);
      wrapper.appendChild(stopButton);
    }
  };

  applyState(opts.tts.state());

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

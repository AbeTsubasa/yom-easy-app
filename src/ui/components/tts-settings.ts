import { copy } from '../copy/ja';
import { createRangeControl } from './range-control';
import type { TtsController } from '../../modules/tts';

export interface TtsSettingsOptions {
  initialRate: number;
  initialVoiceURI: string | null;
  initialParagraphSync: boolean;
  tts: TtsController;
  onRateChange: (rate: number) => void;
  onVoiceChange: (voiceURI: string | null) => void;
  onParagraphSyncChange: (enabled: boolean) => void;
}

export interface TtsSettingsController {
  element: HTMLElement;
  setRate: (rate: number) => void;
  setParagraphSync: (enabled: boolean) => void;
}

/**
 * settings-panel の親「読み上げ」セクションの中身。
 * - 速度スライダー（range-control 再利用、0.5–2.0、step 0.1）
 * - 音声選択ドロップダウン（端末に複数の日本語音声がある場合）
 *
 * 音声リストはブラウザによって遅延ロードされるため、voiceschanged 後に再描画。
 */
export function createTtsSettings(opts: TtsSettingsOptions): TtsSettingsController {
  const wrapper = document.createElement('div');
  wrapper.className = 'tts-settings';

  const hint = document.createElement('p');
  hint.className = 'tts-settings__hint';
  hint.textContent = copy.settings.ttsHint;
  wrapper.appendChild(hint);

  // 速度スライダー
  const speedSlider = createRangeControl({
    id: 'slider-tts-rate',
    label: copy.settings.ttsSpeedLabel,
    min: 0.5,
    max: 2.0,
    step: 0.1,
    initial: opts.initialRate,
    formatValue: (n) => `${n.toFixed(1)} 倍`,
    onChange: opts.onRateChange,
  });
  wrapper.appendChild(speedSlider.element);

  // 音声選択
  const voiceField = document.createElement('div');
  voiceField.className = 'tts-settings__voice';

  const voiceLabel = document.createElement('label');
  voiceLabel.className = 'tts-settings__voice-label';
  voiceLabel.htmlFor = 'tts-voice-select';
  voiceLabel.textContent = copy.settings.ttsVoiceLabel;

  const voiceSelect = document.createElement('select');
  voiceSelect.id = 'tts-voice-select';
  voiceSelect.className = 'tts-settings__voice-select';

  let currentVoiceURI = opts.initialVoiceURI;

  const populateVoices = (): void => {
    const voices = opts.tts.getJapaneseVoices();
    voiceSelect.innerHTML = '';

    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = copy.settings.ttsVoiceDefault;
    if (currentVoiceURI === null) defaultOpt.selected = true;
    voiceSelect.appendChild(defaultOpt);

    voices.forEach((voice) => {
      const opt = document.createElement('option');
      opt.value = voice.voiceURI;
      opt.textContent = voice.name;
      if (voice.voiceURI === currentVoiceURI) opt.selected = true;
      voiceSelect.appendChild(opt);
    });
  };

  populateVoices();
  // 音声リストが後から届くブラウザ向け
  opts.tts.onVoicesChanged(populateVoices);

  voiceSelect.addEventListener('change', () => {
    const value = voiceSelect.value || null;
    currentVoiceURI = value;
    opts.onVoiceChange(value);
  });

  voiceField.appendChild(voiceLabel);
  voiceField.appendChild(voiceSelect);
  wrapper.appendChild(voiceField);

  // 段落同期トグル（Sprint 7：multi-sensory reading）
  const syncField = document.createElement('div');
  syncField.className = 'tts-settings__sync-field';

  const syncToggleLabel = document.createElement('label');
  syncToggleLabel.className = 'tts-settings__toggle';
  syncToggleLabel.htmlFor = 'toggle-tts-paragraph-sync';

  const syncInput = document.createElement('input');
  syncInput.type = 'checkbox';
  syncInput.id = 'toggle-tts-paragraph-sync';
  syncInput.className = 'tts-settings__checkbox';
  syncInput.checked = opts.initialParagraphSync;
  syncInput.addEventListener('change', () =>
    opts.onParagraphSyncChange(syncInput.checked),
  );

  const syncText = document.createElement('span');
  syncText.className = 'tts-settings__toggle-label';
  syncText.textContent = copy.settings.ttsParagraphSyncLabel;

  syncToggleLabel.appendChild(syncInput);
  syncToggleLabel.appendChild(syncText);
  syncField.appendChild(syncToggleLabel);

  const syncHint = document.createElement('p');
  syncHint.className = 'tts-settings__sub-hint';
  syncHint.textContent = copy.settings.ttsParagraphSyncHint;
  syncField.appendChild(syncHint);

  wrapper.appendChild(syncField);

  return {
    element: wrapper,
    setRate: speedSlider.setValue,
    setParagraphSync: (enabled) => {
      syncInput.checked = enabled;
    },
  };
}

import { copy } from '../copy/ja';
import { FONT_MAP } from '../../modules/font-registry';
import { THEME_MAP } from '../../modules/theme-registry';
import { createFocusTrap, type FocusTrapHandle } from '../../modules/focus-trap';
import type { FontFamilyKey, ThemeKey } from '../../types/settings';

export interface OnboardingResult {
  fontFamily: FontFamilyKey;
  theme: ThemeKey;
  lineHeight: number;
}

export interface OnboardingOptions {
  /** 完了時：3問の選択結果を渡す */
  onComplete: (result: OnboardingResult) => void;
  /** スキップ時：デフォルト設定で進む */
  onSkip: () => void;
}

/**
 * 初回起動時の3問テスト。
 *
 * 設計方針：
 * - 「読みやすい方を選んでください」式（押し付けず、診断・評価ではない）
 * - 各問は実フォント・実色・実行間で短いサンプル文を表示
 * - 任意の時点でスキップ可能、あとから設定パネルで変更可能
 * - role=dialog + aria-modal=true でモーダル
 * - 完了時のみコールバックで結果通知（中断時は変更を反映しない）
 */
export function createOnboarding(opts: OnboardingOptions): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'onboarding';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'onboarding-title');

  const card = document.createElement('div');
  card.className = 'onboarding__card';

  const progressEl = document.createElement('p');
  progressEl.className = 'onboarding__progress';
  progressEl.setAttribute('aria-live', 'polite');

  const titleEl = document.createElement('h2');
  titleEl.id = 'onboarding-title';
  titleEl.className = 'onboarding__title';
  titleEl.textContent = copy.onboarding.title;

  const subtitleEl = document.createElement('p');
  subtitleEl.className = 'onboarding__subtitle';
  subtitleEl.textContent = copy.onboarding.subtitle;

  const promptEl = document.createElement('p');
  promptEl.className = 'onboarding__prompt';
  promptEl.setAttribute('aria-live', 'polite');

  const choicesRow = document.createElement('div');
  choicesRow.className = 'onboarding__choices';

  const skipButton = document.createElement('button');
  skipButton.type = 'button';
  skipButton.className = 'onboarding__skip';
  skipButton.textContent = copy.onboarding.skip;

  card.appendChild(progressEl);
  card.appendChild(titleEl);
  card.appendChild(subtitleEl);
  card.appendChild(promptEl);
  card.appendChild(choicesRow);
  card.appendChild(skipButton);
  overlay.appendChild(card);

  // フォーカストラップ。完了 or スキップで detach() を呼ぶ。
  let trap: FocusTrapHandle | null = null;
  const detachTrap = (): void => {
    if (trap) {
      trap.detach();
      trap = null;
    }
  };
  // overlay が DOM に入った直後にトラップを開始する
  // （ResizeObserver の初回コールバックで初期フォーカスが当たる）
  const startTrap = (): void => {
    if (overlay.isConnected && !trap) {
      trap = createFocusTrap({ container: overlay });
    }
  };
  const mountObserver = new MutationObserver(() => {
    if (overlay.isConnected) {
      startTrap();
      mountObserver.disconnect();
    } else {
      detachTrap();
    }
  });
  mountObserver.observe(document.body, { childList: true, subtree: true });

  skipButton.addEventListener('click', () => {
    detachTrap();
    opts.onSkip();
  });

  // 状態
  let step: 0 | 1 | 2 = 0;
  const choices: Partial<OnboardingResult> = {};

  const renderStep = (): void => {
    progressEl.textContent = copy.onboarding.progress(step + 1, 3);
    choicesRow.innerHTML = '';

    if (step === 0) {
      promptEl.textContent = copy.onboarding.q1.prompt;
      const cardA = makeChoiceCard({
        label: 'A',
        name: copy.onboarding.q1.aName,
        sampleText: copy.onboarding.sampleText,
        applyStyle: (el) => {
          el.style.fontFamily = FONT_MAP['ud-kyokasho'].stack;
        },
        onSelect: () => advance({ fontFamily: 'ud-kyokasho' }),
      });
      const cardB = makeChoiceCard({
        label: 'B',
        name: copy.onboarding.q1.bName,
        sampleText: copy.onboarding.sampleText,
        applyStyle: (el) => {
          el.style.fontFamily = FONT_MAP['mincho'].stack;
        },
        note: copy.onboarding.q1.bNote,
        onSelect: () => advance({ fontFamily: 'mincho' }),
      });
      choicesRow.appendChild(cardA);
      choicesRow.appendChild(cardB);
    } else if (step === 1) {
      promptEl.textContent = copy.onboarding.q2.prompt;
      const cardA = makeChoiceCard({
        label: 'A',
        name: copy.onboarding.q2.aName,
        sampleText: copy.onboarding.sampleText,
        applyStyle: (el) => {
          el.style.backgroundColor = THEME_MAP['cream'].bg;
          el.style.color = THEME_MAP['cream'].text;
        },
        onSelect: () => advance({ theme: 'cream' }),
      });
      const cardB = makeChoiceCard({
        label: 'B',
        name: copy.onboarding.q2.bName,
        sampleText: copy.onboarding.sampleText,
        applyStyle: (el) => {
          el.style.backgroundColor = THEME_MAP['peach'].bg;
          el.style.color = THEME_MAP['peach'].text;
        },
        onSelect: () => advance({ theme: 'peach' }),
      });
      choicesRow.appendChild(cardA);
      choicesRow.appendChild(cardB);
    } else {
      promptEl.textContent = copy.onboarding.q3.prompt;
      const cardA = makeChoiceCard({
        label: 'A',
        name: copy.onboarding.q3.aName,
        sampleText: copy.onboarding.sampleText,
        applyStyle: (el) => {
          el.style.lineHeight = '1.5';
        },
        onSelect: () => advance({ lineHeight: 1.5 }),
      });
      const cardB = makeChoiceCard({
        label: 'B',
        name: copy.onboarding.q3.bName,
        sampleText: copy.onboarding.sampleText,
        applyStyle: (el) => {
          el.style.lineHeight = '1.8';
        },
        onSelect: () => advance({ lineHeight: 1.8 }),
      });
      choicesRow.appendChild(cardA);
      choicesRow.appendChild(cardB);
    }
  };

  const advance = (partial: Partial<OnboardingResult>): void => {
    Object.assign(choices, partial);
    if (step === 2) {
      // 全問完了。デフォルトで埋めて完了コールバック
      detachTrap();
      opts.onComplete({
        fontFamily: choices.fontFamily ?? 'ud-kyokasho',
        theme: choices.theme ?? 'cream',
        lineHeight: choices.lineHeight ?? 1.5,
      });
    } else {
      step = (step + 1) as 0 | 1 | 2;
      renderStep();
    }
  };

  renderStep();
  return overlay;
}

interface ChoiceCardArgs {
  label: 'A' | 'B';
  name: string;
  sampleText: string;
  applyStyle: (previewEl: HTMLElement) => void;
  note?: string;
  onSelect: () => void;
}

function makeChoiceCard(args: ChoiceCardArgs): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'onboarding__choice';
  button.setAttribute('aria-label', `${args.label}：${args.name}`);

  const labelEl = document.createElement('span');
  labelEl.className = 'onboarding__choice-label';
  labelEl.textContent = `${args.label}：${args.name}`;
  button.appendChild(labelEl);

  const previewEl = document.createElement('p');
  previewEl.className = 'onboarding__choice-preview';
  previewEl.textContent = args.sampleText;
  args.applyStyle(previewEl);
  button.appendChild(previewEl);

  if (args.note) {
    const noteEl = document.createElement('small');
    noteEl.className = 'onboarding__choice-note';
    noteEl.textContent = args.note;
    button.appendChild(noteEl);
  }

  button.addEventListener('click', args.onSelect);
  return button;
}

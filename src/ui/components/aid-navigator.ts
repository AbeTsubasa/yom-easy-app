import { copy } from '../copy/ja';
import { createFocusTrap, type FocusTrapHandle } from '../../modules/focus-trap';
import type { Settings } from '../../types/settings';

/**
 * 読みやすさナビ — 「困りごと → 設定」の橋渡しモーダル。
 *
 * 設計思想：
 * - 設定パネルは「フォント / 間隔 / 色 / ハイライト …」と機能名で並んでいる。
 *   初めて触れた方には、自分の困りごとと設定名が結びつきにくい。
 * - このモーダルは、機能名を一切出さず「読むときに、こういうことに困っていますか？」
 *   という問いに答えてもらい、対応する設定をまとめて ON にする。
 * - 「正解」とは言わず「ためし」と言う。合わなければ設定パネルで変えられる、
 *   と毎回明示する（塾長の押し付けない原則）。
 *
 * 困りごと → 設定 のマッピングは下記 ISSUE_OVERRIDES に集約。
 * 複数選択時は、後で書かれたキーが前を上書きするマージで合成する。
 */

export type IssueKey =
  | 'blur'
  | 'skipLine'
  | 'kanji'
  | 'longSentence'
  | 'glare'
  | 'soundBetter'
  | 'wideLine';

const ISSUE_ORDER: IssueKey[] = [
  'blur',
  'skipLine',
  'kanji',
  'longSentence',
  'glare',
  'soundBetter',
  'wideLine',
];

/**
 * 困りごと → 設定オーバーライドのマッピング。
 *
 * 設計上のポイント：
 * - 1 つの困りごとは、いくつかの設定キーをまとめて触る（複合処方）
 * - 互いに矛盾しないキーで構成し、複数選択時は単純マージで合成可能
 * - フォントサイズ・色テーマなど「個人差が大きい」キーは控えめに（極端な値を避ける）
 */
const ISSUE_OVERRIDES: Record<IssueKey, Partial<Settings>> = {
  // 文字がぼやける・にじむ → 輪郭のはっきりした UD 教科書体、字間を広めに
  blur: {
    fontFamily: 'ud-kyokasho',
    fontSize: 20,
    letterSpacing: 0.15,
  },
  // 行を飛ばす → 隔行 zebra + 行間ゆったり + 段落フォーカス
  skipLine: {
    lineMode: 'zebra',
    lineHeight: 1.7,
    highlightColor: 'subtle',
    focusMode: true,
  },
  // 漢字でつっかえる → ふりがな
  kanji: {
    rubyEnabled: true,
  },
  // 長い文が頭に入らない → 文節改行 + 段落フォーカス + 段落間広め
  longSentence: {
    chunkedEnabled: true,
    focusMode: true,
    paragraphSpacing: 2.5,
  },
  // まぶしい → cream 背景（OS 設定とは独立に、確実に控えめへ）
  glare: {
    theme: 'cream',
    customBg: null,
    customText: null,
  },
  // 聞いた方が分かる → 段落同期 ON（本文を入れた後の TTS で効く）
  soundBetter: {
    ttsParagraphSync: true,
  },
  // 行が長い → 行幅を狭める（Schneps 2013 ベース）
  wideLine: {
    maxWidth: 28,
  },
};

export interface AidNavigatorOptions {
  /** 適用ボタン押下時：選ばれた困りごとに対する設定マージを通知 */
  onApply: (overrides: Partial<Settings>, selectedIssues: IssueKey[]) => void;
  /** ナビを閉じる（× / Esc / キャンセル ボタン） */
  onClose: () => void;
}

/**
 * 読みやすさナビのモーダル要素を返す（呼び出し側で root にマウント）。
 *
 * - role=dialog + aria-modal=true
 * - 入る前のフォーカスを覚えて、閉じたあと戻す（focus-trap.ts）
 * - Esc / 背景クリックで onClose
 */
export function createAidNavigator(opts: AidNavigatorOptions): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'aid-navigator';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'aid-navigator-title');

  const card = document.createElement('div');
  card.className = 'aid-navigator__card';

  const titleEl = document.createElement('h2');
  titleEl.id = 'aid-navigator-title';
  titleEl.className = 'aid-navigator__title';
  titleEl.textContent = copy.aidNavigator.modalTitle;

  const subtitleEl = document.createElement('p');
  subtitleEl.className = 'aid-navigator__subtitle';
  subtitleEl.textContent = copy.aidNavigator.modalSubtitle;

  // チェックリスト
  const list = document.createElement('fieldset');
  list.className = 'aid-navigator__list';
  // legend は aria 的に重要だが、視覚的に隠す（title が同じ役割を担う）
  const legend = document.createElement('legend');
  legend.className = 'aid-navigator__sr-only';
  legend.textContent = copy.aidNavigator.modalTitle;
  list.appendChild(legend);

  const selectedIssues = new Set<IssueKey>();
  const checkboxes = new Map<IssueKey, HTMLInputElement>();

  for (const key of ISSUE_ORDER) {
    const issue = copy.aidNavigator.issues[key];
    const item = document.createElement('label');
    item.className = 'aid-navigator__item';
    item.htmlFor = `aid-navigator-issue-${key}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `aid-navigator-issue-${key}`;
    checkbox.className = 'aid-navigator__checkbox';
    checkbox.value = key;
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) selectedIssues.add(key);
      else selectedIssues.delete(key);
      item.classList.toggle('aid-navigator__item--checked', checkbox.checked);
      updateApplyState();
    });
    checkboxes.set(key, checkbox);

    const main = document.createElement('span');
    main.className = 'aid-navigator__item-main';

    const itemLabel = document.createElement('span');
    itemLabel.className = 'aid-navigator__item-label';
    itemLabel.textContent = issue.label;

    const itemHint = document.createElement('span');
    itemHint.className = 'aid-navigator__item-hint';
    itemHint.textContent = issue.hint;

    main.appendChild(itemLabel);
    main.appendChild(itemHint);

    item.appendChild(checkbox);
    item.appendChild(main);
    list.appendChild(item);
  }

  // 適用ボタンの状態（disabled / hint）を選択数に応じて更新
  const applyButton = document.createElement('button');
  applyButton.type = 'button';
  applyButton.className = 'aid-navigator__apply';
  applyButton.textContent = copy.aidNavigator.apply;
  applyButton.setAttribute('aria-label', copy.aidNavigator.applyAria);

  const applyHint = document.createElement('p');
  applyHint.className = 'aid-navigator__apply-hint';
  applyHint.id = 'aid-navigator-apply-hint';
  applyHint.textContent = copy.aidNavigator.applyDisabledHint;
  applyButton.setAttribute('aria-describedby', applyHint.id);

  const updateApplyState = (): void => {
    const hasSelection = selectedIssues.size > 0;
    applyButton.disabled = !hasSelection;
    applyHint.hidden = hasSelection;
  };

  applyButton.addEventListener('click', () => {
    if (selectedIssues.size === 0) return;
    const overrides: Partial<Settings> = {};
    for (const key of ISSUE_ORDER) {
      if (selectedIssues.has(key)) {
        Object.assign(overrides, ISSUE_OVERRIDES[key]);
      }
    }
    opts.onApply(overrides, Array.from(selectedIssues));
  });

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.className = 'aid-navigator__cancel';
  cancelButton.textContent = copy.aidNavigator.cancel;
  cancelButton.setAttribute('aria-label', copy.aidNavigator.cancelAria);
  cancelButton.addEventListener('click', () => opts.onClose());

  const actions = document.createElement('div');
  actions.className = 'aid-navigator__actions';
  actions.appendChild(cancelButton);
  actions.appendChild(applyButton);

  card.appendChild(titleEl);
  card.appendChild(subtitleEl);
  card.appendChild(list);
  card.appendChild(applyHint);
  card.appendChild(actions);
  overlay.appendChild(card);

  // 背景クリックで閉じる（card の外側）
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) opts.onClose();
  });

  // Esc で閉じる
  const onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') opts.onClose();
  };
  document.addEventListener('keydown', onKeyDown);

  // フォーカストラップ。初期フォーカスは「最初のチェックボックス」に。
  // ユーザーが流し見しながら下から上に選びにくいので、上から順に決められる位置に置く。
  let trap: FocusTrapHandle | null = null;
  const observer = new MutationObserver(() => {
    if (overlay.isConnected) {
      if (!trap) {
        const firstCheckbox = checkboxes.get(ISSUE_ORDER[0]);
        trap = createFocusTrap({ container: overlay, initialFocus: firstCheckbox });
      }
    } else {
      document.removeEventListener('keydown', onKeyDown);
      if (trap) {
        trap.detach();
        trap = null;
      }
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // 初期状態のボタン制御
  updateApplyState();

  return overlay;
}

export { ISSUE_OVERRIDES, ISSUE_ORDER };

# CLAUDE.md — プロジェクト持続メモリ

> このファイルは Claude Code がプロジェクトディレクトリで**毎セッション最初に読む**べき記述。プロジェクトのコーディング規約・哲学・運用ルールを集約。
> 概要は [[HANDOFF.md]] を参照。

---

## プロジェクト名

**Dyslexia Reading Customizer**（仮称：実装時に汎用的な名称に変更すること。"Dyslexia"をUIに含めない）

候補名：「Yomu」「ReadEasy」「YomiKata」「ReadMate」「LineFocus」など

---

## プロジェクト目的

ディスレクシア（読み書き困難）の生徒・受験生・大人当事者向けに、テキストの視認性を**「自分に合う形」に変えて読める**ようにするウェブアプリを開発する。

主機能：
- フォント・字間・行間・色などの視認性カスタマイズ
- 読み上げ＋単語同期ハイライト
- 日本語ルビ自動付与
- Reading Ruler（行ハイライト）
- カメラ撮影→OCR→テキスト変換

**重要**：これは「治療アプリ」ではなく、**「読みやすさを変えるツール」**として設計する。

---

## ⭐ 絶対守るコーディング・設計規約

### 1. プライバシー・ローカルファースト
- **サーバーバックエンドを持たない**（個人情報を一切収集しない）
- 設定・データは `localStorage` に保存
- OCR は Tesseract.js でクライアントサイド処理（画像をサーバーに送らない）
- アナリティクス・トラッキングを実装しない（v1.0）
- v1.1 以降で利用ログを実装する場合も**オプトイン・デフォルトOFF**

### 2. アクセシビリティ
- **WCAG 2.1 AAA レベルをデフォルト**で出荷
  - line-height ≥ 1.5
  - letter-spacing ≥ 0.12em
  - word-spacing ≥ 0.16em
  - paragraph-spacing ≥ font-size × 2
  - text-align: left（両端揃え禁止）
  - フォントサイズ 18px デフォルト
- スクリーンリーダー対応（aria-label、role 属性、適切な見出し階層）
- キーボードのみで全操作可能
- 色だけに依存しない情報伝達

### 3. 言葉選び・マイクロコピー
**詳細**：[[70_Empowering-Messages/EM_Tone-Principles]] を必ず参照。

#### コード内で **絶対使わない** 文字列：
- 治す、直す、克服、矯正、訓練、リハビリ、症状
- がんばろう、努力しよう、乗り越えよう
- 障害（医療文脈）、患者、診断
- すごい！、素晴らしい！、天才！
- あなたを支援する、あなたを治す
- 「障害があっても大丈夫」式のコピー

#### 推奨する文字列：
- 合う方法を選ぶ、読み方を見つける
- ここまでできたね、お疲れさま
- 自分のペース、自分らしく
- 学び方の違い、読み書きの困りごと、特性

### 4. UI 中立性
- **アプリ名・ロゴに "Dyslexia" "障害" を含めない**
- 医療系の青十字・赤十字を使わない
- 子ども向けキャラクター・パステル多用を避ける
- 大袈裟な啓発調イラスト禁止
- 一般的なテキストエディタ風の見た目に

### 5. 個人差の尊重
- 「これが正しい設定」を提示しない
- すべての設定にデフォルト＋カスタマイズ余地を持たせる
- 「OpenDyslexic 強制」のような単一推奨をしない
- プリセット名は「おすすめA・B・C」のような中立的な名前
  - ❌ NG例：「最適設定」「ディスレクシア用」
  - ✅ OK例：「読みやすい組み合わせ①」「Cream + UD ゴシック」

---

## 技術スタック（決定事項）

```json
{
  "language": "TypeScript",
  "build": "Vite",
  "framework": "Vanilla TS (or Svelte if needed)",
  "styling": "Tailwind CSS",
  "deps": {
    "tesseract.js": "^5.x",
    "@sglkc/kuromoji": "latest",
    "kuroshiro": "^1.x"
  },
  "tts": "Web Speech API (browser built-in)",
  "storage": "localStorage",
  "deployment": "GitHub Pages",
  "ci": "GitHub Actions"
}
```

### 採用しない技術（理由付き）

| 技術 | 不採用理由 |
|---|---|
| React/Vue/Next.js | バンドル肥大、依存重、学校環境でブロックされやすい |
| バックエンド | 個人情報リスク、コスト、プライバシー違反 |
| 有料API（クラウドOCR） | 無料・低価格維持。v1.1でオプションとして検討可 |
| Firebase等のBaaS | サーバーレスでもプライバシー懸念 |
| ストリーク/バッジ機能 | アンダーマイニング効果（Deci 1971）、押し付けがましさ |

---

## コーディング規約

### 命名規約

- **コンポーネント名・関数名**：日常的な英語で
  - ✅ `ReadingArea`, `FontPicker`, `RubySwitch`
  - ❌ `DyslexiaReader`, `DisabledStudentMode`
- **CSS クラス**：BEM風または Tailwind ユーティリティ
- **TypeScript**：strict mode、明示的な型定義
- **テキスト変数**：i18n を意識し、`src/ui/copy/` に集約

### ファイル組織

```
src/
├── main.ts              ← エントリポイント（最小限）
├── app.ts               ← アプリケーション本体
├── modules/             ← 機能モジュール（責務分割）
│   ├── settings.ts
│   ├── tts.ts
│   ├── ruby.ts
│   ├── ocr.ts
│   ├── ruler.ts
│   ├── highlight.ts
│   └── onboarding.ts
├── ui/
│   ├── components/      ← UI コンポーネント
│   ├── copy/            ← マイクロコピー（言語別）
│   │   ├── ja.ts
│   │   └── en.ts
│   └── styles/
└── types/               ← 型定義
```

### Git 運用

- `main` ブランチは常にデプロイ可能な状態
- 機能追加は `feature/xxx` ブランチで
- コミットメッセージは英語、現在形（Conventional Commits 推奨）
  - 例：`feat: add ruby auto-furigana with grade filter`
- PR は自分でも作って、レビュー的な視点で変更を整理してマージ

---

## CSS 設計

CSS 変数で全プロパティを管理：

```css
:root {
  /* Typography */
  --font-family: 'UD Digi Kyokasho NK-R', 'BIZ UDPGothic', sans-serif;
  --font-size: 18px;
  --letter-spacing: 0.12em;
  --line-height: 1.5;
  --word-spacing: 0.16em;
  --paragraph-spacing: 2em;

  /* Layout */
  --max-width: 40em;

  /* Color (Cream theme - default) */
  --bg-color: #FDF6E3;
  --text-color: #222222;
  --accent-color: #EDD1B0;

  /* Reading Ruler */
  --ruler-color: rgba(255, 220, 100, 0.3);
  --ruler-height: 1.5em;
}
```

JS から `document.documentElement.style.setProperty()` で動的更新。

### テーマ切替

CSS変数のみで実装：

```ts
const themes = {
  cream:   { '--bg-color': '#FDF6E3', '--text-color': '#222222' },
  peach:   { '--bg-color': '#EDD1B0', '--text-color': '#333333' },
  orange:  { '--bg-color': '#EDDD6E', '--text-color': '#222222' },
  yellow:  { '--bg-color': '#F8FD89', '--text-color': '#222222' },
  grey:    { '--bg-color': '#D8D3D6', '--text-color': '#222222' },
  dark:    { '--bg-color': '#1A1A1A', '--text-color': '#E5E5E5' }, // 純黒回避
};
```

---

## 機能別実装ヒント

### 読み上げ（TTS）+ 単語同期ハイライト

```ts
// 必ず onboundary で同期
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = 'ja-JP';
utterance.onboundary = (event) => {
  if (event.name === 'word') {
    highlightCharRange(event.charIndex, event.charIndex + (event.charLength ?? 0));
  }
};
speechSynthesis.speak(utterance);
```

**注意**：日本語の word boundary はブラウザ実装差が大きい。**kuromoji.js で形態素解析してオフセットを自前管理する**方が確実。

### ルビ生成（kuroshiro）

```ts
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

const kuroshiro = new Kuroshiro();
await kuroshiro.init(new KuromojiAnalyzer({ dictPath: '/dict' }));

const html = await kuroshiro.convert(text, {
  to: 'hiragana',
  mode: 'furigana'
});
```

**学年フィルタ**：文部科学省「学年別漢字配当表」をJSONで持ち、対象学年より上の漢字のみルビを付与。

### OCR（Tesseract.js）

```ts
import Tesseract from 'tesseract.js';

const result = await Tesseract.recognize(
  imageData,
  'jpn', // 日本語
  {
    logger: (m) => console.log(m), // 進捗
  }
);
const extractedText = result.data.text;
```

詳細：[[60_Implementation/I_OCR-Library]]

---

## テスト方針

### 自動テスト
- 単体テスト：Vitest
- E2E：Playwright（任意）
- 視覚回帰：Storybook + Chromatic（v1.1）

### 手動テスト
- 自分のスマホ・タブレット・PC で実機確認
- 当事者テスト（[[60_Implementation/I_User-Testing]]）
- **WAVE / axe DevTools でアクセシビリティ検証**
- WCAG 1.4.12 を上書きしてレイアウト崩壊しないことを確認

---

## デプロイ

- **GitHub Pages** を主にする
- `main` push で自動デプロイ（GitHub Actions）
- カスタムドメイン推奨（任意）
- HTTPS 自動

---

## アクセシビリティチェックリスト（PR前必須）

- [ ] WCAG 1.4.12（テキストスペーシング）を上書きしても破綻しない
- [ ] WCAG 1.4.10（リフロー）：200% 拡大で横スクロール不要
- [ ] キーボードのみで全機能操作可能
- [ ] スクリーンリーダー（VoiceOver/NVDA）で読み上げ可能
- [ ] フォーカスインジケータが明確
- [ ] aria-live で読み上げ進捗を通知
- [ ] 色覚多様性チェック（Coblis等のシミュレータ）

---

## 危機対応コンテンツの実装

ユーザーが希死念慮等を示唆するキーワードを入力した場合、または燃え尽き警告サインで重篤判定された場合：

```ts
const CRISIS_KEYWORDS = ['死にたい', '消えたい', 'もう疲れた', '生きていたくない'];

function checkCrisisKeywords(text: string): boolean {
  return CRISIS_KEYWORDS.some(kw => text.includes(kw));
}

// 検出時：
// 1. 静かに緊急連絡先パネルを表示
// 2. アプリの動作を妨げない
// 3. 「あなたのことが心配です」式のソフトな表現
// 4. 連絡先：0120-0-78310（24時間子供SOSダイヤル）等
```

詳細：[[70_Empowering-Messages/EM_Trauma-Informed-Microcopy#自殺リスクサイン検知時の対応 v2 機能]]

---

## エラーハンドリング哲学

- エラーメッセージは「責めない」「代替を示す」（[[70_Empowering-Messages/EM_Error-Empty-States]]）
- ❌「ファイル形式が正しくありません」
- ✅「このファイル、うまく読み込めなかったみたい。別の方法を試してみよう」

---

## i18n 戦略

v1.0 では日本語固定でも可。v1.1 で英語を追加：

```ts
// src/ui/copy/ja.ts
export const copy = {
  app: { name: 'Yomu' },
  onboarding: {
    welcome: 'ようこそ。',
    subtitle: '文字を、あなたに合う見え方に変えてみませんか？',
    cta: '続ける',
    skip: '今すぐ使う',
  },
  // ...
};
```

---

## 過去の決定の参照ファイル

- 設計判断の哲学的根拠 → [[30_Voice/V_NPO-EDGE]], [[30_Voice/V_Made-by-Dyslexia]]
- 数値・エビデンスの根拠 → [[10_Research/]] 全般
- 心理学的な根拠 → [[99_Source-Docs/Phase1C_Psychology_Notes]]
- 現場ニーズ → [[20_Field/F_Schools]]

---

## 完了時のメッセージ（参考）

リリース時、ReadMe や告知に書く文言の方向性：

```markdown
# Yomu — あなたに合う読み方を見つけるツール

文字の大きさ、行の間、色、ふりがな、読み上げ。
「読みやすさ」のかたちは、人それぞれ。

このアプリは、文字をあなたの脳に合う形に整えるためのツールです。
読みやすくする方法は人それぞれなので、たくさんの設定から自分にぴったりのものを見つけてください。

ブラウザで開くだけ。登録不要・無料。
```

---

最終更新：2026-05-26

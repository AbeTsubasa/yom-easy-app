# HANDOFF.md — Claude Code への引き継ぎ文書

> **Claude Code を起動した最初の prompt で、まずこのファイルを Read してください。**
> このプロジェクトの背景・仕様・優先順位・受け入れ基準のすべてが、Vault 全体への動線とともにここに集約されています。

---

## 0. このプロジェクトは何か（30秒サマリー）

**ディスレクシア（読み書き困難）の生徒のための、ブラウザで即起動・登録不要・無料のテキスト視認性カスタマイズウェブアプリ。**

任意のテキスト（貼付・ファイル・**カメラ撮影**）を、ユーザーが「自分に合う読みやすさ」（フォント・行間・字間・色・ふりがな・行ハイライト・読み上げ）にカスタマイズして読めるようにする。

開発者：塾長（学習塾運営、受験生指導が主業務）。
対象：日本語の読み書き困難児・受験生・大人当事者。日英バイリンガル想定。

**競合との差別化**：
- 日本語ルビ＋読み上げ＋UDフォント＋行ハイライト＋OCR の**統合**は既存ツールに存在しない（→ [[40_Tools/T_Competitive-Matrix]]）
- DAISY/AccessReadingは申請制で日常使い不可
- 海外ツール（Helperbird等）は日本語ルビ非対応

---

## 1. 開発前に必ず読むファイル（優先順位順）

### Tier 1：絶対必読（30分以内）

1. **このファイル（HANDOFF.md）**
2. **[[CLAUDE.md]]** — プロジェクト持続メモリ、コーディング規約、トーン規約
3. **[[50_Features/FT_MVP]]** — MVP（v1.0）の確定仕様
4. **[[50_Features/FT_OCR]]** — OCR機能の詳細仕様（MVPに含む）
5. **[[60_Implementation/I_Tech-Stack]]** — 技術スタック決定事項
6. **[[60_Implementation/I_First-Sprint-Tasks]]** — Sprint 1の具体的タスク

### Tier 2：実装中に頻繁に参照

7. **[[70_Empowering-Messages/EM_Tone-Principles]]** — マイクロコピーのNG/OK
8. **[[70_Empowering-Messages/EM_In-App-Microcopy]]** — ボタン・ラベル・ヒント
9. **[[70_Empowering-Messages/EM_Onboarding-Copy]]** — 初回起動時の文言
10. **[[60_Implementation/I_Libraries]]** — kuromoji.js / kuroshiro / Web Speech API実装メモ
11. **[[60_Implementation/I_OCR-Library]]** — Tesseract.js実装メモ

### Tier 3：機能拡張時・特定領域の深掘りに

- **[[00_MOC/Home]]** から各MOCへ
- **[[99_Source-Docs/Phase1A_Research_Notes]]** — 学術エビデンス原典
- **[[99_Source-Docs/Phase1C_Psychology_Notes]]** — 心理学根拠原典

---

## 2. プロジェクトの哲学（絶対守ること）

このプロジェクトは技術的に作るだけでは失敗する。**以下5原則を理解せずに書いたコードはマージしない**くらいの厳格さで運用してほしい。

### 2.1 ⭐ 「治す」フレーミング絶対回避

- ❌ NG ワード：治す／直す／克服／矯正／訓練／障害（医療文脈）／症状
- ✅ OK ワード：合う方法を選ぶ／学び方の違い／読み書きの困りごと／特性

理由：[[30_Voice/V_NPO-EDGE]] 藤堂栄子氏「治すのではなく活かす」、[[30_Voice/V_Made-by-Dyslexia]] "Dyslexic Thinking is a Skill"、[[80_Teacher-Learning/TL_M9-Motivation-Theory]] Dweck の False Growth Mindset 警告。

### 2.2 ⭐ 「がんばろう」式の押し付け禁止

- ❌ NG：「がんばれ」「努力しよう」「乗り越えよう」「すごい！」「天才！」
- ✅ OK：「ここまでできたね」「いい設定が見つかったね」「お疲れさま」

根拠：[[80_Teacher-Learning/TL_M9-Motivation-Theory|Mueller & Dweck 1998 — 能力ほめvs過程ほめ]]、[[99_Source-Docs/Phase1C_Psychology_Notes#3. 学習動機づけの心理学]]。

### 2.3 ⭐ 「特別扱いに見えない」UI

- アプリ名・ロゴ・アイコンに "Dyslexia" "障害" を含めない（**汎用的ネーミング**：例「Yomu」「ReadEasy」など中立的なもの）
- スクリーンショットを撮って友人に見られても「ディスレクシア専用」と分からない見た目
- 医療系の青十字、子ども向けキャラクター、大袈裟な啓発調イラスト**禁止**

根拠：[[20_Field/F_Schools|東京学芸大附属小金井小・鈴木秀樹実践]]「読み書きの困難さに気づかれない子も救われる、通常学級1人1台ICT環境」、[[30_Voice/V_Design-Dos-Donts]]。

### 2.4 ⭐ 個人差を前提に「選べる」UI

- 単一の最適解（「これを使えばOK」）を提示しない
- すべて**プリセット＋自由カスタマイズ**の二段構え
- 「OpenDyslexic強制」「特定フォント推奨」は避け、選択肢として提供

根拠：[[10_Research/F_Fonts]] OpenDyslexic効果否定研究、[[10_Research/A_AssistiveTech|CHI 2023 Reading Rulers]]「単一の最良デザインはない」。

### 2.5 ⭐ プライバシー・ローカルファースト

- **個人情報を一切収集しない**（登録・ログイン不要）
- 設定はすべて localStorage 保存
- OCR 画像はサーバーに送らない（Tesseract.js のオフライン処理を優先）
- 読書ログ・利用ログは**オプトイン**、デフォルトOFF
- 当事者は「学校・友人に知られたくない」（[[30_Voice/V_Typical-Experiences]]）

---

## 3. MVP 機能セット（v1.0）

完全な仕様は **[[50_Features/FT_MVP]]** と **[[50_Features/FT_OCR]]** にあるので、ここは要約のみ。

### 必須機能（A〜F は全て v1.0 に含む）

**A. 入力**
- テキスト貼り付け
- .txt / .md ファイル読み込み（ドラッグ＆ドロップ）
- **🆕 カメラ撮影 → OCR（Tesseract.js）** ← MVPに昇格

**B. 視認性コントロール**
- フォント切替（UDデジタル教科書体 / BIZ UD / Noto Sans JP / Arial 等＋OpenDyslexic オプション）
- サイズ・字間・行間・語間・段落間・行幅・左揃え固定

**C. 色**
- 背景色プリセット（Cream / Peach / Orange / Yellow / Grey / Dark）＋ピッカー
- 文字色（純黒回避、デフォルト `#222`）
- ダークモード

**D. 集中支援**
- **TTS（Web Speech API）+ 単語同期ハイライト**（必須）
- Reading Ruler 3種（Line Focus / Underline / Shade）
- 蛍光マーカー

**E. 日本語特化**
- **ルビ自動付与**（kuromoji.js + kuroshiro、学年別フィルタ）
- 分かち書きトグル

**F. オンボーディング・声かけ**
- 初回3問テスト（フォント／配色／行間を本人に選ばせる）
- 強みベースのマイクロコピー
- Made by Dyslexia 6スキル引用（任意・ON/OFF可能）

**G. 出力**
- 印刷出力（設定維持）
- URL共有（設定プロファイル）

**H. データ保存**
- localStorage、個人情報非収集

---

## 4. 技術スタック（決定事項）

| 層 | 採用 |
|---|---|
| 言語 | TypeScript |
| ビルド | Vite |
| フレームワーク | **Vanilla TS（Svelteも可）** ※React/Next.js不要 |
| CSS | Tailwind CSS |
| 形態素解析 | `@sglkc/kuromoji`（フォーク版） |
| ルビ生成 | `kuroshiro` |
| OCR | `tesseract.js` (v5+) |
| TTS | Web Speech API（ブラウザ標準） |
| 永続化 | localStorage |
| デプロイ | **GitHub Pages**（無料、無依存、学校導入容易） |
| PWA | Service Worker（v1.1） |

詳細：[[60_Implementation/I_Tech-Stack]]、[[60_Implementation/I_Libraries]]、[[60_Implementation/I_OCR-Library]]

**避けるもの**：React/Vue/Next.js（バンドルサイズ・学習コスト・依存重）、バックエンド（個人情報非収集設計）、有料API（無料・低価格を保つ）

---

## 5. 推奨スプリント計画

### Sprint 0: セットアップ（半日）
- リポジトリ作成（GitHub）
- `npm create vite@latest dyslexia-app -- --template vanilla-ts`
- 依存インストール：tesseract.js、kuromoji、kuroshiro、tailwindcss
- GitHub Pages デプロイ設定（gh-pages ブランチ）
- ESLint / Prettier
- 詳細：[[60_Implementation/I_Initial-Setup]]

### Sprint 1: 視認性 MVP（1週間）
- テキスト貼付エリア + プレビュー領域
- フォント切替・サイズ・字間・行間・背景色・文字色
- localStorage 保存
- 初回3問テスト
- **動作確認**：自分のスマホ・PCで実機テスト

### Sprint 2: 読み上げ（1週間）
- Web Speech API 統合
- 単語同期ハイライト（`onboundary` イベント）
- 日本語の単語境界は kuromoji.js で自前管理（OS差吸収）
- 速度調整、一時停止・再開

### Sprint 3: ルビ＋分かち書き（1週間）
- kuromoji.js / kuroshiro 統合
- 学年別常用漢字フィルタ
- 分かち書きトグル

### Sprint 4: 集中支援（1週間）
- Reading Ruler 3種
- 蛍光マーカー
- マイクロコピーの最終調整（[[70_Empowering-Messages/EM_In-App-Microcopy]]）

### Sprint 5: 🆕 OCR（1〜2週間）
- Tesseract.js 統合
- `<input type="file" capture>` でカメラ起動
- 画像前処理（傾き補正、コントラスト）
- 抽出テキストを編集エリアに展開
- 詳細：[[50_Features/FT_OCR]]、[[60_Implementation/I_OCR-Library]]

### Sprint 6: 出力＋仕上げ（1週間）
- 印刷フレンドリー CSS
- URL 共有
- 受け入れ基準チェック
- 当事者テスト連携（[[60_Implementation/I_User-Testing]]）

**合計：約6〜7週間**でMVP完成。

詳細タスクリスト：[[60_Implementation/I_First-Sprint-Tasks]]

---

## 6. 受け入れ基準（リリース前チェック）

- [ ] WCAG 2.1 AAA 相当の視認性デフォルト
- [ ] 登録／ログインなしで全機能利用可能
- [ ] スマホ・タブレット・PC のブラウザで動作
- [ ] **オフラインで基本機能が動く**
- [ ] **初回起動から30秒以内**にテキストを貼って読み始められる
- [ ] 「治す」「直す」「克服」「練習」を1度も使っていない
- [ ] ロゴ・アイコンに "Dyslexia" を含まない
- [ ] **カメラ撮影 → OCR → 読み上げのフロー**が日本語の印刷物で動作する
- [ ] **6つの Dyslexic Thinking Skills 引用**がON/OFF可能
- [ ] **緊急連絡先**（24時間子供SOSダイヤル：0120-0-78310 等）がフッターに常設

---

## 7. やってはいけないこと（避けたい失敗）

### 設計レベル
- ❌ ログイン機能を実装する（プライバシー違反、当事者離れの原因）
- ❌ ゲーミフィケーション（バッジ・ストリーク・連続日数）を入れる（アンダーマイニング効果）
- ❌ 「ディスレクシア専用」と明示するコピー（[[30_Voice/V_Design-Dos-Donts]]）
- ❌ 子ども向けキャラクター・パステル多用（中高生・大人当事者の離反）

### 実装レベル
- ❌ React/Next.js 採用（バンドル肥大、学校環境でブロックされやすい）
- ❌ サーバーサイド（個人情報リスク、コスト）
- ❌ 純黒文字色 `#000000` をデフォルトに（[[10_Research/C_Color]]）
- ❌ 両端揃え（WCAG・BDA違反）
- ❌ OpenDyslexic を強制的にデフォルトに（査読研究で効果否定）

### メッセージング
- ❌ 「あなたを治す」「あなたを支援する」（医療化）
- ❌ 「がんばろう！」「絶対大丈夫！」（押し付け励まし）
- ❌ 「あなたは天才！」（能力ほめ、Fixed Mindset誘発）
- ❌ 大袈裟な啓発調（「あなたは輝ける！」）

---

## 8. 完成後の連携先（当事者テスト・公開）

詳細は [[60_Implementation/I_User-Testing]]。

- **NPO EDGE**（藤堂栄子氏ネットワーク、LSA講座修了者）
- **発達性ディスレクシア研究会**（専門家レビュー）
- **触るグリフ**（大人当事者SNSコミュニティ）
- **東大DO-IT Japan**（スカラー＝中高生・大学生当事者）
- **東京学芸大附属小金井小（鈴木秀樹教諭）**（通常学級1人1台ICT環境）
- **京都府総合教育センター**（通級教室）
- **ディスレクシア月間（10月）**でのオフライン体験会

---

## 9. プロジェクト構造（推奨）

```
dyslexia-app/
├── .claude/
│   └── CLAUDE.md           ← Claude Code が読むプロジェクト記述
├── docs/
│   ├── HANDOFF.md          ← この文書のコピー
│   └── vault/              ← Obsidian Vault のコピー（参照用）
├── public/
│   ├── dict/               ← kuromoji 辞書
│   └── fonts/              ← UDフォント等
├── src/
│   ├── main.ts             ← エントリポイント
│   ├── app.ts              ← アプリケーション本体
│   ├── modules/
│   │   ├── settings.ts     ← 設定管理（localStorage）
│   │   ├── tts.ts          ← 読み上げ
│   │   ├── ruby.ts         ← ルビ生成（kuroshiro）
│   │   ├── ocr.ts          ← OCR（Tesseract.js）
│   │   ├── ruler.ts        ← Reading Ruler
│   │   ├── highlight.ts    ← 蛍光マーカー
│   │   └── onboarding.ts   ← 初回3問テスト
│   ├── ui/
│   │   ├── components/
│   │   ├── copy/           ← マイクロコピー（i18n）
│   │   └── styles/
│   └── types/
├── tests/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 10. Claude Code 起動時の推奨ファーストプロンプト

塾長がClaude Code を起動したら、以下のような prompt から開始するとスムーズです：

```
このプロジェクトを引き継ぎます。

まず以下を順番に読んでください：
1. ./HANDOFF.md（プロジェクト全体）
2. ./.claude/CLAUDE.md（コーディング規約・トーン規約）
3. ./docs/vault/50_Features/FT_MVP.md（MVP仕様）
4. ./docs/vault/50_Features/FT_OCR.md（OCR仕様）
5. ./docs/vault/60_Implementation/I_First-Sprint-Tasks.md（Sprint 1タスク）

読み終わったら、Sprint 0（セットアップ）から始めましょう。

ただし、何かコードを書く前に：
- 「治す」フレーミング回避
- 「特別扱いに見えない」UI
- 個人情報非収集
- WCAG AAA デフォルト

の4原則を必ず守ってください。具体的なNG/OKは vault/70_Empowering-Messages/EM_Tone-Principles.md にあります。
```

---

## 11. 質問・判断に迷ったら

- **仕様で迷う** → このVault内の対応MOC（[[00_MOC/Features-MOC]]等）を参照
- **トーン・言葉選び** → [[70_Empowering-Messages/EM_Tone-Principles]]
- **エビデンスの根拠** → [[10_Research/]] と [[99_Source-Docs/Phase1A_Research_Notes]]
- **心理学的根拠** → [[99_Source-Docs/Phase1C_Psychology_Notes]]
- **緊急対応（自殺リスク等）** → [[80_Teacher-Learning/TL_M10-Trauma-Informed-Practice]]

---

## ⭐ 最後に

このプロジェクトは「便利なツールを作る」だけではなく、**「これまで読み書きで深く傷ついてきた当事者の心に、害を与えない形で寄り添うアプリ」**を作ることが本質です。

技術的な完成度だけでなく、**生徒が初めてアプリを開いた瞬間に「ここは安全だ」と感じられるか**が成功の指標です。

迷ったら、Vault に戻ってください。すべての設計判断の根拠が、研究と当事者の声に基づいて整理されています。

---

最終更新：2026-05-26
納品元：Cowork 上の Claude（リサーチ＆Vault構築フェーズ）
納品先：Claude Code（実装フェーズ）

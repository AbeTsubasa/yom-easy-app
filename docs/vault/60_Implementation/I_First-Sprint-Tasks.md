---
title: "I_First-Sprint-Tasks — Sprint 1〜6 タスクリスト"
type: implementation
created: 2026-05-26
tags: [implementation, tasks, sprint]
---

# I_First-Sprint-Tasks — Sprint 1〜6 タスクリスト

> Claude Code が MVP（v1.0）を実装するための詳細タスクリスト。各 Sprint 1週間目安、合計約6〜7週間。

## Sprint 0：セットアップ（半日）
詳細：[[I_Initial-Setup]]

- [x] リポジトリ作成
- [x] Vite + TS 初期化
- [x] 依存インストール（tesseract.js / kuromoji / kuroshiro / tailwind）
- [x] フォルダ構造作成
- [x] GitHub Pages デプロイ設定
- [x] 初回コミット＆動作確認

---

## Sprint 1：視認性 MVP（1週間）

### Goal
任意のテキストを貼り付けて、フォント・色・字間・行間を変えて読める。

### Tasks

#### Day 1-2：テキスト入力 UI
- [ ] テキスト貼り付けエリア（`<textarea>`）
- [ ] プレビュー領域（テキスト表示）
- [ ] ファイル読み込み（.txt / .md、FileReader API、ドラッグ＆ドロップ）
- [ ] ヘッダー＋サイドメニューの基本レイアウト（[[EM_In-App-Microcopy]] 参照）

#### Day 3：フォント切替
- [ ] フォントピッカー UI
- [ ] 和文：UD Digi Kyokasho NK-R / BIZ UDPGothic / Noto Sans JP / メイリオ
- [ ] 欧文：Arial / Verdana / Open Sans / Helvetica
- [ ] **オプション**：OpenDyslexic / Dyslexie（Web フォント）
- [ ] CSS変数 `--font-family` で動的切替

#### Day 4：文字サイズ・字間・行間
- [ ] フォントサイズスライダー（14–32px、デフォルト18px）
- [ ] letter-spacing スライダー（0–0.25em、デフォルト0.12em）
- [ ] line-height スライダー（1.2–2.0、デフォルト1.5）
- [ ] word-spacing スライダー（0–0.5em、デフォルト0.16em）

#### Day 5：色テーマ
- [ ] 背景色プリセット6種：Cream / Peach / Orange / Yellow / Grey / Dark
  - Cream: `#FDF6E3`, Peach: `#EDD1B0`, Orange: `#EDDD6E`, Yellow: `#F8FD89`, Grey: `#D8D3D6`, Dark: `#1A1A1A`
- [ ] 文字色：Dark Grey デフォルト（`#222`）、ダークモード時は `#E5E5E5`
- [ ] 自由カラーピッカー
- [ ] **純黒 `#000000` をデフォルトにしない**（C_Color 知見）

#### Day 6-7：保存＆オンボーディング
- [ ] localStorage に設定保存・読込
- [ ] 初回起動時の3問テスト（[[EM_Onboarding-Copy]]）
  - Q1：フォント（UDデジタル教科書体 vs 明朝体）
  - Q2：背景色（白 vs クリーム）
  - Q3：行間（普通 vs 広め）
- [ ] スキップ可能・後からも変更可能であることを明示

### Sprint 1 完了基準
- [ ] スマホで開いて、テキストを貼り付け、フォント・色・字間・行間を変えられる
- [ ] 設定が次回起動時にも保持される
- [ ] 初回起動時に押し付けがましくない3問テストが動く
- [ ] WAVE / axe DevTools でアクセシビリティエラーゼロ

---

## Sprint 2：読み上げ＋単語同期ハイライト（1週間）

### Goal
テキストをTTSで読み上げ、現在読まれている単語をハイライトする。

### Tasks

#### Day 1-2：Web Speech API 統合
- [ ] `SpeechSynthesisUtterance` で基本読み上げ
- [ ] 日本語音声選択（`lang === 'ja-JP'` でフィルタ）
- [ ] 速度スライダー（0.5–2.0、デフォルト1.0）
- [ ] 一時停止・再開ボタン

#### Day 3-4：⭐ 単語同期ハイライト
- [ ] `onboundary` イベントで `charIndex` を取得
- [ ] **日本語は kuromoji.js で形態素解析**してオフセット管理（OS差吸収）
- [ ] ハイライト用 `<span>` でテキストを分割描画
- [ ] 現在読み上げ中の単語に `.highlighted` クラス

#### Day 5-6：ハイライト粒度
- [ ] 文字単位 / 文節単位 / 文単位の選択
- [ ] ハイライト色のカスタマイズ（透明度・色）

#### Day 7：UX 仕上げ
- [ ] 読了時の控えめなフィードバック（[[EM_Celebration-Moments]]）
- [ ] 「読み上げ中の単語が画面中央付近を維持」自動スクロール（Speechify風）

### Sprint 2 完了基準
- [ ] 日本語テキストが自然に読み上げられる
- [ ] 単語ハイライトが TTS と同期する
- [ ] 速度調整・一時停止・再開が動作

---

## Sprint 3：ルビ自動付与＋分かち書き（1週間）

### Goal
日本語テキストにルビを自動付与し、ひらがな主体文の分かち書きにも対応。

### Tasks

#### Day 1-3：kuroshiro 統合
- [ ] `kuromoji.js` の Worker 化（重い初期化を非ブロック化）
- [ ] kuroshiro 初期化
- [ ] テキストにルビ付与（HTML `<ruby>` 要素）
- [ ] ルビ表示の ON/OFF トグル

#### Day 4-5：⭐ 学年別常用漢字フィルタ
- [ ] 文部科学省「学年別漢字配当表」を JSON で持つ
- [ ] フィルタ：「小1〜小6 / 中学 / 全部」を選択
- [ ] 対象学年より上の漢字のみルビを付与
- [ ] CSS で `ruby-position` 上下選択可能

#### Day 6-7：分かち書きトグル
- [ ] 形態素解析結果から文節境界を検出
- [ ] 文節境界に視覚的スペース（CSS `letter-spacing` or `&thinsp;`）
- [ ] ひらがな主体文で有効化、漢字仮名交じり文では効果薄い旨を表示

### Sprint 3 完了基準
- [ ] 漢字に自動でルビが付く
- [ ] 学年フィルタが機能する
- [ ] ルビ表示の ON/OFF が動作

---

## Sprint 4：Reading Ruler＋蛍光マーカー（1週間）

### Goal
行ハイライト・蛍光マーカーで集中支援。

### Tasks

#### Day 1-3：Reading Ruler
- [ ] 3種類のスタイル実装：
  - **Grey Bar**：現在行に半透明の帯
  - **Lightbox**：現在行を明るく、他を暗く
  - **Shade**：上下にシェード
  - **Underline**：下線のみ
- [ ] マウス追従モード
- [ ] キーボード（↓キー）で行送りモード
- [ ] 色・高さ・透明度の調整 UI

#### Day 4-5：蛍光マーカー
- [ ] 範囲選択（`window.getSelection()`）
- [ ] 5色から選んでハイライト（黄・ピンク・緑・青・オレンジ）
- [ ] localStorage にハイライト保存（オプション）
- [ ] ハイライト解除機能

#### Day 6-7：マイクロコピー仕上げ
- [ ] 全 UI コピーを [[EM_In-App-Microcopy]] と照合
- [ ] エラーメッセージを [[EM_Error-Empty-States]] と照合
- [ ] [[EM_Strength-Reminders]] の任意表示機能を実装

### Sprint 4 完了基準
- [ ] Reading Ruler 4種が選択可能
- [ ] 蛍光マーカーが機能する
- [ ] マイクロコピーが哲学に準拠

---

## Sprint 5：🆕 OCR（1〜2週間）

### Goal
カメラ撮影 → OCR → アプリで読み上げまでが3タップ以内で完結。

詳細：[[FT_OCR]]、[[I_OCR-Library]]

### Tasks

#### Day 1-2：UI とカメラ起動
- [ ] 「📷 カメラで撮影」ボタン
- [ ] `<input type="file" accept="image/*" capture="environment">`
- [ ] 撮影画像のプレビュー
- [ ] 「撮り直し」「文字を読み取る」ボタン

#### Day 3-4：Tesseract.js 統合
- [ ] Worker の事前初期化（アプリ起動時にバックグラウンドで）
- [ ] 進捗バー＋ステータス表示（[[EM_Tone-Principles]] 準拠の文言）
- [ ] キャンセル機能
- [ ] エラーハンドリング（権限拒否、暗すぎ、文字なし等）

#### Day 5-7：画像前処理
- [ ] Canvas でグレースケール化
- [ ] コントラスト自動調整
- [ ] リサイズ（長辺2000px以内）
- [ ] 傾き補正（任意・スライダー）

#### Day 8-10：結果表示＋編集
- [ ] 抽出テキストを編集可能エリアに表示
- [ ] **「※間違いがあれば直してね」**コピーで誤読を許容
- [ ] 既存の視認性設定が自動適用
- [ ] 「このまま読む」ですぐにTTS開始可能

#### Day 11-14：プライバシー＆テスト
- [ ] **画像がサーバーに送信されないことをネットワーク監視で確認**
- [ ] 初回利用時のプライバシー宣言表示
- [ ] テスト画像セットでベンチマーク（学校プリント想定）
- [ ] iOS Safari / Android Chrome / Windows Chrome で動作確認

### Sprint 5 完了基準
- [ ] スマホ撮影 → OCR → 読み上げが3タップ以内
- [ ] 標準的なプリント（1000字程度）が10秒以内に処理
- [ ] OCR エラー時にも編集で修正可能
- [ ] 画像がサーバーに送信されていない（Network Tab で確認）

---

## Sprint 6：出力＋仕上げ＋当事者テスト準備（1週間）

### Goal
印刷・共有機能、最終調整、リリース準備。

### Tasks

#### Day 1-2：印刷出力
- [ ] `@media print` CSS で印刷フレンドリーレイアウト
- [ ] UDフォント・行間設定を維持
- [ ] 印刷プレビューボタン

#### Day 3：URL 共有
- [ ] 設定プロファイルを URL Hash にエンコード（Base64）
- [ ] URL から設定を読み込み
- [ ] 「この設定を共有」ボタン → クリップボードコピー

#### Day 4：強みリマインダー＆危機対応
- [ ] [[EM_Strength-Reminders]] の引用集を実装（ON/OFF切替、頻度設定）
- [ ] 緊急連絡先フッター（24時間子供SOSダイヤル等）
- [ ] [[EM_Trauma-Informed-Microcopy#自殺リスクサイン検知時の対応]] のキーワード検知（任意機能）

#### Day 5：受け入れ基準チェック
- [ ] [[HANDOFF.md#6. 受け入れ基準]] の全項目を確認
- [ ] WAVE / axe DevTools / Lighthouse Accessibility
- [ ] WCAG 1.4.12 を上書きしてレイアウトが破綻しないことを確認

#### Day 6-7：ベータリリース準備
- [ ] README.md（公開用）
- [ ] プライバシーポリシー
- [ ] フッターのクレジット
- [ ] 当事者テスト連携先への案内文準備（[[I_User-Testing]]）

### Sprint 6 完了基準
- [ ] 全受け入れ基準を満たす
- [ ] 印刷・共有機能が動作
- [ ] 当事者テストの準備が整っている

---

## 任意：Sprint 7+（v1.1）

詳細：[[FT_v1_1-Roadmap]]

- Bionic Reading 風強調
- 文節改行
- やさしい日本語化（LLM連携）
- PDFテキスト抽出
- OCR の高度化（Cloud API、手書き対応）
- PWA化・ブラウザ拡張版

---

## 各 Sprint 終了時の確認

毎 Sprint 終了時：

1. **動作確認**：自分のスマホ・PCで実機テスト
2. **アクセシビリティ**：WAVE / axe DevTools
3. **マイクロコピー**：[[EM_Tone-Principles]] の NG ワードチェック
4. **エビデンス整合性**：[[Research-MOC]] の知見に反する実装になっていないか
5. **コミット＆プッシュ**：機能ごとに意味のある単位でコミット

## 関連

- [[HANDOFF]] — プロジェクト全体
- [[CLAUDE]] — コーディング規約
- [[FT_MVP]] — MVP仕様
- [[FT_OCR]] — OCR仕様
- [[I_Initial-Setup]] — 初日セットアップ
- [[I_User-Testing]] — 当事者テスト

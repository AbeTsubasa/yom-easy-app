---
title: "FT_v1_1-Roadmap — v1.1 推奨機能"
type: feature
created: 2026-05-26
tags: [feature, roadmap, v1_1]
---

# FT_v1_1-Roadmap — v1.1 推奨機能

[[FT_MVP]] でMVPを公開した後、当事者テストのフィードバックを反映して追加する機能群。

## v1.1 追加機能

### 1. 文節改行（チャンク分割表示）
- 形態素解析で意味のまとまりごとに改行
- Rello & Baeza-Yates 2015の知見
- ON/OFF切替可能

### 2. やさしい日本語化（LLM連携）
- 文の長さ短縮、難読語の置換
- API：OpenAI / Anthropic / 国産LLM（オプション）
- 利用者がAPIキー持参（プライバシー優先）

### 3. PDFテキスト抽出
- pdf.js でPDF読み込み→ テキスト抽出 → 視認性適用
- 教科書・配布プリントの主要ユースケース

### 3.5. OCRの高度化（基本OCRはMVPに含む → [[FT_OCR]]）
- クラウドAPI連携（Google Cloud Vision / Azure Read API、ユーザーAPIキー持参）
- 手書き対応
- 縦書き対応
- 複数枚連続撮影 → 1文書に統合
- 画像前処理の自動化（傾き補正、トリミング）

### 4. Bionic Reading風強調
- 各単語の最初の数文字を太字化
- 太字割合（1〜4文字）を調整可能
- **効果を約束しない説明文を添える**（→ [[A_AssistiveTech#Bionic Reading]]）

### 5. 品詞色分け（Immersive Reader 風）
- 名詞・動詞・形容詞を異なる色で
- 国語学習との親和性

### 6. 読み進めた位置の自動スクロール
- 現在読み上げ中の単語が画面中央付近を維持
- Speechify風UX

### 7. 設定プリセット保存・共有
- 複数プロファイルを保存（「学校用」「読書用」「英語学習用」など）
- QRコード／URLでプロファイル共有

### 8. PWA化
- オフライン対応強化（Service Worker）
- ホーム画面に追加可能
- ネイティブアプリ風UX

### 9. ブラウザ拡張版
- Chrome / Edge / Firefox 拡張
- 任意のWebページに視認性設定を適用

## 関連

- [[FT_MVP]]
- [[FT_Future]] — v2以降
- [[I_User-Testing]] — フィードバック収集方法

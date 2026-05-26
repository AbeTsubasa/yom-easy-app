---
title: "I_Tech-Stack — 技術スタック"
type: implementation
created: 2026-05-26
tags: [implementation, tech_stack]
---

# I_Tech-Stack — 技術スタック

## 選定方針

- **シンプル・依存最小**：保守容易、教育機関でブロックされない
- **ブラウザで完結**：サーバー不要、無料デプロイ可能
- **ローカルファースト**：個人情報非収集、プライバシー保護
- **オフライン動作**：Wi-Fi不安定環境でも基本機能が動く

## MVP（v1.0）構成

### フロントエンド

```
[Vite + Vanilla TypeScript]
├── HTML / CSS / TS（単一SPA）
├── Tailwind CSS（ユーティリティCSS、軽量）
└── 依存ライブラリ
```

### ライブラリ

| 用途 | ライブラリ | 理由 |
|---|---|---|
| 形態素解析 | **@sglkc/kuromoji**（フォーク） | ES Module対応、軽量化済 |
| ルビ生成 | **kuroshiro** | kuromoji連携、`<ruby>` HTML出力 |
| TTS | **Web Speech API** | ブラウザ標準、無料 |
| ファイル読込 | FileReader API | ブラウザ標準 |
| 永続化 | **localStorage** | サーバー不要、ローカル保存 |
| PDF（v1.1） | pdf.js | Mozilla製、安定 |

詳細は [[I_Libraries]]

### デプロイ

- **GitHub Pages**（無料・静的ホスティング・教育現場で導入容易）
- 独自ドメイン（任意・後付け可）
- HTTPS 自動付与

### ビルド

- Vite（高速ビルド、HMR）
- TypeScript（型安全）
- 出力：1つの`index.html` + 必要最小のJSバンドル

## なぜ React / Vue / Svelte ではない？

- 学習コスト・バンドルサイズの最小化
- 依存ライブラリ数を抑えたい（脆弱性管理）
- 単一ページで完結する規模感

ただし、機能が複雑化したら Svelte / Lit の検討余地あり。

## なぜ Next.js / バックエンドではない？

- **個人情報を扱わない**設計で十分
- サーバー維持費がかかる（無料・低価格を保ちたい）
- 教育機関でのCSPやセキュリティ要件を回避しやすい

## v1.1〜v2 で追加検討

- **Service Worker** によるPWA化（オフライン強化）
- **IndexedDB**（複数プロファイル管理用）
- **Web Components**（再利用しやすい部品化）
- **ブラウザ拡張**（manifest v3）

## 関連

- [[I_Libraries]] — ライブラリ詳細
- [[FT_MVP]] — MVP仕様
- [[I_User-Testing]] — テスト方法

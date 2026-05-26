# Yom-easy

[![Deploy](https://github.com/AbeTsubasa/yom-easy-app/actions/workflows/deploy.yml/badge.svg)](https://github.com/AbeTsubasa/yom-easy-app/actions/workflows/deploy.yml)

文字を、あなたに合う見え方に変えるためのブラウザツールです。

文字の大きさ、行の間、色、ふりがな、読み上げ。
「読みやすさ」のかたちは、人それぞれ。
たくさんの設定の中から、自分にしっくりくる読み方を見つけてみてください。

ブラウザで開くだけ。登録もログインも不要、無料です。

---

## 開発者向け

### 必要なもの

- Node.js 20 以上
- npm

### セットアップ

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

### スクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 型チェックを通してから本番ビルド |
| `npm run preview` | ビルド済みファイルをローカル確認 |
| `npm test` | ユニットテスト（Vitest） |
| `npm run format` | Prettier で整形 |
| `npm run lint` | ESLint で検査 |

### プロジェクトドキュメント

- 全体像 → [HANDOFF.md](./HANDOFF.md)
- 開発規約 → [.claude/CLAUDE.md](./.claude/CLAUDE.md)
- 仕様書・設計書 → [docs/vault/](./docs/vault/)

### プライバシーについて

- このアプリは個人情報を一切収集しません。
- 設定はすべて、ご自分の端末（ブラウザの `localStorage`）にだけ保存されます。
- カメラ撮影と OCR（文字認識）の処理も、端末の中だけで完結します。画像はどこにも送られません。

### 技術スタック

TypeScript / Vite / Tailwind CSS / Tesseract.js / kuromoji.js / kuroshiro / Web Speech API。
React や Vue などの大きなフレームワークは使っていません（軽量・依存少を優先）。

### ライセンス

検討中（リリース前に決定）。

# Yom-easy

[![Deploy](https://github.com/AbeTsubasa/yom-easy-app/actions/workflows/deploy.yml/badge.svg)](https://github.com/AbeTsubasa/yom-easy-app/actions/workflows/deploy.yml)

文字を、あなたに合う見え方に変えるためのブラウザツールです。

文字の大きさ、行の間、色、ふりがな、読み上げ。
「読みやすさ」のかたちは、人それぞれ。
たくさんの設定の中から、自分にしっくりくる読み方を見つけてみてください。

ブラウザで開くだけ。登録もログインも不要、無料です。

**公開URL**：[https://abetsubasa.github.io/yom-easy-app/](https://abetsubasa.github.io/yom-easy-app/)

> このバージョンは **ベータ版（0.9.0）** です。
> 動かない部分や読みにくい部分があれば、[GitHub の Issue](https://github.com/AbeTsubasa/yom-easy-app/issues) から教えてください。

---

## できること

- **フォントを選ぶ** — UD デジタル教科書体、BIZ UDPGothic、Open Sans、OpenDyslexic ほか。「これが正しい」とは決めず、試して合うものを選べる構造
- **文字の大きさ・字間・行間・語間** — スライダーで即時プレビュー。WCAG AAA のスペーシング推奨値をデフォルトに
- **色テーマ** — クリーム、桃、藤、グレー、ダークなど。背景と文字を自由に選べるカスタムカラーも
- **行ハイライト** — 隔行 zebra ／ 全行帯 ／ なし、の 3 択。色も 7 種類から
- **ふりがな** — 漢字に自動でふりがなを付与（kuromoji ベース）
- **分かち書き** — 単語の区切りに目に見えるスペースを入れる
- **読み上げ（TTS）** — ブラウザ標準の Web Speech API。速さと声を選べる
- **カメラ撮影 / 画像から OCR** — 端末の中だけで文字認識（Tesseract.js）
- **印刷** — 現在の読み方の設定のままで紙に出力
- **設定を共有** — URL に設定だけを Base64 で埋め込んでコピー（本文は含めない）

---

## このアプリの 4 原則

1. **「治す／矯正する」ではなく「読み方を見つける」** — 医療的な押し付けの言葉を使いません
2. **「特別扱いに見えない」UI** — 一般的なテキストエディタに見える中立的な見た目
3. **個人情報を一切集めない** — サーバーを持たず、すべて端末の中で完結
4. **WCAG AAA をデフォルト** — 初期値で行間 1.5・字間 0.12em・純黒純白を避ける

---

## プライバシー・ライセンス・謝辞

- プライバシーポリシー → [PRIVACY.md](./PRIVACY.md)
- 利用ライブラリ・フォント・辞書の謝辞 → [CREDITS.md](./CREDITS.md)
- ソースコードのライセンス → [LICENSE](./LICENSE)（MIT）

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

### 技術スタック

TypeScript / Vite / Tailwind CSS / Tesseract.js / kuromoji.js / Web Speech API。
React や Vue などの大きなフレームワークは使っていません（軽量・依存少を優先）。

---

## バグ報告・要望

[GitHub Issues](https://github.com/AbeTsubasa/yom-easy-app/issues) からお気軽にどうぞ。

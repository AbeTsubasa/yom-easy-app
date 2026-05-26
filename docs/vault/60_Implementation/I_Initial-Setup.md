---
title: "I_Initial-Setup — 初日セットアップ手順"
type: implementation
created: 2026-05-26
tags: [implementation, setup, sprint0]
---

# I_Initial-Setup — 初日セットアップ手順

> Claude Code を起動した初日（Sprint 0）に行うセットアップ手順。
> 半日（4時間）で完了することを目指す。

## 前提条件

- macOS / Windows / Linux いずれかで開発可能
- Node.js v20 以上インストール済み
- Git・GitHub アカウント
- VS Code 推奨（Claude Code との親和性が高い）

## Step 1: リポジトリ作成（10分）

```bash
# GitHubでリポジトリ作成（プライベート推奨、後で公開）
# 名前候補：yomu / read-easy / dyslexia-app-private 等

# ローカルにクローン
git clone git@github.com:your-username/yomu.git
cd yomu
```

## Step 2: Vite + TypeScript セットアップ（15分）

```bash
# Vite で Vanilla TS プロジェクト作成
npm create vite@latest . -- --template vanilla-ts

# プロンプトに従う（既存ディレクトリで作成する場合は overwrite を選択）

# 依存インストール
npm install
```

## Step 3: 必要なライブラリインストール（10分）

```bash
# OCR
npm install tesseract.js

# 日本語形態素解析・ルビ
npm install @sglkc/kuromoji kuroshiro kuroshiro-analyzer-kuromoji

# CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 開発ツール
npm install -D eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D vitest @vitest/ui
npm install -D vite-plugin-pwa  # v1.1 用
```

## Step 4: 初期ファイル構造作成（30分）

```bash
mkdir -p src/modules src/ui/components src/ui/copy src/ui/styles src/types
mkdir -p public/dict public/fonts
mkdir -p tests/fixtures
mkdir -p .claude

# ドキュメントを所定の場所にコピー
mkdir -p docs/vault
cp -r /path/to/Dyslexia-Support-App-Vault/* docs/vault/
cp /path/to/HANDOFF.md docs/
cp /path/to/CLAUDE.md .claude/
```

### tsconfig.json（推奨設定）

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client"]
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        ud: ['"UD Digi Kyokasho NK-R"', '"BIZ UDPGothic"', 'sans-serif'],
        dyslexie: ['"OpenDyslexic"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

### .gitignore（追加）

```
node_modules
dist
.env
.env.local
.vite
*.log
.DS_Store
```

## Step 5: 日本語辞書ファイル準備（15分）

kuromoji 辞書を `public/dict/` に配置：

```bash
# kuromoji の辞書ファイルをコピー
cp node_modules/@sglkc/kuromoji/dict/* public/dict/

# Tesseract.js は CDN から自動取得するが、PWA化する場合は事前ダウンロード
# v1.0 では CDN 利用で OK
```

## Step 6: 初期 index.html（雛形）

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Yomu — あなたに合う読み方</title>
  <meta name="description" content="文字を、あなたに合う見え方に変えるツール">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

**注意**：
- `<title>` に "Dyslexia" を含めない
- `<meta description>` も中立的に
- favicon は中立的なもの（医療系青十字、子ども向けキャラクター回避）

## Step 7: src/main.ts（最小雛形）

```ts
import './ui/styles/main.css';
import { initApp } from './app';

initApp();
```

## Step 8: src/app.ts（最小雛形）

```ts
export function initApp() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <main class="min-h-screen p-4">
      <h1 class="text-2xl mb-4">Yomu</h1>
      <p>あなたに合う読み方を見つけよう。</p>
      <div id="reader"></div>
    </main>
  `;
}
```

## Step 9: 動作確認（10分）

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開いて確認。

## Step 10: GitHub Pages デプロイ設定（30分）

### .github/workflows/deploy.yml

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### vite.config.ts

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/your-repo-name/', // GitHub Pages のパスに合わせて変更
});
```

## Step 11: 初回コミット＆プッシュ

```bash
git add .
git commit -m "chore: initial project setup with Vite, TS, Tailwind, Tesseract, kuromoji"
git push origin main
```

GitHub Pages を有効化（リポジトリ設定 → Pages → Source: gh-pages branch）。

## Step 12: 動作確認（実機）

- 自分のスマホ・PCで開く
- まずは「Yomu」と表示されるだけのページが見えればOK

## Sprint 0 完了基準

- [ ] `npm run dev` でローカルサーバーが起動する
- [ ] `npm run build` でビルドが通る
- [ ] GitHub Pages にデプロイされ、URLでアクセスできる
- [ ] スマホ実機で開けることを確認
- [ ] HANDOFF.md と CLAUDE.md がリポジトリに含まれている

## トラブルシューティング

### Tailwind が効かない
→ `tailwind.config.js` の `content` パスを確認。`src/**/*.{ts,html}` を含めること。

### kuromoji がロードできない
→ `public/dict/` に辞書ファイル4つ（`base.dat.gz`等）があるか確認。
→ パスを `vite.config.ts` の `base` と整合させる。

### GitHub Pages で 404
→ `vite.config.ts` の `base` パスを正しいリポジトリ名に。
→ `dist/index.html` のパスを `/your-repo-name/` 起点に書き換え。

## 次のステップ

Sprint 0 が完了したら、次は **Sprint 1**：[[I_First-Sprint-Tasks]]

## 関連

- [[I_Tech-Stack]] — 技術スタック詳細
- [[I_Libraries]] — ライブラリ実装メモ
- [[I_OCR-Library]] — OCR実装メモ
- [[HANDOFF]] — プロジェクト全体引き継ぎ
- [[CLAUDE]] — コーディング規約

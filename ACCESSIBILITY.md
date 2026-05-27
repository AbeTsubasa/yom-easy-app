# アクセシビリティ — Yom-easy

最終更新：2026-05-27 ／ 対象バージョン：0.9.0（ベータ）

このドキュメントは、Yom-easy のアクセシビリティ受け入れ基準（Sprint 6 Day 5）の自己評価と、実機で確認していただきたい項目をまとめています。

「ベータ版」ですので、出荷時点で完璧を目指していません。気になる点があれば、[Issues](https://github.com/AbeTsubasa/yom-easy-app/issues) からお寄せください。

---

## 目指している基準

**WCAG 2.1 AAA レベル** を、デフォルト出荷値で満たすことを目標にしています。
ディスレクシアの方に向けたアプリだからこそ、「読みやすさのための土台」が崩れないようにしています。

主要なデフォルト値：

| 項目 | 値 | 根拠 |
|---|---|---|
| 行間（line-height） | 1.5 以上 | WCAG SC 1.4.12 / BDA Style Guide |
| 字間（letter-spacing） | 0.12em 以上 | WCAG SC 1.4.12 |
| 語間（word-spacing） | 0.16em 以上 | WCAG SC 1.4.12 |
| 段落間 | 文字サイズ × 2 以上 | WCAG SC 1.4.12 |
| 本文揃え | 左揃え（両端揃え禁止） | BDA Style Guide |
| 純黒・純白 | 使わない | クリーム背景（#FAF7F0）＋ダークグレー文字（#222） |
| 既定文字サイズ | 18px | BDA Style Guide |
| キーボード操作 | すべて可 | WCAG SC 2.1.1 |

---

## 自己評価チェックリスト（コード監査ベース）

### A. 知覚可能（Perceivable）

| SC | 内容 | 状態 | 補足 |
|---|---|---|---|
| 1.1.1 | 画像に代替テキスト | ✅ | OCR プレビュー画像に `alt` 設定。装飾画像なし |
| 1.3.1 | 情報と関係性 | ✅ | `<main>` / `<header>` / `<footer>` / `<nav>` / `role=dialog` を適切に使用 |
| 1.3.5 | 入力目的の特定 | n/a | 個人情報入力欄なし |
| 1.4.3 | コントラスト（最低） | ✅ | プリセット 7 種すべて 4.5:1 以上 |
| 1.4.6 | コントラスト（強化、AAA） | ✅ | デフォルトの cream + #222 は 13:1。フッター #444 + cream は 9.5:1 |
| 1.4.8 | テキストの視覚的提示（AAA） | ✅ | 行間・字間・段落間・左揃え すべて推奨値以上 |
| 1.4.10 | リフロー | ✅ | mobile-first 設計、320px 幅まで横スクロールなし |
| 1.4.12 | テキストの間隔 | ✅ | 1 件修正済：`.settings-panel` を fixed height → max-height に変更（ユーザー override で詰まらないように） |
| 1.4.13 | ホバー・フォーカスで現れるコンテンツ | ✅ | ツールチップ／ポップアップなし。アコーディオンは click ベース |

### B. 操作可能（Operable）

| SC | 内容 | 状態 | 補足 |
|---|---|---|---|
| 2.1.1 | キーボード | ✅ | すべてのコントロールは `<button>` / `<input>` / `<a>`。clickable `<div>` なし |
| 2.1.2 | キーボードトラップなし | ✅ | モーダル外のフォーカストラップは存在しない |
| 2.1.4 | 文字キーショートカット | n/a | 文字キー単独のショートカットなし |
| 2.4.3 | フォーカス順序 | ✅ | DOM 順に従う |
| 2.4.7 | フォーカスの可視化 | ✅ | `:focus-visible` 全コントロールに 2-3px outline |
| 2.4.11 | フォーカスの不可視化なし（AAA） | ✅ | sticky / overlay でフォーカス要素を完全に隠す箇所なし |
| 2.5.5 | ターゲットサイズ（AAA） | ✅ | 主要ボタンはタップ可能領域 44×44px 以上を確保 |

### C. 理解可能（Understandable）

| SC | 内容 | 状態 | 補足 |
|---|---|---|---|
| 3.1.1 | ページの言語 | ✅ | `<html lang="ja">` |
| 3.2.1 | フォーカス時に状態を変えない | ✅ | フォーカス遷移は副作用なし。クリック・change のみで反応 |
| 3.2.2 | 入力時に状態を変えない | ✅ | 設定スライダーの change はプレビューに反映するが、ページ遷移は発生しない |
| 3.3.1 | エラーの特定 | ✅ | `role="alert"` のエラー領域＋日本語メッセージ |
| 3.3.3 | エラーの修正案 | ✅ | エラー文に「もう一度試してみよう」「.txt か .md だと開けます」など代替を明記 |

### D. 堅牢（Robust）

| SC | 内容 | 状態 | 補足 |
|---|---|---|---|
| 4.1.2 | 名前・役割・値 | ✅ | aria 属性、role 属性、aria-checked / aria-pressed / aria-expanded 等を要所で使用 |
| 4.1.3 | ステータスメッセージ | ✅ | `role="status"` + `aria-live="polite"` 領域あり（OCR 進捗、TTS 完了、共有コピー結果） |

---

## Sprint 6 Day 5 で修正した項目

| 項目 | 修正内容 | ファイル |
|---|---|---|
| モーダルのフォーカストラップ | 共通の `createFocusTrap` を追加し、onboarding / image-preview に適用。Tab/Shift+Tab で内側に閉じ、閉じたら前のフォーカスへ復帰 | `src/modules/focus-trap.ts`、両モーダル |
| `<main>` の役割属性が冗長 | `setAttribute('role', 'main')` を削除（ネイティブ `<main>` が既に role=main を持つ） | `src/app.ts` |
| フッターのコントラストが AAA 未達 | `rgba(0,0,0,0.55)` → 固定 `#444`（cream 背景に対して 9.5:1） | `src/ui/styles/main.css` |
| 動きの低減（prefers-reduced-motion） | グローバルで transition / animation を 0.01ms に短縮するメディアクエリを追加 | `src/ui/styles/main.css` |
| WCAG 1.4.12 で `.settings-panel` がクリップ | 固定 `height: 33vh` → `max-height: 33vh` に変更。中身が増えたらスクロールで届く | `src/ui/styles/main.css` |

---

## 塾長に実機で確認していただきたいこと

コード監査では確認しきれない部分です。一度ご確認ください。

### ブラウザ拡張で自動チェック

1. **[axe DevTools](https://www.deque.com/axe/devtools/)**（Chrome / Firefox 拡張）
   - 公開URL：`https://abetsubasa.github.io/yom-easy-app/`
   - F12 → Issues タブ → Scan ALL of my page
   - 期待：critical / serious が 0 件

2. **[WAVE](https://wave.webaim.org/extension/)**（同上）
   - 期待：Errors が 0 件、Contrast Errors が 0 件

### スクリーンリーダーでの読み上げ

- **macOS / iOS：VoiceOver**（Command+F5）
- **Windows：NVDA**（無料）

確認の目安：

- [ ] ヘッダーの「Yom-easy」がタイトルとして読まれる
- [ ] 設定パネルを開くと「設定パネルを開く」と読まれる
- [ ] アコーディオンの「フォント」を開くと「展開」状態が伝わる
- [ ] 読み上げボタンを押すと、TTS の状態（再生中／一時停止）が伝わる
- [ ] エラー時、エラー文が自動でアナウンスされる

### 200% 拡大で横スクロールが出ないか

1. ブラウザの Ctrl/Cmd + `+` で 200% に拡大
2. 設定パネルを開閉、アコーディオンを展開
3. 期待：縦スクロールはあっても、**横スクロールは出ない**

### キーボードのみで全機能を使えるか

1. マウスを使わず Tab / Shift+Tab / Enter / Space / Esc だけで操作
2. 確認したい流れ：
   - [ ] ファイルを開く（label に Tab → Enter）
   - [ ] 設定パネルを開く（FAB に Tab → Enter）
   - [ ] フォントを変える（accordion → option ボタン）
   - [ ] 読み上げを開始・停止
   - [ ] オンボーディング画面を Tab で全部回って、Esc は無視（誤って閉じない）

### 色覚多様性

- [Coblis](https://www.color-blindness.com/coblis-color-blindness-simulator/) でスクリーンショットをアップロード
- すべての色ハイライト（クリーム／桃／藤／グレー／空／緑／オレンジ）が、色覚多様性のフィルタを通しても他と区別できるか

---

## 既知の制限

| 項目 | 状態 | 理由 |
|---|---|---|
| 単語単位の TTS 同期ハイライト | 不採用 | 日本語の word boundary はブラウザ実装差が大きく、不正確だと利用者を混乱させる。代わりに行単位のハイライト 3 種を提供 |
| 学年別フリガナフィルタ | 未実装 | Sprint 3 Day 4-5 に積み残し。現状は全漢字にふりがな |
| Reading Ruler（行追跡マウスカーソル） | 未実装 | Sprint 4 に積み残し。代わりに行単位ハイライトを提供 |
| Dyslexie フォントの内蔵配信 | しない | 商用フォントのため、端末にインストール済みの場合のみ適用 |
| OpenDyslexic の効果 | 個人差 | 研究では「全員に効く」とは言えないと公表されている。試して合う方だけ選択する設計 |

---

## 連絡先

質問・指摘・要望は、GitHub の Issue からお寄せください。

[https://github.com/AbeTsubasa/yom-easy-app/issues](https://github.com/AbeTsubasa/yom-easy-app/issues)

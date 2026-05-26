---
title: "G_Guidelines — BDA / WCAG / COGA / IDA / 日本の公的ガイド"
type: research
created: 2026-05-26
tags: [research, guidelines, wcag, bda, ida, daisy]
---

# G_Guidelines — 公的ガイドライン

## ガイドライン横断・最大公約数（実装デフォルト推奨）

| 項目 | 推奨値 | 根拠 |
|---|---|---|
| フォント | サンセリフ／UDゴシック | BDA 2023 |
| 本文サイズ | 16-19px（推奨18px） | BDA・Rello 2016 |
| 見出しサイズ | 本文の120%以上 | BDA |
| line-height | ≥1.5 | WCAG 1.4.8/1.4.12, BDA |
| letter-spacing | ≥0.12em（字幅35%） | WCAG 1.4.12, BDA |
| word-spacing | ≥0.16em（字間3.5倍） | WCAG 1.4.12, BDA |
| paragraph-spacing | ≥font-sizeの2倍 | WCAG 1.4.12 |
| 行幅 | ≤80字（CJK 40字） | WCAG 1.4.8, BDA |
| 揃え | **左揃え固定**（両端揃え禁止） | WCAG 1.4.8, BDA |
| 背景色 | 白でない柔らかい色／ユーザー選択可 | BDA, WCAG |
| 文字色 | 濃色（純黒回避）、4.5:1以上 | WCAG, UX実務 |
| 強調 | 太字。下線・斜体・全大文字回避 | BDA |
| テキスト拡大 | 200%まで横スクロールなし | WCAG |

## BDA Dyslexia Style Guide 2023

英国ディスレクシア協会の公式スタイルガイド。本アプリのデフォルト基準。
- フォント：Arial / Comic Sans / Verdana / Tahoma / Century Gothic / Trebuchet / Calibri / Open Sans
- 本文：12-14pt（1-1.2em / 16-19px）
- 強調は**太字のみ**。下線・斜体・全大文字を避ける
- 左揃え固定、白背景回避、緑×赤×ピンク強組合せ回避

## IDA（International Dyslexia Association）

- **定義（2002年版、2025年改訂）**：神経生物学的起源の特異的学習障害。音韻論的処理の欠陥が主因
- **指導原則 "Structured Literacy"**：Explicit / Systematic / Cumulative

## WCAG 2.1 / 2.2

### SC 1.4.8 Visual Presentation（AAA）
- 前景・背景色をユーザー選択可能
- 行幅 ≤80字（CJK 40字）
- 両端揃え禁止
- 行間 ≥1.5、段落間 ≥行間の1.5倍
- 200%拡大時に横スクロール不要

### SC 1.4.12 Text Spacing（AA）

ユーザーが以下を上書き可能：

| プロパティ | 最低値 |
|---|---|
| line-height | font-sizeの1.5倍以上 |
| paragraph spacing | font-sizeの2倍以上 |
| letter-spacing | font-sizeの0.12倍以上 |
| word-spacing | font-sizeの0.16倍以上 |

引用研究：**Zorzi 2012 PNAS**、**Rello & Baeza-Yates 2017**、**Sjoblom 2016**、McLeish 2007

## W3C COGA — Making Content Usable

8つの設計目標：
1. 既知のアイコン・用語で理解しやすく
2. ナビゲーションのしやすさ
3. 明確で理解しやすい内容（平易・短文・現在形）
4. ミス防止・訂正補助
5. 集中を助ける（不要なメディア自動再生回避）
6. 記憶に頼らない
7. ヘルプ・サポート提供
8. **適応化・パーソナライゼーション**

## 日本の公的ガイドライン

### 文部科学省 — 合理的配慮
- LD定義、3観点11項目の合理的配慮
- 具体例：板書撮影許可、漢字へのルビ、問題文読み上げ、ICT活用、試験時間延長

### 国立特別支援教育総合研究所（NISE）
- 「LD・ADHD・高機能自閉症ガイドライン（試案）」
- 音読困難への対応を聴覚的処理困難型／視覚的処理困難型で分けて指導

### 日本DAISYコンソーシアム
- マルチメディアDAISY教科書：**読み上げ＋同期ハイライト**
- 文字サイズ・色・行間・縦／横書きを自由変更可能
- UDフォントとの組合せ

## その他海外

- **Yale Center for Dyslexia & Creativity**：「Extra Time（時間延長）」が最重要配慮
- **EU ICT4IAL**（European Agency）：23言語対応のアクセシブル情報ガイドライン
- **Made by Dyslexia**：強みベースの啓発（[[V_Made-by-Dyslexia]]参照）

## 出典

- [BDA Dyslexia Style Guide 2023](https://cdn.bdadyslexia.org.uk/uploads/documents/Advice/style-guide/BDA-Style-Guide-2023.pdf)
- [WCAG 1.4.8 Visual Presentation](https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation.html)
- [WCAG 1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)
- [W3C COGA Making Content Usable](https://www.w3.org/TR/coga-usable/)
- [IDA Definition Consensus Project](https://dyslexiaida.org/definition-consensus-project/)
- [文科省 合理的配慮](https://www.mext.go.jp/b_menu/shingi/chukyo/chukyo3/siryo/attach/1325887.htm)
- [日本DAISYコンソーシアム / DINF](https://www.dinf.ne.jp/doc/daisy/book/daisytext.html)

## 関連

- [[F_Fonts]] / [[L_Layout]] / [[C_Color]] / [[A_AssistiveTech]] — 各論
- [[FT_MVP]] — 実装デフォルト値の根拠
- [[TL_M3-Evidence-Based-Practice]] — 講師向け解説

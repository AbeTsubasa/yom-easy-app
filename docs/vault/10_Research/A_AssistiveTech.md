---
title: "A_AssistiveTech — TTS・Reading Ruler・Bionic等"
type: research
created: 2026-05-26
tags: [research, assistive_tech, tts, ruler]
---

# A_AssistiveTech — TTS・Reading Ruler・Bionic等

## 結論

- **強いエビデンスのある介入は3つ**：①**TTS + 単語同期ハイライト**（メタ分析 d=0.35）②**Reading Ruler**（CHI 2023, +86 wpm）③字間/行間拡大（[[L_Layout]]）
- **Bionic Reading は効果証拠が乏しい**が害もない → オプションとして提供

## TTS（Text-to-Speech）

### エビデンス
- **メタアナリシス**：reading comprehension への効果量 **d = 0.35**（95% CI: 0.14–0.56）
- **Annals of Dyslexia 2023**：**TTS + 単語ハイライトの bimodal 提示**が無音読より理解スコア有意に高い。mind wandering減、on-task時間増

### 実装
- **Web Speech API（SpeechSynthesis）**：ブラウザ標準、無料、API キー不要、プライバシー保護
- `SpeechSynthesisUtterance` の `pitch`, `rate`, `volume`, `voice` を制御
- 日本語：OS標準音声（Kyoko, Otoya）
- **設計指針**：単語同期ハイライトが必須。`onboundary` イベントで同期。日本語の word boundary は kuromoji.js でオフセット管理する方が確実

## Reading Ruler / Line Focus

### CHI 2023 "Digital Reading Rulers"
- n=91+86 でクラウドソース実験
- **全層で読速・読解向上、ディスレクシア群で最大効果**
- 平均 **+86 wpm**
- 4種：**Grey Bar / Lightbox / Shade / Underline**
- 「全員に合う単一スタイルは存在しない」 → 複数提供

### 実装
- マウス追従 or 「現在行のみ高輝度＋他はディム」を CSS `mask` / overlay div で
- キーボード（↓キー）で行を進めるモード

## Bionic Reading

### エビデンス（懐疑的）
- Readwise n=2,074：使用時 -2.6 wpm（むしろ遅い）
- Možina 2025（SAGE Open）アイトラッキング：reading speed / fixation 数に有意差なし
- IJAMS 2024：**self-efficacy（自己効力感）には改善あり** → プラセボ的モチベーション効果

### 実装方針
オプションとして提供、太字割合（1〜4文字）を調整可能、**効果を約束しない説明文を添える**。

## テキスト分節化（チャンク改行）

- Rello & Baeza-Yates 2015：18-22pt が最適、文節境界で改行すると fluency 向上
- 日本語は kuromoji.js で文節分割可能

## RSVP（Spritz）

- Acklin & Papesh 2017：literal comprehension 悪化、視覚疲労増大
- PLOS One 2016：**350 wpm 超で comprehension 崩壊**
- **オプション提供、デフォルトOFF、上限300 wpmハードキャップ**

## 語彙難易度の調整

- Rello et al. 2013：頻出語置換で読解速度↑、短語置換で理解度↑
- 日本語：「やさしい日本語」12ルール、LLM書き換え

## 既存ツール参考（[[T_International-Tools]]も参照）

| ツール | 学べる設計 |
|---|---|
| **Microsoft Immersive Reader** | Line Focus（1/3/5行）の段階制 |
| **Helperbird** | ピックアンドミックスUI（各機能独立ON/OFF） |
| **DAISY系** | 単語ハイライト同期の標準実装 |

## 出典

- [Annals of Dyslexia 2023 TTS](https://link.springer.com/article/10.1007/s11881-023-00281-9)
- [Beier et al. CHI 2023](https://thereadabilityconsortium.org/wp-content/uploads/2023/08/Digital-Reading-Rulers-Evaluating-Inclusively-Designed-Rulers-for-Readers-With-Dyslexia-and-Without.pdf)
- [Readwise Bionic Reading study](https://blog.readwise.io/bionic-reading-results/)
- [Možina et al. 2025 SAGE Open](https://journals.sagepub.com/doi/10.1177/21582440251376158)
- [MDN: Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

## 関連

- [[FT_MVP]] — 実装仕様
- [[I_Libraries]] — Web Speech API・kuromoji.js 実装メモ
- [[C_Color]] — 行ハイライトの色設計

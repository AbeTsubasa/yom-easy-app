---
title: "C_Color — 背景色・文字色・カラーオーバーレイ"
type: research
created: 2026-05-26
tags: [research, color, overlay, contrast]
---

# C_Color — 背景色・文字色・カラーオーバーレイ

## 結論

- **背景は白を避けクリーム／暖色**（Rello & Bigham 2017, BDA一致）
- **文字色は純黒を避けダークグレー** `#222`〜`#333`
- **カラーオーバーレイ**（Irlen）は**科学的論争中**。提供は害なし、治療効果は謳わない
- **行ハイライト**（CHI 2023）はディスレクシア群で最大の効果

## 背景色

### Rello & Bigham 2017 ASSETS（n=341、ディスレクシア群含む）

| 色 | HEX | 相対読み時間 |
|---|---|---|
| **Peach** | `#EDD1B0` | **100%（最速）** |
| Orange | `#EDDD6E` | 103% |
| Yellow | `#F8FD89` | 109% |
| Grey | `#D8D3D6` | 121% |
| Blue Grey | `#DBE1F1` | 145%（最遅） |

- **避ける**：純白 `#FFFFFF`（眩しさ・visual stress）、強い赤・緑・ピンク（色覚多様性）

## 文字色

- 純黒 `#000000` 回避：高コントラストは vibration（チラつき感）を生む
- **推奨**：`#222222`〜`#333333` のダークグレー
- BDA 2023: "dark coloured text on a light (not white) background"

## カラーオーバーレイ（Irlen / Meares-Irlen）

### 支持研究
- **Wilkins 系**：自分で選んだ色でディスレクシア児童の読書速度約25%向上
- **Jeanes et al. 1997**、**Evans et al. 1994**

### 否定研究
- **Griffiths et al. 2016**（OPO 系統的レビュー）：「バイアスリスクが低い研究ほど効果を支持しない」
- **Suttle et al. 2018**（CEO）：「読書改善目的の使用は推奨できない」

### 結論
個人差大・プラセボ関与あり。害は少なく低コスト。**「治療」と称さず**アクセシビリティオプションとして提供は合理的。

## コントラスト比

- **WCAG AA**: 4.5:1、**AAA**: 7:1
- ただし**最大コントラスト（純黒×純白＝21:1）は避ける**
- Rello実験範囲（7:1〜19:1）で複数選択肢を提示

## 蛍光マーカー

- **Ponce et al. 2022 メタ分析**（36研究）：記憶 d=0.36、理解 d=0.20
- 過剰ハイライトは逆効果 → 選択的にハイライトする訓練が必要

## 行ハイライト（Reading Ruler）

- **Beier et al. CHI 2023**（n=91+86）：平均**+86 wpm**、ディスレクシア群で最大効果
- 4種デザイン：**Grey Bar / Lightbox / Shade / Underline**
- 「単一の最良デザインはない」 → 複数提供

## 色覚多様性（Okabe-Ito CUDパレット）

8色：Orange `#E69F00`, Sky Blue `#56B4E9`, Bluish Green `#009E73`, Yellow `#F0E442`, Blue `#0072B2`, Vermillion `#D55E00`, Reddish Purple `#CC79A7`, Black `#000000`

## 実装示唆 → [[FT_MVP]]

- 背景色プリセット：Cream `#FDF6E3` / Peach `#EDD1B0` / Orange `#EDDD6E` / Yellow `#F8FD89` / Light Grey `#D8D3D6` / Dark
- 文字色デフォルト `#222`
- カラーオーバーレイ：Rello 10色＋Cream＋CUD配慮色、透明度0-50%、自由カラーピッカー必須
- 行ハイライト：4種から選択、色・高さ・透明度調整可能

## 出典

- [Rello & Bigham 2017 ASSETS](https://www.cs.cmu.edu/~jbigham/pubs/pdfs/2017/colors.pdf)
- [Griffiths et al. 2016 OPO](https://pubmed.ncbi.nlm.nih.gov/27580753/)
- [Suttle et al. 2018 CEO](https://pubmed.ncbi.nlm.nih.gov/29633383/)
- [Beier et al. CHI 2023 Digital Reading Rulers](https://thereadabilityconsortium.org/wp-content/uploads/2023/08/Digital-Reading-Rulers-Evaluating-Inclusively-Designed-Rulers-for-Readers-With-Dyslexia-and-Without.pdf)
- [Okabe-Ito CUDパレット](https://jfly.uni-koeln.de/color/)

## 関連

- [[A_AssistiveTech]] — 行ハイライトとTTSの組合せ
- [[FT_MVP]] — 実装仕様

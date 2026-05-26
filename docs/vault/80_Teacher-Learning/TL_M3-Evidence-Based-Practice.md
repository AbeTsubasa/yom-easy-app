---
title: "M3: エビデンスベースの支援"
type: teacher_learning
module: 3
created: 2026-05-26
tags: [teacher, module, evidence, research]
---

# M3: エビデンスベースの支援

## 学習目標

- 主要な査読論文と公的ガイドラインを引用できる
- 「強い／弱いエビデンス」を区別できる
- 「専用フォントを買えば解決」式の単純化を避けられる

## キーポイント

1. **強いエビデンスがある介入は3つ**：①TTS+同期ハイライト ②Reading Ruler ③字間・行間拡大
2. **OpenDyslexic等の専用フォントは効果が査読研究で否定されている**
3. **個人差が大きく、単一の最適解はない**
4. **WCAG 1.4.12 が国際標準**：line-height≥1.5、letter-spacing≥0.12em、word-spacing≥0.16em、paragraph-spacing≥2em

## 1. 強いエビデンス：3つの介入

### A. TTS（読み上げ）+ 単語同期ハイライト

- **メタアナリシス**：reading comprehension への効果量 **d = 0.35**（95% CI: 0.14–0.56）
- **Annals of Dyslexia 2023**：TTS+ハイライトの bimodal 提示が無音読より理解スコア有意に高い、mind wandering 減少
- 実装：Web Speech API、`onboundary` イベントで単語同期
- → 詳細：[[A_AssistiveTech]]

### B. Reading Ruler（行ハイライト）

- **Beier et al. CHI 2023**（n=91+86）：平均 **+86 wpm**、ディスレクシア群で最大効果
- 4種デザイン：Grey Bar / Lightbox / Shade / Underline
- 「単一の最良デザインはない」→ 複数提供
- → 詳細：[[A_AssistiveTech#Reading Ruler Line Focus]]

### C. 字間・行間・文字サイズの拡大

- **Zorzi et al. 2012 PNAS**：イタリア・フランスのディスレクシア児74名で**読みエラー半減**、+0.3 syllables/sec
- 理論的根拠：**crowding effect**（フランカー文字干渉）の緩和
- Hakvoort 2017：効果はディスレクシア特異的ではない → 万人向けの汎用機能
- → 詳細：[[L_Layout]]

## 2. 否定されているエビデンス

### OpenDyslexic / Dyslexie の客観的優位性

- **Wery & Diliberto 2017**（*Annals of Dyslexia*）：OpenDyslexic は読字速度・精度を改善しなかった
- **Kuster et al. 2018**（同）：Dyslexie font も利益・阻害なし、Arial が好まれた
- **Marinus et al. 2016**（*Dyslexia*）：Dyslexie のわずかな効果は**字形ではなくスペーシング**由来

### しかし——「主観的好み」は重要
- 査読研究で客観差なしでも、**「自分に合うフォントに出会えた」**ことが救いになる当事者は多い
- 「強制」せず「選択肢として提供」する設計が正解

詳細は [[F_Fonts]]

## 3. 論争中のエビデンス

### カラーオーバーレイ（Irlen）
- **Wilkins 系**：自分で選んだ色で約25%向上
- **Griffiths 2016 系統的レビュー**：「バイアスリスクが低い研究ほど効果を支持しない」
- **Suttle 2018 Overview**：「読書改善目的の使用は推奨できない」

→ 個人差大、害は少ない、**「治療」と称さず**選択肢として提供は合理的

### Bionic Reading
- Readwise n=2,074：-2.6 wpm（むしろ遅い）
- Možina 2025：reading speed / fixation 数に有意差なし
- ただし self-efficacy（自己効力感）改善あり → プラセボ的モチベーション効果

→ **効果を約束しない説明**を添えて、オプション化

詳細は [[A_AssistiveTech#Bionic Reading]] / [[C_Color]]

## 4. WCAG 2.1 / 2.2 — 国際標準数値

### SC 1.4.8 Visual Presentation（AAA）
- 前景・背景色をユーザー選択可能
- 行幅 ≤80字（CJK 40字）
- **両端揃え禁止**
- 行間 ≥1.5、段落間 ≥行間の1.5倍
- 200%拡大時に横スクロール不要

### SC 1.4.12 Text Spacing（AA）

| プロパティ | 最低値 |
|---|---|
| line-height | font-sizeの1.5倍以上 |
| paragraph spacing | font-sizeの2倍以上 |
| letter-spacing | font-sizeの0.12倍以上 |
| word-spacing | font-sizeの0.16倍以上 |

引用研究：**Zorzi 2012 PNAS**、Rello & Baeza-Yates 2017、Sjoblom 2016、McLeish 2007

詳細は [[G_Guidelines]]

## 5. BDA Dyslexia Style Guide 2023 — 実務基準

英国ディスレクシア協会の公式スタイルガイド。本アプリのデフォルト基準。

- フォント：Arial / Comic Sans / Verdana / Tahoma / Century Gothic / Trebuchet / Calibri / Open Sans
- 本文：12-14pt（1-1.2em / 16-19px）
- 強調は**太字のみ**、下線・斜体・全大文字を避ける
- 左揃え固定、白背景回避、緑×赤×ピンク強組合せ回避

## 6. 日本語特有の知見

### UDデジタル教科書体（モリサワ）
- **奥村智人研究**：UD書体で読み速度約9%改善（n=33）
- **J-STAGE 音声言語医学 2023**（後藤・宇野 et al., n=24+24）：客観差なし、**主観的にUD書体を有意に選好**

### 分かち書き
- **Sainio 2007**：純ひらがな文では単語認識・眼球運動を促進
- 漢字仮名交じり文では冗長

### ルビ
- 教育現場の標準的配慮
- 厳密なRCTは少ないが、現場知見として支持

詳細は [[F_Fonts]] / [[L_Layout]]

## 明日からできる3つのこと

1. **教室の配布資料の行間を1.5以上に変える**
2. **テスト問題用紙を Arial / UD ゴシック・18pt・左揃えで作り直す**
3. **配布物の背景色を白からクリーム色（厚紙）に変える**

## チェックリスト

- [ ] エビデンスのある介入3つを説明できる
- [ ] OpenDyslexic等の専用フォントの客観効果は否定されていると説明できる
- [ ] WCAG 1.4.12 の数値（1.5 / 0.12 / 0.16 / 2倍）を覚えている
- [ ] 「エビデンスあり／論争中／弱い」を区別して話せる
- [ ] 主要研究を3つ以上引用できる（Zorzi, Wery, Beier 等）

## 参考文献（主要なもの）

- [Zorzi et al. 2012 PNAS - 字間拡大](https://www.pnas.org/doi/10.1073/pnas.1205566109)
- [Beier et al. CHI 2023 - Digital Reading Rulers](https://thereadabilityconsortium.org/wp-content/uploads/2023/08/Digital-Reading-Rulers-Evaluating-Inclusively-Designed-Rulers-for-Readers-With-Dyslexia-and-Without.pdf)
- [Annals of Dyslexia 2023 - TTS](https://link.springer.com/article/10.1007/s11881-023-00281-9)
- [Wery & Diliberto 2017 - OpenDyslexic](https://link.springer.com/article/10.1007/s11881-016-0127-1)
- [WCAG 1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)
- [BDA Dyslexia Style Guide 2023](https://cdn.bdadyslexia.org.uk/uploads/documents/Advice/style-guide/BDA-Style-Guide-2023.pdf)
- [J-STAGE UD書体研究 2023](https://www.jstage.jst.go.jp/article/jjlp/64/2/64_105/_article/-char/ja/)

## 関連

- [[TL_M2-Strength-Based]] — 前モジュール
- [[TL_M4-In-Classroom-Implementation]] — 次モジュール
- [[Research-MOC]]

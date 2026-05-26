---
title: "F_Fonts — フォントと読みやすさ"
type: research
created: 2026-05-26
tags: [research, fonts, typography]
---

# F_Fonts — フォントと読みやすさ

## 結論

- **OpenDyslexic / Dyslexie の客観的優位性は査読研究で否定**（Wery 2017, Kuster 2018）
- 効果の主因は字形ではなく**字間スペーシング**（Marinus 2016, Galliussi 2020）
- **個人差大** → 複数フォントを選択可能にする設計が必須
- 日本語は**客観差小・主観選好大**（J-STAGE 2023, n=24+24）

## キー研究

| 研究 | 結果 |
|---|---|
| **Wery & Diliberto 2017**（*Annals of Dyslexia*）| OpenDyslexic は読字速度・精度を改善しなかった |
| **Kuster et al. 2018**（同上）| Dyslexie font も利益・阻害なし、Arial が好まれた |
| **Marinus et al. 2016**（*Dyslexia*）| Dyslexie の効果は「字形」ではなく「スペーシング」由来。Arialの字間を広げると差が消失 |
| **Rello & Baeza-Yates 2013**（ACM ASSETS）| Helvetica / Courier / Arial / Verdana / CMU が好成績。OpenDyslexic は好まれず |
| **Bachmann & Mengheri 2018**（*Brain Sciences*）| EasyReading は小4で速読・誤読減（ただし利益相反に注意） |
| **Rello et al. 2016**（*ACM TACCESS*）| **18pt が最適**（アイトラッキング） |

## 日本語フォント

- **UDデジタル教科書体**（モリサワ）：太さの強弱を抑えた設計
- **奥村智人（大阪医科薬科大）研究**：UD書体で読み速度約9%改善（n=33）
- **J-STAGE 音声言語医学 2023**（後藤・宇野 et al., n=24+24）：客観差なし、**主観的にUD書体を有意に選好**
- **BIZ UDゴシック**：Google Fonts で無料配布

## 実装示唆 → [[FT_MVP]]

| フォント | 用途 | 提供方法 |
|---|---|---|
| UDデジタル教科書体 | 和文デフォルト | システム搭載があれば優先、なければBIZ UDゴシック |
| BIZ UDゴシック | 和文（無料代替） | Google Fonts |
| Noto Sans JP / メイリオ | 和文オプション | システム |
| Arial / Verdana / Open Sans / Helvetica | 欧文デフォルト | システム |
| OpenDyslexic / Dyslexie | **オプション**（強制しない） | Webフォント |

## 出典

- [Wery & Diliberto 2017](https://link.springer.com/article/10.1007/s11881-016-0127-1)
- [Kuster et al. 2018](https://link.springer.com/article/10.1007/s11881-017-0154-6)
- [Marinus et al. 2016](https://pubmed.ncbi.nlm.nih.gov/27194598/)
- [Rello & Baeza-Yates 2013](https://dyslexiahelp.umich.edu/wp-content/uploads/2014/02/good_fonts_for_dyslexia_study.pdf)
- [Bachmann & Mengheri 2018](https://www.mdpi.com/2076-3425/8/5/89)
- [J-STAGE UD書体研究](https://www.jstage.jst.go.jp/article/jjlp/64/2/64_105/_article/-char/ja/)
- [モリサワ UDフォント研究](https://www.morisawa.co.jp/products/fonts/ud-public/study/)

## 関連

- [[L_Layout]] — 字間スペーシング（フォント効果の真の正体）
- [[FT_MVP]] — MVP実装仕様
- [[TL_M3-Evidence-Based-Practice]] — 講師向け解説

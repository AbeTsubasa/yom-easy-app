---
title: "L_Layout — 字間・行間・行長・揃え"
type: research
created: 2026-05-26
tags: [research, layout, spacing, wcag]
---

# L_Layout — 字間・行間・行長・揃え

## 結論

- **字間拡大は最も強力かつエビデンスの確かな介入**（Zorzi 2012 PNAS で読みエラー半減）
- **WCAG 1.4.12 が国際標準** — 行間≥1.5、段落間≥2倍、字間≥0.12em、語間≥0.16em
- **左揃え固定**（両端揃えは visual stress を増やす）

## 字間（letter-spacing）

| 推奨値 | 根拠 |
|---|---|
| **0.12em以上** | WCAG 2.1 SC 1.4.12（AA） |
| 平均文字幅の**約35%** | BDA Dyslexia Style Guide 2023 |
| **+0.18em相当（+1.9倍）** | Zorzi et al. 2012 PNAS の実験条件 |

**Zorzi 2012**：n=74のディスレクシア児童で読みエラー半減、読速+0.3 syllables/sec（通常1学年分の進歩）。理論的根拠は **crowding effect** の緩和。
**Hakvoort 2017**：字間拡張効果はディスレクシア特異的ではない → 万人向けの汎用機能。

## 行間（line-height）

- **1.5（150%）以上** ← WCAG 1.4.8（AAA）・1.4.12（AA）・BDA 2023 すべて一致

## 行長（line length）

- WCAG 1.4.8: **半角80字以内（CJK 40字）**
- BDA 2023: **本文60–70字**
- 日本語タイポ実務: 30–40全角字/行

## 単語間・段落間

- word-spacing ≥0.16em（WCAG 1.4.12）／字間の3.5倍（BDA）
- paragraph-spacing ≥font-sizeの2倍（WCAG 1.4.12）

## テキスト揃え

- **左揃え固定**。両端揃え（justify）は WCAG・BDA ともに禁止
- 理由：両端揃えは "rivers of white" を生み単語分節を阻害

## 日本語特有

- **分かち書き**（Sainio 2007 *Vision Research*）：純ひらがな文では単語認識・眼球運動を促進。漢字仮名交じり文では冗長
- **ルビ・振り仮名**：教育現場の標準的配慮（厳密なRCTは少ないが）
- **縦書きvs横書き**：W3C JLREQ で両対応規定。ディスレクシア向けの縦書き有効性研究は未確立

## 実装デフォルト値（WCAG AAA準拠）

| プロパティ | デフォルト | スライダー範囲 |
|---|---|---|
| `letter-spacing` | 0.12em | 0 – 0.25em |
| `line-height` | 1.5 | 1.2 – 2.0 |
| `word-spacing` | 0.16em | 0 – 0.5em |
| `paragraph-spacing` | 2em | 1.5 – 3em |
| `max-width` | 全角40字/半角80字 | 30–50 / 60–90 |
| `text-align` | left（固定） | — |

## 出典

- [Zorzi et al. 2012 PNAS](https://www.pnas.org/doi/10.1073/pnas.1205566109)
- [WCAG 1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)
- [BDA Dyslexia Style Guide 2023](https://cdn.bdadyslexia.org.uk/uploads/documents/Advice/style-guide/BDA-Style-Guide-2023.pdf)
- [Sainio et al. 2007 Vision Research](https://pubmed.ncbi.nlm.nih.gov/17697693/)

## 関連

- [[F_Fonts]] — フォント効果の真因
- [[G_Guidelines]] — WCAG/BDA詳細
- [[FT_MVP]] — 実装仕様

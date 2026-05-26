---
title: "T_International-Tools — 海外主要ツール"
type: tools
created: 2026-05-26
tags: [tools, international, immersive_reader, helperbird]
---

# T_International-Tools — 海外主要ツール

## ツール比較表

| ツール | 主要機能 | プラットフォーム | 価格 | 学べる設計 |
|---|---|---|---|---|
| **Microsoft Immersive Reader** | TTS・Line Focus（1/3/5行）・Picture Dictionary・品詞色分け・音節分割 | Edge/Word/Teams等 | 無料（MS365内） | 品詞ハイライト・音節分割・段階制Line Focus |
| **Helperbird** | TTS・特殊フォント・ルーラー・Line Focus・色テーマ・辞書・注釈 | Chrome/Firefox/Edge 拡張 | Free/Pro $6.99/月 | **ピックアンドミックスUI**（各機能独立ON/OFF） |
| **Read&Write（TextHelp）** | TTS・辞書・語彙予測・画像辞書・書字支援 | Chrome 拡張/デスクトップ | 月額制、高価 | 書字（出力）支援まで含めた包括設計 |
| **BeeLine Reader** | 行末→次行頭への色グラデーション | Web/Chrome 拡張/iOS | 拡張、限定無料 | 「次の行への視線誘導」を色で行う発想 |
| **Speechify** | 高品質TTS・単語同期ハイライト・自動スクロール | Web/Chrome 拡張/モバイル | 月額制 | 商用TTSのUX基準、「読み上げ中の単語が画面中央」自動スクロール |
| **TTSReader / Audeus** | TTS・ハイライト | Web/拡張 | 各種 | 単語同期ハイライト |
| **MS Edge "Read Aloud"** | TTS・同期ハイライト | Edge標準 | 無料 | 単語同期ハイライトのブラウザネイティブ実装 |
| **OpenDyslexicフォント** | 特殊書体 | フォント/Chrome拡張 | 無料 | 査読で効果否定、ただし選択肢として提供する価値はあり |
| **ATbar** | TTS・サイズ・色オーバーレイ・辞書・予測 | OSSツールバー | 無料（OSS） | UK発のシンプル単一ツールバー思想 |
| **Augmenta11y（ACIS 2021）** | カメラOCR+ディスレクシアフレンドリーリーダー | iOS/Android | — | 紙の本対応の研究プロト |

## 研究プロトタイプ

- **DysWebxia**（Luz Rello PhD 2014）：レイアウトガイドラインを統合したweb service
- **IDEAL Group Reader**：ディスレクシア設定を含む初のe-bookリーダー
- **WebHelpDyslexia**（Avelar et al., Procedia CS 2015）：ブラウザ拡張プロト

## 日本語対応状況

| ツール | 日本語UI | 日本語TTS | 日本語ルビ | 日本語OCR |
|---|---|---|---|---|
| Helperbird | 〇 | 〇 | **× 自動ふりがな非対応** | 〇 |
| Read&Write | △ | △（音質低） | × | △ |
| Immersive Reader | 〇 | 〇 | **△ 音節分割はあるがルビ自動付与非対応** | OCR連携可 |
| BeeLine Reader | × | グラデーション色のみ | × | × |
| Speechify | △ | 〇だが漢字読み精度低 | × | 〇 |
| Audeus | × | × 主に英語 | × | × |

**結論**：海外ツールは読み上げ・UDフォント・行ハイライトは強いが、**「日本語ルビ自動付与」を統合した製品はほぼ存在しない**。

## 出典

- [Microsoft Immersive Reader 製品ガイド](https://learn.microsoft.com/ja-jp/training/educator-center/product-guides/immersive-reader/)
- [Helperbird Chrome拡張](https://chromewebstore.google.com/detail/helperbird-%E3%82%A2%E3%82%AF%E3%82%BB%E3%82%B7%E3%83%93%E3%83%AA%E3%83%86%E3%82%A3%E3%81%A8%E7%94%9F%E7%94%A3%E6%80%A7%E5%90%91%E4%B8%8A/ahmapmilbkfamljbpgphfndeemhnajme?hl=ja-jp)
- [Speechify 公式](https://speechify.com/)
- [Luz Rello PhD Thesis](https://www.luzrello.org/)

## 関連

- [[T_Japanese-Tools]]
- [[T_Competitive-Matrix]]
- [[A_AssistiveTech]]

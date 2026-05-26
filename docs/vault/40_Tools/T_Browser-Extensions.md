---
title: "T_Browser-Extensions — ブラウザ拡張（日本語）"
type: tools
created: 2026-05-26
tags: [tools, browser_extensions, furigana]
---

# T_Browser-Extensions — ブラウザ拡張（日本語）

## ふりがな系拡張

| 拡張機能 | 機能 | 価格 |
|---|---|---|
| **サテライトオフィス ふりがな付与** | ボタン1つでページ全体にルビ付与 | 無料 |
| **Furigana Plus** | 漢字ふりがな自動付与 | 無料 |
| **Furigana Maker** | 自動＋手動範囲指定、ひらがな/カタカナ/ローマ字切替 | 無料 |
| **IPA furigana** | 文字種選択、教育現場で利用例多数 | 無料 |
| **Tsukeru** | オフライン辞書、JLPTフィルタ、語彙保存 | 無料 |
| **Auto Furigana / Subkit / Furiganator** | 類似機能 | 無料 |

**共通の弱点**：いずれも「ふりがな単機能」で、読み上げ・行ハイライト・UDフォント切替などとの統合がない。

## 教育用拡張

- **OpenDyslexic for Chrome**：OpenDyslexicフォントをページ全体に適用
- **Read Aloud: A Text to Speech Voice Reader**：ブラウザ拡張のTTS

## 観察

- 単機能の組み合わせで対応している現状 → **統合UIへの空白がある**
- 既存拡張のUIを参考に：

### 良いUI参考
- **Furigana Maker**：ひらがな/カタカナ/ローマ字を1クリック切替
- **IPA furigana**：教員が「学年別漢字フィルタ」感覚で使える
- **Helperbird**：ピックアンドミックス（各機能独立ON/OFF）

## アプリ実装への示唆

- 既存ふりがな拡張ユーザーへの移行訴求：「ふりがなだけでなく、読み上げ・行ハイライト・UDフォントも統合」
- ブラウザ拡張版（v1.1）の検討：現在のWebサイト上でも使えるよう拡張化

## 出典

- [サテライトオフィス ふりがな付与](https://www.sateraito.jp/Lab/Add_furigana.html)
- [Furigana Plus（Chrome）](https://chromewebstore.google.com/detail/furigana-plus/kaebmfgmehefgiphckeahegicpfddhan)
- [Furigana Maker（Chrome）](https://chromewebstore.google.com/detail/furigana-maker/heodojceeinbkfjfilnfminlkgbacpfp)

## 関連

- [[T_Japanese-Tools]]
- [[T_Competitive-Matrix]]
- [[I_Libraries]] — kuromoji.js / kuroshiro による自前実装

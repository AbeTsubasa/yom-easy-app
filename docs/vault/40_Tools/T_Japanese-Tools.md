---
title: "T_Japanese-Tools — 日本語圏ディスレクシア向けツール"
type: tools
created: 2026-05-26
tags: [tools, japanese, daisy, ud_browser]
---

# T_Japanese-Tools — 日本語圏ディスレクシア向けツール

## 公的・研究機関発のツール

| ツール | 開発者 | 機能 | 価格・入手 | 強み | 弱み |
|---|---|---|---|---|---|
| **MIM / つまずきチェッカー** | 海津亜希子（NISE） | 多層指導モデル＋月次チェッカー | 学研販売 | エビデンス、通常学級可 | 紙ベース中心 |
| **マルチメディアDAISY教科書** | 日本DAISYコンソーシアム | 音声・テキスト同期ハイライト、サイズ・色変更 | **無料**（要申請、診断不要） | 公的支援、検定教科書カバー | 申請手続き、再生アプリ別途 |
| **わいわい文庫（DAISY図書）** | 伊藤忠記念財団 | 一般書のDAISY化 | 学校・図書館・医療機関に**無償寄贈** | 教科書外読書を補える | 個人配布なし |
| **UDブラウザ** | 慶應 中野泰志研 | 拡大教科書＋リフロー版閲覧 | **iPad専用・無料**（教科書は申請） | 弱視・読み困難児に最適化 | iPadのみ |
| **AccessReading** | 東大先端研 | Word/EPUB教科書配信 | **無料**（年度ごと申請） | 編集可、東大ブランド | 申請制、操作習得必要 |
| **ボイス オブ デイジー 5** | サイパック | DAISY 2.02/3、EPUB 3再生、ハイライト同期 | **3,000円**（iPhone/iPad） | DAISY標準再生環境 | 有料、iOSのみ |
| **触るグリフ** | 株式会社サワル | 多感覚学習教材 | 紙教材販売 | 世界初の特許技術 | デジタル不可 |
| **読めてる？** | コルチコ（モリサワ協賛） | ディスレクシア傾向スクリーニング | App Store **無料** | 簡易チェック入口 | 診断不可、支援機能なし |

## 商用学習アプリのアクセシビリティ

- **すらら**：問題文・解説の読み上げに対応。学習障害向けプラン公式に明記。UDフォント切替は明記なし
- **デキタス**：UI に音声解説あり。アクセシビリティ機能の明確な記載は乏しい
- **スマイルゼミ／進研ゼミ**：問題文音声読み上げあり。専用タブレット中心

**共通の弱点**：「学習教材」内のみで、**外部テキスト（プリント・教科書・Webページ）には使えない**。

## 読み上げソフト・OS標準

| 機能 | OS | 価格 | 日本語対応 |
|---|---|---|---|
| **VoiceOver** | macOS / iOS / iPadOS | 標準・無料 | 日本語TTS、点字、ジェスチャ |
| **TalkBack** | Android | 標準・無料 | 日本語TTS |
| **Windowsナレーター** | Windows 10/11 | 標準・無料 | Win11 22H2より自然な音声 |
| **PC-Talker Neo** | Windows | 5年44,000円〜 | 高品質日本語TTS、公費購入対象 |

OS標準は無料だが、**ブラウザ操作・選択読み・UDフォント切替・ふりがな付与などディスレクシア固有のニーズには非対応**。

## ふりがな・やさしい日本語ツール

- **やさしい日本語書き換えツール**（出入国在留管理庁）：Web、無料
- **伝えるウェブ**（アルファサード）：機械学習でWebページを自動変換
- **eboard やさしい日本語化ツール**（NPO法人eboard、2025年実証）：生成AIで学校配布プリントを変換

主に外国にルーツのある子向けだが、ディスレクシア児にも応用可能。

## OCR・スキャン＋読み上げ系

| ツール | OS | 価格 | 日本語OCR | 読み上げ |
|---|---|---|---|---|
| Microsoft Lens | iOS/Android | 無料 | 〇 | Word/Immersive Reader経由 |
| Google Lens | iOS/Android/Chrome | 無料 | 〇 | デバイスTTS経由 |
| Voice Dream Reader | iOS | 2,440〜4,800円 | 取り込みのみ | 日本語TTS追加可 |
| Voice Dream Scanner | iOS | 1,600円 | 2022年に日本語対応 | 同上と連携 |
| しゃべる教科書 | iOS | 有料 | スキャン＋TTS | DAISY連携 |

## 出典

- [デイジー教科書 日本障害者リハ協会](https://www.dinf.ne.jp/daisy/daisytext/)
- [わいわい文庫 伊藤忠記念財団](https://www.itc-zaidan.or.jp/summary/ebook/waiwai/)
- [UDブラウザ 公式（慶應）](https://psylab.hc.keio.ac.jp/app/UDB/)
- [AccessReading 公式](https://accessreading.org/)
- [ボイス オブ デイジー 5](https://www.cypac.co.jp/94)
- [すらら 学習障がいのお子さま向け](https://surala.jp/type/disability_ld.html)
- [読めてる？アプリ](https://yometeru.open-dna.jp/)
- [出入国在留管理庁 やさしい日本語](https://www.moj.go.jp/isa/support/portal/plainjapanese_kakikaerei.html)

## 関連

- [[T_International-Tools]]
- [[T_Browser-Extensions]]
- [[T_Competitive-Matrix]]

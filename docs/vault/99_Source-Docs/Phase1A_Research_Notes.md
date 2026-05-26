---
title: "Phase 1-A リサーチノート — ディスレクシア支援ウェブアプリ"
status: "draft"
phase: "1-A"
created: 2026-05-26
tags: [dyslexia, research, phase1a, MOC]
aliases: ["Phase 1-A 統合ノート", "リサーチ統合"]
---

# Phase 1-A リサーチノート（統合版）

> **目的**：ディスレクシアの生徒のためのテキスト視認性カスタマイズWebアプリを開発するにあたり、世界の査読論文・公的ガイドラインを横断調査し、設計上の意思決定根拠を1ヶ所に集約する。
> **対象言語**：日本語・英語の両方
> **次フェーズ**：このノートを起点にObsidian Vault（Phase 2）へ分解し、MVP仕様（Phase 3）の根拠とする。

---

## TL;DR — このノートの結論

1. **「ディスレクシア専用フォント」（OpenDyslexic / Dyslexie）の客観的優位性は査読研究で否定されている**。効果の主因は字形ではなく**字間スペーシング**である（Marinus 2016, Galliussi 2020）。
2. **個人差が極めて大きい**ため、「これが正解」という単一プリセットは存在しない。**ユーザーが選択・調整できるツール**として設計するのが、エビデンスに最も忠実。
3. **強い研究エビデンスがある介入**は ①**TTS＋単語同期ハイライト**（メタ分析でd=0.35）②**Reading Ruler（行ハイライト）**（CHI 2023で全層改善、ディスレクシア群で最大）③**字間・行間・文字サイズの拡大**（Zorzi 2012, Rello 2016）の3つ。
4. **Bionic Reading・カラーオーバーレイ**は科学的に未決着。提供は害がないが「治療効果」を謳ってはならない。
5. **日本語特有**：UDデジタル教科書体は主観的に好まれるが客観的差は小さい。漢字へのルビ・ひらがな文の分かち書きは教育現場で確立した配慮。
6. **公的ガイドライン横断の最大公約数**：本文16–19px、line-height ≥1.5、letter-spacing ≥0.12em、word-spacing ≥0.16em、左揃え、白でない背景（クリーム色）、純黒でない文字色、太字強調（下線・斜体・全大文字を避ける）。

---

## 目次

- [[#1. フォント研究]]
- [[#2. レイアウト研究（字間・行間・行長）]]
- [[#3. 色彩・背景・カラーオーバーレイ研究]]
- [[#4. 支援技術・読書補助研究]]
- [[#5. 公的ガイドライン横断整理]]
- [[#6. ウェブアプリ実装への統合示唆（MVP仕様の素案）]]
- [[#7. 主要出典一覧]]

---

## 1. フォント研究
#font #fonts #typeface

### 1.1 主要な学術的知見（結論先出し）

| 知見 | 主要出典 |
|---|---|
| **OpenDyslexicは読字速度・精度を改善しない** | Wery & Diliberto 2017, *Annals of Dyslexia* |
| **Dyslexie fontも読みに利益も阻害ももたらさない** | Kuster et al. 2018, *Annals of Dyslexia* |
| **Dyslexieのわずかな効果は字間スペーシングで説明できる** | Marinus et al. 2016, *Dyslexia* |
| **専用フォントは「文字単位の識別」のみ有利な場合あり** | Joseph & Powell 2022, *Dyslexia* |
| **サンセリフ・等幅・ローマン体（Helvetica/Arial/Verdana/Courier）が良好** | Rello & Baeza-Yates 2013, ACM ASSETS |
| **EasyReadingは肯定的結果（ただし利益相反に注意）** | Bachmann & Mengheri 2018, *Brain Sciences* |
| **字間拡大はクラウディング効果を減らし読みを助ける** | Zorzi et al. 2012, *PNAS* |
| **本文18pt程度が最適** | Rello, Pielot & Marcos 2016, *ACM TACCESS* |

### 1.2 フォント別エビデンス比較表

| フォント | 客観的効果 | 主観的好み | 備考 |
|---|---|---|---|
| **OpenDyslexic** | 効果なし | 好まれない傾向 | 無料・有名だが査読研究で根拠なし |
| **Dyslexie** | ほぼ効果なし／字間由来 | 中立 | 文字命名のみ若干有利。商用 |
| **EasyReading** | 肯定的結果あり（小4で速読・誤読減） | 肯定 | 字形＋字間の組合せ |
| **Sylexiad** | 主観的に好まれる（成人対象） | 肯定 | 大規模RCT未確立 |
| **Arial / Verdana / Helvetica / Open Sans / Tahoma** | 良好 | 良好 | サンセリフ汎用 |
| **Comic Sans / Calibri / Century Gothic / Trebuchet** | BDA推奨（経験則） | 良好 | サンセリフが主理由 |
| **Times New Roman（セリフ）** | 不利な傾向 | 不利 | プロポーショナル・セリフは速度低下 |
| **イタリック** | 大きな悪影響 | 不利 | **強調はボールドで** |

### 1.3 日本語フォント

- **UDデジタル教科書体（モリサワ）**：太さの強弱を抑え、画線処理を簡素化。発達性ディスレクシア・ロービジョンに配慮した設計。
- **奥村智人（大阪医科薬科大学LDセンター）**：読み書き困難児26名で4書体を比較→ UDデジタル教科書体が最も読みやすいと選択。33名で読み速度約9%改善。
- **査読論文（音声言語医学2023, J-STAGE）**：UD書体と標準教科書体で**客観的差なし**（読み時間・誤読・自己修正・読解正答率）だが、**主観的にはUD書体が読みやすい**。
- **発達性ディスレクシア児童の音読における書体の影響（J-STAGE）**：丸ゴシック vs 明朝も客観差なし。主観的には丸ゴシックが選ばれる。
- **BIZ UDゴシック / BIZ UD明朝**：Google Fontsで配布。教育・行政向け。

**示唆**：日本語の場合、客観指標では有意差が出にくいが、**「明朝体は避けてUD系ゴシック／UD教科書体を選ぶ」**が現時点で根拠のある推奨。「主観的読みやすさ」=「学習動機」「読書継続意欲」に直結するため軽視できない。

### 1.4 アプリ実装への示唆

1. **唯一解として「専用フォント」を推さない**：選択肢として提供。
2. **デフォルト（英語）**：Arial / Verdana / Open Sans / Helvetica。オプションとして OpenDyslexic / Dyslexie / Sylexiad / EasyReading。
3. **デフォルト（日本語）**：UDデジタル教科書体（または BIZ UDゴシック）。代替に丸ゴシック系。**明朝体は避ける**。
4. **フォントサイズ**：本文 **16–18pt** をデフォルトに。14–24pt で調整可能。
5. **イタリック禁止、強調はボールドで**。
6. **左揃え固定**（両端揃え禁止）。

---

## 2. レイアウト研究（字間・行間・行長）
#layout #spacing #typography

### 2.1 字間（letter-spacing）

| 推奨値 | 根拠 |
|---|---|
| **0.12em以上** | WCAG 2.1 SC 1.4.12（AA） |
| **平均文字幅の約35%** | BDA Dyslexia Style Guide 2023 |
| **+0.18em相当（+1.9倍）** | Zorzi et al. 2012, *PNAS*（実験条件） |

**Zorzi 2012**：イタリア・フランスのディスレクシア児74名で**読みエラー半減**、読速 +0.3 syllables/sec（通常1学年分の進歩相当）。「crowding effect（フランカー文字干渉）の緩和」が理論的根拠。
**Hakvoort 2017**：字間拡張効果は**ディスレクシア特異的ではなく一般読者にも見られる** → 万人にメリットがあるアクセシビリティ機能。

### 2.2 行間（line-height）

| 推奨値 | 根拠 |
|---|---|
| **1.5（150%）以上** | WCAG 1.4.8（AAA）、WCAG 1.4.12（AA）、BDA 2023 |

### 2.3 行長（line length / column width）

| 推奨値 | 根拠 |
|---|---|
| **半角80字以内**（CJKは40字以内） | WCAG 1.4.8（AAA） |
| **30–40全角字/行** | 日本語タイポグラフィ実務、JLREQ |
| **本文60–70字/行** | BDA 2023 |

### 2.4 単語間・段落間

- **word-spacing**：≥0.16em（WCAG 1.4.12）／字間の3.5倍以上（BDA 2023）
- **paragraph-spacing**：≥font-sizeの2倍（WCAG 1.4.12）／行間の1.5倍（WCAG 1.4.8 AAA）

### 2.5 テキスト揃え

- **左揃え（ragged right）固定**。両端揃え（justify）は**WCAG・BDAともに禁止**。
- 理由：両端揃えは「rivers of white」を生み、ディスレクシア読者の単語分節を阻害。

### 2.6 日本語特有

- **分かち書き**：Sainio 2007（*Vision Research*）— **純ひらがな文では分かち書きが単語認識・眼球運動を促進**。漢字仮名交じり文では漢字自体が分節手がかりとなるため冗長。
  - → 含意：低学年向け・ひらがな主体の文では分かち書きトグルが有効
- **ルビ（振り仮名）**：漢字認知が未確立な児童の意味把握を補助。教育現場の標準的配慮（厳密なRCTは少ない）。
- **縦書きvs横書き**：W3C JLREQが両対応を規定。ディスレクシア向け縦書きの有効性研究は未確立。Web/アプリは横書き標準。

### 2.7 アプリ実装デフォルト値（保守的・WCAG AAA準拠）

| プロパティ | デフォルト | スライダー範囲 |
|---|---|---|
| `letter-spacing` | 0.12em | 0 – 0.25em |
| `line-height` | 1.5 | 1.2 – 2.0 |
| `word-spacing` | 0.16em | 0 – 0.5em |
| `paragraph-spacing` | 2em | 1.5em – 3em |
| `max-width` | 全角40字 / 半角80字 | 30–50 / 60–90 |
| `text-align` | left（固定推奨） | — |
| 日本語特殊 | 分かち書きトグル / ルビ表示トグル / 縦書き切替 | — |

---

## 3. 色彩・背景・カラーオーバーレイ研究
#color #background #overlay #contrast

### 3.1 背景色

- **推奨**：クリーム色／オフホワイト／淡いパステル／暖色系（Peach、Orange、Yellow）
- **避ける**：純白 #FFFFFF（眩しさ・visual stress）、強い赤・緑・ピンクの組合せ（色覚多様性）

#### Rello & Bigham 2017 ASSETS（n=341、ディスレクシア群含む）読み時間比較

| 色 | HEX | コントラスト比 | 相対読み時間 |
|---|---|---|---|
| **Peach** | `#EDD1B0` | 14.35:1 | **100%（最速）** |
| Orange | `#EDDD6E` | 15.17:1 | 103% |
| Yellow | `#F8FD89` | 19.4:1 | 109% |
| Purple | `#B987DC` | 7.56:1 | 115% |
| Red | `#E0A6AA` | 10.2:1 | 117% |
| Turquoise | `#A5F7E1` | 16.99:1 | 118% |
| Grey | `#D8D3D6` | 14.21:1 | 121% |
| Blue | `#96ADFC` | 9.68:1 | 130% |
| Green | `#A8F29A` | 15.83:1 | 130% |
| Blue Grey | `#DBE1F1` | 16.05:1 | 145%（最遅） |

10色すべて黒文字`#000000`との組合せで**WCAG AAA（7:1）を満たす**。

### 3.2 文字色

- **純黒 `#000000` を避ける**：高コントラストは"vibration"（チラつき感）を生じ得る。
- **推奨**：`#222222` ～ `#333333` の濃いグレー。
- 根拠：UX Movement実務知見、Bradford 2011、Perron（Rello引用）。BDA Style Guide 2023は「dark coloured text on a light (not white) background」と明示。

### 3.3 カラーオーバーレイ（Irlen / Meares-Irlen）

#### 効果を支持する研究
- **Wilkins系**：自分で選んだ色のオーバーレイでディスレクシア児童の読書速度約25%向上。
- **Jeanes et al. 1997**：学校での長期使用で読書パフォーマンス改善。
- **Evans et al. 1994**：pattern glare感受性が高い人にはカラーフィルタが有用。

#### 効果を否定する研究
- **Griffiths et al. 2016（Ophthalmic & Physiological Optics, 系統的レビュー）**：「バイアスリスクが低い研究ほど、効果を支持しない」。
- **Suttle et al. 2018（Clinical & Experimental Optometry）**：「カラーレンズ／オーバーレイの読書改善目的の使用は推奨できない」。

#### 結論
- 個人差が大きく、プラセボ効果関与も否定できない。
- 害は少なく低コスト。主観的に救われるユーザーも存在する。
- **「治療」「診断」と称さず、あくまでアクセシビリティオプションとして提供**するなら合理的。

### 3.4 Visual Stress / Meares-Irlen症候群

- 言語ではなく**視覚処理の問題**。眩しさ、文字の滲み・揺れ・点滅などの知覚的歪み。
- ディスレクシアとは別個だが**共存（comorbid）**することが多い（ディスレクシア患者の最大40%）。
- 診断：Wilkins Rate of Reading Test（WRRT）で5%以上の改善で「効果あり」。
- 英国では正式な臨床診断名ではない。

### 3.5 コントラスト比とディスレクシア配慮の緊張関係

- **WCAG最低基準は守る**：通常テキスト4.5:1（AA）、7:1（AAA）。
- ただし「**最大コントラスト（純黒×純白＝21:1）は避ける**」。
- Rello実験のように 7:1～19:1 の範囲で複数選択肢を提示するのが安全。

### 3.6 蛍光マーカー（Highlighting）

- **Ponce et al. 2022 メタ分析（36研究, 1938–2019）**：
  - 学習者自身によるハイライトは**記憶**にd=0.36の効果、**理解**にはd=0.20と弱い。
  - **過剰なハイライトは逆効果** → 選択的にハイライトする訓練が必要。

### 3.7 行ハイライト（Reading Ruler / Line Focus）

- **Beier et al. CHI 2023 "Digital Reading Rulers"**（n=91ディスレクシア＋86非ディスレクシア）：
  - 全層で読速・読解向上、**ディスレクシア群で最大の効果**。
  - **平均 +86 wpm**。
  - **「全員に合う単一スタイルは存在しない」** → 4種類のデザイン（**Grey Bar / Lightbox / Shade / Underline**）を提供推奨。

### 3.8 色覚多様性配慮（Color Universal Design）

- **Okabe-Ito 2008 CUDパレット**（8色、全CVDタイプで識別可能）：
  - Orange `#E69F00`, Sky Blue `#56B4E9`, Bluish Green `#009E73`, Yellow `#F0E442`, Blue `#0072B2`, Vermillion `#D55E00`, Reddish Purple `#CC79A7`, Black `#000000`

### 3.9 アプリ実装への示唆

- **背景色プリセット**：Cream `#FDF6E3`、Peach `#EDD1B0`、Orange `#EDDD6E`、Yellow `#F8FD89`、Light Grey `#D8D3D6`、Pure White は**デフォルトにしない**。
- **文字色**：デフォルトを `#222222`、純黒は避ける。
- **オーバーレイ**：Rello実験10色 ＋ Cream ＋ Okabe-Itoの色覚配慮色をプリセットに。透明度スライダ（0–50%）。**自由カラーピッカーも必須**（Wilkinsの「自分で選んだ色のみ効果」知見）。
- **行ハイライト**：CHI 2023の4種を実装オプションに。色・高さ・透明度を調整可能に。
- **説明文**：「Irlen / オーバーレイ効果は科学的に論争中である」「医学的診断・治療効果は主張しない」をUIに明示。

---

## 4. 支援技術・読書補助研究
#assistive_tech #tts #ruler #bionic

### 4.1 Bionic Reading

- **仕組み**：各単語の最初の数文字を太字で強調。
- **Readwise n=2,074テスト**：Bionic使用時 平均-2.6 wpm（むしろ遅い）。読解スコア有意差なし。
- **Možina et al. 2025（SAGE Open）アイトラッキング**：reading speed / fixation duration / fixation 数に有意差なし。
- **The Conversation 2023**：「reading speedの真のボトルネックは知覚ではなくprocessing」。
- **IJAMS 2024**：self-efficacy（自己効力感）には改善あり → プラセボ的モチベーション効果はあり得る。

**結論**：効果証拠は乏しいが害もない。**実装するならON/OFF切替＋太字割合調整可能なオプション**として、効果を約束しない説明を添える。

### 4.2 Text-to-Speech（TTS）

#### エビデンス（強い）
- **メタアナリシス**：TTSのreading comprehensionへの効果量 d = .35（95% CI: .14–.56）。
- **Annals of Dyslexia 2023**：**TTS＋単語ハイライトのbimodal提示**が無音読より理解スコア有意に高い。mind wandering（注意散漫）が減り、on-task時間が増える。

#### 実装
- **Web Speech API（SpeechSynthesis）**：ブラウザ標準、無料、APIキー不要、プライバシー保護。Chrome/Edge/Safariサポート。
- `SpeechSynthesisUtterance`の`pitch`, `rate`, `volume`, `voice`を制御。
- **日本語**：OS標準音声（Kyoko, Otoya）が利用可能。
- **設計指針**：**TTS＋現在読まれている単語のハイライト同期が必須**。`onboundary`イベントで同期可能。日本語のword boundaryはOS差が大きく、自前で**kuromoji.js**で形態素解析しオフセット管理が確実。

### 4.3 テキスト分節化（チャンク改行）

- 構文的に区切られたテキストは line break での dysfluency が減り、fluency と理解を向上。
- **Rello & Baeza-Yates 2015**：フォント・字間・行間の調整で読解速度有意向上。**18–22pt**が最適。
- 子供は構文解析自体は大人と同じだが、誤解析の検出が遅れる → **チャンク提示が特に有効**。
- **実装**：形態素解析で「意味のまとまり（文節）」単位で改行。日本語は助詞・係り受け境界。

### 4.4 日本語の分かち書き・ルビ・既存ライブラリ

- **ライブラリ候補**：
  - **kuromoji.js**（takuyaa/kuromoji.js）：IPADIC形態素解析。ブラウザ動作可。読み（カタカナ）取得可。元リポはメンテ停滞 → **@sglkc/kuromojiフォーク**（ES Module・軽量）推奨。
  - **kuroshiro**（hexenq/kuroshiro）：kuromoji利用。furiganaモード（HTML `<ruby>`出力）提供。
- **参考実装**：Furigana Maker、EZkanji Chrome拡張、出入国在留管理庁「やさしい日本語書き換えツール」、eboard「やさしい日本語化ツール」。
- **日本語ディスレクシア研究会ファクトシート**：フォント・分かち書き・行間・振り仮名・紙色などが配慮対象。
- **日本語ディスレクシア有病率**：5.4%～7.5%（仮名は透明な表記ゆえ低いと思われていたが実際は英語圏並み）。

### 4.5 Reading Ruler / Line Focus

- **CHI 2023 Digital Reading Rulers**：n=177で**全参加者が平均+86 wpm**、ディスレクシア群で最大効果。
- 4種デザイン：**Grey Bar / Lightbox / Shade / Underline**。
- 実装：マウス追従 or 「現在行のみ高輝度＋他はディム」をCSS `mask`/overlay divで。キーボード（↓キー）で行を進めるモードも有効。
- **Microsoft Immersive Reader Line Focus**（1/3/5行ハイライト）も同コンセプト → 「段階数」UIが好例。

### 4.6 その他

#### RSVP（Spritz等）
- **Acklin & Papesh 2017**：literal comprehensionを悪化、視覚疲労増大。
- **PLOS One 2016**：350 wpm超で comprehension が崩壊。
- **結論**：tracking困難型の軽度ディスレクシアにのみ補助機能として。**速度上限300 wpm**程度にハードキャップ、デフォルトOFF。

#### 語彙難易度の調整
- **Rello et al. 2013**：頻出語への置換で読解速度↑、短語への置換で理解度↑。両者独立に効く。
- 日本語側は「やさしい日本語」12ルール、出入国在留管理庁ツール、eboardツール、LLM書き換え。
- **実装**：LLM API or 語彙頻度辞書＋同義語辞書（WordNet/日本語WordNet）で置換。

### 4.7 既存ツール比較表（参考となる設計）

| ツール | 主要機能 | プラットフォーム | 学べる設計 |
|---|---|---|---|
| **BeeLine Reader** | 行末→次行頭への色グラデーション | Web/拡張/iOS | 「次の行への視線誘導」を色で行う発想 |
| **Helperbird** | TTS・特殊フォント・ルーラー・Line Focus・色テーマ・辞書・注釈 | 拡張 | 各機能を独立ON/OFFできる「ピックアンドミックス」UI |
| **Read&Write (TextHelp)** | TTS・辞書・語彙予測・画像辞書・書字支援 | 拡張/デスクトップ | 書字（出力）支援まで含めた包括設計 |
| **Microsoft Immersive Reader** | TTS・Line Focus（1/3/5行）・Picture Dictionary・品詞色分け・音節分割 | Edge/Word/Teams等 | 品詞ハイライト・音節分割・段階制Line Focus |
| **OpenDyslexicフォント** | 特殊書体 | フォント/拡張 | 査読で効果否定。**選択肢として提供**する価値はあり |
| **ATbar** | TTS・サイズ・色オーバーレイ・辞書・予測 | OSSツールバー | 無料・OSS・UK発のシンプルさ |
| **Augmenta11y（ACIS 2021）** | カメラOCR＋ディスレクシアフレンドリーリーダー | iOS/Android | 紙の本対応の研究プロト |
| **MS Edge "Read Aloud"** | TTS・同期ハイライト | Edge標準 | 単語同期ハイライトの参考実装 |
| **Speechify / Audeus** | 高品質TTS・同期ハイライト・自動スクロール | 各種 | 「読み上げ中の単語が画面中央」自動スクロールのUX標準 |
| **DysWebxia（Rello PhD）** | レイアウト動的調整 | 研究プロト | 査読研究結果を統合した設計 |

### 4.8 アプリ実装への示唆（優先度付き）

#### 必須（MVP）— 強い研究エビデンス
1. フォント調整（サイズ18–22pt推奨、行間、字間、語間）
2. フォント切替（UD系・サンセリフを軸に、OpenDyslexic等はオプション）
3. **TTS（Web Speech API）＋単語同期ハイライト** ← 最大効果量
4. 読み上げ速度調整（80–150%）と一時停止
5. **ルビ自動付与**（kuromoji.js + kuroshiro、学年別常用漢字フィルタ）
6. **背景色テーマ**（クリーム・グレー・ダーク等。純白回避）
7. **Reading Ruler**（最低2種：Line Focus型 + Underline型）

#### 推奨（v1.1）
8. 文節改行（形態素解析）
9. 語彙難易度調整（LLM／「やさしい日本語」API）
10. 単語タップで意味表示（Picture Dictionary）
11. Bionic Reading風太字（オプション・効果を約束しない）
12. 品詞色分け
13. 読み進めた位置の自動スクロール

#### 将来（v2+）
14. OCR（カメラ→ディスレクシアフレンドリー再表示）
15. RSVP（オプション、上限300 wpm）
16. 読書ログ／自己効力感トラッキング
17. 教師・保護者ダッシュボード
18. PWA／オフライン

#### 設計原則
- **ピックアンドミックスUI**：各機能独立ON/OFF（1人ひとり最適解が異なる）
- **デフォルトは控えめに**：強制しない
- **設定プロファイル保存＋即時プレビュー**（localStorage + URLハッシュ）
- **エビデンスラベル**：「研究で効果が示されている」「主観的好みで選んでください」を機能ごとに明示

---

## 5. 公的ガイドライン横断整理
#guidelines #wcag #bda #ida #coga #daisy #japan

### 5.1 BDA Dyslexia Style Guide 2023（要点）

| カテゴリ | 推奨 |
|---|---|
| フォント種別 | サンセリフ（Arial・Comic Sans・Verdana・Tahoma・Century Gothic・Trebuchet・Calibri・Open Sans） |
| 本文サイズ | 12–14pt（1–1.2em / 16–19px） |
| 見出し | 本文より20%以上大きく＋必要なら太字 |
| 字間（letter spacing） | 平均文字幅の約35% |
| 単語間 | 字間の3.5倍以上 |
| 行間 | 1.5（150%）以上 |
| 強調 | **太字のみ**。下線・斜体・全大文字は避ける |
| 背景 | 単色・パターン回避・**白でない**柔らかい色（クリーム） |
| 文字色 | 濃色 on 明背景 |
| 避ける色 | 緑・赤・ピンクの強組合せ |
| レイアウト | 左揃え固定（両端揃え禁止）、複数段組回避、1文60–70字 |
| 文体 | 能動態、簡潔、平易、図解・箇条書き活用、二重否定回避、略語は初出時に展開 |

### 5.2 IDA（International Dyslexia Association）

- **定義（2002年版、2025年改訂版あり）**：神経生物学的起源の特異的学習障害。**音韻論的処理の欠陥**が主因。
- **指導原則 "Structured Literacy"**：音韻論、音記号対応、音節、形態論、統語論、意味論を、**Explicit / Systematic / Cumulative** に。
- ファクトシート群（音読・読解・音韻認識・流暢性）公開。

### 5.3 WCAG 2.1 / 2.2 関連基準

#### SC 1.4.8 Visual Presentation（AAA）
- 前景・背景色をユーザーが選択可能
- 行幅 ≤80字（CJK 40字）
- **両端揃え禁止**
- 行間 ≥1.5、段落間 ≥行間の1.5倍
- 200%拡大時に横スクロール不要

#### SC 1.4.12 Text Spacing（AA）
ユーザーが以下を上書き可能とすること：

| プロパティ | 最低値 |
|---|---|
| line-height | font-sizeの1.5倍以上 |
| paragraph spacing | font-sizeの2倍以上 |
| letter-spacing | font-sizeの0.12倍以上 |
| word-spacing | font-sizeの0.16倍以上 |

- 関連研究引用：Zorzi 2012、Rello & Baeza-Yates 2017。

#### その他
- SC 1.4.3 / 1.4.6 Contrast：通常4.5:1、大文字3:1（AAA は 7:1 / 4.5:1）
- SC 3.1.5 Reading Level（AAA）
- SC 3.1.3 Unusual Words（AAA）

### 5.4 W3C COGA — Making Content Usable

8つの設計目標：
1. 理解しやすさ（既知のアイコン・用語）
2. ナビゲーションのしやすさ
3. 明確で理解しやすい内容（平易・短文・現在形）
4. ミスを防ぐ・訂正を助ける
5. 集中を助ける（不要なメディア自動再生回避）
6. 記憶に頼らない
7. ヘルプ・サポート提供
8. **適応化・パーソナライゼーション**（Personalisation Semantics）

### 5.5 日本の公的ガイドライン

#### 文部科学省 — LD／合理的配慮
- 合理的配慮の具体例：板書撮影許可、板書同内容プリント配布、**漢字へのルビ**、漢字書字免除、**問題文の読み上げ**、**ICT活用**、試験時間延長。

#### 国立特別支援教育総合研究所（NISE）
- 「LD、ADHD、高機能自閉症ガイドライン（試案）」（H15）
- 音読困難への対応を**聴覚的処理困難型／視覚的処理困難型**で分けて指導。
- 「できるようにする・別法で代替する・他能力で補完する」3軸。

#### 日本LD学会 / 発達性ディスレクシア研究会
- 日本LD学会：学術誌『LD研究』。
- 発達性ディスレクシア研究会（2001設立、2004 IDAグローバルパートナー）：日本語話者ディスレクシアは**約8%**。

#### 日本DAISYコンソーシアム / マルチメディアDAISY教科書
- DAISY = Digital Accessible Information System。
- **読み上げ＋同期ハイライト**が集中を助ける。
- ユーザーが**文字サイズ・色・行間・縦／横書き**を自由変更可能。
- UDフォントと組み合わせて視覚認知困難に対応。
- 申請により無償提供（伊藤忠記念財団、日本障害者リハ協会など）。

### 5.6 その他海外

- **Yale Center for Dyslexia & Creativity**：「**Extra Time（時間延長）**が最重要配慮」。
- **EU ICT4IAL（European Agency）**：23言語＋アラビア語・中国語・ロシア語の実務者向けガイドライン。
- **Inclusion Europe — Easy-to-Read European Standards**：知的障害・低リテラシー向け易解化標準。
- **Made by Dyslexia**（Richard Branson主導）：教員研修、'Intelligence 5.0'レポート、ディスレクシア思考の強み（複雑問題解決・適応力・レジリエンス・コミュニケーション・創造性）の啓発。

### 5.7 ガイドライン横断・最大公約数（実装デフォルト推奨）

| 項目 | 推奨値 | 根拠 |
|---|---|---|
| フォント種別 | サンセリフ／UDゴシック | BDA・教育実務 |
| 本文サイズ | 16–19px（12–14pt、推奨18pt） | BDA・Rello 2016 |
| 見出しサイズ | 本文の120%以上 | BDA |
| line-height | ≥1.5 | WCAG 1.4.8/1.4.12、BDA |
| letter-spacing | ≥0.12em（字幅35%） | WCAG 1.4.12、BDA |
| word-spacing | ≥0.16em（字間3.5倍以上） | WCAG 1.4.12、BDA |
| paragraph-spacing | ≥font-sizeの2倍 | WCAG 1.4.12 |
| 行幅 | ≤80字（CJK 40字） | WCAG 1.4.8、BDA |
| テキスト揃え | 左揃え固定 | WCAG 1.4.8、BDA |
| 背景色 | 白でない柔らかい色／ユーザー選択可 | BDA、WCAG 1.4.8 |
| 文字色 | 濃色・コントラスト4.5:1以上（AAA 7:1）、純黒回避 | WCAG、UX実務 |
| 強調 | 太字。下線・斜体・全大文字回避 | BDA |
| テキスト拡大 | 200%まで横スクロールなし | WCAG |
| ユーザー設定 | サイズ・色・行間・フォントの個別カスタマイズ | DAISY、COGA |
| 読み上げ | 同期ハイライト付きTTS | DAISY、IDA、文科省 |
| 画像・図 | フローチャート・ピクトグラムで補強 | BDA、COGA |
| 文体 | 平易・短文・能動態・二重否定回避・用語集 | BDA、COGA、Easy-to-Read |
| 時間制限 | タイムアウト撤廃／延長 | Yale、COGA、文科省 |

---

## 6. ウェブアプリ実装への統合示唆（MVP仕様の素案）
#mvp #spec #app

### 6.1 設計原則（全機能共通）

1. **個人差を前提に「選べる」UIに**：プリセット＋自由カスタマイズの両立
2. **デフォルトはWCAG AAAを上回る安全値で出荷**
3. **エビデンスラベル**：各機能に「強い研究エビデンスあり」「主観的好みで選択」「効果は議論中」を明示
4. **「治療」「診断」と称さない**：あくまでアクセシビリティ・学習支援ツール
5. **設定プロファイルの保存・即時プレビュー・共有**：localStorage + URLハッシュ
6. **データはローカルファースト**：個人情報・読書履歴は端末内保存（プライバシー）

### 6.2 MVP機能セット（Phase 3で実装する範囲）

#### 入力
- テキスト直接貼り付け
- .txt / .md ファイル読み込み
- （v1.1）PDFテキスト抽出
- （v2）カメラOCR

#### 視認性コントロール（必須）
- フォント切替（和文：UDデジタル教科書体、BIZ UDゴシック、Noto Sans JP、メイリオ／欧文：Arial、Verdana、Open Sans、OpenDyslexic、Dyslexie）
- フォントサイズ（14–32px、デフォルト18px）
- letter-spacing（0–0.25em、デフォルト0.12em）
- line-height（1.2–2.0、デフォルト1.5）
- word-spacing（0–0.5em、デフォルト0.16em）
- paragraph-spacing（1–3em、デフォルト2em）
- max-width（30–50全角字／60–90半角字）

#### 色（必須）
- 背景色プリセット（Cream / Peach / Orange / Yellow / Grey / Dark）＋自由カラーピッカー
- 文字色プリセット（Dark Grey #222 / #333 / Off-white for dark mode）＋自由カラーピッカー
- ダークモード切替（純黒は使わない、`#1a1a1a` ベース）

#### 集中支援（必須）
- **TTS + 単語同期ハイライト**（Web Speech API、速度80–150%、一時停止・再開）
- **Reading Ruler**（Line Focus / Underline / Shade の3種、色・透明度調整）
- **蛍光マーカー**（範囲選択で複数色から）

#### 日本語特化（必須）
- ルビ自動付与（kuromoji.js + kuroshiro、学年別常用漢字フィルタ：小1〜小6・中学・全部）
- 分かち書きトグル（ひらがな主体文で有効）

#### オプション機能（v1）
- Bionic Reading風（強調文字数1–4を調整可、効果を約束しない説明付き）
- 文節改行（形態素解析）

#### 出力
- 設定済みテキストをPDF/HTML出力
- 印刷フレンドリーレイアウト
- 設定プロファイルのURL共有

### 6.3 技術スタック（Phase 3で確定）

- **フロントエンド**：素のHTML/CSS/JS（依存最小）または Vite + Vanilla TS
- **形態素解析**：@sglkc/kuromoji（フォーク・軽量・ES Module）
- **ルビ生成**：kuroshiro
- **TTS**：Web Speech API（ブラウザ標準）
- **データ保存**：localStorage（個人）／URLハッシュ（共有）
- **デプロイ**：GitHub Pages（無料・無依存・教育現場で導入容易）
- **PWA化**（v1.1）：オフライン対応

### 6.4 ユーザーテスト方針

- ディスレクシア当事者の生徒2–3名（小〜中・高校生）でA/Bテスト
- 「効いた設定」を記録 → デフォルトプリセット改善
- 教員・特別支援担当者からのフィードバック収集
- 設定変更ログ（オプトイン）で利用パターン分析

---

## 7. 主要出典一覧
#references

### 7.1 査読論文（フォント）
- [Wery & Diliberto 2017 – OpenDyslexic study, *Annals of Dyslexia*](https://link.springer.com/article/10.1007/s11881-016-0127-1)
- [Kuster et al. 2018 – Dyslexie font does not benefit reading, *Annals of Dyslexia*](https://link.springer.com/article/10.1007/s11881-017-0154-6)
- [Marinus et al. 2016 – A Special Font for People with Dyslexia, *Dyslexia*](https://pubmed.ncbi.nlm.nih.gov/27194598/)
- [Joseph & Powell 2022 – Specialist typeface study, *Dyslexia*](https://onlinelibrary.wiley.com/doi/full/10.1002/dys.1727)
- [Rello & Baeza-Yates 2013 – Good Fonts for Dyslexia, ACM ASSETS](https://dl.acm.org/doi/10.1145/2513383.2513447)
- [Bachmann & Mengheri 2018 – EasyReading study, *Brain Sciences*](https://www.mdpi.com/2076-3425/8/5/89)
- [Galliussi et al. 2020 – Inter-letter spacing & dyslexia-friendly font, *Annals of Dyslexia*](https://link.springer.com/article/10.1007/s11881-020-00194-x)
- [Hillier 2006 – Sylexiad PhD Thesis, Anglia Ruskin University](https://www.sylexiad.com/research-and-phd/A-typeface-for-the-adult-dyslexic-reader-PhD-by-Robert-Hillier-Anglia-Ruskin-University-2006.pdf)
- [Rello & Baeza-Yates 2016 – Font Type on Screen Readability, *ACM TACCESS*](https://www.superarladislexia.org/pdf/2016-Luz%20Rello-Fonts-taccess.pdf)

### 7.2 査読論文（レイアウト）
- [Zorzi et al. 2012 – Extra-large letter spacing improves reading in dyslexia, *PNAS*](https://www.pnas.org/doi/10.1073/pnas.1205566109)
- [Hakvoort et al. 2017 – Inter-letter spacing not specific to dyslexia, *J Exp Child Psychol*](https://www.sciencedirect.com/science/article/abs/pii/S0022096517304629)
- [Sainio et al. 2007 – Interword spacing in reading Japanese, *Vision Research*](https://pubmed.ncbi.nlm.nih.gov/17697693/)

### 7.3 査読論文（色彩・オーバーレイ・ハイライト）
- [Rello & Bigham 2017 – Good Background Colors, ACM ASSETS](https://www.cs.cmu.edu/~jbigham/pubs/pdfs/2017/colors.pdf)
- [Rello & Baeza-Yates 2015 – How to present more readable text, *UAIS*](https://repositori.upf.edu/bitstreams/275f50cd-7524-479a-a09f-1edc22830b30/download)
- [Griffiths et al. 2016 – Coloured overlays systematic review, *OPO*](https://pubmed.ncbi.nlm.nih.gov/27580753/)
- [Suttle et al. 2018 – Coloured overlays overview of systematic reviews, *CEO*](https://pubmed.ncbi.nlm.nih.gov/29633383/)
- [Kriss & Evans 2005 – Dyslexia and Meares-Irlen Syndrome, *J Research in Reading*](https://www.researchgate.net/publication/227618549_The_relationship_between_dyslexia_and_Meares-Irlen_Syndrome)
- [Ponce et al. 2022 – Highlighting meta-analysis, *Educ Psychol Rev*](https://link.springer.com/article/10.1007/s10648-021-09654-1)
- [Beier et al. CHI 2023 – Digital Reading Rulers](https://thereadabilityconsortium.org/wp-content/uploads/2023/08/Digital-Reading-Rulers-Evaluating-Inclusively-Designed-Rulers-for-Readers-With-Dyslexia-and-Without.pdf)

### 7.4 査読論文（支援技術・TTS・Bionic）
- [Annals of Dyslexia 2023 – TTS features on reading comprehension](https://link.springer.com/article/10.1007/s11881-023-00281-9)
- [Možina et al. 2025 – Bionic Reading eye-tracking, *SAGE Open*](https://journals.sagepub.com/doi/10.1177/21582440251376158)
- [Acklin & Papesh 2017 – RSVP/Spritz, *CHB*](https://www.sciencedirect.com/science/article/abs/pii/S0747563214007663)
- [Rello et al. 2013 – Frequent Words Improve Readability](https://link.springer.com/chapter/10.1007/978-3-642-40498-6_15)

### 7.5 日本語査読論文
- [音声言語医学 2023 – UDデジタル教科書体の影響, J-STAGE](https://www.jstage.jst.go.jp/article/jjlp/64/2/64_105/_article/-char/ja/)
- [音声言語医学 – 発達性ディスレクシア児童の音読における書体の影響, J-STAGE](https://www.jstage.jst.go.jp/article/jjlp/57/2/57_238/_article/-char/ja/)

### 7.6 公的ガイドライン・公式文書
- [BDA Dyslexia Style Guide 2023 (PDF)](https://cdn.bdadyslexia.org.uk/uploads/documents/Advice/style-guide/BDA-Style-Guide-2023.pdf?v=1680514568)
- [WCAG 2.1 SC 1.4.8 Visual Presentation](https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation.html)
- [WCAG 2.2 SC 1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)
- [W3C COGA — Making Content Usable](https://www.w3.org/TR/coga-usable/)
- [IDA Definition Consensus Project](https://dyslexiaida.org/definition-consensus-project/)
- [IDA Dyslexia Handbook 2019 (PDF)](https://www.readingrockets.org/sites/default/files/guide/IDA-Dyslexia-Handbook-2019.pdf)
- [Yale Center for Dyslexia & Creativity — Accommodations](https://dyslexia.yale.edu/resources/accommodations/)
- [European Agency — Guidelines for Accessible Information](https://www.european-agency.org/resources/publications/guidelines-accessible-information)

### 7.7 日本の公的資料
- [文部科学省 — 合理的配慮](https://www.mext.go.jp/b_menu/shingi/chukyo/chukyo3/siryo/attach/1325887.htm)
- [NISE 発達障害教育推進センター — LDの合理的配慮](https://cpedd.nise.go.jp/rikai/goritekihairyo/ld)
- [NISE — LDの指導・支援](https://cpedd.nise.go.jp/shido_shien/ld)
- [日本DAISYコンソーシアム / DINF — マルチメディアデイジー教科書](https://www.dinf.ne.jp/doc/daisy/book/daisytext.html)
- [日本障害者リハビリテーション協会 — DAISY事業](https://www.jsrpd.jp/overview/daisy/)
- [発達性ディスレクシア研究会](https://square.umin.ac.jp/dyslexia/concept.html)
- [NPO EDGE](https://npo-edge.jp/whats-dyslexia/)
- [モリサワ — UDフォント エビデンス](https://www.morisawa.co.jp/products/fonts/ud-public/study/)

### 7.8 実装ライブラリ・参考ツール
- [kuromoji.js](https://github.com/takuyaa/kuromoji.js/)
- [kuroshiro](https://kuroshiro.org/)
- [MDN: Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Helperbird](https://www.helperbird.com/)
- [Microsoft Immersive Reader](https://support.microsoft.com/en-us/topic/use-immersive-reader-in-microsoft-edge-78a7a17d-52e1-47ee-b0ac-eff8539015e1)
- [Made by Dyslexia](https://www.madebydyslexia.org/)

### 7.9 補足（色覚多様性）
- [Okabe-Ito CUDパレット – J*Fly](https://jfly.uni-koeln.de/color/)

---

## 残課題・Phase 1-Bへの送り（教育現場・当事者の声）

Phase 1-Aでは査読論文・公的ガイドラインの整理を完了した。Phase 1-Bでは以下を補完予定：

- 日本国内の **学校現場・特別支援学級の実践事例**（NISE実践研究、教委発信）
- **当事者団体・本人の発信**（NPO EDGE、Made by Dyslexia事例、当事者ブログ）
- **保護者・教員向けハンドブック**の収集
- **既存日本語ディスレクシア向け教材・アプリ**のユーザビリティ評価（多層的読み書きスクリーニング検査MIM、つまずきチェッカー等）
- 国内大学の研究室発信（奥村智人/大阪医科薬科大、玉井浩、高橋登/大阪教育大、東京学芸大、奈良教育大）

---

*このノートは Phase 2 で Obsidian Vault に分解する。「研究」「事例」「ガイドライン」「機能候補」「実装メモ」の5フォルダ構成を予定。*

# Credits — Yom-easy

Yom-easy は、世界中の研究者・エンジニア・タイポグラフィデザイナーの仕事の上に立っています。それぞれのライセンス条件を尊重しつつ、感謝とともに利用させていただいています。

最終更新：2026-05-27 ／ 対象バージョン：0.9.0（ベータ）

---

## 形態素解析・辞書

### kuromoji.js（[@sglkc/kuromoji](https://github.com/sglkc/kuromoji.js)）

ふりがな生成・分かち書きのための日本語形態素解析に使用しています。MIT License。

このフォークは、ブラウザでの動作と ES Modules 対応を目的とした派生版です。原作 [takuyaa/kuromoji.js](https://github.com/takuyaa/kuromoji.js) にも感謝します。

### IPA 辞書（IPAdic）

kuromoji.js が同梱している辞書データは、独立行政法人 情報処理推進機構（IPA）が公開している IPA 辞書を、Atilika Inc. が変換したものです。

- 配布元：[atilika/kuromoji](https://github.com/atilika/kuromoji)
- ライセンス：[mecab-ipadic ライセンス](https://github.com/atilika/kuromoji/blob/master/LICENSE-MeCab-IPADIC.md)（修正 BSD ライセンスに準ずる）
- 著作権表示：「奈良先端科学技術大学院大学情報科学研究科 ＋ 独立行政法人 情報通信研究機構」

---

## 文字認識（OCR）

### [Tesseract.js](https://github.com/naptha/tesseract.js)

カメラ・画像からの文字認識に使用しています。Apache License 2.0。

ベースとなった [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) は Google が長く支援しているオープンソースの OCR エンジンです。

### 日本語・英語学習データ

Tesseract.js は、認識実行時に Google が配布する `jpn.traineddata` / `eng.traineddata` をダウンロードして使います。Apache License 2.0 で提供されています。

---

## 読み上げ

[Web Speech API](https://developer.mozilla.org/ja/docs/Web/API/Web_Speech_API)（ブラウザ標準）を使っています。実際の音声は、ご利用の OS / ブラウザに搭載された音声合成エンジンから提供されます。

---

## フォント

ディスレクシアの方が読みやすいと感じるフォントは個人差が大きいことが研究で示されています。Yom-easy では「これが正解」とは決めず、複数の選択肢を用意しています。

| フォント | 提供元・ライセンス |
|---|---|
| BIZ UDPGothic | Morisawa Inc. / [SIL Open Font License 1.1](https://scripts.sil.org/OFL)（Google Fonts 経由） |
| Noto Sans JP | Google / SIL Open Font License 1.1（Google Fonts 経由） |
| Open Sans | Google / SIL Open Font License 1.1（Google Fonts 経由） |
| OpenDyslexic | Abelardo Gonzalez / [SIL Open Font License 1.1](https://opendyslexic.org/) |
| UD デジタル教科書体 | Morisawa Inc.（Windows / iOS / macOS に同梱されたものを利用） |
| Dyslexie Font | Christian Boer 氏が開発した商用フォント。本アプリは指定のみ行い、配布はしません。端末にインストール済みの場合のみ適用されます |
| ヒラギノ角ゴ／メイリオ／游ゴシック等 | 各 OS（macOS / Windows）同梱フォント |

---

## 配色・ハイライト関連の研究

色テーマやハイライトの選択肢は、次の研究・知見を参考に組んでいます。「効果には個人差が大きい」という結論を尊重し、押し付けない設計にしています。

- Wilkins, A. J. ら（カラーオーバーレイ研究）
- Irlen, H.（Irlen syndrome / Scotopic Sensitivity Syndrome）
- British Dyslexia Association（Dyslexia Style Guide 2018）
- Rello, L. & Baeza-Yates, R., "Good Fonts for Dyslexia" (ACM ASSETS 2013)

---

## ビルドと配信

| 道具 | ライセンス |
|---|---|
| TypeScript | Apache License 2.0 |
| Vite | MIT |
| Tailwind CSS | MIT |
| PostCSS / Autoprefixer | MIT |
| ESLint / Prettier | MIT |
| Vitest | MIT |
| GitHub Pages | GitHub によるホスティング |

`package.json` の `dependencies` / `devDependencies` がすべてです。詳しくは `npm ls` でご確認いただけます。

---

## アプリ本体

Yom-easy 本体のソースコードは MIT License です。詳細は [LICENSE](./LICENSE) を参照してください。

---

## 設計思想・コピーライティングについて

本アプリのコピーは、塾長 阿部翼（徳島国語英語専門塾つばさ）の言葉と、教育現場での観察を土台に書かれています。「治す」「がんばろう」のような押し付け系の語を避け、「読み方を見つける」「自分のペース」「ここまでできたね」といった、本人の選択を尊重する言葉を選んでいます。

参照したマイクロコピーの方針：

- NPO EDGE（日本のディスレクシア支援団体）の発信
- Made by Dyslexia（英国のキャンペーン）の言葉
- アクション言語 81 項目の対応表（塾長提供）

---

## お礼

最後に、ベータ版を試してくださっている当事者の生徒さん・保護者の方・現場の先生方に深く感謝します。みなさんの声で、このアプリは形になっていきます。

質問・指摘・要望は、GitHub の Issue からお寄せください。

[https://github.com/AbeTsubasa/yom-easy-app/issues](https://github.com/AbeTsubasa/yom-easy-app/issues)

---
title: "I_Libraries — ライブラリ実装メモ"
type: implementation
created: 2026-05-26
tags: [implementation, libraries, kuromoji, web_speech_api]
---

# I_Libraries — ライブラリ実装メモ

## 1. 日本語形態素解析：kuromoji.js

### 推奨フォーク：@sglkc/kuromoji
- 元の[takuyaa/kuromoji.js](https://github.com/takuyaa/kuromoji.js/)はメンテ停滞
- フォーク版は ES Module 対応・軽量化済み

### 用途
- 単語境界の検出（読み上げ同期ハイライト用）
- 漢字の読み（カタカナ）取得（ルビ用）
- 文節分割（チャンク改行用、v1.1）

### 注意点
- 辞書ファイル（約5MB）の遅延読み込みが必要
- 初期化に1〜2秒かかる → ローディングUI推奨

### サンプルコード（概念）
```ts
import kuromoji from '@sglkc/kuromoji';

const builder = kuromoji.builder({ dicPath: '/dict' });
builder.build((err, tokenizer) => {
  const tokens = tokenizer.tokenize('今日はいい天気です。');
  // tokens: [{surface_form, reading, ...}, ...]
});
```

## 2. ルビ生成：kuroshiro

### 用途
- 漢字→ふりがな（HTML `<ruby>` 要素）への変換
- kuromoji.js を内部利用

### サンプルコード（概念）
```ts
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

const kuroshiro = new Kuroshiro();
await kuroshiro.init(new KuromojiAnalyzer({ dictPath: '/dict' }));

const html = await kuroshiro.convert('漢字の練習', { 
  to: 'hiragana', 
  mode: 'furigana' 
});
// <ruby>漢字<rt>かんじ</rt></ruby>の<ruby>練習<rt>れんしゅう</rt></ruby>
```

### 学年別フィルタの実装
- 文部科学省「学年別漢字配当表」を参照
- 各学年で習う漢字のリストを JSON で持つ
- 対象学年より上の漢字のみルビを付与

## 3. TTS：Web Speech API

### 基本
```ts
const utterance = new SpeechSynthesisUtterance('読み上げるテキスト');
utterance.lang = 'ja-JP';
utterance.rate = 1.0;  // 0.5〜2.0
utterance.pitch = 1.0; // 0〜2
utterance.volume = 1.0; // 0〜1
speechSynthesis.speak(utterance);
```

### 単語同期ハイライト（重要）
```ts
utterance.onboundary = (event) => {
  if (event.name === 'word') {
    // event.charIndex で現在読み上げ中の文字位置を取得
    highlightWord(event.charIndex);
  }
};
```

### 日本語の注意点
- `onboundary` の word イベントは**ブラウザ実装差が大きい**
- 日本語の word boundary は不安定 → kuromoji.js でオフセット自前管理が確実
- 音声選択：`speechSynthesis.getVoices()` で取得、`lang === 'ja-JP'` でフィルタ

### 利用可能音声（OS依存）
- macOS: Kyoko、Otoya
- Windows: Haruka、Ayumi、Ichiro
- iOS / iPadOS: Kyoko
- Android: TalkBack日本語

## 4. localStorage

### 設定スキーマ案
```ts
type UserSettings = {
  font: string;           // 'UD Digi Kyokasho NK-R' etc.
  fontSize: number;       // px
  letterSpacing: number;  // em
  lineHeight: number;     // unitless
  wordSpacing: number;    // em
  paragraphSpacing: number; // em
  maxWidth: number;       // 全角字数
  backgroundColor: string; // HEX
  textColor: string;       // HEX
  rubyMode: 'off' | 'grade1' | 'grade2' | 'grade3' | 'grade4' | 'grade5' | 'grade6' | 'middle' | 'all';
  readingRulerType: 'off' | 'line_focus' | 'underline' | 'shade';
  ttsRate: number;        // 0.5〜2.0
  // ...
};
```

### キー名規約
- `dyslexia-app:settings`（Vault内全体で共有）
- 名前空間プレフィックスで他アプリと衝突回避

## 5. ファイル読込

```ts
async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file, 'UTF-8');
  });
}
```

ドラッグ＆ドロップは `dragover` / `drop` イベントで実装。

## 6. CSS 設計（参考）

CSS変数で全プロパティを管理：

```css
:root {
  --font-family: 'UD Digi Kyokasho NK-R', sans-serif;
  --font-size: 18px;
  --letter-spacing: 0.12em;
  --line-height: 1.5;
  --word-spacing: 0.16em;
  --paragraph-spacing: 2em;
  --max-width: 40em;
  --bg-color: #FDF6E3;
  --text-color: #222222;
}

.reader {
  font-family: var(--font-family);
  font-size: var(--font-size);
  letter-spacing: var(--letter-spacing);
  line-height: var(--line-height);
  word-spacing: var(--word-spacing);
  max-width: var(--max-width);
  background: var(--bg-color);
  color: var(--text-color);
  text-align: left;
}

.reader p + p {
  margin-top: var(--paragraph-spacing);
}
```

JS から `document.documentElement.style.setProperty('--font-size', '20px')` で動的更新。

## 関連

- [[I_Tech-Stack]]
- [[FT_MVP]] — 各機能の仕様
- [[A_AssistiveTech]] — Web Speech APIの研究根拠

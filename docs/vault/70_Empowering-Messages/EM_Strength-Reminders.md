---
title: "EM_Strength-Reminders — 強みリマインダー（引用集）"
type: empowering
created: 2026-05-26
tags: [empowering, strength, reminders, quotes]
---

# EM_Strength-Reminders — 強みリマインダー（引用集）

> Made by Dyslexiaの "Dyslexic Thinking is a Skill" の哲学を、アプリ内のさりげない引用として実装可能なマイクロコピーに整理。
> **必ずON/OFF切替可能・表示頻度調整可能**。押し付けないこと。

## 表示ルール

- 読了時・長時間集中後など**良い体験の後**にのみ表示
- エラー時・うまく行かなかった時には**絶対表示しない**（押し付けになる）
- 頻度：デフォルト「5回に1回」、ユーザー設定可能
- 画面の隅に控えめに、3〜5秒でフェードアウト
- 出典を必ず添える（「言いっぱなし」ではなく根拠提示）

## ⭐ Made by Dyslexia 6スキル引用集

[[V_Made-by-Dyslexia]] の6スキルから抜粋。

### Visualising（視覚的思考）
```
ディスレクシアの人の84%は
「全体像を視覚的に捉える」力が平均以上だそうです。
— Made by Dyslexia / Randstad Intelligence 5.0
```

### Imagining（想像力）
```
71%が「新しい発想を生む力」が
平均以上と評価されています。
— Made by Dyslexia / Randstad Intelligence 5.0
```

### Communicating（コミュニケーション）
```
84%が「人を引き込む話し方」が
平均以上と評価されています。
— Made by Dyslexia / Randstad Intelligence 5.0
```

### Reasoning（推論）
```
「パターンや可能性を見抜く力」は
ディスレクシック・シンキングの特徴と言われています。
— Made by Dyslexia
```

### Connecting（つなげる力）
```
点と点を結んで新しい意味を作るのが
得意な人が多いと言われています。
— Made by Dyslexia
```

### Exploring（探究心）
```
好奇心を持って深く掘り下げるのが
得意な人が多いと言われています。
— Made by Dyslexia
```

## ⭐ 著名当事者の言葉

[[V_Famous-Dyslexics]] から抜粋。

### Richard Branson
```
"Dyslexia is my superpower."
— Sir Richard Branson, Virgin創業者
```

### Keira Knightley
```
「早期診断がすべての鍵だった。」
— Keira Knightley
```

### Whoopi Goldberg
```
「ディスレクシアは私を思慮深くした。」
— Whoopi Goldberg
```

### Steven Spielberg
```
「映画を作っていなかったら、
気付かなかったかもしれない。」
— Steven Spielberg（60歳で診断）
```

### ミッツ・マングローブ
```
「慶應卒でも文字が読みにくい。
知能の問題ではないんです。」
— ミッツ・マングローブ
```

### Tom Cruise
```
「台本は音読してもらって録音で覚える。
それが自分のやり方。」
— Tom Cruise
```

## 一般的な励まし（控えめに）

引用ではなく、アプリ独自のソフトメッセージ。

```
「読みやすい」のかたちは、人それぞれ。
あなたのやり方が一番です。
```

```
今日も「自分に合う設定」で読めましたね。
```

```
ここまで読めたという事実が、
何よりの成果です。
```

```
ゆっくり読むのは、よく考えているということ。
```

## 表示テンプレート（実装イメージ）

```html
<aside class="strength-reminder" role="status" aria-live="polite">
  <p class="quote">{quote}</p>
  <p class="attribution">— {author}</p>
  <button class="dismiss" aria-label="閉じる">×</button>
  <a class="settings-link" href="#settings/reminders">
    表示頻度を変える
  </a>
</aside>
```

- 必ず**閉じるボタン**を提供
- 「表示頻度を変える」リンクを毎回提示
- 連続して同じ引用は出さない（最低10回間隔）

## ON/OFF・頻度設定

設定画面で以下を提供：

```
強みリマインダー
    ON / OFF

頻度
    [毎回] [3回に1回] [5回に1回（推奨）] [10回に1回] [週1回]

表示する引用
    ☑ Made by Dyslexia 6スキル
    ☑ 著名当事者の言葉
    ☑ アプリからの励まし
```

> ユーザーが「全部OFF」も選べることが重要。

## 関連

- [[EM_Celebration-Moments]] — 表示タイミング
- [[V_Made-by-Dyslexia]] — 6スキルの根拠
- [[V_Famous-Dyslexics]] — 引用元
- [[EM_Tone-Principles]] — トーン規約

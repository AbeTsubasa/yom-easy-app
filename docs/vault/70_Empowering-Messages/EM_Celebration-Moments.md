---
title: "EM_Celebration-Moments — 小さな成功の演出"
type: empowering
created: 2026-05-26
tags: [empowering, celebration, motivation]
---

# EM_Celebration-Moments — 小さな成功の演出

> 「派手な祝福」は避けつつ、**さりげなく事実を認める瞬間**を埋め込む。
> 「読めた」「設定が見つかった」「使い続けている」という体験を、本人の自己肯定感に静かに繋げる。

## 設計原則

- 🎉🎊🌟 のような**大袈裟な絵文字は使わない**
- 「すごい！」「素晴らしい！」「天才！」式の評価**は使わない**
- **事実ベース**：時間、量、回数、変化を淡々と
- **控えめな表示**：画面の隅、フェードイン、3〜5秒で消える
- **ON/OFF可能**：「祝福を表示する」をユーザーが切れる
- **頻度を抑える**：頻繁に出すと押し付けがましい

## マイルストーン別文言

### 初回読了
```
✓ 最後まで読めました
   〇〇字 / 〇〇分
```
> 数字＝事実。評価語なし。

### 設定が決まった
```
✓ あなたの設定が見つかりました
   いつでもサイドメニューから変えられます
```

### 5回目の利用
```
（控えめに小さく）

5回目の利用ですね。
お疲れさまでした。
```
> 「お疲れさまでした」が大切。「がんばりましたね」ではない。

### 1週間継続
```
1週間使ってくれてありがとう。

これまで合計〇〇字を読んだそうです。
```
> 「ありがとう」がアプリ側からの感謝。生徒を「評価」する立場に立たない。

### 30分集中
```
30分集中できたみたい。
休憩しませんか？
```
> 「すごい！」ではなく「休憩しませんか？」。健康面の気遣い。

## ⭐ さりげない「強みリマインダー」（オプション）

読了時にときどき表示（頻度：5回に1回程度、ユーザーがOFFも可能）。

詳細は [[EM_Strength-Reminders]]。

```
✓ 最後まで読めました

    *  *  *

「Dyslexia is my superpower.」
— Richard Branson, Virgin創業者
```

```
✓ 最後まで読めました

    *  *  *

ディスレクシアの人の84%は
「視覚的な発想」が平均以上だそうです。
（Made by Dyslexia / Randstad）
```

## 演出のCSS例（参考）

控えめなフェードイン、3秒後にフェードアウト：

```css
.celebration {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(245, 245, 220, 0.95);
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  opacity: 0;
  animation: fadeInOut 4s ease forwards;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(20px); }
  20% { opacity: 1; transform: translateY(0); }
  80% { opacity: 1; }
  100% { opacity: 0; }
}
```

> パッと出てサッと消える。視界に長居しない。

## やってはいけない演出

| ❌ | 理由 |
|---|---|
| 大きなコンフェッティ・花火 | 子どもっぽい・押し付け |
| 「Level Up!」「Achievement Unlocked!」 | ゲーミフィケーション過剰、評価フレーム |
| 「100点満点！」「パーフェクト！」 | 評価語、上下関係 |
| ポップアップで全画面を覆う | 邪魔・押し付け |
| 強制的なシェアボタン（「友達にシェア！」） | プライバシー侵害 |
| バッジ・スター・トロフィー | 子ども扱い、評価フレーム |

## 関連

- [[EM_Design-Principles]]
- [[EM_Tone-Principles]]
- [[EM_Strength-Reminders]]
- [[V_Made-by-Dyslexia]]

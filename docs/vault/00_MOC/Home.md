---
title: "🏠 Home — ディスレクシア支援ウェブアプリ Vault"
type: MOC
created: 2026-05-26
updated: 2026-05-26
tags: [MOC, home]
---

# 🏠 Home — ディスレクシア支援ウェブアプリ Vault

> **このVaultの目的**
> ディスレクシア（読み書き困難）の生徒が「自分に合う読み方」をカスタマイズできるウェブアプリを開発するための、研究・現場・当事者の声・心理学を体系化した知識ベース。Phase 1-A／1-B／1-C ＋ Phase 2 の統合版。

## ⭐ Claude Code への引き継ぎ

**実装フェーズに進む場合、まず以下のファイルを順番に読んでください**：

1. **[[HANDOFF]]** — プロジェクト引き継ぎ文書（全体把握）
2. **[[CLAUDE]]** — コーディング規約・トーン規約
3. **[[FT_MVP]]** — MVP仕様
4. **[[FT_OCR]]** — OCR機能仕様
5. **[[I_First-Sprint-Tasks]]** — Sprint 1のタスクリスト
6. **[[I_Initial-Setup]]** — 初日セットアップ手順

## このVaultの使い方

1. **[[Research-MOC]]** から学術・公的ガイドラインを参照
2. **[[Field-MOC]]** で日本の学校現場の実践事例を確認
3. **[[Voice-MOC]]** で当事者・保護者・支援者の声を理解
4. **[[Tools-MOC]]** で既存ツールの調査・空白領域を把握
5. **[[Features-MOC]]** でMVP仕様にアクセス
6. **[[Empowering-Messages-MOC]]** で生徒に届ける声かけUI/UXを設計
7. **[[Teacher-Learning-MOC]]** で講師向け学習コンテンツを構築

## 全体マップ

```
Dyslexia-Support-App-Vault/
├── HANDOFF.md             ⭐ Claude Codeへの引き継ぎ
├── CLAUDE.md              ⭐ プロジェクト持続メモリ
├── README.md              Vault概要
│
├── 00_MOC/                目次群
├── 10_Research/           Phase 1-A 学術エビデンス（5）
├── 20_Field/              Phase 1-B 学校現場（5）
├── 30_Voice/              Phase 1-B 当事者の声（5）
├── 40_Tools/              Phase 1-B 既存ツール（4）
├── 50_Features/           機能仕様（4: MVP / v1.1 / Future / OCR）
├── 60_Implementation/     実装メモ（5）
├── 70_Empowering-Messages/ ★差別化軸① 声かけUI/UX（10）
├── 80_Teacher-Learning/   ★差別化軸② 講師学習M1-M12（13）
├── 90_Templates/          ノートテンプレート（5）
└── 99_Source-Docs/        原典 Phase 1-A/1-B/1-C（3）
```

## 核心となる5つの設計原則

1. **個人差を前提に「選べる」UIへ** — 単一の最適解は存在しない（[[L_Layout|Zorzi 2012]]、[[A_AssistiveTech|CHI 2023]]）
2. **デフォルトはWCAG AAAを上回る安全値で出荷**（[[G_Guidelines|WCAG 1.4.12]]）
3. **「治す」フレーミング絶対回避、「活かす／合う方法を選ぶ」へ**（[[EM_Tone-Principles]]、[[V_Made-by-Dyslexia]]）
4. **「特別扱いに見えない」UI**（[[F_Schools|東京学芸大附属小金井小学校の実践]]）
5. **講師も育つアプリ**（[[80_Teacher-Learning/Curriculum-Outline|Teacher Learning Curriculum M1-M12]]）

## 重要キーパーソン・団体

- **藤堂栄子**（NPO EDGE 会長）— 「ディスレクシアが活きる社会」
- **中邑賢龍**（東大先端研）— DO-IT Japan、ROCKET、LEARN
- **奥村智人**（大阪医科薬科大学LDセンター）— UDフォント研究、CARD検査
- **鈴木秀樹**（東京学芸大附属小金井小）— 通常学級1人1台ICTの先駆実践
- **Kate Griggs & Richard Branson**（Made by Dyslexia）— "Dyslexic Thinking is a Skill"
- **Luz Rello**（DysWebxia研究者）— ウェブテキスト最適化の査読研究多数
- **中田洋二郎**（早稲田）— 螺旋形モデル（告知心理学）
- **亀岡智美**（兵庫県こころのケアセンター）— トラウマインフォームドケア日本導入

## ⭐ 開発フェーズの全体像

```
Phase 1-A (学術リサーチ)  ✅ 完了
   ↓
Phase 1-B (現場・当事者・既存ツール)  ✅ 完了
   ↓
Phase 1-C (心理学リサーチ)  ✅ 完了
   ↓
Phase 2 (Obsidian Vault構築)  ✅ 完了 ← 現在地
   ↓
Phase 3 (MVPウェブアプリ実装)  ← Claude Code で次へ
   ├─ Sprint 0: セットアップ
   ├─ Sprint 1: 視認性 MVP
   ├─ Sprint 2: 読み上げ＋同期ハイライト
   ├─ Sprint 3: ルビ＋分かち書き
   ├─ Sprint 4: Reading Ruler＋蛍光マーカー
   ├─ Sprint 5: 🆕 OCR（カメラ撮影）
   └─ Sprint 6: 出力＋仕上げ
   ↓
Phase 4 (当事者テスト＋公開)
```

## 関連ソース

- [[Phase1A_Research_Notes|99_Source-Docs/Phase1A_Research_Notes]]
- [[Phase1B_Research_Notes|99_Source-Docs/Phase1B_Research_Notes]]
- [[Phase1C_Psychology_Notes|99_Source-Docs/Phase1C_Psychology_Notes]]

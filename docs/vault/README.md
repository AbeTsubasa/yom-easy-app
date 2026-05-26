# Dyslexia-Support-App-Vault

ディスレクシア（読み書き困難）の生徒が「自分に合う読み方」をカスタマイズできるウェブアプリの**設計・実装ナレッジベース**。
Obsidian Vault としてそのまま開ける Markdown ファイル群です。

**Phase 1-A（学術エビデンス）＋ Phase 1-B（現場・当事者・既存ツール）＋ Phase 1-C（心理学に基づく声かけ・対話）＋ Phase 2（Vault構築）＋ Claude Code 引き継ぎ文書** を統合した知識体系。

---

## ⭐ Claude Code 引き継ぎ用

**実装フェーズに進む場合、まず以下のファイルを順番に読んでください**：

1. **HANDOFF.md** — プロジェクト引き継ぎ文書
2. **CLAUDE.md** — コーディング規約・トーン規約
3. **50_Features/FT_MVP.md** — MVP仕様
4. **50_Features/FT_OCR.md** — OCR機能仕様（MVPに含む）
5. **60_Implementation/I_First-Sprint-Tasks.md** — Sprint 1のタスクリスト
6. **60_Implementation/I_Initial-Setup.md** — 初日セットアップ手順

---

## 使い方

1. このフォルダを丸ごと Obsidian の Vault として開く
2. **00_MOC/Home.md** から各MOC（Map of Content）へ
3. `[[ノート名]]` 形式の内部リンクをクリックして探索
4. 必要に応じて `90_Templates/` のテンプレートで新規ノートを作成

Obsidianがない場合：VS Code、Typora、各種Markdownビューアでも基本的に閲覧可能。

---

## フォルダ構成

```
Dyslexia-Support-App-Vault/
├── HANDOFF.md                ⭐ Claude Codeへの引き継ぎ文書
├── CLAUDE.md                 ⭐ プロジェクト持続メモリ
├── README.md                 このファイル
│
├── 00_MOC/                   目次（8ファイル）
│   ├── Home.md
│   ├── Research-MOC.md
│   ├── Field-MOC.md
│   ├── Voice-MOC.md
│   ├── Tools-MOC.md
│   ├── Features-MOC.md
│   ├── Empowering-Messages-MOC.md  ★差別化軸①
│   └── Teacher-Learning-MOC.md     ★差別化軸②
│
├── 10_Research/              Phase 1-A 学術エビデンス（5）
│
├── 20_Field/                 Phase 1-B 学校現場（5）
│
├── 30_Voice/                 Phase 1-B 当事者の声（5）
│
├── 40_Tools/                 Phase 1-B 既存ツール（4）
│
├── 50_Features/              機能仕様（4）
│   ├── FT_MVP.md             MVP（v1.0）— OCR含む
│   ├── FT_OCR.md             🆕 OCR詳細仕様
│   ├── FT_v1_1-Roadmap.md    v1.1拡張
│   └── FT_Future.md          v2以降
│
├── 60_Implementation/        実装メモ（5）
│   ├── I_Tech-Stack.md
│   ├── I_Libraries.md
│   ├── I_OCR-Library.md      🆕 Tesseract.js実装メモ
│   ├── I_Initial-Setup.md    🆕 Sprint 0手順
│   ├── I_First-Sprint-Tasks.md  🆕 Sprint 1-6タスク
│   └── I_User-Testing.md
│
├── 70_Empowering-Messages/   ★差別化軸① 生徒への声かけUI/UX（10）
│
├── 80_Teacher-Learning/      ★差別化軸② 講師向け学習M1-M12（13）
│
├── 90_Templates/             新規ノート用テンプレート（5）
│
└── 99_Source-Docs/           原典 Phase 1-A/1-B/1-C（3）
```

## ノート総数

| カテゴリ | ファイル数 |
|---|---|
| トップレベル（HANDOFF, CLAUDE, README） | 3 |
| MOC | 8 |
| Research（学術） | 5 |
| Field（現場） | 5 |
| Voice（当事者の声） | 5 |
| Tools（既存ツール） | 4 |
| Features（機能仕様） | 4 |
| Implementation（実装） | 6 |
| **Empowering Messages（声かけ）** | **10** ★差別化軸① |
| **Teacher Learning（講師学習）** | **13** ★差別化軸② |
| Templates | 5 |
| Source Docs（原典） | 3 |
| **合計** | **71** |

## ⭐ 5つの設計原則

1. **個人差を前提に「選べる」UIへ**
2. **デフォルトはWCAG AAAを上回る安全値で出荷**
3. **「治す」フレーミング絶対回避、「活かす／合う方法を選ぶ」へ**
4. **「特別扱いに見えない」UI**
5. **講師も育つアプリ** — 心理学に裏付けされた12モジュール

## Phase 履歴

- **Phase 1-A**：査読論文・公的ガイドラインの本格調査（フォント・レイアウト・色・支援技術）
- **Phase 1-B**：学校現場・当事者・既存ツールの調査
- **Phase 1-C**：心理学（告知・受験生メンタル・動機づけ・トラウマ・対話技法）の徹底調査
- **Phase 2**：Obsidian Vault として体系化
- **Phase 2.5**：Claude Code への引き継ぎ文書整備＋OCR仕様確定
- **Phase 3（次）**：Claude Code でのMVP実装（6〜7週間）
- **Phase 4**：当事者テスト＆公開

## ライセンス・利用について

- 本Vaultは個人利用・教育目的での共有を想定
- 引用論文・公式ガイドラインは各出典のライセンスに従う
- マイクロコピー・カリキュラム文書は適宜改変・再利用可

## 更新履歴

- 2026-05-26 v1.0：Phase 1-A／1-B 統合（54ファイル）
- 2026-05-26 v1.1：Phase 1-C（心理学）統合（64ファイル、+10）
- 2026-05-26 v1.2：Claude Code 引き継ぎ文書＋OCR仕様確定（71ファイル、+5＋更新6）

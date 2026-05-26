# 🚀 QUICKSTART — このプロジェクトの始め方

> **3ステップで Claude Code を起動するまでの手順書。**
> 開発者でなくても迷わず進めるよう、コピー＆ペーストできるコマンドを揃えています。

---

## このフォルダの構造

zipを展開すると以下のような構造になっています：

```
yomu-project/
├── QUICKSTART.md       ← このファイル
├── HANDOFF.md          ⭐ プロジェクト全体（Claude Code が最初に読む）
├── .claude/
│   └── CLAUDE.md       ⭐ コーディング規約（Claude Code が毎回参照）
└── docs/
    └── vault/          ← Obsidian Vault（71ファイルの知識ベース）
        ├── 00_MOC/
        ├── 10_Research/
        ├── 50_Features/
        │   ├── FT_MVP.md       ⭐ MVP仕様
        │   └── FT_OCR.md       ⭐ OCR仕様
        ├── 60_Implementation/
        │   ├── I_First-Sprint-Tasks.md   ⭐ Sprint 1のタスク
        │   └── I_Initial-Setup.md        ⭐ 初日セットアップ
        └── ...
```

---

## Step 1：プロジェクトフォルダを置く場所を決める

zipを展開した `yomu-project/` フォルダを、好きな場所に置きます。

**推奨**：
- `~/塾アプリ/yomu-project/`（既に塾アプリフォルダがある場合）
- `~/Projects/yomu-project/`（一般的）
- `~/Desktop/yomu-project/`（とりあえず試したい場合）

**Finderで操作**：
1. ダウンロードした `yomu-project.zip` をダブルクリック → 展開される
2. 展開された `yomu-project/` フォルダを上記のいずれかに移動

---

## Step 2：Terminal を開いてプロジェクトフォルダに移動

### Terminal の開き方
- `Cmd + Space` で Spotlight 検索
- 「ターミナル」と打って Enter

### プロジェクトフォルダに移動するコマンド

以下のいずれかを **コピーして Terminal に貼り付け** → Enter：

```bash
# 推奨：塾アプリフォルダに置いた場合
cd ~/塾アプリ/yomu-project

# またはProjectsフォルダ
cd ~/Projects/yomu-project

# またはDesktop
cd ~/Desktop/yomu-project
```

### 確認

```bash
# このフォルダにいることを確認
pwd

# ファイルが揃っているか確認（HANDOFF.md と docs/ が表示されればOK）
ls
```

`HANDOFF.md`、`.claude/`、`docs/` が表示されれば成功です。

---

## Step 3：Claude Code を起動して、プロンプトを貼り付ける

### Claude Code をまだインストールしていない場合

```bash
# Node.js が入っていなければ先にインストール
# 公式：https://nodejs.org/

# Claude Code のインストール
npm install -g @anthropic-ai/claude-code
```

### Claude Code を起動

```bash
claude
```

初回は API キーの設定が必要です（画面の案内に従ってください）。

### ⭐ 起動したら、以下のプロンプトをそのまま貼り付け

```
このプロジェクトを引き継ぎます。

まず以下を順番に読んでください：
1. ./HANDOFF.md（プロジェクト全体）
2. ./.claude/CLAUDE.md（コーディング規約・トーン規約）
3. ./docs/vault/50_Features/FT_MVP.md（MVP仕様）
4. ./docs/vault/50_Features/FT_OCR.md（OCR仕様）
5. ./docs/vault/60_Implementation/I_First-Sprint-Tasks.md（Sprint 1タスク）
6. ./docs/vault/60_Implementation/I_Initial-Setup.md（初日セットアップ）

読み終わったら、Sprint 0（セットアップ）から始めましょう。

ただし、何かコードを書く前に：
- 「治す」フレーミング回避
- 「特別扱いに見えない」UI
- 個人情報非収集
- WCAG AAA デフォルト

の4原則を必ず守ってください。具体的なNG/OKは docs/vault/70_Empowering-Messages/EM_Tone-Principles.md にあります。
```

---

## トラブルシューティング

### 「Claude Code がファイルを見つけられない」と言われた

```bash
# プロジェクトフォルダに正しくいるか確認
pwd
# /Users/AbeTsubasa/塾アプリ/yomu-project のように表示されるはず

# ファイルが揃っているか確認
ls -la
# HANDOFF.md, .claude, docs が表示されるはず

# .claude/CLAUDE.md が見えるか
ls .claude/

# docs/vault/ の中身
ls docs/vault/50_Features/
```

すべてOKなら、もう一度 `claude` を実行してください。

### 「claude コマンドが見つかりません」と言われた

Claude Code がインストールされていないか、PATH が通っていません：

```bash
# インストール状態確認
which claude

# 何も表示されなければ未インストール → 以下でインストール
npm install -g @anthropic-ai/claude-code
```

### Node.js / npm がない

公式から最新版をダウンロード：
- https://nodejs.org/

インストール後、Terminal を一度閉じて開き直してから再試行。

### それでもうまく行かない

Cowork（私）に戻って、エラーメッセージをそのまま教えてください。一緒に解決します。

---

## このプロジェクトについて（30秒サマリー）

ディスレクシア（読み書き困難）の生徒のための、ブラウザで即起動・登録不要・無料のテキスト視認性カスタマイズウェブアプリ。

カメラで撮影 → OCR → 自分に合うフォント・色・行間で表示 → 読み上げ＋ふりがな付与 までを統合。

**詳細はすべて HANDOFF.md と docs/vault/ にあります。Claude Code がそれらを読み込んで、Sprint 0 のセットアップから順番に進めてくれます。**

---

## 進捗の見える化（参考）

```
Sprint 0：セットアップ（半日） ← Claude Code がまず取り組む
   ↓
Sprint 1：視認性 MVP（1週間）
   ↓
Sprint 2：読み上げ＋同期ハイライト（1週間）
   ↓
Sprint 3：ルビ＋分かち書き（1週間）
   ↓
Sprint 4：Reading Ruler＋蛍光マーカー（1週間）
   ↓
Sprint 5：🆕 OCR カメラ撮影（1〜2週間）
   ↓
Sprint 6：出力＋仕上げ（1週間）
   ↓
Phase 4：当事者テスト＆10月のディスレクシア月間で公開
```

合計：**約6〜7週間でMVP公開可能な状態**。

---

困った時はいつでも Cowork（私）に戻ってきてください。Vault と心理学根拠を引きながら、実装中の判断もご一緒に進められます。

# Google Forms を Apps Script で 1 分で作る

[FEEDBACK_FORM_TEMPLATE.md](./FEEDBACK_FORM_TEMPLATE.md) と完全一致するフォームを、塾長の Google アカウントに自動で作るためのスクリプトです。

1 度実行するだけで、5 つの質問・選択肢・案内文・確認メッセージすべてが整った Google Forms が、塾長の Drive に生まれます。塾長は URL をコピーして [src/config/beta.ts](../../src/config/beta.ts) に貼るだけで、アプリ内のフィードバックボタンが有効になります。

---

## このスクリプトが「やる」こと・「やらない」こと

### やること（=承認する権限の範囲）

- 塾長の Google Drive に、新しい Google Forms を 1 つ作る
- そのフォームのタイトル・説明・質問・選択肢を設定する
- 完了したら、回答用 URL と編集用 URL をログに出す

### やらないこと（安全性）

- メールを 1 通も送りません
- 既存のファイル・フォルダを一切触りません（削除も上書きもしません）
- 塾長の Drive の他のファイルを覗きません
- 外部のサーバーに何も送信しません
- 個人情報を集めません
- 一度実行したあとは何も自動実行されません

スクリプトのコードは下に全文掲載しています。実行前に中身を読んでいただいて構いません。

---

## 手順（所要 1〜2 分）

### 1. ブラウザで Apps Script を開く

[script.google.com](https://script.google.com) を開きます。
塾長の Google アカウントで自動的にログインされるはず。

### 2. 新しいプロジェクトを作る

画面左上の「+ 新しいプロジェクト」をクリック。

### 3. 既存のコードを全部消して、下のスクリプトを貼る

画面中央のコードエリアに `function myFunction() { }` のような雛形が表示されています。
**全部選択して削除**してから、このページの **下にある全コード**（"スクリプト本体" セクション）をそのまま貼り付けてください。

### 4. プロジェクトに名前を付ける（任意）

画面上部の「無題のプロジェクト」を「Yom-easy フィードバックフォーム作成」などに書き換えると、あとから探しやすくなります。

### 5. ▶ 実行を押す

画面上部の **「▶ 実行」** ボタンをクリック。
（横にある「デバッグ」と間違えないでください。緑色の三角ボタンが「実行」です）

### 6. 権限を承認

初回だけ、こんな画面が出ます：

1. 「承認が必要です」→ **承認をクリック**
2. アカウント選択画面 → 塾長の Google アカウントを選ぶ
3. **「Google が確認していません」** という警告が出るかもしれません  
   → 「**詳細**」をクリック → 一番下の「**安全でない（プロジェクト名）に移動**」をクリック  
   ※これは「ご自分で書いた／信頼するスクリプトを実行する」ときの一般的な経路です。Google は他人が書いたスクリプトを念のため警告する仕様で、塾長ご自身が手動で承認することで通せます
4. 「**このプロジェクトが Google アカウントへのアクセスを必要としています**」  
   → 必要な権限：**「Google フォームを表示および管理する」のみ**  
   → 「**許可**」をクリック

### 7. 実行完了 → URL をコピー

画面の下に「実行ログ」が出ます（出ていなければ画面下の「実行ログ」タブをクリック）。

```
=== フォーム作成完了 ===
テスターさんに渡す URL（回答用）:
https://docs.google.com/forms/d/e/.../viewform

塾長が編集する URL:
https://docs.google.com/forms/d/.../edit

src/config/beta.ts に貼り付ける 1 行:
BETA_FEEDBACK_FORM_URL = 'https://docs.google.com/forms/d/e/.../viewform';
```

この **「テスターさんに渡す URL（回答用）」** をコピーします。

### 8. アプリに反映

[src/config/beta.ts](../../src/config/beta.ts) を開いて、下の行を：

```ts
export const BETA_FEEDBACK_FORM_URL = '';
```

こう書き換えます：

```ts
export const BETA_FEEDBACK_FORM_URL = 'https://docs.google.com/forms/d/e/.../viewform';
```

push すれば、~40 秒後にアプリ内の「💌 テスターさんへ」モーダルに **「📝 フィードバックフォームを開く」** ボタンが現れます。

---

## スクリプト本体（コピペ用）

ここから↓を、Apps Script のコードエリアに丸ごと貼ってください。

```javascript
/**
 * Yom-easy ベータ版フィードバックフォーム作成スクリプト
 *
 * 実行すると：
 *   1) 新しい Google Forms を塾長の Drive に作成
 *   2) 5 つの質問・選択肢・案内文・確認メッセージを設定
 *   3) フォーム URL を実行ログに出力
 *
 * 何度実行しても新しいフォームが作られます（既存は触らない）。
 * いらないフォームができたら、Drive から削除してください。
 */
function createYomEasyFeedbackForm() {
  // フォーム本体を作成
  var form = FormApp.create('Yom-easy を試していただきありがとうございます');

  // フォーム冒頭の説明文
  form.setDescription(
    '試してくださってありがとうございます。\n\n' +
    'このフォームは、Yom-easy をもっと使いやすくするための声を集めるためのものです。\n' +
    '答えなくて大丈夫な項目もあります。書きたいことだけ、書きたい分だけ書いてください。\n\n' +
    '「合わなかった」「使いづらかった」は、ありがたい声です。\n' +
    'そのまま書いていただいて大丈夫です。\n\n' +
    'メールアドレスやお名前は集めません。すべて匿名で受け取ります。'
  );

  // フォームの基本設定
  form.setCollectEmail(false);              // 匿名（メール収集 OFF）
  form.setLimitOneResponsePerUser(false);   // 何度でも回答可
  form.setProgressBar(false);               // 5 問だけなので進捗バー不要
  form.setShowLinkToRespondAgain(true);     // 送信後にもう一度回答するリンクを出す
  form.setAcceptingResponses(true);         // 回答受付 ON

  // 送信後の確認メッセージ
  form.setConfirmationMessage(
    'ありがとうございました。\n\n' +
    'ここで集めた声は、私（塾長）が一つひとつ拝見し、次の改良に活かします。\n' +
    'すぐに改良できるとは限りませんが、必ず読みます。\n\n' +
    '体験のあとに、もし辛い気持ちが残ったら、\n' +
    '無理せず画面を閉じて、お茶でも飲んでください。\n\n' +
    '塾長 阿部翼'
  );

  // ===== Q1：5 段階 + 答えたくない =====
  var q1 = form.addMultipleChoiceItem();
  q1.setTitle('Q1. 試してみて、目（や頭）はどうでしたか？');
  q1.setRequired(false);
  q1.setChoices([
    q1.createChoice('とても楽になった'),
    q1.createChoice('少し楽になった'),
    q1.createChoice('変わらない'),
    q1.createChoice('少し疲れた'),
    q1.createChoice('とても疲れた'),
    q1.createChoice('分からない／答えたくない'),
  ]);

  // ===== Q2：複数選択 =====
  var q2 = form.addCheckboxItem();
  q2.setTitle('Q2. うれしかった機能、合っていた設定はありますか？（いくつでも）');
  q2.setRequired(false);
  q2.setChoices([
    q2.createChoice('フォントを変えられたこと（UD 教科書体・Open Sans など）'),
    q2.createChoice('文字の大きさ・字間・行間・行幅を変えられたこと'),
    q2.createChoice('背景や文字の色を変えられたこと'),
    q2.createChoice('行ハイライト（1 行ごと／全行）'),
    q2.createChoice('段落フォーカス（読んでいる段落以外を薄める）'),
    q2.createChoice('ふりがな'),
    q2.createChoice('分かち書き'),
    q2.createChoice('文節改行'),
    q2.createChoice('読み上げ'),
    q2.createChoice('設定の共有 URL'),
    q2.createChoice('カメラで撮って文字を読み取る機能'),
    q2.createChoice('どれも特に合わなかった'),
    q2.createChoice('分からない'),
  ]);

  // ===== Q3：自由記述（困った瞬間） =====
  var q3 = form.addParagraphTextItem();
  q3.setTitle('Q3. 困った瞬間、引っかかった瞬間はありましたか？');
  q3.setHelpText(
    '例：どこから触ればいいか迷った／◯◯ の機能を ON にしたら見にくくなった／' +
    'ボタンの場所が分かりにくかった／スマホでうまく表示されなかった／' +
    '◯◯ の言葉が分かりにくかった など、思いついたことを、どんなことでも教えてください。'
  );
  q3.setRequired(false);

  // ===== Q4：自由記述（要望） =====
  var q4 = form.addParagraphTextItem();
  q4.setTitle('Q4. 「こうだったらいいのに」と思うことはありますか？');
  q4.setHelpText(
    'こんな機能があったら、もっと使いたい、もっと楽になるかも、というアイデアがあったら教えてください。' +
    '（実現できるかは別ですが、声はすべて見させていただきます）'
  );
  q4.setRequired(false);

  // ===== Q5：自由欄 =====
  var q5 = form.addParagraphTextItem();
  q5.setTitle('Q5. 自由欄');
  q5.setHelpText(
    'ここまでに書ききれなかったこと、感想、励まし、苦情、何でも。' +
    '書きたくなければ空欄で大丈夫です。'
  );
  q5.setRequired(false);

  // ===== URL を実行ログに出力 =====
  var publishedUrl = form.getPublishedUrl();
  var editUrl = form.getEditUrl();

  Logger.log('=== フォーム作成完了 ===');
  Logger.log('テスターさんに渡す URL（回答用）:');
  Logger.log(publishedUrl);
  Logger.log('');
  Logger.log('塾長が編集する URL:');
  Logger.log(editUrl);
  Logger.log('');
  Logger.log("src/config/beta.ts に貼り付ける 1 行:");
  Logger.log("BETA_FEEDBACK_FORM_URL = '" + publishedUrl + "';");
}
```

---

## よくある質問

### Q. もう一度実行したらどうなりますか？

新しいフォームが**もう 1 つ**作られます（既存のは消えません）。
古いフォームが要らなくなったら、塾長の Google Drive から手動で削除してください。

### Q. 質問を後で変えたくなったら？

2 つの方法があります：

1. **Google Forms の編集画面で直接変える**（編集用 URL から開く）
2. このスクリプトの該当行を変えて、再実行 → 新しいフォームが生まれる（古い方は削除）

### Q. 回答が誰から来たか分かりますか？

分かりません。メールアドレス収集を OFF にしてあるので、すべて匿名です。
代わりに、回答が来たタイミング（タイムスタンプ）と内容だけが残ります。

### Q. 回答はどこに溜まりますか？

フォームの「**回答**」タブで見られます。CSV としてダウンロードすることも、Google スプレッドシートに連携することもできます（編集画面の「回答」タブから設定可能）。

### Q. 回答数が多くなって管理しきれないときは？

最初の 1 ヶ月くらいは多くないはずです。月 1 回まとめて見れば十分。
あふれそうになったら、その時に [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) の運用方針を見直しましょう。

---

## 関連ドキュメント

- [FEEDBACK_FORM_TEMPLATE.md](./FEEDBACK_FORM_TEMPLATE.md) — フォーム内容の元設計
- [BETA_TESTERS.md](./BETA_TESTERS.md) — テスターさんへの案内文
- [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) — 公開フェーズの確認項目
- [../../src/config/beta.ts](../../src/config/beta.ts) — フォーム URL をここに貼る

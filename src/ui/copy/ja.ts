// マイクロコピーは EM_Tone-Principles に準拠。
// 「治す」「がんばろう」「すごい」などの押し付け系・医療系の語を含めない。

export const copy = {
  app: {
    name: 'Yom-easy',
    tagline: 'あなたに合う読み方を見つけるツール',
    intro: '文字を、あなたに合う見え方に変えてみませんか。',
    placeholder:
      'これから、フォントや色、ふりがな、読み上げなど、自分にぴったり合う読み方を一緒に見つけていきます。',
  },
  modes: {
    edit: '入力',
    read: '読む',
    editAria: 'テキストを入力するモードに切り替える',
    readAria: '入力したテキストを読みやすく表示するモードに切り替える',
  },
  reader: {
    textareaLabel: '読みたい文章',
    textareaPlaceholder:
      'ここに、読みたい文章を貼り付けるか、書いてください。\nファイルを開いたり、画面にファイルをドラッグして読み込むこともできます。',
    emptyReadView: '読みたい文章が、まだありません。\n「入力」に切り替えて、貼り付けるか、ファイルを開いてみてください。',
    charCount: (n: number) => `${n} 文字`,
  },
  actions: {
    paste: 'テキストを貼り付ける',
    openFile: 'ファイルを開く',
    openFileAria: 'テキストファイル（.txt / .md）を開く',
    capture: 'カメラで撮影',
    read: '読み上げる',
    pause: '一時停止',
    resume: '再開',
    save: '今の設定を保存',
    share: 'この設定を共有',
    print: '印刷する',
    clear: '入力欄を空にする',
  },
  hints: {
    quietSave: '設定はこの端末の中だけに保存されます。',
    noLogin: '登録もログインも必要ありません。',
    pickWhatFits: '読みやすい方を選んでみてください。',
    typoOnOcr: '間違いがあれば直してね。',
    dropToOpen: 'ここにファイルを置くと開けます',
    acceptedTypes: '対応形式：.txt / .md（テキストファイル）',
  },
  errors: {
    fileUnreadable: 'このファイル、うまく読み込めなかったみたい。別の方法を試してみよう。',
    fileTooLarge: 'ファイルが少し大きすぎるみたい。短めの文章で試してみよう。',
    fileWrongType: 'このファイル形式は、まだ対応していません。.txt か .md のファイルだと開けます。',
    emptyText: '読みたい文章を貼り付けるか、ファイルを開いてください。',
    cameraDenied: 'カメラが使えないみたい。ファイルから選ぶこともできます。',
    ocrEmpty: '文字が見つからなかったみたい。明るいところで、もう一度撮ってみよう。',
  },
} as const;

export type Copy = typeof copy;

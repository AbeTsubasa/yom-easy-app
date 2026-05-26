// マイクロコピーは EM_Tone-Principles に準拠。
// 「治す」「がんばろう」「すごい」などの押し付け系・医療系の語を含めない。

export const copy = {
  app: {
    name: 'Yom-easy',
    intro: '文字を、あなたに合う見え方に変えてみませんか。',
    placeholder:
      'これから、フォントや色、ふりがな、読み上げなど、自分にぴったり合う読み方を一緒に見つけていきます。',
  },
  onboarding: {
    welcome: 'ようこそ。',
    subtitle: '読みやすさのかたちは、人それぞれ。あなたに合う読み方を見つけられます。',
    cta: '続ける',
    skip: '今すぐ使う',
    note: 'あとからいつでも変えられます。',
  },
  actions: {
    paste: 'テキストを貼り付ける',
    openFile: 'ファイルを開く',
    capture: 'カメラで撮影',
    read: '読み上げる',
    pause: '一時停止',
    resume: '再開',
    save: '今の設定を保存',
    share: 'この設定を共有',
    print: '印刷する',
  },
  hints: {
    quietSave: '設定はこの端末の中だけに保存されます。',
    noLogin: '登録もログインも必要ありません。',
    pickWhatFits: '読みやすい方を選んでみてください。',
    typoOnOcr: '間違いがあれば直してね。',
  },
  errors: {
    fileUnreadable: 'このファイル、うまく読み込めなかったみたい。別の方法を試してみよう。',
    emptyText: '読みたい文章を貼り付けるか、ファイルを開いてください。',
    cameraDenied: 'カメラが使えないみたい。ファイルから選ぶこともできます。',
    ocrEmpty: '文字が見つからなかったみたい。明るいところで、もう一度撮ってみよう。',
  },
} as const;

export type Copy = typeof copy;

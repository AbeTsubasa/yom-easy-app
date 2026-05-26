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
  editToggle: {
    open: '✏ 編集する',
    openAria: 'テキストを編集するためのエディタを開く',
    close: '読みに戻る',
    closeAria: 'エディタを閉じて読みに戻る',
  },
  emptyState: {
    title: '読みたい文章を、はじめましょう',
    body: '下のボタンからテキストを貼り付けるか、ファイルを開いてください。設定はあとからいつでも変えられます。',
    paste: '✏ テキストを貼り付ける',
    openFile: '📁 ファイルを開く',
  },
  drawer: {
    openLabel: '⚙ 設定',
    openAria: '設定パネルを開く',
    closeLabel: '✕',
    closeAria: '設定パネルを閉じる',
  },
  imagePreview: {
    title: '撮った写真',
    imageAlt: '撮影した、または選んだ画像',
    hint: 'この写真から文字を読み取ります。読み取れたら、編集エリアに入ります。間違いがあれば後から直せます。',
    retake: '撮り直す',
    recognize: '文字を読み取る',
    recognizing: '読み取り中…',
    cancel: 'キャンセル',
    cancelAria: '文字の読み取りを中止する',
  },
  ocr: {
    initializing: '読み取りの準備中…',
    loadingModel: '日本語の辞書を読み込み中…',
    preprocessing: '画像を読み取りやすく整えています…',
    recognizing: '文字を読み取り中…',
    cancelled: '読み取りを中止しました。',
    noText: '文字が見つからなかったみたい。明るいところで、もう一度撮ってみよう。',
    failed: '文字をうまく読み取れなかったみたい。明るいところで、もう一度撮ってみよう。',
    statusFallback: '処理中…',
  },
  tts: {
    play: '🔊 読み上げる',
    playAria: 'テキストを読み上げる',
    pause: '⏸ 一時停止',
    pauseAria: '読み上げを一時停止',
    resume: '▶ 再開',
    resumeAria: '読み上げを再開',
    stop: '⏹ 停止',
    stopAria: '読み上げを停止',
    preparing: '準備中…',
    preparingAria: '読み上げの準備中です',
    unsupported: 'お使いのブラウザは、まだ読み上げ機能に対応していないみたい。',
    noJapaneseVoice:
      'お使いの端末には、日本語の音声が見つからないみたい。OSの設定で日本語音声を追加できる場合があります。',
    nothingToRead: '読み上げる文章が、まだありません。',
    preparingError: '読み上げの準備中に少し問題が起きたみたい。もう一度試してみてください。',
    completed: 'お疲れさま。ここまで読み終わりましたね。',
    completedAria: '読み上げが終わりました',
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
    capture: '📷 カメラで撮影',
    captureAria: '写真を撮るか、画像ファイルを選ぶ',
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
    imageUnreadable: 'この画像、うまく読み込めなかったみたい。別の写真で試してみよう。',
    imageWrongType: '画像のかたちが、まだ対応していないみたい。JPEG か PNG だと開けます。',
    imageTooLarge: '画像が少し大きすぎるみたい。もう一度撮るか、別の画像で試してみよう。',
    ocrComingSoon:
      '文字の読み取りは、もう少し準備中です。次の更新で使えるようになります。',
  },
  settings: {
    panelHeading: '読み方の設定',
    fontHeading: 'フォント',
    fontHint: 'ボタン自体が、そのフォントで表示されます。試して、合うものを選んでください。',
    groupJp: '日本語向け',
    groupEn: '英語向け',
    groupOption: '専用フォント（オプション）',
    optionDisclaimer:
      'これらのフォントは、合う方と合わない方がいます。研究では「全員に効く」とは言えていません。試してみて、合えば使う、くらいの気持ちで選んでください。',
    webFontPending:
      'OpenDyslexic はオンラインで読み込みます。Dyslexie は商用フォントのため、合えば端末にインストールしたうえで選んでください。',
    spacingHeading: '文字と行の間隔',
    spacingHint: 'スライダーを動かすと、すぐに見え方が変わります。',
    fontSizeLabel: '文字の大きさ',
    letterSpacingLabel: '字の間（文字どうしの間隔）',
    lineHeightLabel: '行の間（行と行の間隔）',
    wordSpacingLabel: '語の間（単語どうしの間隔）',
    colorHeading: '読みたい文章の色',
    colorHint:
      '読みたい文章の部分だけ、背景と文字の色を変えられます。「あ」の見え方が参考になります。設定パネルやボタンの色はそのままです。',
    customColorHeading: '自由に色を選ぶ',
    customColorHint:
      'プリセットだけでは合わないとき、自分で色を作れます。背景と文字、それぞれ選べます。',
    bgColorLabel: '背景色',
    textColorLabel: '文字色',
    resetToPreset: 'プリセットの色に戻す',
    ttsHeading: '読み上げ',
    ttsHint: '速さや声を変えられます。実際に読み上げて、心地よい設定を見つけてみてください。',
    ttsSpeedLabel: '読み上げの速さ',
    ttsVoiceLabel: '声',
    ttsVoiceDefault: 'おまかせ（端末の標準）',
    highlightHeading: 'ハイライト',
    highlightHint:
      '行の見えやすさを助ける表示です。3つから1つを選んでください。日本語でも英語でも同じように動きます。',
    lineModeOffLabel: 'なし',
    lineModeOffHint: '何もつけません。',
    lineModeZebraLabel: '隔行で色分け（zebra）',
    lineModeZebraHint:
      '1行ごとに薄い色を交互に塗ります（折り返した行も1行ずつ）。「行を飛ばして読んでしまう」のを防ぐ効果が報告されています。',
    lineModeFlatLabel: '全行に色帯',
    lineModeFlatHint:
      'すべての行に色の帯を入れます（折り返した行も含めて、最終行まで1行ずつ）。今どこを読んでいるか、行の存在を見失いにくくなります。',
    highlightColorHeading: 'ハイライトの色',
    highlightColorHint:
      '色は個人差がとても大きいことが研究で分かっています。「正解の色」は決まっていません。合うものを選んでください。',
    rubyHeading: 'ふりがな',
    rubyHint:
      '漢字に小さなふりがなを付けます。読みづらい漢字も読める助けになります。初めて ON にすると、辞書の準備に少し時間がかかります。',
    rubyEnableLabel: 'ふりがなを付ける',
    rubyPreparing: 'ふりがなの準備中…',
    rubyError: 'ふりがなの準備に少し問題が起きたみたい。もう一度試してください。',
    wakachiHeading: '分かち書き',
    wakachiHint:
      '単語の区切りに、目に見えるスペースを入れます。ひらがなが多い文章で効果が大きく、漢字とまじった文章では効果が薄めです。',
    wakachiEnableLabel: '分かち書きにする',
  },
  onboarding: {
    welcome: 'ようこそ。',
    title: 'あなたに合う読み方を見つけましょう',
    subtitle:
      '3問だけ、お試しください。読みやすいと感じた方を選ぶだけです。正解はありません。',
    skip: '今すぐ使う（あとから設定できます）',
    closing: 'あとからいつでも、設定パネルから何度でも変えられます。',
    progress: (current: number, total: number) => `${current} / ${total}`,
    sampleText:
      '文字を、あなたに合う見え方に変えていきましょう。読みやすさのかたちは、人それぞれです。',
    q1: {
      prompt: 'どちらの文字の形が読みやすいですか？',
      aName: 'UD デジタル教科書体',
      bName: '明朝体',
      bNote: 'うろこ（線の端の飾り）があり、読みにくく感じる方が多いと言われています。',
    },
    q2: {
      prompt: 'どちらの背景色が読みやすいですか？',
      aName: 'やわらかいクリーム',
      bName: 'うすい桃色',
    },
    q3: {
      prompt: 'どちらの行の間が読みやすいですか？',
      aName: '普通（行の間 1.5）',
      bName: '広め（行の間 1.8）',
    },
  },
} as const;

export type Copy = typeof copy;

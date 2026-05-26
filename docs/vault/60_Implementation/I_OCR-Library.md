---
title: "I_OCR-Library — Tesseract.js 実装メモ"
type: implementation
created: 2026-05-26
tags: [implementation, ocr, tesseract]
---

# I_OCR-Library — Tesseract.js 実装メモ

> [[FT_OCR]] 仕様を実装するためのライブラリ選定と実装パターン。

## 1. Tesseract.js を選ぶ理由

| 項目 | Tesseract.js | Google Cloud Vision | Azure Read API |
|---|---|---|---|
| 価格 | **無料** | 有料（無料枠あり） | 有料（無料枠あり） |
| 日本語精度 | ★★ | ★★★★ | ★★★★ |
| プライバシー | **◎ 完全ローカル** | △ 画像送信 | △ 画像送信 |
| オフライン | **◎** | × | × |
| 初期セットアップ | やや重い（辞書約4MB） | API キー管理 | API キー管理 |
| 学校環境での導入 | **◎ ファイアウォール影響なし** | △ API ドメインがブロックされる場合あり | △ 同様 |

→ **v1.0 は Tesseract.js 一択**。プライバシーと学校環境適応性が決定的。
→ v1.1 で「より高精度が欲しいユーザー向け」にAPIオプションを検討。

## 2. インストール

```bash
npm install tesseract.js
```

最新版（2026年5月時点）は v5.x。v6 がリリースされていれば最新を採用。

## 3. 基本的な実装パターン

### 3.1 シンプルな使い方

```ts
import Tesseract from 'tesseract.js';

async function ocrImage(imageBlob: Blob): Promise<string> {
  const result = await Tesseract.recognize(
    imageBlob,
    'jpn',
    {
      logger: (m) => console.log(m), // 進捗
    }
  );
  return result.data.text;
}
```

### 3.2 Worker を再利用するパターン（推奨）

複数枚処理する場合、Worker を使い回す方が高速：

```ts
import { createWorker, Worker } from 'tesseract.js';

class OCRService {
  private worker: Worker | null = null;

  async initialize() {
    this.worker = await createWorker('jpn', 1, {
      logger: (m) => this.onProgress?.(m),
    });
  }

  async recognize(imageBlob: Blob): Promise<string> {
    if (!this.worker) throw new Error('Worker not initialized');
    const { data: { text } } = await this.worker.recognize(imageBlob);
    return text;
  }

  async terminate() {
    await this.worker?.terminate();
    this.worker = null;
  }

  onProgress?: (m: { status: string; progress: number }) => void;
}
```

### 3.3 日英両対応

```ts
const worker = await createWorker('jpn+eng', 1, {
  logger: (m) => updateProgress(m),
});
```

## 4. 画像前処理（Canvas API）

OCR精度を高めるため、撮影画像を前処理する：

```ts
async function preprocessImage(imageBlob: Blob): Promise<Blob> {
  const img = await loadImage(imageBlob);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  // 1. グレースケール化
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = data[i + 1] = data[i + 2] = avg;
  }

  // 2. コントラスト調整（簡易自動レベル補正）
  const histogram = computeHistogram(data);
  const { min, max } = findMinMax(histogram, 0.005); // 上下0.5%カット
  for (let i = 0; i < data.length; i += 4) {
    const v = data[i];
    const normalized = ((v - min) / (max - min)) * 255;
    const clamped = Math.max(0, Math.min(255, normalized));
    data[i] = data[i + 1] = data[i + 2] = clamped;
  }

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}
```

### 4.1 圧縮（処理速度のため）

長辺2000px以内に縮小：

```ts
function resizeImage(canvas: HTMLCanvasElement, maxDim = 2000): HTMLCanvasElement {
  const { width, height } = canvas;
  if (Math.max(width, height) <= maxDim) return canvas;

  const scale = maxDim / Math.max(width, height);
  const newCanvas = document.createElement('canvas');
  newCanvas.width = width * scale;
  newCanvas.height = height * scale;
  const ctx = newCanvas.getContext('2d')!;
  ctx.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height);
  return newCanvas;
}
```

## 5. カメラ起動

### 5.1 シンプルなHTML
```html
<input
  type="file"
  accept="image/*"
  capture="environment"
  id="camera-input"
>
```

`capture="environment"` でスマホの背面カメラを優先起動。PC では通常のファイル選択になる。

### 5.2 ファイル取得
```ts
const input = document.getElementById('camera-input') as HTMLInputElement;
input.addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  await handleImage(file);
});
```

## 6. 進捗表示

```ts
const ocr = new OCRService();
ocr.onProgress = (m) => {
  if (m.status === 'recognizing text') {
    setProgressBar(m.progress * 100);
    setStatusText(`文字を読み取っています… ${Math.round(m.progress * 100)}%`);
  } else {
    setStatusText('準備中…');
  }
};
```

## 7. エラーハンドリング

```ts
try {
  await ocr.recognize(image);
} catch (err) {
  if (err.message.includes('memory')) {
    showError('画像のサイズを小さくして再試行します', () => retryWithSmallerImage());
  } else if (err.message.includes('language')) {
    showError('準備中です。もう少しお待ちください');
  } else {
    showError('文字が見つからなかったみたい。もう一度撮ってみよう', { offerManualEntry: true });
  }
}
```

## 8. パフォーマンス最適化

### 8.1 Worker は1つだけ
複数 Worker は重い。シングルトンパターンで1つだけ作る。

### 8.2 辞書の事前ロード
アプリ起動時に Worker を初期化しておく（バックグラウンドで）：

```ts
// アプリ起動時に
window.addEventListener('load', () => {
  // ユーザーがカメラを使う前に準備
  setTimeout(() => ocrService.initialize(), 2000);
});
```

### 8.3 PWA キャッシュ
Service Worker で `tesseract.js-core` と `jpn.traineddata` をキャッシュ：

```ts
// service-worker.ts
const CACHE_NAME = 'dyslexia-app-v1';
const CACHE_URLS = [
  '/index.html',
  '/main.js',
  '/dict/jpn.traineddata',
  '/tesseract/tesseract-core.wasm',
  // ...
];
```

## 9. テスト用画像セット

開発時に手元で使うテスト画像のセットアップ：

```
tests/fixtures/
├── prints/
│   ├── elementary-printout.jpg   ← 小学生プリント想定
│   ├── junior-high-textbook.jpg  ← 中学教科書
│   └── exam-question.jpg         ← 入試問題
├── notes/
│   └── handwritten.jpg           ← 手書き（v1.1 用）
└── edge-cases/
    ├── tilted.jpg                ← 傾いた画像
    ├── dark.jpg                  ← 暗い
    └── low-contrast.jpg          ← 低コントラスト
```

## 10. v1.1 で追加する Google Cloud Vision オプション

ユーザーが自分のAPIキー持参で利用：

```ts
async function ocrWithGoogleVision(imageBase64: string, apiKey: string): Promise<string> {
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      body: JSON.stringify({
        requests: [{
          image: { content: imageBase64 },
          features: [{ type: 'TEXT_DETECTION' }],
        }],
      }),
    }
  );
  const result = await response.json();
  return result.responses[0].fullTextAnnotation?.text ?? '';
}
```

**プライバシー注意**：「Googleに画像を送信します」と必ず明示。

## 11. 既知の制約・落とし穴

- **手書きは Tesseract.js では精度が低い** → v1.0 では「印刷物専用」と明示
- **縦書きはデフォルトでは対応していない** → v1.0 では非サポート
- **辞書ファイル（jpn.traineddata）は数MB** → 初回ロードに時間がかかる
- **iOS Safari の Canvas メモリ制限**：大きすぎる画像（4000px超）でクラッシュすることがある → リサイズ必須

## 12. 参考リソース

- [Tesseract.js 公式](https://github.com/naptha/tesseract.js)
- [Tesseract OCR エンジン](https://github.com/tesseract-ocr/tesseract)
- [日本語精度比較記事](https://qiita.com/tag/Tesseract)
- [画像前処理ベストプラクティス（OpenCV系）](https://docs.opencv.org/4.x/d6/d6a/group__photo.html)

## 関連

- [[FT_OCR]] — 機能仕様
- [[I_Libraries]] — その他ライブラリ
- [[I_Tech-Stack]] — 全体技術スタック
- [[FT_MVP]] — MVP仕様

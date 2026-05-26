/**
 * OCR 前処理：撮影画像の認識精度を上げるため、Tesseract.js に渡す前に
 * Canvas API でリサイズ・グレースケール・自動レベル補正を施す。
 *
 * 設計方針：
 * - 外部ライブラリ不要（Canvas + ImageBitmap で完結）
 * - 画像はサーバーに送らず端末内処理
 * - 失敗時はサイレントに原画像にフォールバック（OCR を止めない）
 * - 傾き補正は v1.0 ではスコープ外（Hough 変換が必要で複雑度高い）
 */

/** 長辺がこのピクセル数を超えたら縮小する */
const MAX_LONG_EDGE = 2000;

/**
 * 画像 File を OCR しやすい形に整えた Blob を返す。
 * - 長辺 2000px 以下にリサイズ
 * - グレースケール化（ITU-R BT.601）
 * - 自動レベル補正（min/max を 0/255 に引き伸ばす）
 * 失敗時は throw する（呼び出し側で try/catch して原画像にフォールバック可能）
 */
export async function preprocessImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const { width, height } = scaleDownIfNeeded(bitmap.width, bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('Canvas 2D context not available');
    }
    // 滑らかなリサイズ（大→小）
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    applyGrayscale(imageData);
    applyAutoLevels(imageData);
    ctx.putImageData(imageData, 0, 0);

    return await canvasToBlob(canvas, 'image/png');
  } finally {
    bitmap.close();
  }
}

function scaleDownIfNeeded(
  w: number,
  h: number,
): { width: number; height: number } {
  const longEdge = Math.max(w, h);
  if (longEdge <= MAX_LONG_EDGE) return { width: w, height: h };
  const ratio = MAX_LONG_EDGE / longEdge;
  return {
    width: Math.max(1, Math.round(w * ratio)),
    height: Math.max(1, Math.round(h * ratio)),
  };
}

/** ITU-R BT.601 の輝度式でグレースケール化 */
function applyGrayscale(imageData: ImageData): void {
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    const y = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    const g = Math.round(y);
    data[i] = g;
    data[i + 1] = g;
    data[i + 2] = g;
    // alpha は据え置き
  }
}

/**
 * 自動レベル補正（線形ストレッチ）。
 * グレースケール後の min/max を 0/255 にスケールする。
 * 端の外れ値（hot/cold pixels）の影響を抑えるため、両端 0.5% を切り落とす。
 */
function applyAutoLevels(imageData: ImageData): void {
  const { data } = imageData;
  const pixelCount = data.length / 4;

  // 256階調ヒストグラム
  const hist = new Uint32Array(256);
  for (let i = 0; i < data.length; i += 4) {
    hist[data[i]]++;
  }

  // 両端 0.5% を外れ値として切り捨て
  const cutoff = Math.floor(pixelCount * 0.005);
  let cumulative = 0;
  let minLevel = 0;
  for (let v = 0; v < 256; v++) {
    cumulative += hist[v];
    if (cumulative > cutoff) {
      minLevel = v;
      break;
    }
  }
  cumulative = 0;
  let maxLevel = 255;
  for (let v = 255; v >= 0; v--) {
    cumulative += hist[v];
    if (cumulative > cutoff) {
      maxLevel = v;
      break;
    }
  }
  if (maxLevel <= minLevel) return; // ほぼフラットな画像、補正しない

  const scale = 255 / (maxLevel - minLevel);
  for (let i = 0; i < data.length; i += 4) {
    let v = (data[i] - minLevel) * scale;
    if (v < 0) v = 0;
    else if (v > 255) v = 255;
    const g = Math.round(v);
    data[i] = g;
    data[i + 1] = g;
    data[i + 2] = g;
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('canvas.toBlob returned null'));
    }, type);
  });
}

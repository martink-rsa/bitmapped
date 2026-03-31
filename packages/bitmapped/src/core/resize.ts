import { createImageData, imageDataToUint32 } from './buffer.js';

/**
 * Resize ImageData using nearest-neighbor interpolation.
 * Uses Uint32Array views for fast 4-byte-at-a-time pixel copying.
 */
function resizeNearest(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number,
): ImageData {
  const { width: srcW, height: srcH } = imageData;
  const output = createImageData(targetWidth, targetHeight);
  const srcPixels = imageDataToUint32(imageData);
  const dstPixels = imageDataToUint32(output);

  for (let oy = 0; oy < targetHeight; oy++) {
    const sy = Math.floor((oy * srcH) / targetHeight);
    const srcRowOffset = sy * srcW;
    const dstRowOffset = oy * targetWidth;
    for (let ox = 0; ox < targetWidth; ox++) {
      const sx = Math.floor((ox * srcW) / targetWidth);
      dstPixels[dstRowOffset + ox] = srcPixels[srcRowOffset + sx]!;
    }
  }

  return output;
}

/**
 * Resize ImageData using bilinear interpolation.
 * Produces smoother results than nearest-neighbor for photographic content.
 */
function resizeBilinear(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number,
): ImageData {
  const { width: srcW, height: srcH, data: srcData } = imageData;
  const output = createImageData(targetWidth, targetHeight);
  const dstData = output.data;

  for (let oy = 0; oy < targetHeight; oy++) {
    const srcY = (oy * (srcH - 1)) / Math.max(targetHeight - 1, 1);
    const y0 = Math.floor(srcY);
    const y1 = Math.min(y0 + 1, srcH - 1);
    const fy = srcY - y0;

    for (let ox = 0; ox < targetWidth; ox++) {
      const srcX = (ox * (srcW - 1)) / Math.max(targetWidth - 1, 1);
      const x0 = Math.floor(srcX);
      const x1 = Math.min(x0 + 1, srcW - 1);
      const fx = srcX - x0;

      const i00 = (y0 * srcW + x0) * 4;
      const i10 = (y0 * srcW + x1) * 4;
      const i01 = (y1 * srcW + x0) * 4;
      const i11 = (y1 * srcW + x1) * 4;

      const dstIdx = (oy * targetWidth + ox) * 4;

      for (let c = 0; c < 3; c++) {
        const top = srcData[i00 + c]! * (1 - fx) + srcData[i10 + c]! * fx;
        const bot = srcData[i01 + c]! * (1 - fx) + srcData[i11 + c]! * fx;
        dstData[dstIdx + c] = Math.round(top * (1 - fy) + bot * fy);
      }
      dstData[dstIdx + 3] = 255;
    }
  }

  return output;
}

/**
 * Resize ImageData to exact target dimensions.
 * @param imageData - Source image
 * @param targetWidth - Output width
 * @param targetHeight - Output height
 * @param method - Interpolation method: 'nearest' (default, best for pixel art) or 'bilinear'
 */
export function resizeImageData(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number,
  method: 'nearest' | 'bilinear' = 'nearest',
): ImageData {
  if (targetWidth === imageData.width && targetHeight === imageData.height) {
    // Return a copy to maintain immutability
    const copy = createImageData(targetWidth, targetHeight);
    copy.data.set(imageData.data);
    // Force alpha to 255 for consistency with non-identity resize paths
    for (let i = 3; i < copy.data.length; i += 4) {
      copy.data[i] = 255;
    }
    return copy;
  }

  if (method === 'bilinear') {
    return resizeBilinear(imageData, targetWidth, targetHeight);
  }
  return resizeNearest(imageData, targetWidth, targetHeight);
}

/**
 * Fit an image into a target resolution, preserving or adjusting aspect ratio.
 * @param imageData - Source image
 * @param resolution - Target resolution
 * @param fit - Fit mode: 'contain' (letterbox), 'cover' (crop), 'stretch' (distort)
 * @param method - Interpolation method
 */
export function fitToResolution(
  imageData: ImageData,
  resolution: { width: number; height: number },
  fit: 'contain' | 'cover' | 'stretch' = 'contain',
  method: 'nearest' | 'bilinear' = 'nearest',
): ImageData {
  const { width: srcW, height: srcH } = imageData;
  const { width: dstW, height: dstH } = resolution;

  if (fit === 'stretch') {
    return resizeImageData(imageData, dstW, dstH, method);
  }

  if (fit === 'cover') {
    // Scale to fill, then crop from center
    const scale = Math.max(dstW / srcW, dstH / srcH);
    const scaledW = Math.round(srcW * scale);
    const scaledH = Math.round(srcH * scale);
    const scaled = resizeImageData(imageData, scaledW, scaledH, method);

    // Crop from center
    const cropX = Math.floor((scaledW - dstW) / 2);
    const cropY = Math.floor((scaledH - dstH) / 2);
    const output = createImageData(dstW, dstH);
    const srcPixels = imageDataToUint32(scaled);
    const dstPixels = imageDataToUint32(output);

    for (let y = 0; y < dstH; y++) {
      for (let x = 0; x < dstW; x++) {
        dstPixels[y * dstW + x] =
          srcPixels[(y + cropY) * scaledW + (x + cropX)]!;
      }
    }
    return output;
  }

  // contain: scale to fit, letterbox with black
  const scale = Math.min(dstW / srcW, dstH / srcH);
  const scaledW = Math.round(srcW * scale);
  const scaledH = Math.round(srcH * scale);
  const scaled = resizeImageData(imageData, scaledW, scaledH, method);

  // Center in output with black background
  const output = createImageData(dstW, dstH);
  // output is already zeroed (black with alpha=0), set alpha to 255
  const dstData = output.data;
  for (let i = 3; i < dstData.length; i += 4) {
    dstData[i] = 255;
  }

  const offsetX = Math.floor((dstW - scaledW) / 2);
  const offsetY = Math.floor((dstH - scaledH) / 2);
  const srcPixels = imageDataToUint32(scaled);
  const dstPixels = imageDataToUint32(output);

  for (let y = 0; y < scaledH; y++) {
    for (let x = 0; x < scaledW; x++) {
      dstPixels[(y + offsetY) * dstW + (x + offsetX)] =
        srcPixels[y * scaledW + x]!;
    }
  }

  return output;
}

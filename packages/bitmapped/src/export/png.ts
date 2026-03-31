import { defaultFilenameBase, downloadBlob } from './helpers.js';

/**
 * Wraps canvas.toBlob() in a Promise to convert a canvas to a PNG Blob.
 *
 * @param canvas - The HTMLCanvasElement to convert
 * @returns A Promise that resolves to the PNG Blob
 */
export function toPNGBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create PNG blob from canvas'));
      }
    }, 'image/png');
  });
}

/**
 * Creates a PNG blob from a canvas, generates an object URL, triggers a
 * download via a temporary anchor element, then revokes the URL.
 *
 * @param canvas - The HTMLCanvasElement to export
 * @param filename - The download filename (default: 'YYYYMMDD-HHMMSS-bitmapped.png')
 */
export async function downloadPNG(
  canvas: HTMLCanvasElement,
  filename: string = `${defaultFilenameBase()}.png`,
): Promise<void> {
  const blob = await toPNGBlob(canvas);
  downloadBlob(blob, filename);
}

/**
 * Creates a temporary OffscreenCanvas (or Canvas), puts the ImageData onto it,
 * and converts to a PNG blob. This allows exporting without the consumer
 * needing to manage a Canvas.
 *
 * @param imageData - The ImageData to convert
 * @returns A Promise that resolves to the PNG Blob
 */
export async function imageDataToBlob(imageData: ImageData): Promise<Blob> {
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to create OffscreenCanvas context');
    ctx.putImageData(imageData, 0, 0);
    return canvas.convertToBlob({ type: 'image/png' });
  }

  // Fallback to regular canvas
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create canvas context');
  ctx.putImageData(imageData, 0, 0);
  return toPNGBlob(canvas);
}

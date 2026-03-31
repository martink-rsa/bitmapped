import { defaultFilenameBase, downloadBlob } from './helpers.js';

/** Converts a canvas to a WebP Blob. */
export function toWebPBlob(
  canvas: HTMLCanvasElement,
  quality: number = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create WebP blob from canvas'));
      },
      'image/webp',
      quality,
    );
  });
}

/** Downloads the canvas as a WebP file. */
export async function downloadWebP(
  canvas: HTMLCanvasElement,
  filename: string = `${defaultFilenameBase()}.webp`,
  quality: number = 0.92,
): Promise<void> {
  const blob = await toWebPBlob(canvas, quality);
  downloadBlob(blob, filename);
}

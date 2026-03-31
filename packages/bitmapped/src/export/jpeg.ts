import { defaultFilenameBase, downloadBlob } from './helpers.js';

/** Converts a canvas to a JPEG Blob. */
export function toJPEGBlob(
  canvas: HTMLCanvasElement,
  quality: number = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create JPEG blob from canvas'));
      },
      'image/jpeg',
      quality,
    );
  });
}

/** Downloads the canvas as a JPEG file. */
export async function downloadJPEG(
  canvas: HTMLCanvasElement,
  filename: string = `${defaultFilenameBase()}.jpg`,
  quality: number = 0.92,
): Promise<void> {
  const blob = await toJPEGBlob(canvas, quality);
  downloadBlob(blob, filename);
}

import { defaultFilenameBase, downloadBlob } from './helpers.js';

function rgbHex(r: number, g: number, b: number): string {
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

/**
 * Converts ImageData to an SVG string where each pixel is a rect element.
 * Consecutive same-color pixels in a row are merged into wider rects for efficiency.
 */
export function imageDataToSVG(imageData: ImageData): string {
  const { width, height, data } = imageData;
  const rects: string[] = [];

  for (let y = 0; y < height; y++) {
    let x = 0;
    while (x < width) {
      const i = (y * width + x) * 4;
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      const a = data[i + 3]!;

      // Merge consecutive pixels with same color and alpha
      let runLen = 1;
      while (x + runLen < width) {
        const ni = (y * width + (x + runLen)) * 4;
        if (
          data[ni] === r &&
          data[ni + 1] === g &&
          data[ni + 2] === b &&
          data[ni + 3] === a
        ) {
          runLen++;
        } else {
          break;
        }
      }

      // Skip fully transparent pixels
      if (a === 0) {
        x += runLen;
        continue;
      }

      const color = rgbHex(r, g, b);
      if (a < 255) {
        const opacity = (a / 255).toFixed(3);
        rects.push(
          `<rect x="${x}" y="${y}" width="${runLen}" height="1" fill="${color}" opacity="${opacity}"/>`,
        );
      } else {
        rects.push(
          `<rect x="${x}" y="${y}" width="${runLen}" height="1" fill="${color}"/>`,
        );
      }
      x += runLen;
    }
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" shape-rendering="crispEdges">`,
    ...rects,
    '</svg>',
  ].join('\n');
}

/** Converts ImageData to an SVG Blob. */
export function toSVGBlob(imageData: ImageData): Blob {
  const svg = imageDataToSVG(imageData);
  return new Blob([svg], { type: 'image/svg+xml' });
}

/** Downloads ImageData as an SVG file. */
export function downloadSVG(
  imageData: ImageData,
  filename: string = `${defaultFilenameBase()}.svg`,
): void {
  const blob = toSVGBlob(imageData);
  downloadBlob(blob, filename);
}

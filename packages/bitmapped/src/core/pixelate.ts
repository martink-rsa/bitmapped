import type { RGB, PixelateResult } from './types.js';
import { createImageData, setPixelRGB } from './buffer.js';
import { resizeImageData } from './resize.js';

/**
 * Computes the average RGB color from a region of an ImageData.
 */
function averageColorInRegion(
  imageData: ImageData,
  startX: number,
  startY: number,
  regionWidth: number,
  regionHeight: number,
): RGB {
  const { data, width } = imageData;
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  const pixelCount = regionWidth * regionHeight;

  for (let y = startY; y < startY + regionHeight; y++) {
    for (let x = startX; x < startX + regionWidth; x++) {
      const offset = (y * width + x) * 4;
      rSum += data[offset]!;
      gSum += data[offset + 1]!;
      bSum += data[offset + 2]!;
    }
  }

  return {
    r: Math.round(rSum / pixelCount),
    g: Math.round(gSum / pixelCount),
    b: Math.round(bSum / pixelCount),
  };
}

/**
 * Pixelates an image using block averaging. Iterates through the image in
 * blockSize x blockSize blocks, computing the average color for each block.
 * Handles edge blocks that are smaller than blockSize at image boundaries.
 *
 * @param imageData - The source ImageData to pixelate
 * @param blockSize - The size of each block in pixels
 * @returns The pixelation result containing the color grid and metadata
 */
export function pixelateBlockAverage(
  imageData: ImageData,
  blockSize: number,
): PixelateResult {
  if (blockSize < 1) {
    throw new Error('blockSize must be at least 1');
  }
  const { width, height } = imageData;
  const gridWidth = Math.ceil(width / blockSize);
  const gridHeight = Math.ceil(height / blockSize);

  const grid: RGB[][] = [];
  const colors: RGB[] = [];

  for (let gy = 0; gy < gridHeight; gy++) {
    const row: RGB[] = [];
    for (let gx = 0; gx < gridWidth; gx++) {
      const startX = gx * blockSize;
      const startY = gy * blockSize;
      const regionWidth = Math.min(blockSize, width - startX);
      const regionHeight = Math.min(blockSize, height - startY);

      const avgColor = averageColorInRegion(
        imageData,
        startX,
        startY,
        regionWidth,
        regionHeight,
      );

      row.push(avgColor);
      colors.push(avgColor);
    }
    grid.push(row);
  }

  return { grid, colors, width: gridWidth, height: gridHeight, blockSize };
}

/**
 * Pixelates an image using progressive bilinear downscaling. Instead of a
 * box filter (block averaging), the image is halved repeatedly with bilinear
 * interpolation until close to the target grid size, then resized to exactly
 * 1 pixel per block. This mimics browser canvas drawImage() resampling and
 * preserves local contrast, highlights, and fine detail better than
 * equal-weight block averaging.
 *
 * @param imageData - The source ImageData to pixelate
 * @param blockSize - The size of each block in pixels
 * @returns The pixelation result containing the color grid and metadata
 */
export function pixelateResample(
  imageData: ImageData,
  blockSize: number,
): PixelateResult {
  if (blockSize < 1) {
    throw new Error('blockSize must be at least 1');
  }
  const { width, height } = imageData;
  const gridWidth = Math.ceil(width / blockSize);
  const gridHeight = Math.ceil(height / blockSize);

  // Progressive bilinear downscale: halve repeatedly until within 2× of
  // the target, then do a final bilinear step. This ensures each resize is
  // at most 2× so bilinear sampling quality stays high.
  let current = imageData;
  while (current.width > gridWidth * 2 || current.height > gridHeight * 2) {
    const nextW = Math.max(gridWidth, Math.ceil(current.width / 2));
    const nextH = Math.max(gridHeight, Math.ceil(current.height / 2));
    current = resizeImageData(current, nextW, nextH, 'bilinear');
  }

  const downscaled =
    current.width === gridWidth && current.height === gridHeight
      ? current
      : resizeImageData(current, gridWidth, gridHeight, 'bilinear');

  // Read downscaled pixels into a PixelateResult grid
  const grid: RGB[][] = [];
  const colors: RGB[] = [];
  for (let y = 0; y < gridHeight; y++) {
    const row: RGB[] = [];
    for (let x = 0; x < gridWidth; x++) {
      const i = (y * gridWidth + x) * 4;
      const color: RGB = {
        r: downscaled.data[i]!,
        g: downscaled.data[i + 1]!,
        b: downscaled.data[i + 2]!,
      };
      row.push(color);
      colors.push(color);
    }
    grid.push(row);
  }

  return { grid, colors, width: gridWidth, height: gridHeight, blockSize };
}

/**
 * Pixelates an image using the fast downscale-then-upscale approach.
 * Creates a reduced-size canvas, draws the image scaled down, then scales back up.
 * This is fast but does not produce per-block color data.
 *
 * Note: This function requires a browser environment with Canvas support.
 *
 * @param imageData - The source ImageData to pixelate
 * @param blockSize - The size of each pixelation block
 * @returns The pixelated ImageData
 */
export function pixelateDownscale(
  imageData: ImageData,
  blockSize: number,
): ImageData {
  const { width, height } = imageData;
  const smallWidth = Math.ceil(width / blockSize);
  const smallHeight = Math.ceil(height / blockSize);

  // Create small canvas for downscale
  const smallCanvas =
    typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(smallWidth, smallHeight)
      : document.createElement('canvas');

  if ('width' in smallCanvas) {
    smallCanvas.width = smallWidth;
    smallCanvas.height = smallHeight;
  }

  const smallCtx = smallCanvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;
  if (!smallCtx) throw new Error('Failed to create canvas context');

  // Put source image on a temporary canvas
  const sourceCanvas =
    typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(width, height)
      : document.createElement('canvas');

  if ('width' in sourceCanvas) {
    sourceCanvas.width = width;
    sourceCanvas.height = height;
  }

  const sourceCtx = sourceCanvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;
  if (!sourceCtx) throw new Error('Failed to create canvas context');

  sourceCtx.putImageData(imageData, 0, 0);

  // Draw scaled down
  smallCtx.drawImage(
    sourceCanvas as HTMLCanvasElement,
    0,
    0,
    smallWidth,
    smallHeight,
  );

  // Create output canvas at original size
  const outputCanvas =
    typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(width, height)
      : document.createElement('canvas');

  if ('width' in outputCanvas) {
    outputCanvas.width = width;
    outputCanvas.height = height;
  }

  const outputCtx = outputCanvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;
  if (!outputCtx) throw new Error('Failed to create canvas context');

  outputCtx.imageSmoothingEnabled = false;
  outputCtx.drawImage(smallCanvas as HTMLCanvasElement, 0, 0, width, height);

  return outputCtx.getImageData(0, 0, width, height);
}

/**
 * Renders a PixelateResult back to an ImageData at the original image dimensions.
 * Each grid cell is expanded to fill its blockSize x blockSize region.
 *
 * @param result - The pixelation result to render
 * @param originalWidth - The original image width
 * @param originalHeight - The original image height
 * @returns An ImageData with the pixelated colors
 */
export function renderPixelateResult(
  result: PixelateResult,
  originalWidth: number,
  originalHeight: number,
): ImageData {
  const output = createImageData(originalWidth, originalHeight);

  for (let gy = 0; gy < result.height; gy++) {
    for (let gx = 0; gx < result.width; gx++) {
      const color = result.grid[gy]![gx]!;
      const startX = gx * result.blockSize;
      const startY = gy * result.blockSize;
      const endX = Math.min(startX + result.blockSize, originalWidth);
      const endY = Math.min(startY + result.blockSize, originalHeight);

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          setPixelRGB(output.data, y * originalWidth + x, color);
        }
      }
    }
  }

  return output;
}

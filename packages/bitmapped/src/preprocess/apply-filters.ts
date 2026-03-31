import type { FilterOptions } from '../core/types.js';
import { hasActiveFilters } from './has-active-filters.js';
import { buildFilterString } from './build-filter-string.js';

/**
 * Creates a canvas of the given dimensions.
 * Prefers OffscreenCanvas, falls back to HTMLCanvasElement.
 */
function createCanvas(
  width: number,
  height: number,
): OffscreenCanvas | HTMLCanvasElement {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height);
  }
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  throw new Error(
    'applyFilters requires a browser environment with Canvas support',
  );
}

/**
 * Applies CSS filters to ImageData by drawing it onto a canvas with
 * ctx.filter set, then extracting the resulting pixel data.
 *
 * Filters are applied in CSS filter function order (browser-defined compositing).
 * Only non-default filter values are included in the filter string.
 *
 * @param imageData - Source image pixel data
 * @param filters - Filter options to apply
 * @returns New ImageData with filters baked into the pixel values
 */
export function applyFilters(
  imageData: ImageData,
  filters: FilterOptions,
): ImageData {
  const { width, height } = imageData;

  // Fast path: no active filters — return a copy without canvas work
  if (!hasActiveFilters(filters)) {
    return new ImageData(new Uint8ClampedArray(imageData.data), width, height);
  }

  // Create source canvas and put the original image data on it
  const srcCanvas = createCanvas(width, height);
  const srcCtx = srcCanvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;
  if (!srcCtx) {
    throw new Error(
      'applyFilters requires a browser environment with Canvas support',
    );
  }
  srcCtx.putImageData(imageData, 0, 0);

  // Create destination canvas with the filter applied
  const destCanvas = createCanvas(width, height);
  const destCtx = destCanvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;
  if (!destCtx) {
    throw new Error(
      'applyFilters requires a browser environment with Canvas support',
    );
  }
  destCtx.filter = buildFilterString(filters);
  destCtx.drawImage(srcCanvas, 0, 0);

  return destCtx.getImageData(0, 0, width, height);
}

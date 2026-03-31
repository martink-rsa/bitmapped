import type {
  RGB,
  Palette,
  PaletteColor,
  DistanceAlgorithm,
} from '../core/types.js';
import { getDistanceFunction } from './distance.js';
import { getPixelRGB, setPixelRGB, createImageData } from '../core/buffer.js';

/**
 * Creates a reusable color matcher closure. Pre-computes any necessary
 * color space conversions for the palette, then returns a function that
 * finds the nearest palette color for any input RGB.
 *
 * @param palette - The palette to match against
 * @param algorithm - The color distance algorithm to use (default: 'redmean')
 * @returns A function that maps an RGB color to the nearest PaletteColor
 */
export function createPaletteMatcher(
  palette: Palette,
  algorithm: DistanceAlgorithm = 'redmean',
): (color: RGB) => PaletteColor {
  const distanceFn = getDistanceFunction(algorithm);

  if (palette.length === 0) {
    throw new Error('Cannot create palette matcher with empty palette');
  }

  return (color: RGB): PaletteColor => {
    let bestMatch = palette[0]!;
    let bestDistance = Infinity;

    for (const entry of palette) {
      const d = distanceFn(color, entry.color);
      if (d < bestDistance) {
        bestDistance = d;
        bestMatch = entry;
      }
    }

    return bestMatch;
  };
}

/**
 * Finds the single nearest palette color to a given RGB color.
 *
 * @param color - The RGB color to match
 * @param palette - The palette to search
 * @param algorithm - The color distance algorithm to use (default: 'redmean')
 * @returns The nearest PaletteColor
 */
export function findNearestColor(
  color: RGB,
  palette: Palette,
  algorithm: DistanceAlgorithm = 'redmean',
): PaletteColor {
  return createPaletteMatcher(palette, algorithm)(color);
}

/**
 * Returns the top N closest palette colors to a given RGB color, sorted by distance.
 *
 * @param color - The RGB color to match
 * @param palette - The palette to search
 * @param n - The number of results to return
 * @param algorithm - The color distance algorithm to use (default: 'redmean')
 * @returns An array of the N nearest PaletteColors, sorted by distance (closest first)
 */
export function findNearestColors(
  color: RGB,
  palette: Palette,
  n: number,
  algorithm: DistanceAlgorithm = 'redmean',
): PaletteColor[] {
  if (palette.length === 0) {
    throw new Error('Cannot find nearest colors with empty palette');
  }

  const distanceFn = getDistanceFunction(algorithm);

  const ranked = palette
    .map((entry) => ({
      entry,
      distance: distanceFn(color, entry.color),
    }))
    .sort((a, b) => a.distance - b.distance);

  return ranked.slice(0, n).map((r) => r.entry);
}

/**
 * Maps every pixel in an ImageData to its nearest palette color.
 * Returns a new ImageData — the input is not modified.
 *
 * @param imageData - The source ImageData
 * @param palette - The palette to match against
 * @param algorithm - The color distance algorithm to use (default: 'redmean')
 * @returns A new ImageData with every pixel mapped to a palette color
 */
export function mapImageToPalette(
  imageData: ImageData,
  palette: Palette,
  algorithm: DistanceAlgorithm = 'redmean',
): ImageData {
  const { width, height } = imageData;
  const output = createImageData(width, height);
  const matcher = createPaletteMatcher(palette, algorithm);
  const pixelCount = width * height;

  for (let i = 0; i < pixelCount; i++) {
    const color = getPixelRGB(imageData.data, i);
    const matched = matcher(color);
    setPixelRGB(output.data, i, matched.color);
  }

  return output;
}

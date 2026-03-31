import type { RGB, Palette, DistanceAlgorithm } from '../core/types.js';
import type { TilePaletteConfig } from './types.js';
import { getDistanceFunction } from '../color/distance.js';
import { findNearestColor } from '../color/match.js';
import { createImageData } from '../core/buffer.js';

// ── Internal Helpers ───────────────────────────────────────────────

/**
 * Represents the pixel data for a single tile, along with its position
 * within the source image.
 */
interface TileInfo {
  /** Tile column index */
  col: number;
  /** Tile row index */
  row: number;
  /** RGB values for every pixel in the tile, in row-major order */
  pixels: RGB[];
}

/**
 * Extracts all tiles from the image. Tiles at the right/bottom edge may
 * be smaller than the configured tile size when the image dimensions are
 * not exact multiples.
 */
function extractTiles(
  imageData: ImageData,
  tileWidth: number,
  tileHeight: number,
): TileInfo[] {
  const { width, height, data } = imageData;
  const cols = Math.ceil(width / tileWidth);
  const rows = Math.ceil(height / tileHeight);
  const tiles: TileInfo[] = [];

  for (let tRow = 0; tRow < rows; tRow++) {
    for (let tCol = 0; tCol < cols; tCol++) {
      const pixels: RGB[] = [];
      const x0 = tCol * tileWidth;
      const y0 = tRow * tileHeight;
      const x1 = Math.min(x0 + tileWidth, width);
      const y1 = Math.min(y0 + tileHeight, height);

      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const offset = (y * width + x) * 4;
          pixels.push({
            r: data[offset]!,
            g: data[offset + 1]!,
            b: data[offset + 2]!,
          });
        }
      }

      tiles.push({ col: tCol, row: tRow, pixels });
    }
  }

  return tiles;
}

/**
 * Builds a histogram of palette color usage within a tile. For every pixel
 * in the tile, finds the nearest palette color and increments its count.
 *
 * Returns an array of { index, count } sorted by count descending.
 */
function buildPaletteHistogram(
  pixels: RGB[],
  palette: Palette,
  distanceFn: (a: RGB, b: RGB) => number,
): { index: number; count: number }[] {
  const counts = new Map<number, number>();

  for (const pixel of pixels) {
    // Find nearest palette color for this pixel
    let bestIdx = 0;
    let bestDist = Infinity;

    for (let i = 0; i < palette.length; i++) {
      const d = distanceFn(pixel, palette[i]!.color);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }

    counts.set(bestIdx, (counts.get(bestIdx) ?? 0) + 1);
  }

  const histogram = Array.from(counts.entries()).map(([index, count]) => ({
    index,
    count,
  }));
  histogram.sort((a, b) => b.count - a.count);

  return histogram;
}

/**
 * Selects the best subpalette for a tile. Takes the top N most-used
 * palette colors (where N = colorsPerSubpalette) and returns them as
 * a mini palette.
 *
 * When `sharedTransparent` is true, the first slot is reserved (the
 * first color of the master palette is always included), and only
 * N-1 additional colors are selected from usage.
 */
function selectSubpalette(
  histogram: { index: number; count: number }[],
  palette: Palette,
  colorsPerSubpalette: number,
  sharedTransparent: boolean,
): Palette {
  if (sharedTransparent) {
    // Reserve slot 0 for the shared/transparent color (first palette entry)
    const sharedColor = palette[0]!;
    const remaining = histogram.filter((h) => h.index !== 0);
    const topIndices = remaining
      .slice(0, colorsPerSubpalette - 1)
      .map((h) => h.index);

    return [sharedColor, ...topIndices.map((i) => palette[i]!)];
  }

  const topIndices = histogram
    .slice(0, colorsPerSubpalette)
    .map((h) => h.index);

  return topIndices.map((i) => palette[i]!);
}

// ── Public API ─────────────────────────────────────────────────────

/**
 * Solves the per-tile-palette constraint for tile-based hardware.
 *
 * Many classic systems (Genesis/Mega Drive, SNES, SMS, Game Gear, GBC,
 * Neo Geo, CPS-1, etc.) allow each tile to choose from a limited set
 * of subpalettes, where each subpalette has a small fixed number of
 * colors (e.g., 15 + transparent on SNES, 16 on Genesis).
 *
 * This solver:
 * 1. Divides the image into tiles of the configured size.
 * 2. For each tile, counts which master-palette colors appear most
 *    often (by nearest-color matching).
 * 3. Selects the top N colors as that tile's subpalette.
 * 4. Re-maps every pixel in the tile to the nearest color within
 *    the tile's subpalette.
 *
 * This is a per-tile independent approach: each tile gets its own
 * optimal subpalette rather than sharing across tiles. This produces
 * good results for arbitrary image conversion without requiring the
 * more complex global subpalette allocation that a ROM editor would need.
 *
 * @param imageData - Source image data (already palette-quantized or raw)
 * @param palette - The full master palette available to the system
 * @param config - Tile size and subpalette parameters
 * @param distanceAlgorithm - Color distance metric (default: 'redmean')
 * @returns New ImageData with per-tile palette constraints enforced
 */
export function solveTilePalette(
  imageData: ImageData,
  palette: Palette,
  config: TilePaletteConfig,
  distanceAlgorithm?: DistanceAlgorithm,
): ImageData {
  const { tileWidth, tileHeight, colorsPerSubpalette, sharedTransparent } =
    config;
  const { width, height } = imageData;
  const algorithm = distanceAlgorithm ?? 'redmean';
  const distanceFn = getDistanceFunction(algorithm);

  // If the palette has fewer colors than the subpalette size, there's
  // no constraint to enforce — just do a simple nearest-color map.
  if (palette.length <= colorsPerSubpalette) {
    const output = createImageData(width, height);
    const totalPixels = width * height;

    for (let i = 0; i < totalPixels; i++) {
      const offset = i * 4;
      const pixel: RGB = {
        r: imageData.data[offset]!,
        g: imageData.data[offset + 1]!,
        b: imageData.data[offset + 2]!,
      };
      const nearest = findNearestColor(pixel, palette, algorithm);
      output.data[offset] = nearest.color.r;
      output.data[offset + 1] = nearest.color.g;
      output.data[offset + 2] = nearest.color.b;
      output.data[offset + 3] = 255;
    }

    return output;
  }

  // Extract tiles from the image
  const tiles = extractTiles(imageData, tileWidth, tileHeight);

  // Create output buffer
  const output = createImageData(width, height);

  for (const tile of tiles) {
    // Build histogram: which palette colors are most used in this tile?
    const histogram = buildPaletteHistogram(tile.pixels, palette, distanceFn);

    // Select the best subpalette for this tile
    const subpalette = selectSubpalette(
      histogram,
      palette,
      colorsPerSubpalette,
      sharedTransparent,
    );

    // Map each pixel in the tile to the nearest color in the subpalette
    const x0 = tile.col * tileWidth;
    const y0 = tile.row * tileHeight;
    const x1 = Math.min(x0 + tileWidth, width);
    const y1 = Math.min(y0 + tileHeight, height);

    let pixelIdx = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const pixel = tile.pixels[pixelIdx]!;
        const nearest = findNearestColor(pixel, subpalette, algorithm);
        const outOffset = (y * width + x) * 4;
        output.data[outOffset] = nearest.color.r;
        output.data[outOffset + 1] = nearest.color.g;
        output.data[outOffset + 2] = nearest.color.b;
        output.data[outOffset + 3] = 255;
        pixelIdx++;
      }
    }
  }

  return output;
}

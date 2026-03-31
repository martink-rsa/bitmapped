import type { RGB, Palette, DistanceAlgorithm } from '../core/types.js';
import type { DistanceFn, AttributeBlockConfig } from './types.js';
import { getDistanceFunction } from '../color/distance.js';
import { createImageData } from '../core/buffer.js';

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Finds the index of the nearest color in a subset, returning the index
 * into the subset array and the distance.
 */
function nearestInSubset(
  pixel: RGB,
  subset: RGB[],
  dist: DistanceFn,
): { index: number; distance: number } {
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < subset.length; i++) {
    const d = dist(pixel, subset[i]!);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }
  return { index: bestIdx, distance: bestDist };
}

/**
 * Computes the total mapping error for a block of pixels against a color subset.
 * Returns the sum of minimum distances from each pixel to its nearest subset color.
 */
function blockError(pixels: RGB[], subset: RGB[], dist: DistanceFn): number {
  let total = 0;
  for (let i = 0; i < pixels.length; i++) {
    let minD = Infinity;
    for (let j = 0; j < subset.length; j++) {
      const d = dist(pixels[i]!, subset[j]!);
      if (d < minD) minD = d;
    }
    total += minD;
  }
  return total;
}

// ── ZX Spectrum: Bright-Locked Pair Selection ──────────────────────────

/**
 * For ZX Spectrum attribute blocks: tests all valid (ink, paper) pairs
 * respecting the brightness constraint.
 *
 * Non-bright pairs: C(8,2) combinations from palette indices 0-7
 * Bright pairs: C(8,2) combinations from palette indices 8-15
 * Total: 56 candidate pairs per block.
 *
 * Returns the two-color subset with the lowest total error.
 */
function solveBrightLocked(
  pixels: RGB[],
  palette: Palette,
  dist: DistanceFn,
): RGB[] {
  let bestPair: RGB[] = [palette[0]!.color, palette[1]!.color];
  let bestError = Infinity;

  // Test non-bright pairs (indices 0-7)
  const nonBrightEnd = Math.min(8, palette.length);
  for (let i = 0; i < nonBrightEnd; i++) {
    for (let j = i + 1; j < nonBrightEnd; j++) {
      const subset = [palette[i]!.color, palette[j]!.color];
      const err = blockError(pixels, subset, dist);
      if (err < bestError) {
        bestError = err;
        bestPair = subset;
      }
    }
  }

  // Test bright pairs (indices 8-15)
  const brightStart = 8;
  const brightEnd = Math.min(16, palette.length);
  for (let i = brightStart; i < brightEnd; i++) {
    for (let j = i + 1; j < brightEnd; j++) {
      const subset = [palette[i]!.color, palette[j]!.color];
      const err = blockError(pixels, subset, dist);
      if (err < bestError) {
        bestError = err;
        bestPair = subset;
      }
    }
  }

  return bestPair;
}

// ── Exhaustive Pair Selection (maxColors = 2) ──────────────────────────

/**
 * Tests all C(paletteSize, 2) pairs and returns the pair with the lowest
 * total error for the block.
 */
function solvePairExhaustive(
  pixels: RGB[],
  palette: Palette,
  dist: DistanceFn,
): RGB[] {
  let bestPair: RGB[] = [palette[0]!.color, palette[1]!.color];
  let bestError = Infinity;

  for (let i = 0; i < palette.length; i++) {
    for (let j = i + 1; j < palette.length; j++) {
      const subset = [palette[i]!.color, palette[j]!.color];
      const err = blockError(pixels, subset, dist);
      if (err < bestError) {
        bestError = err;
        bestPair = subset;
      }
    }
  }

  return bestPair;
}

// ── Greedy Selection (maxColors > 2) ───────────────────────────────────

/**
 * Greedy color subset selection for blocks that allow more than 2 colors.
 *
 * 1. Find the palette color closest to the most pixels (most "popular").
 * 2. Iteratively add the palette color that reduces the total error the most.
 * 3. Repeat until we have maxColors.
 *
 * If a globalBackground index is specified, that color is always included
 * in the subset and counts toward maxColors.
 */
function solveGreedy(
  pixels: RGB[],
  palette: Palette,
  maxColors: number,
  dist: DistanceFn,
  globalBackground?: number,
): RGB[] {
  const subset: RGB[] = [];
  const usedIndices = new Set<number>();

  // If there's a global background color, include it first
  if (globalBackground !== undefined && globalBackground < palette.length) {
    subset.push(palette[globalBackground]!.color);
    usedIndices.add(globalBackground);
  }

  // Precompute per-pixel minimum distances to the current subset
  const pixelMinDist = new Float64Array(pixels.length);

  if (subset.length === 0) {
    // No global background — seed with the most popular color.
    // "Most popular" = palette color with the smallest total distance to all pixels.
    let bestIdx = 0;
    let bestTotal = Infinity;
    for (let p = 0; p < palette.length; p++) {
      let total = 0;
      const pc = palette[p]!.color;
      for (let i = 0; i < pixels.length; i++) {
        total += dist(pixels[i]!, pc);
      }
      if (total < bestTotal) {
        bestTotal = total;
        bestIdx = p;
      }
    }
    subset.push(palette[bestIdx]!.color);
    usedIndices.add(bestIdx);
  }

  // Initialize pixelMinDist based on current subset
  for (let i = 0; i < pixels.length; i++) {
    let minD = Infinity;
    for (let s = 0; s < subset.length; s++) {
      const d = dist(pixels[i]!, subset[s]!);
      if (d < minD) minD = d;
    }
    pixelMinDist[i] = minD;
  }

  // Greedily add colors that reduce the most total error
  while (subset.length < maxColors) {
    let bestIdx = -1;
    let bestReduction = -1;

    for (let p = 0; p < palette.length; p++) {
      if (usedIndices.has(p)) continue;

      const pc = palette[p]!.color;
      let reduction = 0;

      for (let i = 0; i < pixels.length; i++) {
        const d = dist(pixels[i]!, pc);
        if (d < pixelMinDist[i]!) {
          reduction += pixelMinDist[i]! - d;
        }
      }

      if (reduction > bestReduction) {
        bestReduction = reduction;
        bestIdx = p;
      }
    }

    // If no color reduces error (or palette exhausted), stop early
    if (bestIdx === -1 || bestReduction <= 0) break;

    const newColor = palette[bestIdx]!.color;
    subset.push(newColor);
    usedIndices.add(bestIdx);

    // Update per-pixel minimum distances
    for (let i = 0; i < pixels.length; i++) {
      const d = dist(pixels[i]!, newColor);
      if (d < pixelMinDist[i]!) {
        pixelMinDist[i] = d;
      }
    }
  }

  return subset;
}

// ── Main Solver ────────────────────────────────────────────────────────

/**
 * Solves attribute-block color clash for retro hardware systems.
 *
 * For each WxH pixel block in the image, selects the best N colors from
 * the palette and remaps every pixel in the block to its nearest color
 * in that subset.
 *
 * Supports:
 * - ZX Spectrum bright-locked mode (brightLocked = true)
 * - General 2-color attribute blocks (exhaustive pair search)
 * - Multi-color blocks (greedy selection, e.g. C64 multicolor)
 *
 * @param imageData - Source image
 * @param palette - Available palette colors
 * @param config - Attribute block configuration
 * @param distanceAlgorithm - Color distance metric (default: 'euclidean')
 * @returns New ImageData with colors constrained per block
 */
export function solveAttributeClash(
  imageData: ImageData,
  palette: Palette,
  config: AttributeBlockConfig,
  distanceAlgorithm?: DistanceAlgorithm,
): ImageData {
  if (palette.length < 2) {
    throw new Error(
      'Attribute clash solver requires a palette with at least 2 colors',
    );
  }

  const dist = getDistanceFunction(distanceAlgorithm ?? 'euclidean');
  const {
    width: bw,
    height: bh,
    maxColors,
    brightLocked,
    globalBackground,
  } = config;
  const { width: imgW, height: imgH, data: srcData } = imageData;

  const output = createImageData(imgW, imgH);
  const outData = output.data;

  // Iterate over every attribute block
  const blocksX = Math.ceil(imgW / bw);
  const blocksY = Math.ceil(imgH / bh);

  for (let by = 0; by < blocksY; by++) {
    for (let bx = 0; bx < blocksX; bx++) {
      const x0 = bx * bw;
      const y0 = by * bh;
      const x1 = Math.min(x0 + bw, imgW);
      const y1 = Math.min(y0 + bh, imgH);

      // Step 1: Extract all pixel colors in this block
      const pixels: RGB[] = [];
      const coords: Array<{ x: number; y: number }> = [];

      for (let py = y0; py < y1; py++) {
        for (let px = x0; px < x1; px++) {
          const offset = (py * imgW + px) * 4;
          pixels.push({
            r: srcData[offset]!,
            g: srcData[offset + 1]!,
            b: srcData[offset + 2]!,
          });
          coords.push({ x: px, y: py });
        }
      }

      // Step 2: Find the optimal color subset for this block
      let subset: RGB[];

      if (brightLocked) {
        // ZX Spectrum mode: test valid (ink, paper) pairs within
        // non-bright (0-7) and bright (8-15) groups separately
        subset = solveBrightLocked(pixels, palette, dist);
      } else if (maxColors === 2 && palette.length <= 64) {
        // For small palettes with 2-color blocks, exhaustive search is fast enough
        subset = solvePairExhaustive(pixels, palette, dist);
      } else if (maxColors >= palette.length) {
        // Block allows all palette colors — no constraint needed
        subset = palette.map((pc) => pc.color);
      } else {
        // General case: greedy selection
        subset = solveGreedy(
          pixels,
          palette,
          maxColors,
          dist,
          globalBackground,
        );
      }

      // Step 3: Map each pixel to the nearest color in the subset
      for (let i = 0; i < pixels.length; i++) {
        const { index } = nearestInSubset(pixels[i]!, subset, dist);
        const best = subset[index]!;
        const { x, y } = coords[i]!;
        const outOffset = (y * imgW + x) * 4;
        outData[outOffset] = best.r;
        outData[outOffset + 1] = best.g;
        outData[outOffset + 2] = best.b;
        outData[outOffset + 3] = 255;
      }
    }
  }

  return output;
}

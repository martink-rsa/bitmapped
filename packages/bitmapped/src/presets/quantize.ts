import type { RGB, ColorBitDepth } from '../core/types.js';
import { GENESIS_DAC_NORMAL } from '../color/quantize.js';

/**
 * Converts an N-bit value to 8-bit using bit replication.
 * E.g., 5-bit 11111 (31) → 11111111 (255), 5-bit 10000 (16) → 10000100 (132)
 */
export function expandBits(value: number, sourceBits: number): number {
  if (sourceBits >= 8) return value & 0xff;
  if (sourceBits <= 0) return 0;

  let result = 0;
  let shift = 8;
  while (shift > 0) {
    const bits = Math.min(sourceBits, shift);
    shift -= bits;
    result |= (value >> (sourceBits - bits)) << shift;
  }
  return result;
}

/**
 * Genesis-specific non-linear DAC quantization.
 * The Sega Genesis has a 9-bit color space (3 bits/channel) with a non-linear DAC.
 */
export function genesisQuantize(r: number, g: number, b: number): RGB {
  const quantize3 = (v: number): number => {
    let best = 0;
    let bestDist = Math.abs(v - GENESIS_DAC_NORMAL[0]!);
    for (let i = 1; i < 8; i++) {
      const dist = Math.abs(v - GENESIS_DAC_NORMAL[i]!);
      if (dist < bestDist) {
        best = i;
        bestDist = dist;
      }
    }
    return GENESIS_DAC_NORMAL[best]!;
  };
  return { r: quantize3(r), g: quantize3(g), b: quantize3(b) };
}

/**
 * Quantize an 8-bit RGB value to a hardware color space and expand back to 8-bit.
 * If the color space provides a custom quantize function, it is used instead.
 */
export function quantizeColor(
  r: number,
  g: number,
  b: number,
  colorSpace: ColorBitDepth,
): RGB {
  if (colorSpace.quantize) {
    return colorSpace.quantize(r, g, b);
  }

  const maxVal = (1 << colorSpace.bitsPerChannel) - 1;
  const qr = Math.round((r / 255) * maxVal);
  const qg = Math.round((g / 255) * maxVal);
  const qb = Math.round((b / 255) * maxVal);

  return {
    r: expandBits(qr, colorSpace.bitsPerChannel),
    g: expandBits(qg, colorSpace.bitsPerChannel),
    b: expandBits(qb, colorSpace.bitsPerChannel),
  };
}

/**
 * Sample `count` colors uniformly from a programmable color space using a 3D grid.
 * Unlike linear striding through `enumerateColorSpace()`, this distributes
 * samples evenly across all three channels.
 */
export function sampleColorSpace(
  colorSpace: ColorBitDepth,
  count: number,
): RGB[] {
  const totalLevels = 1 << colorSpace.bitsPerChannel;
  const totalColors = totalLevels ** 3;

  if (count >= totalColors) {
    return enumerateColorSpace(colorSpace);
  }

  if (count <= 1) {
    return [{ r: 0, g: 0, b: 0 }];
  }

  const levelsPerChannel = Math.ceil(Math.cbrt(count));

  const channelIndices: number[] = [];
  for (let i = 0; i < levelsPerChannel; i++) {
    channelIndices.push(
      Math.round((i / (levelsPerChannel - 1)) * (totalLevels - 1)),
    );
  }

  const colors: RGB[] = [];
  for (const ri of channelIndices) {
    for (const gi of channelIndices) {
      for (const bi of channelIndices) {
        if (colorSpace.quantize) {
          colors.push(
            colorSpace.quantize(
              expandBits(ri, colorSpace.bitsPerChannel),
              expandBits(gi, colorSpace.bitsPerChannel),
              expandBits(bi, colorSpace.bitsPerChannel),
            ),
          );
        } else {
          colors.push({
            r: expandBits(ri, colorSpace.bitsPerChannel),
            g: expandBits(gi, colorSpace.bitsPerChannel),
            b: expandBits(bi, colorSpace.bitsPerChannel),
          });
        }
      }
    }
  }

  if (colors.length <= count) {
    return colors;
  }

  // Ensure black (first) and white (last) are always included
  const black = colors[0]!;
  const white = colors[colors.length - 1]!;
  const middle = colors.slice(1, -1);
  const needed = count - 2;
  const result: RGB[] = [black];

  if (needed > 0 && middle.length > 0) {
    const step = middle.length / needed;
    for (let i = 0; i < needed; i++) {
      result.push(middle[Math.round(i * step)]!);
    }
  }

  result.push(white);
  return result;
}

/**
 * Generate the full palette of all valid colors for a programmable color space.
 */
export function enumerateColorSpace(colorSpace: ColorBitDepth): RGB[] {
  const levels = 1 << colorSpace.bitsPerChannel;
  const colors: RGB[] = [];

  for (let r = 0; r < levels; r++) {
    for (let g = 0; g < levels; g++) {
      for (let b = 0; b < levels; b++) {
        if (colorSpace.quantize) {
          colors.push(
            colorSpace.quantize(
              expandBits(r, colorSpace.bitsPerChannel),
              expandBits(g, colorSpace.bitsPerChannel),
              expandBits(b, colorSpace.bitsPerChannel),
            ),
          );
        } else {
          colors.push({
            r: expandBits(r, colorSpace.bitsPerChannel),
            g: expandBits(g, colorSpace.bitsPerChannel),
            b: expandBits(b, colorSpace.bitsPerChannel),
          });
        }
      }
    }
  }

  return colors;
}

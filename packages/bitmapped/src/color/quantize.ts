/**
 * Hardware-accurate color quantization functions.
 */

/**
 * Standard linear quantization for most systems.
 * Formula: round(floor(v8 × 2^n / 256) × 255 / (2^n - 1))
 */
export function quantizeBits(value: number, bits: number): number {
  if (bits <= 0) {
    throw new Error(`quantizeBits requires bits > 0, got ${bits}`);
  }
  const levels = 1 << bits;
  const quantized = Math.floor((value * levels) / 256);
  return Math.round((quantized * 255) / (levels - 1));
}

/**
 * Genesis-specific nonlinear DAC mapping.
 * Hardware-measured values from TmEE/Eke's analysis.
 */
export const GENESIS_DAC_NORMAL = [0, 52, 87, 116, 144, 172, 206, 255] as const;
export const GENESIS_DAC_SHADOW = [0, 29, 52, 70, 87, 101, 116, 130] as const;
export const GENESIS_DAC_HIGHLIGHT = [
  130, 144, 158, 172, 187, 206, 228, 255,
] as const;

/** Find closest level in the nonlinear Genesis DAC table */
export function quantizeGenesis(value: number): number {
  let bestIdx = 0;
  let bestDist = Math.abs(value - GENESIS_DAC_NORMAL[0]!);
  for (let i = 1; i < 8; i++) {
    const dist = Math.abs(value - GENESIS_DAC_NORMAL[i]!);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  return GENESIS_DAC_NORMAL[bestIdx]!;
}

/**
 * Amstrad CPC 3-level quantization.
 * NOT a bit-depth system — each channel maps to exactly 3 levels.
 */
export function quantizeCPC(value: number): number {
  if (value < 64) return 0x00;
  if (value < 192) return 0x80;
  return 0xff;
}

/**
 * VGA 6-bit DAC expansion to 8-bit.
 * The accurate formula preserves the 0→0 and 63→255 mapping.
 */
export function expandVGA6to8(value: number): number {
  return (value << 2) | (value >> 4);
}

/**
 * Pre-computed level tables for standard bit depths.
 * Maps bit-depth → array of all valid 8-bit output values.
 */
export const LEVELS: Record<number, readonly number[]> = {
  1: [0, 255],
  2: [0, 85, 170, 255],
  3: Array.from({ length: 8 }, (_, i) => Math.round((i / 7) * 255)),
  4: Array.from({ length: 16 }, (_, i) => i * 17),
  5: Array.from({ length: 32 }, (_, i) => (i << 3) | (i >> 2)),
  6: Array.from({ length: 64 }, (_, i) => (i << 2) | (i >> 4)),
};

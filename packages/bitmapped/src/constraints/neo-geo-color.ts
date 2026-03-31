import type { RGB } from '../core/types.js';

/**
 * Decodes a Neo Geo 16-bit color word into an RGB color.
 *
 * The Neo Geo uses a unique bit layout for its 16-bit color words:
 *   D R0 G0 B0 R4R3R2R1 G4G3G2G1 B4B3B2B1
 *
 * Where D is the "dark" bit (shadow bit) that provides an extra shade level,
 * and R0/G0/B0 are the least significant bits of each channel's 5-bit value.
 * The channels are effectively 6-bit (5 explicit bits + dark bit) and are
 * expanded to 8-bit by replicating the top bits.
 *
 * @param word - The 16-bit Neo Geo color word
 * @returns The decoded RGB color (0-255 per channel)
 */
export function decodeNeoGeoColor(word: number): RGB {
  const dark = (word >> 15) & 1;
  const r4_1 = (word >> 8) & 0xf;
  const r0 = (word >> 14) & 1;
  const r5 = (r4_1 << 2) | (r0 << 1) | dark;
  const g4_1 = (word >> 4) & 0xf;
  const g0 = (word >> 13) & 1;
  const g5 = (g4_1 << 2) | (g0 << 1) | dark;
  const b4_1 = word & 0xf;
  const b0 = (word >> 12) & 1;
  const b5 = (b4_1 << 2) | (b0 << 1) | dark;
  return {
    r: (r5 << 2) | (r5 >> 4),
    g: (g5 << 2) | (g5 >> 4),
    b: (b5 << 2) | (b5 >> 4),
  };
}

/**
 * Encodes an RGB color into a Neo Geo 16-bit color word.
 *
 * Quantizes 8-bit channels to 6-bit values, then packs them into the
 * Neo Geo's bit layout. The dark bit is determined by majority vote of
 * the LSBs of the three quantized channel values.
 *
 * @param r - Red channel (0-255)
 * @param g - Green channel (0-255)
 * @param b - Blue channel (0-255)
 * @returns The encoded 16-bit Neo Geo color word
 */
export function encodeNeoGeoColor(r: number, g: number, b: number): number {
  // Quantize to 6-bit
  const r6 = r >> 2;
  const g6 = g >> 2;
  const b6 = b >> 2;
  // Extract bits
  const dark = (r6 & 1) + (g6 & 1) + (b6 & 1) >= 2 ? 1 : 0; // majority vote
  const r0 = (r6 >> 1) & 1;
  const r4_1 = (r6 >> 2) & 0xf;
  const g0 = (g6 >> 1) & 1;
  const g4_1 = (g6 >> 2) & 0xf;
  const b0 = (b6 >> 1) & 1;
  const b4_1 = (b6 >> 2) & 0xf;
  return (
    (dark << 15) |
    (r0 << 14) |
    (g0 << 13) |
    (b0 << 12) |
    (r4_1 << 8) |
    (g4_1 << 4) |
    b4_1
  );
}

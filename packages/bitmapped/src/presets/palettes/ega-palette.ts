/**
 * EGA 64-color palette.
 * 6-bit register format: rgbRGB
 *   R,G,B = primary bits (2/3 intensity = 0xAA)
 *   r,g,b = secondary bits (1/3 intensity = 0x55)
 *
 * Each channel value = (PRIMARY × 0xAA) + (secondary × 0x55)
 * Possible per-channel values: 0x00, 0x55, 0xAA, 0xFF
 */
export function generateEGAPalette(): string[] {
  const palette: string[] = [];
  for (let i = 0; i < 64; i++) {
    const rSecondary = (i >> 5) & 1; // bit 5
    const gSecondary = (i >> 4) & 1; // bit 4
    const bSecondary = (i >> 3) & 1; // bit 3
    const rPrimary = (i >> 2) & 1; // bit 2
    const gPrimary = (i >> 1) & 1; // bit 1
    const bPrimary = (i >> 0) & 1; // bit 0

    const r = rPrimary * 0xaa + rSecondary * 0x55;
    const g = gPrimary * 0xaa + gSecondary * 0x55;
    const b = bPrimary * 0xaa + bSecondary * 0x55;

    palette.push(
      `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
    );
  }
  return palette;
}

/**
 * EGA default 16-register mapping (CGA backward-compatible).
 * Maps pixel values 0-15 to EGA palette indices 0-63.
 */
export const EGA_DEFAULT_REGISTERS: readonly number[] = [
  0x00,
  0x01,
  0x02,
  0x03,
  0x04,
  0x05,
  0x14,
  0x07, // 0-7 (note: 6→0x14 = brown)
  0x38,
  0x39,
  0x3a,
  0x3b,
  0x3c,
  0x3d,
  0x3e,
  0x3f, // 8-15
];

/**
 * IBM CGA RGBI palette.
 * 4-bit encoding: I-R-G-B (Intensity, Red, Green, Blue).
 *
 * IMPORTANT: Color 6 (0110 = dark yellow) is modified by the
 * IBM 5153 monitor to produce brown by reducing green to ~1/3.
 */
export const CGA_RGBI: readonly string[] = [
  '#000000', // 0:  Black
  '#0000AA', // 1:  Blue
  '#00AA00', // 2:  Green
  '#00AAAA', // 3:  Cyan
  '#AA0000', // 4:  Red
  '#AA00AA', // 5:  Magenta
  '#AA5500', // 6:  Brown          ← NOT #AAAA00
  '#AAAAAA', // 7:  Light Gray
  '#555555', // 8:  Dark Gray
  '#5555FF', // 9:  Light Blue
  '#55FF55', // 10: Light Green
  '#55FFFF', // 11: Light Cyan
  '#FF5555', // 12: Light Red
  '#FF55FF', // 13: Light Magenta
  '#FFFF55', // 14: Yellow
  '#FFFFFF', // 15: White
];

/** CGA 320×200 sub-palette modes. Background color is user-selectable from all 16. */
export const CGA_PALETTE_0_LOW: readonly string[] = [
  '#00AA00',
  '#AA0000',
  '#AA5500',
];
export const CGA_PALETTE_0_HIGH: readonly string[] = [
  '#55FF55',
  '#FF5555',
  '#FFFF55',
];
export const CGA_PALETTE_1_LOW: readonly string[] = [
  '#00AAAA',
  '#AA00AA',
  '#AAAAAA',
];
export const CGA_PALETTE_1_HIGH: readonly string[] = [
  '#55FFFF',
  '#FF55FF',
  '#FFFFFF',
];

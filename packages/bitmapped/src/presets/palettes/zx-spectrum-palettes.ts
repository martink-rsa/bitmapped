/**
 * ZX Spectrum colors.
 *
 * Non-bright: voltage ratio = 0xD8/0xFF ≈ 0.847
 * Bright: full voltage = 0xFF
 * Black is identical in both sets → 15 unique colors.
 */

/** Hardware-accurate D8 variant (recommended) */
export const ZX_SPECTRUM_D8: readonly string[] = [
  // Non-bright (BRIGHT=0)
  '#000000', // 0: Black
  '#0000D8', // 1: Blue
  '#D80000', // 2: Red
  '#D800D8', // 3: Magenta
  '#00D800', // 4: Green
  '#00D8D8', // 5: Cyan
  '#D8D800', // 6: Yellow
  '#D8D8D8', // 7: White
  // Bright (BRIGHT=1)
  '#000000', // 0: Black (same)
  '#0000FF', // 1: Bright Blue
  '#FF0000', // 2: Bright Red
  '#FF00FF', // 3: Bright Magenta
  '#00FF00', // 4: Bright Green
  '#00FFFF', // 5: Bright Cyan
  '#FFFF00', // 6: Bright Yellow
  '#FFFFFF', // 7: Bright White
];

/** FUSE emulator convention (uses 0xD7 instead of 0xD8) */
export const ZX_SPECTRUM_D7: readonly string[] = [
  '#000000',
  '#0000D7',
  '#D70000',
  '#D700D7',
  '#00D700',
  '#00D7D7',
  '#D7D700',
  '#D7D7D7',
  '#000000',
  '#0000FF',
  '#FF0000',
  '#FF00FF',
  '#00FF00',
  '#00FFFF',
  '#FFFF00',
  '#FFFFFF',
];

import type { HardwarePreset } from '../../core/types.js';

/** Generate a representative 64-color palette from the VGA 18-bit RGB666 DAC */
function generateVGAPalette() {
  const levels = [0, 21, 42, 63];
  const colors = [];
  for (const r of levels) {
    for (const g of levels) {
      for (const b of levels) {
        const r8 = (r << 2) | (r >> 4);
        const g8 = (g << 2) | (g >> 4);
        const b8 = (b << 2) | (b >> 4);
        colors.push({ color: { r: r8, g: g8, b: b8 } });
      }
    }
  }
  return colors;
}

export const vgaMode13h: HardwarePreset = {
  id: 'vga-mode13h',
  name: 'VGA Mode 13h',
  category: 'ibm-pc',
  system: 'IBM PC (VGA)',
  resolution: {
    width: 320,
    height: 200,
  },
  par: { x: 6, y: 5 },
  palette: generateVGAPalette(),
  display: {
    type: 'crt-rgb',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.2, gap: 1 },
    },
  },
  paletteType: 'rgb-bitdepth',
  bitsPerChannel: { r: 6, g: 6, b: 6 },
  totalColors: 262144,
  simultaneousColors: 256,
  constraintType: 'none',
  recommendedDithering: 'none',
  notes:
    'VGA Mode 13h — 320x200 with 256 colors from an 18-bit RGB666 DAC (262,144 possible colors). Palette is a representative 64-color sample.',
};

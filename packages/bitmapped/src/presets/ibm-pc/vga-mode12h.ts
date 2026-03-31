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

export const vgaMode12h: HardwarePreset = {
  id: 'vga-mode12h',
  name: 'VGA Mode 12h',
  category: 'ibm-pc',
  system: 'IBM PC (VGA)',
  resolution: {
    width: 640,
    height: 480,
  },
  par: { x: 1, y: 1 },
  palette: generateVGAPalette(),
  display: {
    type: 'crt-rgb',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.15, gap: 1 },
    },
  },
  paletteType: 'rgb-bitdepth',
  bitsPerChannel: { r: 6, g: 6, b: 6 },
  totalColors: 262144,
  simultaneousColors: 16,
  constraintType: 'none',
  notes:
    'VGA Mode 12h — 640x480 with 16 colors from an 18-bit RGB666 DAC (262,144 possible colors). Palette is a representative 64-color sample.',
};

import type { HardwarePreset } from '../../core/types.js';

/** Generate a representative 64-color palette from the full RGB888 color space */
function generatePicotronPalette() {
  const levels = [0, 85, 170, 255];
  const colors = [];
  for (const r of levels) {
    for (const g of levels) {
      for (const b of levels) {
        colors.push({ color: { r, g, b } });
      }
    }
  }
  return colors;
}

export const picotron: HardwarePreset = {
  id: 'picotron',
  name: 'Picotron',
  category: 'fantasy',
  system: 'Picotron',

  paletteType: 'rgb-bitdepth',
  totalColors: 16777216,
  simultaneousColors: 256,
  constraintType: 'none',

  colorSpace: {
    type: 'programmable',
    bitsPerChannel: 8,
    totalBits: 24,
    format: 'RGB888',
    maxSimultaneous: 256,
  },
  palette: generatePicotronPalette(),
  resolution: { width: 480, height: 270 },
  par: { x: 1, y: 1 },
  display: {
    type: 'lcd-tft',
    defaultEffects: {},
  },
  notes:
    'Fantasy workstation with full 24-bit RGB888 color (16.7M colors), 256 simultaneous. Palette is a representative 64-color sample.',
};

import type { HardwarePreset } from '../../core/types.js';

const GBA_COLOR_SPACE = {
  type: 'programmable' as const,
  bitsPerChannel: 5,
  totalBits: 15,
  format: 'BGR555',
  maxSimultaneous: 512,
};

/** Generate a representative 64-color palette from the GBA 15-bit color space */
function generateGBAPalette() {
  const levels = [0, 10, 21, 31];
  const colors = [];
  for (const r of levels) {
    for (const g of levels) {
      for (const b of levels) {
        const r8 = (r << 3) | (r >> 2);
        const g8 = (g << 3) | (g >> 2);
        const b8 = (b << 3) | (b >> 2);
        colors.push({ color: { r: r8, g: g8, b: b8 } });
      }
    }
  }
  return colors;
}

export const gba: HardwarePreset = {
  id: 'gba',
  name: 'Game Boy Advance',
  category: 'nintendo',
  system: 'Game Boy Advance',
  colorSpace: GBA_COLOR_SPACE,
  palette: generateGBAPalette(),
  resolution: { width: 240, height: 160 },
  par: { x: 1, y: 1 },
  display: {
    type: 'lcd-tft',
    defaultEffects: {
      lcdGrid: {
        enabled: true,
        gridOpacity: 0.05,
        gridColor: { r: 20, g: 20, b: 20 },
      },
    },
  },
  notes:
    '15-bit color (32768 colors), 512 simultaneous. Palette is a representative 64-color sample.',
};

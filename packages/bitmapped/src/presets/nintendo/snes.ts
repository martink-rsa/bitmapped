import type { HardwarePreset } from '../../core/types.js';

const SNES_COLOR_SPACE = {
  type: 'programmable' as const,
  bitsPerChannel: 5,
  totalBits: 15,
  format: 'BGR555',
  maxSimultaneous: 256,
};

/** Generate a representative 64-color palette from the SNES 15-bit color space */
function generateSNESPalette() {
  // Sample evenly across each channel: 4 levels per channel = 64 colors
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

export const snes: HardwarePreset = {
  id: 'snes',
  name: 'SNES / Super Famicom',
  category: 'nintendo',
  system: 'SNES / Super Famicom',
  region: 'ntsc',
  colorSpace: SNES_COLOR_SPACE,
  palette: generateSNESPalette(),
  resolution: {
    width: 256,
    height: 224,
    alternativeModes: [
      { width: 512, height: 224, label: 'Hi-Res' },
      { width: 256, height: 448, label: 'Interlaced' },
    ],
  },
  par: { x: 8, y: 7 },
  display: {
    type: 'crt-composite',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.2, gap: 1 },
    },
  },
  notes:
    '15-bit color (32768 colors), 256 simultaneous. Palette is a representative 64-color sample.',
};

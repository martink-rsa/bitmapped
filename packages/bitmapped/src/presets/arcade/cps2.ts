import type { HardwarePreset } from '../../core/types.js';
import { expandBits } from '../quantize.js';

/** Generate a representative 64-color palette from the CPS-2 RGB555 color space */
function generateCPS2Palette() {
  const levels = [0, 10, 21, 31];
  const colors = [];
  for (const r of levels) {
    for (const g of levels) {
      for (const b of levels) {
        const r8 = expandBits(r, 5);
        const g8 = expandBits(g, 5);
        const b8 = expandBits(b, 5);
        colors.push({ color: { r: r8, g: g8, b: b8 } });
      }
    }
  }
  return colors;
}

export const cps2: HardwarePreset = {
  id: 'cps2',
  name: 'Capcom CPS-2',
  category: 'arcade',
  system: 'Capcom CPS-2',

  paletteType: 'rgb-bitdepth',
  totalColors: 65536,
  simultaneousColors: 4096,
  constraintType: 'per-tile-palette',
  tileSize: { width: 16, height: 16 },

  colorSpace: {
    type: 'programmable',
    bitsPerChannel: 5,
    totalBits: 15,
    format: 'RGB555',
    maxSimultaneous: 4096,
  },
  palette: generateCPS2Palette(),
  resolution: { width: 384, height: 224 },
  par: { x: 1, y: 1 },
  display: {
    type: 'crt-rgb',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.3, gap: 1 },
    },
  },
  notes:
    'RGB555 (65536 possible colors), 4096 simultaneous. Per-tile palette with 16x16 tiles. Arcade RGB CRT output.',
};

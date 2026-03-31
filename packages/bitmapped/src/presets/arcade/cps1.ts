import type { HardwarePreset } from '../../core/types.js';
import { expandBits } from '../quantize.js';

/** Generate a representative 64-color palette from the CPS-1 RGB555 color space */
function generateCPS1Palette() {
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

export const cps1: HardwarePreset = {
  id: 'cps1',
  name: 'Capcom CPS-1',
  category: 'arcade',
  system: 'Capcom CPS-1',

  paletteType: 'rgb-bitdepth',
  totalColors: 65536,
  simultaneousColors: 4096,
  constraintType: 'per-tile-palette',
  tileSize: { width: 16, height: 16 },
  paletteLayout: {
    subpaletteCount: 192,
    colorsPerSubpalette: 16,
    sharedTransparent: true,
  },

  colorSpace: {
    type: 'programmable',
    bitsPerChannel: 5,
    totalBits: 15,
    format: 'RGB555',
    maxSimultaneous: 4096,
  },
  palette: generateCPS1Palette(),
  resolution: { width: 384, height: 224 },
  par: { x: 1, y: 1 },
  display: {
    type: 'crt-rgb',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.3, gap: 1 },
    },
  },
  notes:
    'RGB555 (65536 possible colors), 4096 simultaneous. 192 sub-palettes of 16 colors with shared transparent. Arcade RGB CRT output.',
};

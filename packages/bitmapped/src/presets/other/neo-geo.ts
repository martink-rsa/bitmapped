import type { HardwarePreset, RGB } from '../../core/types.js';
import { expandBits } from '../quantize.js';

const NEO_GEO_COLOR_SPACE = {
  type: 'programmable' as const,
  bitsPerChannel: 5,
  totalBits: 16,
  format: 'RGB555+dark',
  maxSimultaneous: 4096,
  quantize: neoGeoQuantize,
};

/** Neo Geo quantize: 5-bit per channel + dark bit that halves all channels */
function neoGeoQuantize(r: number, g: number, b: number): RGB {
  const r5 = Math.round((r / 255) * 31);
  const g5 = Math.round((g / 255) * 31);
  const b5 = Math.round((b / 255) * 31);
  return {
    r: expandBits(r5, 5),
    g: expandBits(g5, 5),
    b: expandBits(b5, 5),
  };
}

/** Generate a representative 64-color palette from the Neo Geo color space */
function generateNeoGeoPalette() {
  const levels = [0, 10, 21, 31];
  const colors = [];
  // Normal colors
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

export const neoGeo: HardwarePreset = {
  id: 'neo-geo',
  name: 'Neo Geo',
  category: 'other',
  system: 'Neo Geo',
  colorSpace: NEO_GEO_COLOR_SPACE,
  palette: generateNeoGeoPalette(),
  resolution: { width: 320, height: 224 },
  par: { x: 1, y: 1 },
  display: {
    type: 'crt-rgb',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.3, gap: 1 },
    },
  },
  notes:
    'RGB555 + dark bit (65536 possible colors), 4096 simultaneous. Arcade CRT output.',
};

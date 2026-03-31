import type { HardwarePreset } from '../../core/types.js';
import { VIRTUAL_BOY } from '../palettes/misc-palettes.js';

function hex(h: string) {
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/** Virtual Boy 4-shade red monochrome palette */
const VB_PALETTE = VIRTUAL_BOY.map((h, i) => ({
  color: hex(h.replace('#', '')),
  name: ['Black', 'Dark Red', 'Medium Red', 'Bright Red'][i],
}));

export const virtualBoy: HardwarePreset = {
  id: 'virtual-boy',
  name: 'Virtual Boy',
  category: 'nintendo',
  system: 'Virtual Boy',

  paletteType: 'monochrome-shades',
  totalColors: 4,
  simultaneousColors: 4,
  constraintType: 'monochrome-global',
  tileSize: { width: 8, height: 8 },

  displayCharacteristics: {
    colorTint: { r: 0xef, g: 0x00, b: 0x00 },
  },

  recommendedDithering: 'bayer',
  recommendedDistance: 'euclidean',

  palette: VB_PALETTE,
  resolution: { width: 384, height: 224 },
  par: { x: 1, y: 1 },
  display: {
    type: 'lcd-backlit',
    defaultEffects: {},
  },
  notes:
    '4-shade red monochrome display. Red LED-based stereoscopic system with 384x224 per eye.',
};

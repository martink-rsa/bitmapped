import type { HardwarePreset } from '../../core/types.js';
import { TIC80_SWEETIE16 } from '../palettes/misc-palettes.js';

function hex(h: string) {
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/** TIC-80 default palette (Sweetie 16) */
const TIC80_PALETTE = TIC80_SWEETIE16.map((h, i) => ({
  color: hex(h.replace('#', '')),
  name: `Color ${i}`,
}));

export const tic80: HardwarePreset = {
  id: 'tic80',
  name: 'TIC-80',
  category: 'fantasy',
  system: 'TIC-80',

  paletteType: 'fixed-lut',
  totalColors: 16,
  simultaneousColors: 16,
  constraintType: 'none',

  palette: TIC80_PALETTE,
  resolution: { width: 240, height: 136 },
  par: { x: 1, y: 1 },
  display: {
    type: 'lcd-tft',
    defaultEffects: {},
  },
  notes:
    'Fantasy console with 16-color Sweetie 16 default palette. All 16 colors available simultaneously.',
};

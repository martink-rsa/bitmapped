import type { HardwarePreset } from '../../core/types.js';
import { PICO8_STANDARD } from '../palettes/pico8-palette.js';

function hex(h: string) {
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/** PICO-8 standard 16-color palette + 16 extended (secret) colors = 32 total */
const PICO8_PALETTE = PICO8_STANDARD.map((h, i) => ({
  color: hex(h.replace('#', '')),
  name: `Color ${i}`,
}));

export const pico8: HardwarePreset = {
  id: 'pico8',
  name: 'PICO-8',
  category: 'fantasy',
  system: 'PICO-8',

  paletteType: 'fixed-lut',
  totalColors: 32,
  simultaneousColors: 16,
  constraintType: 'none',

  palette: PICO8_PALETTE,
  resolution: { width: 128, height: 128 },
  par: { x: 1, y: 1 },
  display: {
    type: 'lcd-tft',
    defaultEffects: {},
  },
  notes:
    'Fantasy console with 32 total colors (16 standard + 16 secret/extended), 16 simultaneous on screen.',
};

import type { HardwarePreset } from '../../core/types.js';
import { TMS9918A_PALETTE } from '../palettes/tms9918a-palette.js';

function hex(h: string) {
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/** TMS9918A 15-color palette (index 0 is transparent, rendered as black) */
const COLECO_PALETTE = TMS9918A_PALETTE.map((h, i) => ({
  color: hex(h.replace('#', '')),
  name: `Color ${i}`,
}));

export const colecovision: HardwarePreset = {
  id: 'colecovision',
  name: 'ColecoVision',
  category: 'other',
  system: 'ColecoVision',

  paletteType: 'fixed-lut',
  totalColors: 15,
  simultaneousColors: 15,
  constraintType: 'per-row-in-tile',
  attributeBlock: { width: 8, height: 1, maxColors: 2 },
  tileSize: { width: 8, height: 8 },
  scanlineLimits: { maxSprites: 4 },

  palette: COLECO_PALETTE,
  resolution: { width: 256, height: 192 },
  par: { x: 1, y: 1 },
  display: {
    type: 'crt-composite',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.25, gap: 1 },
      colorFringe: { enabled: true, type: 'ntsc' },
    },
  },
  notes:
    'TMS9918A VDP with 15 fixed colors. Per-row-in-tile constraint: 2 colors per 8x1 pixel row within each 8x8 tile. Max 4 sprites per scanline.',
};

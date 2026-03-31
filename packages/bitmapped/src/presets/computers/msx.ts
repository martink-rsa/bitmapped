import type { HardwarePreset } from '../../core/types.js';
import { TMS9918A_PALETTE } from '../palettes/tms9918a-palette.js';

function hex(h: string) {
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

const tmsColors = TMS9918A_PALETTE.map((c) => ({
  color: hex(c.replace('#', '')),
}));

export const msx: HardwarePreset = {
  id: 'msx',
  name: 'MSX',
  category: 'computer',
  system: 'MSX',
  palette: tmsColors,
  resolution: { width: 256, height: 192 },
  par: { x: 1, y: 1 },
  display: {
    type: 'crt-composite',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.25, gap: 1 },
    },
  },
  paletteType: 'fixed-lut',
  masterPalette: TMS9918A_PALETTE,
  totalColors: 15,
  simultaneousColors: 15,
  constraintType: 'per-row-in-tile',
  attributeBlock: { width: 8, height: 1, maxColors: 2 },
  tileSize: { width: 8, height: 8 },
  scanlineLimits: { maxSprites: 4 },
  notes:
    'TMS9918A VDP: 15 colors (index 0 is transparent). 2 colors per 8-pixel row within each 8x8 tile.',
};

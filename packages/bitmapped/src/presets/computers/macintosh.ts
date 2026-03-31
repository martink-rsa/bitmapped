import type { HardwarePreset } from '../../core/types.js';

function hex(h: string) {
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

const MAC_COLORS = [
  { color: hex('FFFFFF'), name: 'White' },
  { color: hex('000000'), name: 'Black' },
];

const MAC_HEX: readonly string[] = ['#FFFFFF', '#000000'];

export const macintosh: HardwarePreset = {
  id: 'macintosh',
  name: 'Original Macintosh',
  category: 'computer',
  system: 'Macintosh 128K',
  palette: MAC_COLORS,
  resolution: { width: 512, height: 342 },
  par: { x: 1, y: 1 },
  display: {
    type: 'lcd-tft',
    defaultEffects: {},
  },
  paletteType: 'fixed-lut',
  masterPalette: MAC_HEX,
  totalColors: 2,
  simultaneousColors: 2,
  constraintType: 'monochrome-global',
  recommendedDithering: 'atkinson',
  notes:
    "1-bit monochrome display (512x342). Bill Atkinson's dithering algorithm was developed specifically for this machine.",
};

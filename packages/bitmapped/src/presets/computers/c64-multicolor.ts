import type { HardwarePreset } from '../../core/types.js';
import { C64_COLODORE } from '../palettes/c64-palettes.js';

function hex(h: string) {
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

const COLODORE_NAMES = [
  'Black',
  'White',
  'Red',
  'Cyan',
  'Purple',
  'Green',
  'Blue',
  'Yellow',
  'Orange',
  'Brown',
  'Light Red',
  'Dark Grey',
  'Grey',
  'Light Green',
  'Light Blue',
  'Light Grey',
];

const colodoreColors = C64_COLODORE.map((c, i) => ({
  color: hex(c.replace('#', '')),
  name: COLODORE_NAMES[i],
}));

export const c64Multicolor: HardwarePreset = {
  id: 'c64-multicolor',
  name: 'Commodore 64 (Multicolor)',
  category: 'computer',
  system: 'Commodore 64',
  palette: colodoreColors,
  resolution: { width: 160, height: 200 },
  par: { x: 1.5, y: 1 },
  display: {
    type: 'crt-composite',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.3, gap: 1 },
    },
  },
  paletteType: 'fixed-lut',
  masterPalette: C64_COLODORE,
  totalColors: 16,
  simultaneousColors: 16,
  constraintType: 'attribute-block',
  attributeBlock: { width: 4, height: 8, maxColors: 4, globalBackground: 1 },
  displayCharacteristics: { doubleWidePixels: true },
  recommendedDithering: 'none',
  paletteVariant: 'colodore',
  notes:
    'Multicolor bitmap mode: 160x200 (double-wide pixels), 4 colors per 4x8 cell (3 unique + 1 shared background). Colodore palette variant.',
};

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

export const c64Hires: HardwarePreset = {
  id: 'c64-hires',
  name: 'Commodore 64 (Hires)',
  category: 'computer',
  system: 'Commodore 64',
  palette: colodoreColors,
  resolution: { width: 320, height: 200 },
  par: { x: 0.75, y: 1 },
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
  attributeBlock: { width: 8, height: 8, maxColors: 2 },
  recommendedDithering: 'floyd-steinberg',
  paletteVariant: 'colodore',
  notes:
    'Hires bitmap mode: 320x200, 2 colors per 8x8 attribute cell. Colodore palette variant.',
};

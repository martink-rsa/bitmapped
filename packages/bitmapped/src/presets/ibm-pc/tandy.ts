import type { HardwarePreset } from '../../core/types.js';
import { CGA_RGBI } from '../palettes/cga-palettes.js';

function hex(h: string) {
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

const CGA_NAMES = [
  'Black',
  'Blue',
  'Green',
  'Cyan',
  'Red',
  'Magenta',
  'Brown',
  'Lt Gray',
  'Dark Gray',
  'Lt Blue',
  'Lt Green',
  'Lt Cyan',
  'Lt Red',
  'Lt Magenta',
  'Yellow',
  'White',
];

export const tandy: HardwarePreset = {
  id: 'tandy-1000',
  name: 'Tandy 1000',
  category: 'ibm-pc',
  system: 'Tandy 1000',
  resolution: {
    width: 320,
    height: 200,
  },
  par: { x: 6, y: 5 },
  palette: CGA_RGBI.map((c, i) => ({
    color: hex(c.replace('#', '')),
    name: CGA_NAMES[i],
  })),
  display: {
    type: 'crt-composite',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.25, gap: 1 },
    },
  },
  paletteType: 'fixed-lut',
  totalColors: 16,
  simultaneousColors: 16,
  constraintType: 'none',
  notes:
    'Tandy 1000 320x200 16-color mode — all 16 CGA RGBI colors available without sub-palette restrictions.',
};

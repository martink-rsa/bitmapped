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

export const cgaComposite: HardwarePreset = {
  id: 'cga-composite',
  name: 'CGA Composite',
  category: 'ibm-pc',
  system: 'IBM PC (CGA)',
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
      compositeDither: { enabled: true, blendRadius: 1 },
      scanlines: { enabled: true, intensity: 0.3, gap: 1 },
    },
  },
  paletteType: 'fixed-lut',
  totalColors: 16,
  simultaneousColors: 16,
  constraintType: 'sub-palette-lock',
  notes:
    'CGA composite output — NTSC artifact colors allow blending of adjacent pixels for extra perceived colors.',
};

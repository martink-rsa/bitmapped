import type { HardwarePreset } from '../../core/types.js';
import { THOMSON_MO5 } from '../palettes/misc-palettes.js';

function hex(h: string) {
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

const mo5Colors = THOMSON_MO5.map((c) => ({
  color: hex(c.replace('#', '')),
}));

export const thomsonMO5: HardwarePreset = {
  id: 'thomson-mo5',
  name: 'Thomson MO5',
  category: 'computer',
  system: 'Thomson MO5',
  palette: mo5Colors,
  resolution: { width: 320, height: 200 },
  par: { x: 1, y: 1 },
  display: {
    type: 'crt-composite',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.25, gap: 1 },
    },
  },
  paletteType: 'fixed-lut',
  masterPalette: THOMSON_MO5,
  totalColors: 16,
  simultaneousColors: 16,
  constraintType: 'attribute-block',
  attributeBlock: { width: 8, height: 1, maxColors: 2 },
  notes:
    '16-color fixed palette (4-bit PBGR). 2 colors per 8-pixel row (attribute block 8x1).',
};

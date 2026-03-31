import type { HardwarePreset } from '../../core/types.js';
import {
  CGA_PALETTE_0_LOW,
  CGA_PALETTE_0_HIGH,
} from '../palettes/cga-palettes.js';

function hex(h: string) {
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

const CGA_NAMES_PAL0 = ['Green', 'Red', 'Brown'];
const CGA_NAMES_PAL0_HIGH = ['Lt Green', 'Lt Red', 'Yellow'];

const basePreset = {
  category: 'ibm-pc' as const,
  system: 'IBM PC (CGA)',
  resolution: {
    width: 320,
    height: 200,
  },
  par: { x: 6, y: 5 },
  display: {
    type: 'crt-rgb' as const,
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.3, gap: 1 },
    },
  },
  paletteType: 'fixed-lut' as const,
  totalColors: 16,
  simultaneousColors: 4,
  constraintType: 'sub-palette-lock' as const,
  recommendedDithering: 'bayer' as const,
};

export const cgaPal0Low: HardwarePreset = {
  ...basePreset,
  id: 'cga-mode4-pal0-low',
  name: 'CGA Mode 4 (Palette 0, Low)',
  palette: [
    { color: hex('000000'), name: 'Black' },
    ...CGA_PALETTE_0_LOW.map((c, i) => ({
      color: hex(c.replace('#', '')),
      name: CGA_NAMES_PAL0[i],
    })),
  ],
  notes:
    'CGA 320x200 4-color mode, palette 0 (low intensity): black, green, red, brown.',
};

export const cgaPal0High: HardwarePreset = {
  ...basePreset,
  id: 'cga-mode4-pal0-high',
  name: 'CGA Mode 4 (Palette 0, High)',
  palette: [
    { color: hex('000000'), name: 'Black' },
    ...CGA_PALETTE_0_HIGH.map((c, i) => ({
      color: hex(c.replace('#', '')),
      name: CGA_NAMES_PAL0_HIGH[i],
    })),
  ],
  notes:
    'CGA 320x200 4-color mode, palette 0 (high intensity): black, light green, light red, yellow.',
};

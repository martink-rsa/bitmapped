import type { HardwarePreset } from '../../core/types.js';
import { BBC_MICRO_PALETTE } from '../palettes/misc-palettes.js';

function hex(h: string) {
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

const bbcColors = BBC_MICRO_PALETTE.map((c) => ({
  color: hex(c.replace('#', '')),
}));

export const bbcMicroMode2: HardwarePreset = {
  id: 'bbc-micro-mode2',
  name: 'BBC Micro (Mode 2)',
  category: 'computer',
  system: 'BBC Micro',
  palette: bbcColors,
  resolution: { width: 160, height: 256 },
  par: { x: 2, y: 1 },
  display: {
    type: 'crt-rgb',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.2, gap: 1 },
    },
  },
  paletteType: 'fixed-lut',
  masterPalette: BBC_MICRO_PALETTE,
  totalColors: 8,
  simultaneousColors: 8,
  constraintType: 'none',
  recommendedDithering: 'floyd-steinberg',
  notes: 'Mode 2: 160x256, all 8 colors available. 1-bit per RGB channel.',
};

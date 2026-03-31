import type { HardwarePreset } from '../../core/types.js';
import { enumerateColorSpace } from '../quantize.js';

const SYSTEM16_COLOR_SPACE = {
  type: 'programmable' as const,
  bitsPerChannel: 4,
  totalBits: 12,
  format: 'RGB444',
  maxSimultaneous: 2048,
};

/** Generate the full 4096-color System 16 palette */
function generateSystem16Palette() {
  return enumerateColorSpace(SYSTEM16_COLOR_SPACE).map((color) => ({ color }));
}

export const segaSystem16: HardwarePreset = {
  id: 'sega-system16',
  name: 'Sega System 16',
  category: 'arcade',
  system: 'Sega System 16',

  paletteType: 'rgb-bitdepth',
  totalColors: 4096,
  simultaneousColors: 2048,
  constraintType: 'per-tile-palette',
  tileSize: { width: 8, height: 8 },

  colorSpace: SYSTEM16_COLOR_SPACE,
  palette: generateSystem16Palette(),
  resolution: { width: 320, height: 224 },
  par: { x: 1, y: 1 },
  display: {
    type: 'crt-rgb',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.3, gap: 1 },
    },
  },
  notes:
    'RGB444 (4096 possible colors), 2048 simultaneous. Per-tile palette with 8x8 tiles. Arcade RGB CRT output.',
};

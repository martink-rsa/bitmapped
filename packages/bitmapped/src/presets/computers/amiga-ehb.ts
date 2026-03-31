import type { HardwarePreset } from '../../core/types.js';
import { sampleColorSpace } from '../quantize.js';

const EHB_COLOR_SPACE = {
  type: 'programmable' as const,
  bitsPerChannel: 4,
  totalBits: 12,
  format: 'RGB444',
  maxSimultaneous: 64,
};

export const amigaEHB: HardwarePreset = {
  id: 'amiga-ehb',
  name: 'Amiga OCS (EHB)',
  category: 'computer',
  system: 'Amiga',
  region: 'pal',
  colorSpace: EHB_COLOR_SPACE,
  palette: sampleColorSpace(EHB_COLOR_SPACE, 64).map((color) => ({ color })),
  resolution: { width: 320, height: 256 },
  par: { x: 1, y: 1 },
  display: {
    type: 'crt-rgb',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.15, gap: 1 },
    },
  },
  paletteType: 'rgb-bitdepth',
  totalColors: 4096,
  simultaneousColors: 64,
  bitsPerChannel: { r: 4, g: 4, b: 4 },
  constraintType: 'none',
  recommendedDithering: 'floyd-steinberg',
  notes:
    'Extra Half-Brite mode: 32 programmable colors + 32 half-brightness copies = 64 simultaneous colors from the 4096-color OCS palette.',
};

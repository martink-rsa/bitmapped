import type { HardwarePreset } from '../../core/types.js';
import { sampleColorSpace } from '../quantize.js';

const ST_COLOR_SPACE = {
  type: 'programmable' as const,
  bitsPerChannel: 3,
  totalBits: 9,
  format: 'RGB333',
  maxSimultaneous: 16,
};

export const atariST: HardwarePreset = {
  id: 'atari-st',
  name: 'Atari ST',
  category: 'computer',
  system: 'Atari ST',
  colorSpace: ST_COLOR_SPACE,
  palette: sampleColorSpace(ST_COLOR_SPACE, 16).map((color) => ({ color })),
  resolution: { width: 320, height: 200 },
  par: { x: 1, y: 1 },
  display: {
    type: 'crt-rgb',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.15, gap: 1 },
    },
  },
  paletteType: 'rgb-bitdepth',
  totalColors: 512,
  simultaneousColors: 16,
  bitsPerChannel: { r: 3, g: 3, b: 3 },
  constraintType: 'none',
  recommendedDithering: 'floyd-steinberg',
  notes:
    'Shifter chip: 9-bit color (3 bits per channel, 512 colors), 16 simultaneous in low-res mode.',
};

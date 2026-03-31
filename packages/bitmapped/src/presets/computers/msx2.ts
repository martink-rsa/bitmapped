import type { HardwarePreset } from '../../core/types.js';
import { sampleColorSpace } from '../quantize.js';

const MSX2_COLOR_SPACE = {
  type: 'programmable' as const,
  bitsPerChannel: 3,
  totalBits: 9,
  format: 'RGB333',
  maxSimultaneous: 256,
};

export const msx2: HardwarePreset = {
  id: 'msx2',
  name: 'MSX2',
  category: 'computer',
  system: 'MSX2',
  colorSpace: MSX2_COLOR_SPACE,
  palette: sampleColorSpace(MSX2_COLOR_SPACE, 256).map((color) => ({ color })),
  resolution: { width: 256, height: 212 },
  par: { x: 1, y: 1 },
  display: {
    type: 'crt-composite',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.25, gap: 1 },
    },
  },
  paletteType: 'rgb-bitdepth',
  totalColors: 512,
  simultaneousColors: 256,
  bitsPerChannel: { r: 3, g: 3, b: 3 },
  constraintType: 'none',
  recommendedDithering: 'bayer',
  notes:
    'V9938 VDP Screen 8: 256 simultaneous colors from 512 (3 bits per channel). Bitmap mode, no tile constraints.',
};

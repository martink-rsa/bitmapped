import type { HardwarePreset } from '../../core/types.js';
import { sampleColorSpace } from '../quantize.js';

const STE_COLOR_SPACE = {
  type: 'programmable' as const,
  bitsPerChannel: 4,
  totalBits: 12,
  format: 'RGB444',
  maxSimultaneous: 16,
};

export const atariSTE: HardwarePreset = {
  id: 'atari-ste',
  name: 'Atari STE',
  category: 'computer',
  system: 'Atari STE',
  colorSpace: STE_COLOR_SPACE,
  palette: sampleColorSpace(STE_COLOR_SPACE, 16).map((color) => ({ color })),
  resolution: { width: 320, height: 200 },
  par: { x: 1, y: 1 },
  display: {
    type: 'crt-rgb',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.15, gap: 1 },
    },
  },
  paletteType: 'rgb-bitdepth',
  totalColors: 4096,
  simultaneousColors: 16,
  bitsPerChannel: { r: 4, g: 4, b: 4 },
  constraintType: 'none',
  recommendedDithering: 'floyd-steinberg',
  notes:
    'Enhanced Shifter: 12-bit color (4 bits per channel, 4096 colors), 16 simultaneous in low-res mode.',
};

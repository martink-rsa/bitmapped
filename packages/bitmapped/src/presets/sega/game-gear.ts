import type { HardwarePreset } from '../../core/types.js';
import { sampleColorSpace } from '../quantize.js';

const GG_COLOR_SPACE = {
  type: 'programmable' as const,
  bitsPerChannel: 4,
  totalBits: 12,
  format: 'BGR444',
  maxSimultaneous: 32,
};

export const gameGear: HardwarePreset = {
  id: 'game-gear',
  name: 'Sega Game Gear',
  category: 'sega',
  system: 'Game Gear',
  colorSpace: GG_COLOR_SPACE,
  palette: sampleColorSpace(GG_COLOR_SPACE, 32).map((color) => ({ color })),
  resolution: { width: 160, height: 144 },
  par: { x: 1, y: 1 },
  display: {
    type: 'lcd-backlit',
    defaultEffects: {
      lcdGrid: {
        enabled: true,
        gridOpacity: 0.08,
        gridColor: { r: 20, g: 20, b: 20 },
      },
    },
  },
  notes: '12-bit color (4096 colors), 32 simultaneous.',
};

import type { HardwarePreset } from '../../core/types.js';
import { enumerateColorSpace } from '../quantize.js';

const SMS_COLOR_SPACE = {
  type: 'programmable' as const,
  bitsPerChannel: 2,
  totalBits: 6,
  format: 'BGR222',
  maxSimultaneous: 32,
};

/** Generate the full 64-color SMS palette */
function generateSMSPalette() {
  return enumerateColorSpace(SMS_COLOR_SPACE).map((color) => ({ color }));
}

export const masterSystem: HardwarePreset = {
  id: 'master-system',
  name: 'Sega Master System',
  category: 'sega',
  system: 'Master System',
  region: 'ntsc',
  colorSpace: SMS_COLOR_SPACE,
  palette: generateSMSPalette(),
  resolution: { width: 256, height: 192 },
  par: { x: 8, y: 7 },
  display: {
    type: 'crt-rf',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.3, gap: 1 },
    },
  },
  notes: '6-bit color (64 colors total), 32 simultaneous.',
};

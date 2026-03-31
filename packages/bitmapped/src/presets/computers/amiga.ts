import type { HardwarePreset } from '../../core/types.js';
import { sampleColorSpace } from '../quantize.js';

const OCS_COLOR_SPACE = {
  type: 'programmable' as const,
  bitsPerChannel: 4,
  totalBits: 12,
  format: 'RGB444',
  maxSimultaneous: 32,
};

export const amigaOCS: HardwarePreset = {
  id: 'amiga-ocs',
  name: 'Amiga OCS',
  category: 'computer',
  system: 'Amiga',
  region: 'pal',
  colorSpace: OCS_COLOR_SPACE,
  palette: sampleColorSpace(OCS_COLOR_SPACE, 32).map((color) => ({ color })),
  resolution: {
    width: 320,
    height: 256,
    alternativeModes: [
      { width: 320, height: 200, label: 'NTSC' },
      { width: 640, height: 256, label: 'Hi-Res PAL' },
      { width: 640, height: 200, label: 'Hi-Res NTSC' },
    ],
  },
  par: { x: 1, y: 1 },
  display: {
    type: 'crt-rgb',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.15, gap: 1 },
    },
  },
  notes:
    'OCS chipset: 4 bits per channel (4096 colors), 32 simultaneous. EHB mode doubles to 64, HAM mode shows all 4096.',
};

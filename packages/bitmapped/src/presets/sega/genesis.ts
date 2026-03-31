import type { HardwarePreset } from '../../core/types.js';
import { genesisQuantize, enumerateColorSpace } from '../quantize.js';

const GENESIS_COLOR_SPACE = {
  type: 'programmable' as const,
  bitsPerChannel: 3,
  totalBits: 9,
  format: 'BGR333',
  maxSimultaneous: 61,
  quantize: genesisQuantize,
};

/** Generate the full 512-color Genesis palette via the non-linear DAC */
function generateGenesisPalette() {
  return enumerateColorSpace(GENESIS_COLOR_SPACE).map((color) => ({ color }));
}

const basePreset = {
  category: 'sega' as const,
  system: 'Genesis / Mega Drive',
  colorSpace: GENESIS_COLOR_SPACE,
  palette: generateGenesisPalette(),
};

export const genesis: HardwarePreset = {
  ...basePreset,
  id: 'genesis',
  name: 'Sega Genesis (NTSC)',
  region: 'ntsc',
  resolution: {
    width: 320,
    height: 224,
    alternativeModes: [{ width: 256, height: 224, label: 'H32 Mode' }],
  },
  par: { x: 32, y: 35 },
  display: {
    type: 'crt-composite',
    defaultEffects: {
      compositeDither: { enabled: true, blendRadius: 1 },
      scanlines: { enabled: true, intensity: 0.2, gap: 1 },
    },
  },
  notes:
    '9-bit color with non-linear DAC (512 colors), 61 simultaneous. Composite dithering blends adjacent pixels.',
};

export const genesisPAL: HardwarePreset = {
  ...basePreset,
  id: 'genesis-pal',
  name: 'Sega Genesis (PAL)',
  region: 'pal',
  resolution: {
    width: 320,
    height: 240,
    alternativeModes: [{ width: 256, height: 240, label: 'H32 Mode' }],
  },
  par: { x: 11, y: 10 },
  display: {
    type: 'crt-composite',
    defaultEffects: {
      compositeDither: { enabled: true, blendRadius: 1 },
      scanlines: { enabled: true, intensity: 0.2, gap: 1 },
    },
  },
  notes:
    '9-bit color with non-linear DAC (512 colors), 61 simultaneous. PAL region.',
};

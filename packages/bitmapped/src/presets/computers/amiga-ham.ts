import type { HardwarePreset } from '../../core/types.js';

const HAM6_COLOR_SPACE = {
  type: 'programmable' as const,
  bitsPerChannel: 4,
  totalBits: 12,
  format: 'RGB444',
  maxSimultaneous: 4096,
};

export const amigaHAM: HardwarePreset = {
  id: 'amiga-ham6',
  name: 'Amiga OCS (HAM6)',
  category: 'computer',
  system: 'Amiga',
  region: 'pal',
  colorSpace: HAM6_COLOR_SPACE,
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
  simultaneousColors: 4096,
  bitsPerChannel: { r: 4, g: 4, b: 4 },
  constraintType: 'ham',
  hamConfig: { basePaletteSize: 16, modifyBits: 4 },
  recommendedDithering: 'none',
  recommendedDistance: 'ciede2000',
  notes:
    'Hold-And-Modify mode: 16 base palette colors + modify one RGB channel per pixel. Effectively displays all 4096 OCS colors with fringing artifacts.',
};

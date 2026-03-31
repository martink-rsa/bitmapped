import type { HardwarePreset } from '../../core/types.js';
import {
  generateEGAPalette,
  EGA_DEFAULT_REGISTERS,
} from '../palettes/ega-palette.js';

function hex(h: string) {
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/** Generate the default 16-color EGA palette by mapping registers through the full 64-color space */
function generateDefaultEGAPalette() {
  const full64 = generateEGAPalette();
  return EGA_DEFAULT_REGISTERS.map((reg) => ({
    color: hex((full64[reg] ?? '#000000').replace('#', '')),
  }));
}

export const ega: HardwarePreset = {
  id: 'ega',
  name: 'EGA',
  category: 'ibm-pc',
  system: 'IBM PC (EGA)',
  resolution: {
    width: 640,
    height: 350,
  },
  par: { x: 1, y: 1 },
  palette: generateDefaultEGAPalette(),
  display: {
    type: 'crt-rgb',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.2, gap: 1 },
    },
  },
  paletteType: 'rgb-bitdepth',
  bitsPerChannel: { r: 2, g: 2, b: 2 },
  totalColors: 64,
  simultaneousColors: 16,
  constraintType: 'none',
  recommendedDithering: 'bayer',
  notes:
    'EGA 640x350 16-color mode — 16 colors selected from a 64-color RGB222 palette via register mapping.',
};

import type { HardwarePreset } from '../../core/types.js';
import { sampleColorSpace } from '../quantize.js';

function hex(h: string) {
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

const DMG_BGB_PALETTE = [
  { color: hex('E0F8D0'), name: 'Lightest' },
  { color: hex('88C070'), name: 'Light' },
  { color: hex('346856'), name: 'Dark' },
  { color: hex('081820'), name: 'Darkest' },
];

const POCKET_PALETTE = [
  { color: hex('FFFFFF'), name: 'White' },
  { color: hex('A8A8A8'), name: 'Light Grey' },
  { color: hex('545454'), name: 'Dark Grey' },
  { color: hex('000000'), name: 'Black' },
];

const GBC_COLOR_SPACE = {
  type: 'programmable' as const,
  bitsPerChannel: 5,
  totalBits: 15,
  format: 'BGR555',
  maxSimultaneous: 56,
};

const basePreset = {
  category: 'nintendo' as const,
  system: 'Game Boy',
  resolution: { width: 160, height: 144 },
  par: { x: 1, y: 1 },
};

export const gameBoyDMG: HardwarePreset = {
  ...basePreset,
  id: 'gameboy-dmg',
  name: 'Game Boy (DMG)',
  palette: DMG_BGB_PALETTE,
  display: {
    type: 'lcd-stn',
    defaultEffects: {
      lcdGrid: {
        enabled: true,
        gridOpacity: 0.15,
        gridColor: { r: 8, g: 24, b: 32 },
      },
    },
  },
  notes:
    'Original Game Boy with BGB emulator green palette. 4 shades of green.',
};

export const gameBoyPocket: HardwarePreset = {
  ...basePreset,
  id: 'gameboy-pocket',
  name: 'Game Boy Pocket',
  palette: POCKET_PALETTE,
  display: {
    type: 'lcd-stn',
    defaultEffects: {
      lcdGrid: {
        enabled: true,
        gridOpacity: 0.1,
        gridColor: { r: 40, g: 40, b: 40 },
      },
    },
  },
  notes: 'Game Boy Pocket with improved greyscale LCD. 4 shades of grey.',
};

export const gameBoyColor: HardwarePreset = {
  ...basePreset,
  id: 'gameboy-color',
  name: 'Game Boy Color',
  colorSpace: GBC_COLOR_SPACE,
  palette: sampleColorSpace(GBC_COLOR_SPACE, 56).map((color) => ({ color })),
  display: {
    type: 'lcd-backlit',
    defaultEffects: {},
  },
  notes:
    '5-bit per channel (32768 colors), 56 simultaneous (8 palettes x 4 colors, some shared).',
};

import type { HardwarePreset } from '../../core/types.js';

function hex(h: string) {
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/** Namco Galaxian 8-color resistor-DAC palette */
const GALAXIAN_PALETTE = [
  { color: hex('000000'), name: 'Black' },
  { color: hex('FF0000'), name: 'Red' },
  { color: hex('00FF00'), name: 'Green' },
  { color: hex('FFFF00'), name: 'Yellow' },
  { color: hex('0000FF'), name: 'Blue' },
  { color: hex('FF00FF'), name: 'Magenta' },
  { color: hex('00FFFF'), name: 'Cyan' },
  { color: hex('FFFFFF'), name: 'White' },
];

export const namcoGalaxian: HardwarePreset = {
  id: 'namco-galaxian',
  name: 'Namco Galaxian',
  category: 'arcade',
  system: 'Namco Galaxian',

  paletteType: 'fixed-lut',
  totalColors: 8,
  simultaneousColors: 8,
  constraintType: 'none',

  palette: GALAXIAN_PALETTE,
  resolution: { width: 256, height: 224 },
  par: { x: 1, y: 1 },
  display: {
    type: 'crt-rgb',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.3, gap: 1 },
    },
  },
  notes:
    'Simple 8-color RGB palette from resistor-DAC. No palette constraints. Arcade RGB CRT output.',
};

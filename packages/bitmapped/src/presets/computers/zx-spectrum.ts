import type { HardwarePreset } from '../../core/types.js';

function hex(h: string) {
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

const SPECTRUM_COLORS = [
  // Normal brightness (hardware voltage ratio: 255 × 0.85 ≈ 216 = 0xD8)
  { color: hex('000000'), name: 'Black' },
  { color: hex('0000D8'), name: 'Blue' },
  { color: hex('D80000'), name: 'Red' },
  { color: hex('D800D8'), name: 'Magenta' },
  { color: hex('00D800'), name: 'Green' },
  { color: hex('00D8D8'), name: 'Cyan' },
  { color: hex('D8D800'), name: 'Yellow' },
  { color: hex('D8D8D8'), name: 'White' },
  // Bright
  { color: hex('0000FF'), name: 'Bright Blue' },
  { color: hex('FF0000'), name: 'Bright Red' },
  { color: hex('FF00FF'), name: 'Bright Magenta' },
  { color: hex('00FF00'), name: 'Bright Green' },
  { color: hex('00FFFF'), name: 'Bright Cyan' },
  { color: hex('FFFF00'), name: 'Bright Yellow' },
  { color: hex('FFFFFF'), name: 'Bright White' },
];

export const zxSpectrum: HardwarePreset = {
  id: 'zx-spectrum',
  name: 'ZX Spectrum',
  category: 'computer',
  system: 'ZX Spectrum',
  region: 'pal',
  palette: SPECTRUM_COLORS,
  resolution: { width: 256, height: 192 },
  par: { x: 1, y: 1 },
  display: {
    type: 'crt-rf',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.2, gap: 1 },
      colorFringe: { enabled: true, type: 'pal' },
    },
  },
  notes: '15 unique colors (8 normal + 7 bright, black shared between both).',
};

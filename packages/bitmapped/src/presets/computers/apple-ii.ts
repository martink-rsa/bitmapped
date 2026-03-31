import type { HardwarePreset } from '../../core/types.js';

function hex(h: string) {
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

const LORES_COLORS = [
  { color: hex('000000'), name: 'Black' },
  { color: hex('DD0033'), name: 'Magenta' },
  { color: hex('000099'), name: 'Dark Blue' },
  { color: hex('DD22FF'), name: 'Purple' },
  { color: hex('007722'), name: 'Dark Green' },
  { color: hex('555555'), name: 'Grey 1' },
  { color: hex('2222FF'), name: 'Medium Blue' },
  { color: hex('6699FF'), name: 'Light Blue' },
  { color: hex('885500'), name: 'Brown' },
  { color: hex('FF6600'), name: 'Orange' },
  { color: hex('AAAAAA'), name: 'Grey 2' },
  { color: hex('FF9988'), name: 'Pink' },
  { color: hex('11DD00'), name: 'Green' },
  { color: hex('FFFF00'), name: 'Yellow' },
  { color: hex('44FF99'), name: 'Aquamarine' },
  { color: hex('FFFFFF'), name: 'White' },
];

const HIRES_COLORS = [
  { color: hex('000000'), name: 'Black' },
  { color: hex('FFFFFF'), name: 'White' },
  { color: hex('20C000'), name: 'Green' },
  { color: hex('A000FF'), name: 'Violet' },
  { color: hex('F07000'), name: 'Orange' },
  { color: hex('0080FF'), name: 'Blue' },
];

export const appleIILoRes: HardwarePreset = {
  id: 'apple-ii-lores',
  name: 'Apple II (Lo-Res)',
  category: 'computer',
  system: 'Apple II',
  region: 'ntsc',
  palette: LORES_COLORS,
  resolution: {
    width: 40,
    height: 48,
  },
  par: { x: 1.5, y: 1 },
  display: {
    type: 'crt-composite',
    defaultEffects: {
      colorFringe: { enabled: true, type: 'ntsc' },
    },
  },
  notes: '16-color lo-res mode with large rectangular blocks.',
};

export const appleIIHiRes: HardwarePreset = {
  id: 'apple-ii-hires',
  name: 'Apple II (Hi-Res)',
  category: 'computer',
  system: 'Apple II',
  region: 'ntsc',
  palette: HIRES_COLORS,
  resolution: { width: 280, height: 192 },
  par: { x: 1, y: 1.2 },
  display: {
    type: 'crt-composite',
    defaultEffects: {
      colorFringe: { enabled: true, type: 'ntsc' },
    },
  },
  notes:
    '6 artifact colors in hi-res mode — color depends on pixel position and NTSC decoding.',
};

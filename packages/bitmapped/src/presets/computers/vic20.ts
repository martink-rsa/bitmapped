import type { HardwarePreset } from '../../core/types.js';

function hex(h: string) {
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

const VIC20_COLORS = [
  { color: hex('000000'), name: 'Black' },
  { color: hex('FFFFFF'), name: 'White' },
  { color: hex('782922'), name: 'Red' },
  { color: hex('87D6DD'), name: 'Cyan' },
  { color: hex('AA5FB6'), name: 'Purple' },
  { color: hex('55A049'), name: 'Green' },
  { color: hex('40318D'), name: 'Blue' },
  { color: hex('BFCE72'), name: 'Yellow' },
  { color: hex('AA7449'), name: 'Orange' },
  { color: hex('EAB489'), name: 'Light Orange' },
  { color: hex('B67272'), name: 'Light Red' },
  { color: hex('C7FFFF'), name: 'Light Cyan' },
  { color: hex('EAAFF6'), name: 'Light Purple' },
  { color: hex('AAFFAA'), name: 'Light Green' },
  { color: hex('A0A0FF'), name: 'Light Blue' },
  { color: hex('FFFFAA'), name: 'Light Yellow' },
];

const VIC20_HEX: readonly string[] = [
  '#000000',
  '#FFFFFF',
  '#782922',
  '#87D6DD',
  '#AA5FB6',
  '#55A049',
  '#40318D',
  '#BFCE72',
  '#AA7449',
  '#EAB489',
  '#B67272',
  '#C7FFFF',
  '#EAAFF6',
  '#AAFFAA',
  '#A0A0FF',
  '#FFFFAA',
];

export const vic20: HardwarePreset = {
  id: 'vic-20',
  name: 'VIC-20',
  category: 'computer',
  system: 'Commodore VIC-20',
  palette: VIC20_COLORS,
  resolution: { width: 176, height: 184 },
  par: { x: 1, y: 1 },
  display: {
    type: 'crt-composite',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.3, gap: 1 },
    },
  },
  paletteType: 'fixed-lut',
  masterPalette: VIC20_HEX,
  totalColors: 16,
  simultaneousColors: 16,
  constraintType: 'attribute-block',
  attributeBlock: { width: 8, height: 8, maxColors: 2 },
  notes:
    '16-color fixed palette with 8x8 attribute blocks (2 colors per cell).',
};

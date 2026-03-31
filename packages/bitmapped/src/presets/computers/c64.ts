import type { HardwarePreset } from '../../core/types.js';

function hex(h: string) {
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

const PEPTO_COLORS = [
  hex('000000'),
  hex('FFFFFF'),
  hex('68372B'),
  hex('70A4B2'),
  hex('6F3D86'),
  hex('588D43'),
  hex('352879'),
  hex('B8C76F'),
  hex('6F4F25'),
  hex('433900'),
  hex('9A6759'),
  hex('444444'),
  hex('6C6C6C'),
  hex('9AD284'),
  hex('6C5EB5'),
  hex('959595'),
];

const COLODORE_COLORS = [
  hex('000000'),
  hex('FFFFFF'),
  hex('813338'),
  hex('75CEC8'),
  hex('8E3C97'),
  hex('56AC4D'),
  hex('2E2C9B'),
  hex('EDF171'),
  hex('8E5029'),
  hex('553800'),
  hex('C46C71'),
  hex('4A4A4A'),
  hex('7B7B7B'),
  hex('A9FF9F'),
  hex('706DEB'),
  hex('B2B2B2'),
];

const PEPTO_NAMES = [
  'Black',
  'White',
  'Red',
  'Cyan',
  'Purple',
  'Green',
  'Blue',
  'Yellow',
  'Orange',
  'Brown',
  'Light Red',
  'Dark Grey',
  'Grey',
  'Light Green',
  'Light Blue',
  'Light Grey',
];

const basePreset = {
  category: 'computer' as const,
  system: 'Commodore 64',
  resolution: {
    width: 320,
    height: 200,
    alternativeModes: [{ width: 160, height: 200, label: 'Multicolor' }],
  },
  par: { x: 0.75, y: 1 },
  display: {
    type: 'crt-composite' as const,
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.3, gap: 1 },
    },
  },
};

export const c64Pepto: HardwarePreset = {
  ...basePreset,
  id: 'c64-pepto',
  name: 'Commodore 64 (Pepto)',
  palette: PEPTO_COLORS.map((color, i) => ({ color, name: PEPTO_NAMES[i] })),
  notes: 'Pepto palette — the most widely accepted C64 color measurements.',
};

export const c64Colodore: HardwarePreset = {
  ...basePreset,
  id: 'c64-colodore',
  name: 'Commodore 64 (Colodore)',
  palette: COLODORE_COLORS.map((color, i) => ({ color, name: PEPTO_NAMES[i] })),
  notes: 'Colodore palette — alternative C64 color measurements.',
};

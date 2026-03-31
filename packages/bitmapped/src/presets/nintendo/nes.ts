import type { HardwarePreset } from '../../core/types.js';

function hex(h: string) {
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/** 2C02 PPU reference palette — 64 entries (some duplicate blacks) */
const NES_2C02_PALETTE = [
  // Row 0 (darkest)
  { color: hex('545454'), name: '$00' },
  { color: hex('001E74'), name: '$01' },
  { color: hex('081090'), name: '$02' },
  { color: hex('300088'), name: '$03' },
  { color: hex('440064'), name: '$04' },
  { color: hex('5C0030'), name: '$05' },
  { color: hex('540400'), name: '$06' },
  { color: hex('3C1800'), name: '$07' },
  { color: hex('202A00'), name: '$08' },
  { color: hex('083A00'), name: '$09' },
  { color: hex('004000'), name: '$0A' },
  { color: hex('003C00'), name: '$0B' },
  { color: hex('00323C'), name: '$0C' },
  { color: hex('000000'), name: '$0D' },
  { color: hex('000000'), name: '$0E' },
  { color: hex('000000'), name: '$0F' },
  // Row 1
  { color: hex('989698'), name: '$10' },
  { color: hex('084CC4'), name: '$11' },
  { color: hex('3032EC'), name: '$12' },
  { color: hex('5C1EE4'), name: '$13' },
  { color: hex('8814B0'), name: '$14' },
  { color: hex('A01464'), name: '$15' },
  { color: hex('982220'), name: '$16' },
  { color: hex('783C00'), name: '$17' },
  { color: hex('545A00'), name: '$18' },
  { color: hex('287200'), name: '$19' },
  { color: hex('087C00'), name: '$1A' },
  { color: hex('007628'), name: '$1B' },
  { color: hex('006678'), name: '$1C' },
  { color: hex('000000'), name: '$1D' },
  { color: hex('000000'), name: '$1E' },
  { color: hex('000000'), name: '$1F' },
  // Row 2 (brightest)
  { color: hex('ECEEEC'), name: '$20' },
  { color: hex('4C9AEC'), name: '$21' },
  { color: hex('7080EC'), name: '$22' },
  { color: hex('9C6CEC'), name: '$23' },
  { color: hex('D064E0'), name: '$24' },
  { color: hex('E878A0'), name: '$25' },
  { color: hex('E09470'), name: '$26' },
  { color: hex('C8A820'), name: '$27' },
  { color: hex('A8B820'), name: '$28' },
  { color: hex('68D000'), name: '$29' },
  { color: hex('40D820'), name: '$2A' },
  { color: hex('38D874'), name: '$2B' },
  { color: hex('38C8CC'), name: '$2C' },
  { color: hex('3C3C3C'), name: '$2D' },
  { color: hex('000000'), name: '$2E' },
  { color: hex('000000'), name: '$2F' },
  // Row 3 (pastel)
  { color: hex('ECEEEC'), name: '$30' },
  { color: hex('A8CCE4'), name: '$31' },
  { color: hex('B4B8EC'), name: '$32' },
  { color: hex('D4B0E4'), name: '$33' },
  { color: hex('E4A8D4'), name: '$34' },
  { color: hex('E4A8B8'), name: '$35' },
  { color: hex('E0A8A0'), name: '$36' },
  { color: hex('D8B098'), name: '$37' },
  { color: hex('C8B888'), name: '$38' },
  { color: hex('B0C090'), name: '$39' },
  { color: hex('A8CC8C'), name: '$3A' },
  { color: hex('A0CCA0'), name: '$3B' },
  { color: hex('A0C4C4'), name: '$3C' },
  { color: hex('A8A8A8'), name: '$3D' },
  { color: hex('000000'), name: '$3E' },
  { color: hex('000000'), name: '$3F' },
];

const basePreset = {
  category: 'nintendo' as const,
  system: 'NES / Famicom',
  palette: NES_2C02_PALETTE,
  colorSpace: {
    type: 'fixed' as const,
    bitsPerChannel: 0,
    totalBits: 0,
    format: 'PPU LUT',
    maxSimultaneous: 25,
  },
};

export const nesNTSC: HardwarePreset = {
  ...basePreset,
  id: 'nes-ntsc',
  name: 'NES (NTSC)',
  region: 'ntsc',
  resolution: {
    width: 256,
    height: 224,
    alternativeModes: [{ width: 256, height: 240, label: 'Full' }],
  },
  par: { x: 8, y: 7 },
  display: {
    type: 'crt-composite',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.25, gap: 1 },
      colorFringe: { enabled: true, type: 'ntsc' },
    },
  },
  notes:
    '2C02 PPU palette — 64 entries (54 unique colors). 25 simultaneous via 4 palettes of 4 colors + backdrop.',
};

export const nesPAL: HardwarePreset = {
  ...basePreset,
  id: 'nes-pal',
  name: 'NES (PAL)',
  region: 'pal',
  resolution: {
    width: 256,
    height: 240,
  },
  par: { x: 11, y: 8 },
  display: {
    type: 'crt-composite',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.2, gap: 1 },
      colorFringe: { enabled: true, type: 'pal' },
    },
  },
  notes:
    '2C02 PPU palette — PAL region with slightly wider pixel aspect ratio.',
};

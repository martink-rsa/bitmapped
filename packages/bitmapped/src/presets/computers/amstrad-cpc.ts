import type { HardwarePreset } from '../../core/types.js';
import { CPC_PALETTE } from '../palettes/cpc-palette.js';

function hex(h: string) {
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/** Convert '#RRGGBB' to 'RRGGBB' for the hex() helper */
const cpcColors = CPC_PALETTE.map((c) => ({
  color: hex(c.replace('#', '')),
}));

const basePreset = {
  category: 'computer' as const,
  system: 'Amstrad CPC',
  palette: cpcColors,
  display: {
    type: 'crt-rgb' as const,
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.2, gap: 1 },
    },
  },
  paletteType: 'three-level' as const,
  masterPalette: CPC_PALETTE,
  totalColors: 27,
  recommendedDistance: 'redmean' as const,
};

export const cpcMode0: HardwarePreset = {
  ...basePreset,
  id: 'amstrad-cpc-mode0',
  name: 'Amstrad CPC (Mode 0)',
  resolution: { width: 160, height: 200 },
  par: { x: 2, y: 1 },
  simultaneousColors: 16,
  constraintType: 'none',
  notes:
    'Mode 0: 160x200, 16 colors from 27 (3-level RGB). Wide pixels (2:1 PAR).',
};

export const cpcMode1: HardwarePreset = {
  ...basePreset,
  id: 'amstrad-cpc-mode1',
  name: 'Amstrad CPC (Mode 1)',
  resolution: { width: 320, height: 200 },
  par: { x: 1, y: 1 },
  simultaneousColors: 4,
  constraintType: 'none',
  notes: 'Mode 1: 320x200, 4 colors from 27 (3-level RGB). Square pixels.',
};

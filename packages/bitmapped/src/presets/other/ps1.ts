import type { HardwarePreset } from '../../core/types.js';

const PS1_COLOR_SPACE = {
  type: 'programmable' as const,
  bitsPerChannel: 5,
  totalBits: 15,
  format: 'BGR555',
  maxSimultaneous: 32768,
};

/** Generate a representative 64-color palette from the PS1 15-bit color space */
function generatePS1Palette() {
  const levels = [0, 10, 21, 31];
  const colors = [];
  for (const r of levels) {
    for (const g of levels) {
      for (const b of levels) {
        const r8 = (r << 3) | (r >> 2);
        const g8 = (g << 3) | (g >> 2);
        const b8 = (b << 3) | (b >> 2);
        colors.push({ color: { r: r8, g: g8, b: b8 } });
      }
    }
  }
  return colors;
}

export const ps1: HardwarePreset = {
  id: 'ps1',
  name: 'PlayStation 1',
  category: 'other',
  system: 'PlayStation',
  colorSpace: PS1_COLOR_SPACE,
  palette: generatePS1Palette(),
  resolution: {
    width: 256,
    height: 240,
    alternativeModes: [
      { width: 320, height: 240, label: '320 Mode' },
      { width: 512, height: 240, label: '512 Mode' },
      { width: 640, height: 480, label: 'Hi-Res' },
    ],
  },
  par: { x: 1, y: 1 },
  display: {
    type: 'crt-composite',
    defaultEffects: {
      scanlines: { enabled: true, intensity: 0.15, gap: 1 },
    },
  },
  notes:
    '15-bit color (32768 colors). Effectively unconstrained for 2D. Palette is a representative 64-color sample.',
};

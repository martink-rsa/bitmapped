import { describe, it, expect } from 'vitest';
import {
  quantizeGenesis,
  quantizeCPC,
  expandVGA6to8,
  GENESIS_DAC_NORMAL,
  GENESIS_DAC_SHADOW,
  GENESIS_DAC_HIGHLIGHT,
} from './quantize.js';

describe('quantizeGenesis', () => {
  it('maps 0 to 0 (DAC level 0)', () => {
    expect(quantizeGenesis(0)).toBe(0);
  });

  it('maps 255 to 255 (DAC level 7)', () => {
    expect(quantizeGenesis(255)).toBe(255);
  });

  it('maps exact DAC values to themselves', () => {
    for (const val of GENESIS_DAC_NORMAL) {
      expect(quantizeGenesis(val)).toBe(val);
    }
  });

  it('maps values to the nearest DAC level', () => {
    // 70 is between 52 (level 1) and 87 (level 2)
    // |70-52| = 18, |70-87| = 17 → closest is 87
    expect(quantizeGenesis(70)).toBe(87);

    // 25 is between 0 (level 0) and 52 (level 1)
    // |25-0| = 25, |25-52| = 27 → closest is 0
    expect(quantizeGenesis(25)).toBe(0);

    // 130 is between 116 (level 3) and 144 (level 4)
    // |130-116| = 14, |130-144| = 14 → tie goes to earlier (bestDist uses <)
    expect(quantizeGenesis(130)).toBe(116);
  });

  it('returns only values from the DAC table', () => {
    const dacSet = new Set<number>(GENESIS_DAC_NORMAL);
    for (let v = 0; v <= 255; v++) {
      expect(dacSet.has(quantizeGenesis(v))).toBe(true);
    }
  });
});

describe('Genesis DAC tables', () => {
  it('GENESIS_DAC_NORMAL has 8 levels', () => {
    expect(GENESIS_DAC_NORMAL).toHaveLength(8);
  });

  it('GENESIS_DAC_SHADOW has 8 levels', () => {
    expect(GENESIS_DAC_SHADOW).toHaveLength(8);
  });

  it('GENESIS_DAC_HIGHLIGHT has 8 levels', () => {
    expect(GENESIS_DAC_HIGHLIGHT).toHaveLength(8);
  });

  it('shadow values are lower than normal values', () => {
    for (let i = 1; i < 8; i++) {
      expect(GENESIS_DAC_SHADOW[i]!).toBeLessThanOrEqual(
        GENESIS_DAC_NORMAL[i]!,
      );
    }
  });

  it('highlight values are higher than normal values', () => {
    for (let i = 0; i < 7; i++) {
      expect(GENESIS_DAC_HIGHLIGHT[i]!).toBeGreaterThanOrEqual(
        GENESIS_DAC_NORMAL[i]!,
      );
    }
  });
});

describe('quantizeCPC', () => {
  it('maps values below 64 to 0x00', () => {
    expect(quantizeCPC(0)).toBe(0x00);
    expect(quantizeCPC(32)).toBe(0x00);
    expect(quantizeCPC(63)).toBe(0x00);
  });

  it('maps values 64-191 to 0x80', () => {
    expect(quantizeCPC(64)).toBe(0x80);
    expect(quantizeCPC(128)).toBe(0x80);
    expect(quantizeCPC(191)).toBe(0x80);
  });

  it('maps values 192-255 to 0xFF', () => {
    expect(quantizeCPC(192)).toBe(0xff);
    expect(quantizeCPC(224)).toBe(0xff);
    expect(quantizeCPC(255)).toBe(0xff);
  });

  it('produces exactly 3 distinct levels', () => {
    const levels = new Set<number>();
    for (let v = 0; v <= 255; v++) {
      levels.add(quantizeCPC(v));
    }
    expect(levels.size).toBe(3);
    expect(levels).toContain(0x00);
    expect(levels).toContain(0x80);
    expect(levels).toContain(0xff);
  });
});

describe('expandVGA6to8', () => {
  it('maps 0 to 0', () => {
    expect(expandVGA6to8(0)).toBe(0);
  });

  it('maps 63 to 255', () => {
    expect(expandVGA6to8(63)).toBe(255);
  });

  it('uses correct formula: (v << 2) | (v >> 4)', () => {
    expect(expandVGA6to8(1)).toBe((1 << 2) | (1 >> 4)); // 4
    expect(expandVGA6to8(32)).toBe((32 << 2) | (32 >> 4)); // 130
    expect(expandVGA6to8(16)).toBe((16 << 2) | (16 >> 4)); // 65
  });

  it('produces monotonically increasing values', () => {
    let prev = -1;
    for (let v = 0; v <= 63; v++) {
      const result = expandVGA6to8(v);
      expect(result).toBeGreaterThan(prev);
      prev = result;
    }
  });
});

import { describe, it, expect } from 'vitest';
import {
  expandBits,
  quantizeColor,
  enumerateColorSpace,
  sampleColorSpace,
  genesisQuantize,
} from './quantize.js';
import type { ColorBitDepth } from '../core/types.js';

describe('expandBits', () => {
  it('converts 5-bit max to 255', () => {
    expect(expandBits(31, 5)).toBe(255);
  });

  it('converts 5-bit zero to 0', () => {
    expect(expandBits(0, 5)).toBe(0);
  });

  it('converts 5-bit 16 correctly', () => {
    expect(expandBits(16, 5)).toBe(132);
  });

  it('converts 2-bit max to 255', () => {
    expect(expandBits(3, 2)).toBe(255);
  });

  it('converts 2-bit zero to 0', () => {
    expect(expandBits(0, 2)).toBe(0);
  });

  it('converts 4-bit max to 255', () => {
    expect(expandBits(15, 4)).toBe(255);
  });

  it('converts 4-bit zero to 0', () => {
    expect(expandBits(0, 4)).toBe(0);
  });

  it('converts 3-bit max to 255', () => {
    expect(expandBits(7, 3)).toBe(255);
  });

  it('converts 3-bit zero to 0', () => {
    expect(expandBits(0, 3)).toBe(0);
  });
});

describe('genesisQuantize', () => {
  it('quantizes black to black', () => {
    expect(genesisQuantize(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('quantizes white to white', () => {
    expect(genesisQuantize(255, 255, 255)).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('quantizes to exact DAC level 1', () => {
    expect(genesisQuantize(52, 52, 52)).toEqual({ r: 52, g: 52, b: 52 });
  });

  it('snaps near-DAC values to nearest level', () => {
    // 50 is closer to 52 (DAC level 1) than to 0 (DAC level 0)
    const result = genesisQuantize(50, 50, 50);
    expect(result).toEqual({ r: 52, g: 52, b: 52 });
  });

  it('maps mid-range values to appropriate DAC levels', () => {
    const result = genesisQuantize(128, 128, 128);
    // 128 is closest to 116 (level 3) or 144 (level 4)
    expect([116, 144]).toContain(result.r);
  });
});

describe('quantizeColor', () => {
  it('quantizes to 5-bit color space (SNES-like)', () => {
    const snesSpace: ColorBitDepth = {
      type: 'programmable',
      bitsPerChannel: 5,
      totalBits: 15,
      format: 'BGR555',
      maxSimultaneous: 256,
    };
    const result = quantizeColor(255, 255, 255, snesSpace);
    expect(result).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('quantizes to 2-bit color space (SMS-like)', () => {
    const smsSpace: ColorBitDepth = {
      type: 'programmable',
      bitsPerChannel: 2,
      totalBits: 6,
      format: 'BGR222',
      maxSimultaneous: 32,
    };
    const result = quantizeColor(0, 0, 0, smsSpace);
    expect(result).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('delegates to custom quantize function when provided', () => {
    const genesisSpace: ColorBitDepth = {
      type: 'programmable',
      bitsPerChannel: 3,
      totalBits: 9,
      format: 'BGR333',
      maxSimultaneous: 61,
      quantize: genesisQuantize,
    };
    const result = quantizeColor(52, 52, 52, genesisSpace);
    expect(result).toEqual({ r: 52, g: 52, b: 52 });
  });
});

describe('sampleColorSpace', () => {
  const steSpace: ColorBitDepth = {
    type: 'programmable',
    bitsPerChannel: 4,
    totalBits: 12,
    format: 'RGB444',
    maxSimultaneous: 16,
  };

  it('returns requested count of colors', () => {
    const colors = sampleColorSpace(steSpace, 16);
    expect(colors).toHaveLength(16);
  });

  it('produces colors with varied R, G, and B channels', () => {
    const colors = sampleColorSpace(steSpace, 16);
    const uniqueR = new Set(colors.map((c) => c.r));
    const uniqueG = new Set(colors.map((c) => c.g));
    const uniqueB = new Set(colors.map((c) => c.b));
    expect(uniqueR.size).toBeGreaterThan(1);
    expect(uniqueG.size).toBeGreaterThan(1);
    expect(uniqueB.size).toBeGreaterThan(1);
  });

  it('includes black in the sample', () => {
    const colors = sampleColorSpace(steSpace, 16);
    expect(colors).toContainEqual({ r: 0, g: 0, b: 0 });
  });

  it('returns full enumeration when count exceeds total', () => {
    const smallSpace: ColorBitDepth = {
      type: 'programmable',
      bitsPerChannel: 2,
      totalBits: 6,
      format: 'RGB222',
      maxSimultaneous: 32,
    };
    const colors = sampleColorSpace(smallSpace, 100);
    expect(colors).toHaveLength(64);
  });

  it('handles count of 1 without error', () => {
    const colors = sampleColorSpace(steSpace, 1);
    expect(colors).toHaveLength(1);
  });

  it('samples 64 colors from 4-bit space with full 3D coverage', () => {
    const colors = sampleColorSpace(steSpace, 64);
    expect(colors).toHaveLength(64);
    expect(colors).toContainEqual({ r: 0, g: 0, b: 0 });
    expect(colors).toContainEqual({ r: 255, g: 255, b: 255 });
  });

  it('includes white when truncation is needed', () => {
    const colors = sampleColorSpace(steSpace, 16);
    expect(colors).toContainEqual({ r: 255, g: 255, b: 255 });
  });

  it('includes both black and white when truncation is needed', () => {
    const colors = sampleColorSpace(steSpace, 32);
    expect(colors).toContainEqual({ r: 0, g: 0, b: 0 });
    expect(colors).toContainEqual({ r: 255, g: 255, b: 255 });
  });

  it('samples 256 from 9-bit space (MSX2 case)', () => {
    const msx2Space: ColorBitDepth = {
      type: 'programmable',
      bitsPerChannel: 3,
      totalBits: 9,
      format: 'RGB333',
      maxSimultaneous: 256,
    };
    const colors = sampleColorSpace(msx2Space, 256);
    expect(colors).toHaveLength(256);
    const uniqueR = new Set(colors.map((c) => c.r));
    expect(uniqueR.size).toBeGreaterThanOrEqual(6);
  });
});

describe('enumerateColorSpace', () => {
  it('generates 64 colors for 2-bit SMS color space', () => {
    const smsSpace: ColorBitDepth = {
      type: 'programmable',
      bitsPerChannel: 2,
      totalBits: 6,
      format: 'BGR222',
      maxSimultaneous: 32,
    };
    const colors = enumerateColorSpace(smsSpace);
    expect(colors).toHaveLength(64);
  });

  it('generates 512 colors for 3-bit Genesis color space', () => {
    const genesisSpace: ColorBitDepth = {
      type: 'programmable',
      bitsPerChannel: 3,
      totalBits: 9,
      format: 'BGR333',
      maxSimultaneous: 61,
      quantize: genesisQuantize,
    };
    const colors = enumerateColorSpace(genesisSpace);
    expect(colors).toHaveLength(512);
  });

  it('generates 4096 colors for 4-bit Amiga color space', () => {
    const amigaSpace: ColorBitDepth = {
      type: 'programmable',
      bitsPerChannel: 4,
      totalBits: 12,
      format: 'RGB444',
      maxSimultaneous: 32,
    };
    const colors = enumerateColorSpace(amigaSpace);
    expect(colors).toHaveLength(4096);
  });

  it('includes black and white in enumerated colors', () => {
    const smsSpace: ColorBitDepth = {
      type: 'programmable',
      bitsPerChannel: 2,
      totalBits: 6,
      format: 'BGR222',
      maxSimultaneous: 32,
    };
    const colors = enumerateColorSpace(smsSpace);
    expect(colors).toContainEqual({ r: 0, g: 0, b: 0 });
    expect(colors).toContainEqual({ r: 255, g: 255, b: 255 });
  });
});

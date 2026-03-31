import { describe, it, expect } from 'vitest';
import { decodeNeoGeoColor, encodeNeoGeoColor } from './neo-geo-color.js';

describe('decodeNeoGeoColor', () => {
  it('decodes word 0 to black', () => {
    const color = decodeNeoGeoColor(0);
    expect(color.r).toBe(0);
    expect(color.g).toBe(0);
    expect(color.b).toBe(0);
  });

  it('decodes word 0x7FFF', () => {
    // 0x7FFF = 0111 1111 1111 1111
    // D=0, R0=1, G0=1, B0=1
    // R4-1=0xF (15), G4-1=0xF (15), B4-1=0xF (15)
    // r5 = (15 << 2) | (1 << 1) | 0 = 60 | 2 | 0 = 62
    // Same for g5, b5 = 62
    // 8-bit = (62 << 2) | (62 >> 4) = 248 | 3 = 251
    const color = decodeNeoGeoColor(0x7fff);
    expect(color.r).toBe(251);
    expect(color.g).toBe(251);
    expect(color.b).toBe(251);
  });

  it('decodes word 0xFFFF (all bits set including dark)', () => {
    // D=1, R0=1, G0=1, B0=1
    // R4-1=0xF, G4-1=0xF, B4-1=0xF
    // r5 = (15 << 2) | (1 << 1) | 1 = 60 | 2 | 1 = 63
    // 8-bit = (63 << 2) | (63 >> 4) = 252 | 3 = 255
    const color = decodeNeoGeoColor(0xffff);
    expect(color.r).toBe(255);
    expect(color.g).toBe(255);
    expect(color.b).toBe(255);
  });

  it('returns an object with r, g, b properties', () => {
    const color = decodeNeoGeoColor(0x1234);
    expect(color).toHaveProperty('r');
    expect(color).toHaveProperty('g');
    expect(color).toHaveProperty('b');
  });
});

describe('encodeNeoGeoColor', () => {
  it('encodes black (0,0,0) to 0', () => {
    expect(encodeNeoGeoColor(0, 0, 0)).toBe(0);
  });

  it('encodes white (255,255,255)', () => {
    // 255 >> 2 = 63 (0b111111)
    // LSBs: all 1 -> dark = 1 (majority 3/3)
    // r0 = (63 >> 1) & 1 = 1, r4_1 = (63 >> 2) & 0xF = 15
    // same for g, b
    // word = (1<<15)|(1<<14)|(1<<13)|(1<<12)|(15<<8)|(15<<4)|15
    //      = 0x8000|0x4000|0x2000|0x1000|0x0F00|0x00F0|0x000F
    //      = 0xFFFF
    expect(encodeNeoGeoColor(255, 255, 255)).toBe(0xffff);
  });

  it('round-trip: encode then decode is close to original', () => {
    const testColors = [
      [0, 0, 0],
      [255, 255, 255],
      [128, 64, 192],
      [100, 200, 50],
      [33, 66, 99],
    ] as const;

    for (const [r, g, b] of testColors) {
      const word = encodeNeoGeoColor(r, g, b);
      const decoded = decodeNeoGeoColor(word);
      // 8-bit -> 6-bit -> 8-bit: max quantization error is small
      expect(Math.abs(decoded.r - r)).toBeLessThanOrEqual(8);
      expect(Math.abs(decoded.g - g)).toBeLessThanOrEqual(8);
      expect(Math.abs(decoded.b - b)).toBeLessThanOrEqual(8);
    }
  });

  it('round-trip for pure red', () => {
    const word = encodeNeoGeoColor(255, 0, 0);
    const decoded = decodeNeoGeoColor(word);
    expect(decoded.r).toBeGreaterThan(240);
    expect(decoded.g).toBeLessThan(16);
    expect(decoded.b).toBeLessThan(16);
  });

  it('round-trip for pure green', () => {
    const word = encodeNeoGeoColor(0, 255, 0);
    const decoded = decodeNeoGeoColor(word);
    expect(decoded.r).toBeLessThan(16);
    expect(decoded.g).toBeGreaterThan(240);
    expect(decoded.b).toBeLessThan(16);
  });

  it('round-trip for pure blue', () => {
    const word = encodeNeoGeoColor(0, 0, 255);
    const decoded = decodeNeoGeoColor(word);
    expect(decoded.r).toBeLessThan(16);
    expect(decoded.g).toBeLessThan(16);
    expect(decoded.b).toBeGreaterThan(240);
  });

  it('dark bit majority vote: r=5,g=5,b=4 -> dark=1', () => {
    // 5 >> 2 = 1 (LSB = 1), 5 >> 2 = 1 (LSB = 1), 4 >> 2 = 1 (LSB = 1)
    // Actually: 5 >> 2 = 1, 4 >> 2 = 1. All 6-bit values are 1, LSBs all 1.
    // Let's pick values where the 6-bit LSBs differ clearly.
    // r=5: r6 = 5>>2 = 1, LSB = 1
    // g=5: g6 = 5>>2 = 1, LSB = 1
    // b=4: b6 = 4>>2 = 1, LSB = 1
    // All LSBs are 1 so dark = 1.
    // Instead, test with values that give clear 6-bit LSB patterns:
    // r=7 -> r6=1 (LSB=1), g=7 -> g6=1 (LSB=1), b=4 -> b6=1 (LSB=1)
    // These all round to 1 at 6-bit, all LSBs = 1, dark=1.
    //
    // Better: use values where 6-bit LSBs are explicitly controlled.
    // val 6-bit LSB=1 when (val >> 2) is odd.
    // 4 >> 2 = 1 (odd, LSB=1), 8 >> 2 = 2 (even, LSB=0)
    // r=4 (LSB=1), g=4 (LSB=1), b=8 (LSB=0) => 2 out of 3, dark=1
    const word1 = encodeNeoGeoColor(4, 4, 8);
    const dark1 = (word1 >> 15) & 1;
    expect(dark1).toBe(1);
  });

  it('dark bit majority vote: r=8,g=8,b=4 -> dark=0', () => {
    // 8 >> 2 = 2 (LSB=0), 8 >> 2 = 2 (LSB=0), 4 >> 2 = 1 (LSB=1)
    // Majority: 0,0,1 => dark = 0
    const word2 = encodeNeoGeoColor(8, 8, 4);
    const dark2 = (word2 >> 15) & 1;
    expect(dark2).toBe(0);
  });

  it('encoded word fits in 16 bits', () => {
    const testColors = [
      [0, 0, 0],
      [255, 255, 255],
      [128, 128, 128],
      [200, 100, 50],
    ] as const;

    for (const [r, g, b] of testColors) {
      const word = encodeNeoGeoColor(r, g, b);
      expect(word).toBeGreaterThanOrEqual(0);
      expect(word).toBeLessThanOrEqual(0xffff);
    }
  });
});

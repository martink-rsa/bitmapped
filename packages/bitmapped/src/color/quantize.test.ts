import { describe, it, expect } from 'vitest';
import { quantizeBits, LEVELS } from './quantize.js';

describe('quantizeBits', () => {
  it('throws for bits = 0', () => {
    expect(() => quantizeBits(128, 0)).toThrow('bits > 0');
  });

  it('throws for negative bits', () => {
    expect(() => quantizeBits(128, -1)).toThrow('bits > 0');
  });

  it('quantizes correctly for bits = 1', () => {
    expect(quantizeBits(0, 1)).toBe(0);
    expect(quantizeBits(255, 1)).toBe(255);
  });

  it('quantizes correctly for bits = 2', () => {
    expect(quantizeBits(0, 2)).toBe(0);
    expect(quantizeBits(255, 2)).toBe(255);
    expect(quantizeBits(128, 2)).toBe(170);
  });
});

describe('LEVELS', () => {
  it('LEVELS[3] contains standard linear 3-bit values', () => {
    const expected = [0, 36, 73, 109, 146, 182, 219, 255];
    expect(LEVELS[3]).toEqual(expected);
  });
});

import { describe, it, expect } from 'vitest';
import { parseGPL } from './parse-gpl.js';

const sampleGPL = `GIMP Palette
Name: Test Palette
Columns: 16
#
  0   0   0	Black
255 255 255	White
255   0   0	Red
  0 255   0	Green
  0   0 255	Blue
128 128 128	Gray
# This is a comment
255 165   0	Orange`;

describe('parseGPL', () => {
  it('parses correct number of colors', () => {
    const palette = parseGPL(sampleGPL);
    expect(palette).toHaveLength(7);
  });

  it('parses RGB values correctly', () => {
    const palette = parseGPL(sampleGPL);
    expect(palette[0]!.color).toEqual({ r: 0, g: 0, b: 0 });
    expect(palette[1]!.color).toEqual({ r: 255, g: 255, b: 255 });
    expect(palette[2]!.color).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('captures color names', () => {
    const palette = parseGPL(sampleGPL);
    expect(palette[0]!.name).toBe('Black');
    expect(palette[1]!.name).toBe('White');
    expect(palette[6]!.name).toBe('Orange');
  });

  it('skips comment and header lines', () => {
    const palette = parseGPL(sampleGPL);
    // Should not include any entries from # comments or GIMP Palette / Name / Columns lines
    for (const entry of palette) {
      expect(entry.color.r).toBeGreaterThanOrEqual(0);
      expect(entry.color.r).toBeLessThanOrEqual(255);
    }
  });

  it('handles empty input', () => {
    expect(parseGPL('')).toEqual([]);
  });

  it('handles lines without names', () => {
    const gpl = `GIMP Palette
128  64  32`;
    const palette = parseGPL(gpl);
    expect(palette).toHaveLength(1);
    expect(palette[0]!.color).toEqual({ r: 128, g: 64, b: 32 });
    expect(palette[0]!.name).toBeUndefined();
  });

  it('handles extra whitespace in color lines', () => {
    const gpl = `GIMP Palette
   128    64    32   Rusty`;
    const palette = parseGPL(gpl);
    expect(palette).toHaveLength(1);
    expect(palette[0]!.color).toEqual({ r: 128, g: 64, b: 32 });
    expect(palette[0]!.name).toBe('Rusty');
  });

  it('handles tab-separated values', () => {
    const gpl = `GIMP Palette
128\t64\t32\tTabbed`;
    const palette = parseGPL(gpl);
    expect(palette).toHaveLength(1);
    expect(palette[0]!.color).toEqual({ r: 128, g: 64, b: 32 });
  });

  it('handles palette with only comments and no colors', () => {
    const gpl = `GIMP Palette
Name: Empty Palette
# comment 1
# comment 2`;
    const palette = parseGPL(gpl);
    expect(palette).toEqual([]);
  });

  it('clamps values above 255 down to 255', () => {
    const gpl = `GIMP Palette
300  400  128\tClamped`;
    const palette = parseGPL(gpl);
    expect(palette).toHaveLength(1);
    expect(palette[0]!.color.r).toBe(255);
    expect(palette[0]!.color.g).toBe(255);
    expect(palette[0]!.color.b).toBe(128);
  });
});

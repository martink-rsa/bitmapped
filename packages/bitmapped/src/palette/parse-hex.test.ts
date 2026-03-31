import { describe, it, expect } from 'vitest';
import { parseHex } from './parse-hex.js';

describe('parseHex', () => {
  it('parses #RRGGBB format', () => {
    const palette = parseHex('#FF0000 #00FF00 #0000FF');
    expect(palette).toHaveLength(3);
    expect(palette[0]!.color).toEqual({ r: 255, g: 0, b: 0 });
    expect(palette[1]!.color).toEqual({ r: 0, g: 255, b: 0 });
    expect(palette[2]!.color).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('parses #RGB format and expands to 6 chars', () => {
    const palette = parseHex('#F00 #0F0 #00F');
    expect(palette).toHaveLength(3);
    expect(palette[0]!.color).toEqual({ r: 255, g: 0, b: 0 });
    expect(palette[1]!.color).toEqual({ r: 0, g: 255, b: 0 });
    expect(palette[2]!.color).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('parses bare RRGGBB format', () => {
    const palette = parseHex('FF0000\n00FF00\n0000FF');
    expect(palette).toHaveLength(3);
    expect(palette[0]!.color).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('handles mixed content like a CSS file', () => {
    const css = `
      body { color: #333; background: #FAFAFA; }
      .error { color: #FF004D; }
      .success { color: #00E436; }
    `;
    const palette = parseHex(css);
    expect(palette.length).toBeGreaterThanOrEqual(4);
    expect(palette[0]!.color).toEqual({ r: 51, g: 51, b: 51 });
  });

  it('handles empty input', () => {
    expect(parseHex('')).toEqual([]);
  });

  it('handles case insensitivity', () => {
    const palette = parseHex('#aaBBcc #AABBCC');
    expect(palette).toHaveLength(2);
    expect(palette[0]!.color).toEqual(palette[1]!.color);
  });

  it('ignores non-hex content around colors', () => {
    const palette = parseHex('background: #FF0000; /* red */');
    expect(palette).toHaveLength(1);
    expect(palette[0]!.color).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('does not set a name property', () => {
    const palette = parseHex('#FF0000');
    expect(palette[0]!.name).toBeUndefined();
  });

  it('handles multiple colors on the same line', () => {
    const palette = parseHex('#FF0000 #00FF00 #0000FF');
    expect(palette).toHaveLength(3);
  });

  it('handles newline-separated colors', () => {
    const palette = parseHex('#FF0000\n#00FF00\n#0000FF');
    expect(palette).toHaveLength(3);
  });

  it('does not match English words as 3-char hex without #', () => {
    const palette = parseHex('add bad ace cab');
    expect(palette).toHaveLength(0);
  });

  it('still matches 3-char hex with # prefix', () => {
    const palette = parseHex('#add #bad #ace');
    expect(palette).toHaveLength(3);
  });
});

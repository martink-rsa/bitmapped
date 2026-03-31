import { describe, it, expect } from 'vitest';
import { applyPS1Dither, PS1_DITHER_MATRIX } from './ps1.js';

describe('PS1_DITHER_MATRIX', () => {
  it('is a 4x4 matrix', () => {
    expect(PS1_DITHER_MATRIX).toHaveLength(4);
    for (const row of PS1_DITHER_MATRIX) {
      expect(row).toHaveLength(4);
    }
  });

  it('contains values in [-4, 3] range matching PS1 hardware', () => {
    for (const row of PS1_DITHER_MATRIX) {
      for (const val of row) {
        expect(val).toBeGreaterThanOrEqual(-4);
        expect(val).toBeLessThanOrEqual(3);
      }
    }
  });
});

describe('applyPS1Dither', () => {
  it('returns ImageData with same dimensions', () => {
    const data = new Uint8ClampedArray(4 * 4 * 4).fill(128);
    // set alpha to 255
    for (let i = 3; i < data.length; i += 4) data[i] = 255;
    const input = new ImageData(data, 4, 4);

    const result = applyPS1Dither(input);

    expect(result.width).toBe(4);
    expect(result.height).toBe(4);
    expect(result.data.length).toBe(input.data.length);
  });

  it('does not mutate the input ImageData', () => {
    const data = new Uint8ClampedArray(4 * 4 * 4).fill(100);
    for (let i = 3; i < data.length; i += 4) data[i] = 255;
    const input = new ImageData(data, 4, 4);
    const originalData = new Uint8ClampedArray(input.data);

    applyPS1Dither(input);

    expect(input.data).toEqual(originalData);
  });

  it('quantizes all channels to 5-bit values', () => {
    // Fill with varied values
    const w = 4;
    const h = 4;
    const data = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      data[i * 4] = (i * 17) % 256;
      data[i * 4 + 1] = (i * 31) % 256;
      data[i * 4 + 2] = (i * 47) % 256;
      data[i * 4 + 3] = 255;
    }
    const input = new ImageData(data, w, h);

    const result = applyPS1Dither(input);

    // 5-bit expanded to 8-bit: value = (v5 << 3) | (v5 >> 2)
    // Valid values are those where low 3 bits = top 3 of the 5-bit value
    for (let i = 0; i < w * h; i++) {
      for (let ch = 0; ch < 3; ch++) {
        const val = result.data[i * 4 + ch]!;
        // Extract the 5-bit quantized value
        const v5 = val >> 3;
        const expected = (v5 << 3) | (v5 >> 2);
        expect(val).toBe(expected);
      }
    }
  });

  it('preserves alpha channel', () => {
    const data = new Uint8ClampedArray([128, 64, 32, 200]);
    const input = new ImageData(data, 1, 1);

    const result = applyPS1Dither(input);

    expect(result.data[3]).toBe(200);
  });

  it('pure black stays black', () => {
    const data = new Uint8ClampedArray([0, 0, 0, 255]);
    const input = new ImageData(data, 1, 1);

    const result = applyPS1Dither(input);

    // At (0,0) the dither bias is -4, so 0 + (-4) clamped = 0, quantized = 0
    expect(result.data[0]).toBe(0);
    expect(result.data[1]).toBe(0);
    expect(result.data[2]).toBe(0);
  });

  it('pure white stays white', () => {
    const data = new Uint8ClampedArray([255, 255, 255, 255]);
    const input = new ImageData(data, 1, 1);

    const result = applyPS1Dither(input);

    // At (0,0) the dither bias is -4, so 255 + (-4) = 251, quantized:
    // 251 >> 3 = 31, (31 << 3) | (31 >> 2) = 248 | 7 = 255
    expect(result.data[0]).toBe(255);
    expect(result.data[1]).toBe(255);
    expect(result.data[2]).toBe(255);
  });

  it('applies different biases at different pixel positions', () => {
    // Use a uniform value so only the dither matrix causes variation
    const w = 4;
    const h = 1;
    const data = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < w; i++) {
      data[i * 4] = 128;
      data[i * 4 + 1] = 128;
      data[i * 4 + 2] = 128;
      data[i * 4 + 3] = 255;
    }
    const input = new ImageData(data, w, h);

    const result = applyPS1Dither(input);

    // Row 0 of the matrix is [-4, 0, -3, 1]
    // 128 + (-4) = 124 → 15 → (15<<3)|(15>>2) = 120|3 = 123
    // 128 + 0    = 128 → 16 → (16<<3)|(16>>2) = 128|4 = 132
    // 128 + (-3) = 125 → 15 → 123
    // 128 + 1    = 129 → 16 → 132
    expect(result.data[0]).toBe(123); // x=0
    expect(result.data[4]).toBe(132); // x=1
    expect(result.data[8]).toBe(123); // x=2
    expect(result.data[12]).toBe(132); // x=3
  });
});

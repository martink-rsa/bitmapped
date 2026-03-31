import { describe, it, expect } from 'vitest';
import type { RGB } from '../core/types.js';
import { solveApple2Artifact } from './apple2-artifact.js';

function createTestImageData(
  width: number,
  height: number,
  fill: RGB,
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = fill.r;
    data[i * 4 + 1] = fill.g;
    data[i * 4 + 2] = fill.b;
    data[i * 4 + 3] = 255;
  }
  return new ImageData(data, width, height);
}

function hexToRgb(hex: string): RGB {
  const clean = hex.startsWith('#') ? hex.slice(1) : hex;
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

const group1 = ['#000000', '#FF00FF', '#00FF00', '#FFFFFF'] as const;
const group2 = ['#000000', '#0000FF', '#FF8000', '#FFFFFF'] as const;
const applePaletteSets: readonly (readonly string[])[] = [group1, group2];

/** All colors across both groups, parsed to RGB */
const allColors: RGB[] = [...new Set([...group1, ...group2])].map((h) =>
  hexToRgb(h),
);

describe('solveApple2Artifact', () => {
  it('output has same dimensions as input', () => {
    const input = createTestImageData(14, 4, { r: 128, g: 128, b: 128 });
    const output = solveApple2Artifact(input, applePaletteSets, 7);
    expect(output.width).toBe(14);
    expect(output.height).toBe(4);
    expect(output.data.length).toBe(input.data.length);
  });

  it('all output pixels have alpha 255', () => {
    const input = createTestImageData(7, 2, { r: 100, g: 150, b: 200 });
    const output = solveApple2Artifact(input, applePaletteSets, 7);

    for (let i = 0; i < output.width * output.height; i++) {
      expect(output.data[i * 4 + 3]).toBe(255);
    }
  });

  it('all output pixels are from one of the palette sets', () => {
    const input = createTestImageData(14, 4, { r: 100, g: 80, b: 200 });
    const output = solveApple2Artifact(input, applePaletteSets, 7);

    for (let i = 0; i < output.width * output.height; i++) {
      const r = output.data[i * 4]!;
      const g = output.data[i * 4 + 1]!;
      const b = output.data[i * 4 + 2]!;
      const isValid = allColors.some(
        (c) => c.r === r && c.g === g && c.b === b,
      );
      expect(isValid).toBe(true);
    }
  });

  it('handles a 1x1 image', () => {
    const input = createTestImageData(1, 1, { r: 200, g: 200, b: 200 });
    const output = solveApple2Artifact(input, applePaletteSets, 7);
    expect(output.width).toBe(1);
    expect(output.height).toBe(1);
  });

  it('handles partial group at end of scanline', () => {
    // Width 10 with pixelsPerGroup=7: group 0-6, partial group 7-9
    const input = createTestImageData(10, 2, { r: 0, g: 0, b: 0 });
    const output = solveApple2Artifact(input, applePaletteSets, 7);
    expect(output.width).toBe(10);
    expect(output.height).toBe(2);

    // All pixels should still be valid palette colors
    for (let i = 0; i < output.width * output.height; i++) {
      const r = output.data[i * 4]!;
      const g = output.data[i * 4 + 1]!;
      const b = output.data[i * 4 + 2]!;
      const isValid = allColors.some(
        (c) => c.r === r && c.g === g && c.b === b,
      );
      expect(isValid).toBe(true);
    }
  });

  it('with one palette set, all pixels map to that set', () => {
    const singleSet: readonly (readonly string[])[] = [group1];
    const group1Colors = [...group1].map((h) => hexToRgb(h));
    const input = createTestImageData(7, 2, { r: 100, g: 200, b: 50 });
    const output = solveApple2Artifact(input, singleSet, 7);

    for (let i = 0; i < output.width * output.height; i++) {
      const r = output.data[i * 4]!;
      const g = output.data[i * 4 + 1]!;
      const b = output.data[i * 4 + 2]!;
      const isInGroup1 = group1Colors.some(
        (c) => c.r === r && c.g === g && c.b === b,
      );
      expect(isInGroup1).toBe(true);
    }
  });

  it('black input maps to black', () => {
    const input = createTestImageData(7, 1, { r: 0, g: 0, b: 0 });
    const output = solveApple2Artifact(input, applePaletteSets, 7);

    for (let i = 0; i < 7; i++) {
      expect(output.data[i * 4]).toBe(0);
      expect(output.data[i * 4 + 1]).toBe(0);
      expect(output.data[i * 4 + 2]).toBe(0);
    }
  });

  it('white input maps to white', () => {
    const input = createTestImageData(7, 1, {
      r: 255,
      g: 255,
      b: 255,
    });
    const output = solveApple2Artifact(input, applePaletteSets, 7);

    for (let i = 0; i < 7; i++) {
      expect(output.data[i * 4]).toBe(255);
      expect(output.data[i * 4 + 1]).toBe(255);
      expect(output.data[i * 4 + 2]).toBe(255);
    }
  });

  it('pure green input prefers Group 1', () => {
    // Group 1 has #00FF00 (green), Group 2 does not.
    // A pure green pixel should be mapped to green from Group 1.
    const input = createTestImageData(7, 1, { r: 0, g: 255, b: 0 });
    const output = solveApple2Artifact(input, applePaletteSets, 7);

    for (let i = 0; i < 7; i++) {
      expect(output.data[i * 4]).toBe(0);
      expect(output.data[i * 4 + 1]).toBe(255);
      expect(output.data[i * 4 + 2]).toBe(0);
    }
  });

  it('does not mutate the input ImageData', () => {
    const input = createTestImageData(7, 2, { r: 128, g: 128, b: 128 });
    const originalData = new Uint8ClampedArray(input.data);
    solveApple2Artifact(input, applePaletteSets, 7);
    expect(input.data).toEqual(originalData);
  });

  it('works with a custom distance algorithm', () => {
    const input = createTestImageData(7, 2, { r: 100, g: 50, b: 200 });
    const output = solveApple2Artifact(input, applePaletteSets, 7, 'euclidean');
    expect(output.width).toBe(7);
    expect(output.height).toBe(2);
  });

  it('throws when paletteSets is empty', () => {
    const input = createTestImageData(7, 1, { r: 128, g: 128, b: 128 });
    expect(() => solveApple2Artifact(input, [], 7)).toThrow(
      'at least one palette set',
    );
  });

  it('throws when a palette set contains empty array', () => {
    const input = createTestImageData(7, 1, { r: 128, g: 128, b: 128 });
    expect(() => solveApple2Artifact(input, [[]], 7)).toThrow(
      'palette set 0 is empty',
    );
  });
});

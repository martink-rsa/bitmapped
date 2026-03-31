import { describe, it, expect } from 'vitest';
import { generateBlueNoiseMatrix } from './blue-noise.js';

describe('generateBlueNoiseMatrix', () => {
  it('generates the correct size', () => {
    const matrix = generateBlueNoiseMatrix(16);
    expect(matrix).toHaveLength(16);
    for (const row of matrix) {
      expect(row).toHaveLength(16);
    }
  });

  it('generates a 64x64 matrix', () => {
    const matrix = generateBlueNoiseMatrix(64);
    expect(matrix).toHaveLength(64);
    expect(matrix[0]).toHaveLength(64);
  });

  it('values are normalized to [0, 1) range', () => {
    const matrix = generateBlueNoiseMatrix(16);
    for (const v of matrix.flat()) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('all values are unique for a given size', () => {
    const matrix = generateBlueNoiseMatrix(16);
    const values = matrix.flat();
    const unique = new Set(values);
    expect(unique.size).toBe(256);
  });

  it('distribution is roughly uniform', () => {
    const matrix = generateBlueNoiseMatrix(16);
    const values = matrix.flat().sort((a, b) => a - b);
    const n = values.length;
    // Check that values span the full range
    expect(values[0]!).toBeLessThan(0.05);
    expect(values[n - 1]!).toBeGreaterThan(0.95);
    // Check median is roughly 0.5
    const median = values[Math.floor(n / 2)]!;
    expect(median).toBeGreaterThan(0.35);
    expect(median).toBeLessThan(0.65);
  });

  it('throws for size < 2', () => {
    expect(() => generateBlueNoiseMatrix(1)).toThrow();
  });
});

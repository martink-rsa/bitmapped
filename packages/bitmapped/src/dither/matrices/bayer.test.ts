import { describe, it, expect } from 'vitest';
import { generateBayerMatrix } from './bayer.js';

describe('generateBayerMatrix (normalized)', () => {
  it('generates a 2x2 matrix', () => {
    const matrix = generateBayerMatrix(2);
    expect(matrix).toHaveLength(2);
    expect(matrix[0]).toHaveLength(2);
  });

  it('generates a 4x4 matrix', () => {
    const matrix = generateBayerMatrix(4);
    expect(matrix).toHaveLength(4);
    for (const row of matrix) {
      expect(row).toHaveLength(4);
    }
  });

  it('generates an 8x8 matrix', () => {
    const matrix = generateBayerMatrix(8);
    expect(matrix).toHaveLength(8);
    for (const row of matrix) {
      expect(row).toHaveLength(8);
    }
  });

  it('values are normalized to (0, 1) range', () => {
    const matrix = generateBayerMatrix(4);
    const values = matrix.flat();
    for (const v of values) {
      expect(v).toBeGreaterThan(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('all values are unique', () => {
    const matrix = generateBayerMatrix(4);
    const values = matrix.flat();
    const unique = new Set(values);
    expect(unique.size).toBe(16);
  });

  it('throws for non-power-of-2 sizes', () => {
    expect(() => generateBayerMatrix(3)).toThrow();
    expect(() => generateBayerMatrix(5)).toThrow();
    expect(() => generateBayerMatrix(1)).toThrow();
  });

  it('2x2 produces expected values', () => {
    const matrix = generateBayerMatrix(2);
    // Raw: [[0,2],[3,1]], centered: (v + 0.5) / 4
    expect(matrix[0]![0]).toBeCloseTo(0.5 / 4);
    expect(matrix[0]![1]).toBeCloseTo(2.5 / 4);
    expect(matrix[1]![0]).toBeCloseTo(3.5 / 4);
    expect(matrix[1]![1]).toBeCloseTo(1.5 / 4);
  });
});

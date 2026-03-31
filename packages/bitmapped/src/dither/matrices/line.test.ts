import { describe, it, expect } from 'vitest';
import {
  generateHorizontalLineMatrix,
  generateVerticalLineMatrix,
  generateDiagonalLineMatrix,
} from './line.js';

describe('generateHorizontalLineMatrix', () => {
  it('generates the correct size', () => {
    const matrix = generateHorizontalLineMatrix(8);
    expect(matrix).toHaveLength(8);
    for (const row of matrix) {
      expect(row).toHaveLength(8);
    }
  });

  it('all values in the same row are equal', () => {
    const matrix = generateHorizontalLineMatrix(8);
    for (const row of matrix) {
      const first = row[0]!;
      for (const v of row) {
        expect(v).toBe(first);
      }
    }
  });

  it('values are normalized to (0, 1) range', () => {
    const matrix = generateHorizontalLineMatrix(8);
    for (const v of matrix.flat()) {
      expect(v).toBeGreaterThan(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('throws for size < 2', () => {
    expect(() => generateHorizontalLineMatrix(1)).toThrow();
  });
});

describe('generateVerticalLineMatrix', () => {
  it('generates the correct size', () => {
    const matrix = generateVerticalLineMatrix(8);
    expect(matrix).toHaveLength(8);
    for (const row of matrix) {
      expect(row).toHaveLength(8);
    }
  });

  it('all values in the same column are equal', () => {
    const matrix = generateVerticalLineMatrix(8);
    for (let x = 0; x < 8; x++) {
      const first = matrix[0]![x]!;
      for (let y = 0; y < 8; y++) {
        expect(matrix[y]![x]).toBe(first);
      }
    }
  });

  it('values are normalized to (0, 1) range', () => {
    const matrix = generateVerticalLineMatrix(8);
    for (const v of matrix.flat()) {
      expect(v).toBeGreaterThan(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('generateDiagonalLineMatrix', () => {
  it('generates the correct size', () => {
    const matrix = generateDiagonalLineMatrix(8);
    expect(matrix).toHaveLength(8);
    for (const row of matrix) {
      expect(row).toHaveLength(8);
    }
  });

  it('values along the same diagonal are equal', () => {
    const matrix = generateDiagonalLineMatrix(8);
    // Along a diagonal, (x+y) % size is constant
    // Check: (0,0) and (1,7) both have (x+y)%8 = 0
    expect(matrix[0]![0]).toBe(matrix[7]![1]);
    // Check: (0,1) and (1,0) both have (x+y)%8 = 1
    expect(matrix[1]![0]).toBe(matrix[0]![1]);
  });

  it('values are normalized to (0, 1) range', () => {
    const matrix = generateDiagonalLineMatrix(8);
    for (const v of matrix.flat()) {
      expect(v).toBeGreaterThan(0);
      expect(v).toBeLessThan(1);
    }
  });
});

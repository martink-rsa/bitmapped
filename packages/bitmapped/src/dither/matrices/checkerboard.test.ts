import { describe, it, expect } from 'vitest';
import { generateCheckerboardMatrix } from './checkerboard.js';

describe('generateCheckerboardMatrix', () => {
  it('always returns a 2x2 matrix', () => {
    const matrix = generateCheckerboardMatrix();
    expect(matrix).toHaveLength(2);
    expect(matrix[0]).toHaveLength(2);
    expect(matrix[1]).toHaveLength(2);
  });

  it('has the expected alternating pattern', () => {
    const matrix = generateCheckerboardMatrix();
    expect(matrix[0]![0]).toBe(0.25);
    expect(matrix[0]![1]).toBe(0.75);
    expect(matrix[1]![0]).toBe(0.75);
    expect(matrix[1]![1]).toBe(0.25);
  });

  it('has exactly two distinct threshold levels', () => {
    const matrix = generateCheckerboardMatrix();
    const values = new Set(matrix.flat());
    expect(values.size).toBe(2);
  });
});

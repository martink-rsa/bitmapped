import { describe, it, expect } from 'vitest';
import { generateClusteredDotMatrix } from './clustered-dot.js';

describe('generateClusteredDotMatrix', () => {
  it('generates a 4x4 matrix', () => {
    const matrix = generateClusteredDotMatrix(4);
    expect(matrix).toHaveLength(4);
    for (const row of matrix) {
      expect(row).toHaveLength(4);
    }
  });

  it('generates an 8x8 matrix', () => {
    const matrix = generateClusteredDotMatrix(8);
    expect(matrix).toHaveLength(8);
    for (const row of matrix) {
      expect(row).toHaveLength(8);
    }
  });

  it('values are normalized to [0, 1) range', () => {
    const matrix = generateClusteredDotMatrix(4);
    const values = matrix.flat();
    for (const v of values) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('center values are lower than edge values (dots from center)', () => {
    const matrix = generateClusteredDotMatrix(4);
    // Center of 4x4 is around (1,1) and (2,2)
    // Base pattern: center value at [1][1] is 0, edges at [0][0] is 12
    const centerVal = matrix[1]![1]!;
    const edgeVal = matrix[0]![0]!;
    expect(centerVal).toBeLessThan(edgeVal);
  });

  it('throws for size < 4', () => {
    expect(() => generateClusteredDotMatrix(2)).toThrow();
  });
});

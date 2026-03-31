import { describe, it, expect } from 'vitest';
import * as ditherModule from './index.js';

describe('dither barrel export', () => {
  it('exports existing dither functions', () => {
    expect(ditherModule.floydSteinberg).toBeTypeOf('function');
    expect(ditherModule.bayerDither).toBeTypeOf('function');
    expect(ditherModule.generateBayerMatrix).toBeTypeOf('function');
    expect(ditherModule.atkinsonDither).toBeTypeOf('function');
  });

  it('exports orderedDither', () => {
    expect(ditherModule.orderedDither).toBeTypeOf('function');
  });

  it('exports the matrices registry', () => {
    expect(ditherModule.matrices).toBeTypeOf('object');
    expect(ditherModule.matrices.bayer).toBeTypeOf('function');
    expect(ditherModule.matrices['clustered-dot']).toBeTypeOf('function');
    expect(ditherModule.matrices['horizontal-line']).toBeTypeOf('function');
    expect(ditherModule.matrices['vertical-line']).toBeTypeOf('function');
    expect(ditherModule.matrices['diagonal-line']).toBeTypeOf('function');
    expect(ditherModule.matrices.checkerboard).toBeTypeOf('function');
    expect(ditherModule.matrices['blue-noise']).toBeTypeOf('function');
  });

  it('exports individual matrix generators', () => {
    expect(ditherModule.generateBayerThresholdMatrix).toBeTypeOf('function');
    expect(ditherModule.generateClusteredDotMatrix).toBeTypeOf('function');
    expect(ditherModule.generateHorizontalLineMatrix).toBeTypeOf('function');
    expect(ditherModule.generateVerticalLineMatrix).toBeTypeOf('function');
    expect(ditherModule.generateDiagonalLineMatrix).toBeTypeOf('function');
    expect(ditherModule.generateCheckerboardMatrix).toBeTypeOf('function');
    expect(ditherModule.generateBlueNoiseMatrix).toBeTypeOf('function');
  });
});

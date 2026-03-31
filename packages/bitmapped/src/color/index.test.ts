import { describe, it, expect } from 'vitest';
import * as colorModule from './index.js';

describe('color barrel export', () => {
  it('exports all expected functions', () => {
    expect(colorModule.euclideanDistance).toBeTypeOf('function');
    expect(colorModule.redmeanDistance).toBeTypeOf('function');
    expect(colorModule.cie76Distance).toBeTypeOf('function');
    expect(colorModule.ciede2000Distance).toBeTypeOf('function');
    expect(colorModule.oklabDistance).toBeTypeOf('function');
    expect(colorModule.getDistanceFunction).toBeTypeOf('function');
    expect(colorModule.rgbToLab).toBeTypeOf('function');
    expect(colorModule.rgbToOklab).toBeTypeOf('function');
    expect(colorModule.createPaletteMatcher).toBeTypeOf('function');
    expect(colorModule.findNearestColor).toBeTypeOf('function');
    expect(colorModule.findNearestColors).toBeTypeOf('function');
    expect(colorModule.mapImageToPalette).toBeTypeOf('function');
  });
});

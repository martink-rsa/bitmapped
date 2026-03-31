import { describe, it, expect } from 'vitest';
import * as coreModule from './index.js';

describe('core barrel export', () => {
  it('exports all expected functions', () => {
    expect(coreModule.getPixelRGB).toBeTypeOf('function');
    expect(coreModule.setPixelRGB).toBeTypeOf('function');
    expect(coreModule.calculateAverageColor).toBeTypeOf('function');
    expect(coreModule.createImageData).toBeTypeOf('function');
    expect(coreModule.imageDataToUint32).toBeTypeOf('function');
    expect(coreModule.uint32ToRGB).toBeTypeOf('function');
    expect(coreModule.rgbToUint32).toBeTypeOf('function');
    expect(coreModule.pixelateBlockAverage).toBeTypeOf('function');
    expect(coreModule.pixelateDownscale).toBeTypeOf('function');
    expect(coreModule.renderPixelateResult).toBeTypeOf('function');
    expect(coreModule.process).toBeTypeOf('function');
  });
});

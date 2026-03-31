import { describe, it, expect } from 'vitest';
import * as paletteModule from './index.js';

describe('palette barrel export', () => {
  it('exports all expected functions', () => {
    expect(paletteModule.parseGPL).toBeTypeOf('function');
    expect(paletteModule.parseHex).toBeTypeOf('function');
    expect(paletteModule.parseASE).toBeTypeOf('function');
    expect(paletteModule.extractPalette).toBeTypeOf('function');
  });
});

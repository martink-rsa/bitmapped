import { describe, it, expect } from 'vitest';
import { getPreset, listPresets, listPresetsByCategory } from './registry.js';

describe('listPresets', () => {
  it('returns all registered presets', () => {
    const presets = listPresets();
    expect(presets.length).toBe(54);
  });

  it('every preset has required fields', () => {
    for (const preset of listPresets()) {
      expect(preset.id).toBeTypeOf('string');
      expect(preset.id.length).toBeGreaterThan(0);
      expect(preset.name).toBeTypeOf('string');
      expect(preset.category).toBeTypeOf('string');
      expect(preset.system).toBeTypeOf('string');
      expect(preset.resolution).toBeDefined();
      expect(preset.resolution.width).toBeGreaterThan(0);
      expect(preset.resolution.height).toBeGreaterThan(0);
      expect(preset.par).toBeDefined();
      expect(preset.par.x).toBeGreaterThan(0);
      expect(preset.par.y).toBeGreaterThan(0);
      expect(preset.display).toBeDefined();
      expect(preset.display.type).toBeTypeOf('string');
    }
  });

  it('all preset IDs are unique', () => {
    const presets = listPresets();
    const ids = presets.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every preset has a palette or colorSpace', () => {
    for (const preset of listPresets()) {
      const hasPalette = preset.palette && preset.palette.length > 0;
      const hasColorSpace = preset.colorSpace !== undefined;
      expect(hasPalette || hasColorSpace).toBe(true);
    }
  });
});

describe('getPreset', () => {
  it('returns C64 Pepto with 16 colors', () => {
    const preset = getPreset('c64-pepto');
    expect(preset).toBeDefined();
    expect(preset!.palette).toHaveLength(16);
    expect(preset!.category).toBe('computer');
  });

  it('returns NES NTSC with 64 palette entries', () => {
    const preset = getPreset('nes-ntsc');
    expect(preset).toBeDefined();
    expect(preset!.palette).toHaveLength(64);
    expect(preset!.category).toBe('nintendo');
  });

  it('returns Game Boy DMG with 4 colors', () => {
    const preset = getPreset('gameboy-dmg');
    expect(preset).toBeDefined();
    expect(preset!.palette).toHaveLength(4);
  });

  it('returns ZX Spectrum with 15 colors', () => {
    const preset = getPreset('zx-spectrum');
    expect(preset).toBeDefined();
    expect(preset!.palette).toHaveLength(15);
  });

  it('returns Atari 2600 NTSC with 128 colors', () => {
    const preset = getPreset('atari-2600-ntsc');
    expect(preset).toBeDefined();
    expect(preset!.palette).toHaveLength(128);
  });

  it('returns undefined for nonexistent preset', () => {
    expect(getPreset('nonexistent')).toBeUndefined();
  });
});

describe('listPresetsByCategory', () => {
  it('filters to nintendo presets only', () => {
    const nintendo = listPresetsByCategory('nintendo');
    expect(nintendo.length).toBeGreaterThan(0);
    for (const preset of nintendo) {
      expect(preset.category).toBe('nintendo');
    }
  });

  it('filters to computer presets only', () => {
    const computers = listPresetsByCategory('computer');
    expect(computers.length).toBeGreaterThan(0);
    for (const preset of computers) {
      expect(preset.category).toBe('computer');
    }
  });

  it('filters to sega presets only', () => {
    const sega = listPresetsByCategory('sega');
    expect(sega.length).toBeGreaterThan(0);
    for (const preset of sega) {
      expect(preset.category).toBe('sega');
    }
  });

  it('all categories together equal total presets', () => {
    const total = listPresets().length;
    const computers = listPresetsByCategory('computer').length;
    const nintendo = listPresetsByCategory('nintendo').length;
    const sega = listPresetsByCategory('sega').length;
    const ibmPc = listPresetsByCategory('ibm-pc').length;
    const arcade = listPresetsByCategory('arcade').length;
    const fantasy = listPresetsByCategory('fantasy').length;
    const other = listPresetsByCategory('other').length;
    expect(computers + nintendo + sega + ibmPc + arcade + fantasy + other).toBe(
      total,
    );
  });
});

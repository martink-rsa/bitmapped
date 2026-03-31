import type { HardwarePreset } from 'bitmapped';
import { listPresets } from 'bitmapped/presets';
import { CATEGORIES } from './categories';
import { SYSTEM_DESCRIPTIONS, type SystemDescription } from './descriptions';

export interface SystemUIMetadata {
  presetId: string;
  descriptionKey: string;
  displayName: string;
  shortName: string;
  year: number;
  displayCategoryId: string;
  constraintSummary: string;
}

export interface EnrichedSystem {
  preset: HardwarePreset;
  ui: SystemUIMetadata;
  description: SystemDescription;
}

/**
 * Maps every preset ID to its UI metadata.
 * Multiple presets can share a descriptionKey (e.g. nes-ntsc / nes-pal both use 'nes').
 */
const PRESET_UI_MAP: Record<string, SystemUIMetadata> = {
  // ── Consoles ──
  'nes-ntsc': {
    presetId: 'nes-ntsc',
    descriptionKey: 'nes',
    displayName: 'NES / Famicom (NTSC)',
    shortName: 'NES',
    year: 1983,
    displayCategoryId: 'consoles',
    constraintSummary: '16\u00d716 attribute blocks',
  },
  'nes-pal': {
    presetId: 'nes-pal',
    descriptionKey: 'nes',
    displayName: 'NES / Famicom (PAL)',
    shortName: 'NES (PAL)',
    year: 1983,
    displayCategoryId: 'consoles',
    constraintSummary: '16\u00d716 attribute blocks',
  },
  'gameboy-dmg': {
    presetId: 'gameboy-dmg',
    descriptionKey: 'gameboy',
    displayName: 'Game Boy (DMG)',
    shortName: 'Game Boy',
    year: 1989,
    displayCategoryId: 'consoles',
    constraintSummary: '4 green shades',
  },
  'gameboy-pocket': {
    presetId: 'gameboy-pocket',
    descriptionKey: 'gameboy',
    displayName: 'Game Boy Pocket',
    shortName: 'GB Pocket',
    year: 1996,
    displayCategoryId: 'consoles',
    constraintSummary: '4 gray shades',
  },
  'gameboy-color': {
    presetId: 'gameboy-color',
    descriptionKey: 'gbc',
    displayName: 'Game Boy Color',
    shortName: 'GBC',
    year: 1998,
    displayCategoryId: 'consoles',
    constraintSummary: '15-bit RGB, per-tile palette',
  },
  snes: {
    presetId: 'snes',
    descriptionKey: 'snes',
    displayName: 'Super NES',
    shortName: 'SNES',
    year: 1990,
    displayCategoryId: 'consoles',
    constraintSummary: '15-bit RGB, 256 simultaneous',
  },
  gba: {
    presetId: 'gba',
    descriptionKey: 'gba',
    displayName: 'Game Boy Advance',
    shortName: 'GBA',
    year: 2001,
    displayCategoryId: 'consoles',
    constraintSummary: '15-bit bitmap, no constraints',
  },
  'master-system': {
    presetId: 'master-system',
    descriptionKey: 'sms',
    displayName: 'Sega Master System',
    shortName: 'SMS',
    year: 1985,
    displayCategoryId: 'consoles',
    constraintSummary: '6-bit RGB, per-tile palette',
  },
  genesis: {
    presetId: 'genesis',
    descriptionKey: 'genesis',
    displayName: 'Sega Genesis (NTSC)',
    shortName: 'Genesis',
    year: 1988,
    displayCategoryId: 'consoles',
    constraintSummary: '9-bit RGB, nonlinear DAC',
  },
  'genesis-pal': {
    presetId: 'genesis-pal',
    descriptionKey: 'genesis',
    displayName: 'Sega Mega Drive (PAL)',
    shortName: 'Mega Drive',
    year: 1988,
    displayCategoryId: 'consoles',
    constraintSummary: '9-bit RGB, nonlinear DAC',
  },
  'game-gear': {
    presetId: 'game-gear',
    descriptionKey: 'game-gear',
    displayName: 'Sega Game Gear',
    shortName: 'Game Gear',
    year: 1990,
    displayCategoryId: 'consoles',
    constraintSummary: '12-bit RGB, SMS architecture',
  },
  'neo-geo': {
    presetId: 'neo-geo',
    descriptionKey: 'neo-geo',
    displayName: 'Neo Geo',
    shortName: 'Neo Geo',
    year: 1990,
    displayCategoryId: 'consoles',
    constraintSummary: '65K colors, 256 palettes, all-sprite',
  },
  'virtual-boy': {
    presetId: 'virtual-boy',
    descriptionKey: 'virtual-boy',
    displayName: 'Virtual Boy',
    shortName: 'Virtual Boy',
    year: 1995,
    displayCategoryId: 'consoles',
    constraintSummary: '4 red shades',
  },
  ps1: {
    presetId: 'ps1',
    descriptionKey: 'ps1',
    displayName: 'PlayStation 1',
    shortName: 'PS1',
    year: 1994,
    displayCategoryId: 'consoles',
    constraintSummary: '15-bit with ordered dither',
  },
  colecovision: {
    presetId: 'colecovision',
    descriptionKey: 'colecovision',
    displayName: 'ColecoVision',
    shortName: 'ColecoVision',
    year: 1982,
    displayCategoryId: 'consoles',
    constraintSummary: 'TMS9918A, 2 colors per row',
  },
  'atari-2600-ntsc': {
    presetId: 'atari-2600-ntsc',
    descriptionKey: 'atari-2600',
    displayName: 'Atari 2600 (NTSC)',
    shortName: 'Atari 2600',
    year: 1977,
    displayCategoryId: 'consoles',
    constraintSummary: '4 colors per scanline',
  },
  'atari-2600-pal': {
    presetId: 'atari-2600-pal',
    descriptionKey: 'atari-2600',
    displayName: 'Atari 2600 (PAL)',
    shortName: 'Atari 2600 (PAL)',
    year: 1977,
    displayCategoryId: 'consoles',
    constraintSummary: '4 colors per scanline',
  },

  // ── Home Computers ──
  'zx-spectrum': {
    presetId: 'zx-spectrum',
    descriptionKey: 'zx-spectrum',
    displayName: 'ZX Spectrum',
    shortName: 'ZX Spectrum',
    year: 1982,
    displayCategoryId: 'computers',
    constraintSummary: '2 colors per 8\u00d78 cell',
  },
  'c64-pepto': {
    presetId: 'c64-pepto',
    descriptionKey: 'c64',
    displayName: 'Commodore 64 (Pepto)',
    shortName: 'C64 Pepto',
    year: 1982,
    displayCategoryId: 'computers',
    constraintSummary: '16 fixed colors (Pepto palette)',
  },
  'c64-colodore': {
    presetId: 'c64-colodore',
    descriptionKey: 'c64',
    displayName: 'Commodore 64 (Colodore)',
    shortName: 'C64 Colodore',
    year: 1982,
    displayCategoryId: 'computers',
    constraintSummary: '16 fixed colors (Colodore palette)',
  },
  'c64-hires': {
    presetId: 'c64-hires',
    descriptionKey: 'c64-hires',
    displayName: 'C64 Hi-Res',
    shortName: 'C64 Hires',
    year: 1982,
    displayCategoryId: 'computers',
    constraintSummary: '2 colors per 8\u00d78 cell',
  },
  'c64-multicolor': {
    presetId: 'c64-multicolor',
    descriptionKey: 'c64-multicolor',
    displayName: 'C64 Multicolor',
    shortName: 'C64 Multi',
    year: 1982,
    displayCategoryId: 'computers',
    constraintSummary: '4 colors per 4\u00d78 cell',
  },
  'vic-20': {
    presetId: 'vic-20',
    descriptionKey: 'vic20',
    displayName: 'Commodore VIC-20',
    shortName: 'VIC-20',
    year: 1980,
    displayCategoryId: 'computers',
    constraintSummary: '16 fixed colors, character-based',
  },
  'apple-ii-hires': {
    presetId: 'apple-ii-hires',
    descriptionKey: 'apple2-hires',
    displayName: 'Apple II Hi-Res',
    shortName: 'Apple II Hi',
    year: 1977,
    displayCategoryId: 'computers',
    constraintSummary: 'NTSC artifact colors, 7-pixel groups',
  },
  'apple-ii-lores': {
    presetId: 'apple-ii-lores',
    descriptionKey: 'apple2-lores',
    displayName: 'Apple II Lo-Res',
    shortName: 'Apple II Lo',
    year: 1977,
    displayCategoryId: 'computers',
    constraintSummary: '40\u00d748, 16 colors',
  },
  'amiga-ocs': {
    presetId: 'amiga-ocs',
    descriptionKey: 'amiga-ocs',
    displayName: 'Amiga OCS (32-color)',
    shortName: 'Amiga OCS',
    year: 1985,
    displayCategoryId: 'computers',
    constraintSummary: '12-bit RGB, 32 simultaneous',
  },
  'amiga-ham6': {
    presetId: 'amiga-ham6',
    descriptionKey: 'amiga-ham6',
    displayName: 'Amiga OCS (HAM)',
    shortName: 'Amiga HAM',
    year: 1985,
    displayCategoryId: 'computers',
    constraintSummary: 'Hold-And-Modify, all 4096 colors',
  },
  'amiga-ehb': {
    presetId: 'amiga-ehb',
    descriptionKey: 'amiga-ehb',
    displayName: 'Amiga OCS (EHB)',
    shortName: 'Amiga EHB',
    year: 1985,
    displayCategoryId: 'computers',
    constraintSummary: '64 colors (32 + half-bright)',
  },
  'amstrad-cpc-mode0': {
    presetId: 'amstrad-cpc-mode0',
    descriptionKey: 'cpc-mode0',
    displayName: 'Amstrad CPC (Mode 0)',
    shortName: 'CPC Mode 0',
    year: 1984,
    displayCategoryId: 'computers',
    constraintSummary: '3-level RGB, 16 from 27',
  },
  'amstrad-cpc-mode1': {
    presetId: 'amstrad-cpc-mode1',
    descriptionKey: 'cpc-mode1',
    displayName: 'Amstrad CPC (Mode 1)',
    shortName: 'CPC Mode 1',
    year: 1984,
    displayCategoryId: 'computers',
    constraintSummary: '3-level RGB, 4 from 27',
  },
  'bbc-micro-mode2': {
    presetId: 'bbc-micro-mode2',
    descriptionKey: 'bbc-micro',
    displayName: 'BBC Micro',
    shortName: 'BBC Micro',
    year: 1981,
    displayCategoryId: 'computers',
    constraintSummary: '8 RGB colors, no attribute clash',
  },
  msx: {
    presetId: 'msx',
    descriptionKey: 'msx',
    displayName: 'MSX',
    shortName: 'MSX',
    year: 1983,
    displayCategoryId: 'computers',
    constraintSummary: 'TMS9918A, 2 per row-in-tile',
  },
  msx2: {
    presetId: 'msx2',
    descriptionKey: 'msx2',
    displayName: 'MSX2',
    shortName: 'MSX2',
    year: 1985,
    displayCategoryId: 'computers',
    constraintSummary: '9-bit RGB, 256 on screen',
  },
  'atari-st': {
    presetId: 'atari-st',
    descriptionKey: 'atari-st',
    displayName: 'Atari ST',
    shortName: 'Atari ST',
    year: 1985,
    displayCategoryId: 'computers',
    constraintSummary: '9-bit RGB, 16 from 512',
  },
  'atari-ste': {
    presetId: 'atari-ste',
    descriptionKey: 'atari-ste',
    displayName: 'Atari STE',
    shortName: 'Atari STE',
    year: 1989,
    displayCategoryId: 'computers',
    constraintSummary: '12-bit RGB, 16 from 4096',
  },
  'thomson-mo5': {
    presetId: 'thomson-mo5',
    descriptionKey: 'thomson-mo5',
    displayName: 'Thomson MO5',
    shortName: 'MO5',
    year: 1984,
    displayCategoryId: 'computers',
    constraintSummary: '16 PBGR colors, 2 per row',
  },
  macintosh: {
    presetId: 'macintosh',
    descriptionKey: 'macintosh',
    displayName: 'Macintosh (1984)',
    shortName: 'Macintosh',
    year: 1984,
    displayCategoryId: 'computers',
    constraintSummary: '1-bit monochrome, 512\u00d7342',
  },

  // ── IBM PC ──
  'cga-mode4-pal0-low': {
    presetId: 'cga-mode4-pal0-low',
    descriptionKey: 'cga-pal0',
    displayName: 'CGA Palette 0 (Low)',
    shortName: 'CGA Pal0 Lo',
    year: 1981,
    displayCategoryId: 'ibm-pc',
    constraintSummary: 'Green/Red/Brown + background',
  },
  'cga-mode4-pal0-high': {
    presetId: 'cga-mode4-pal0-high',
    descriptionKey: 'cga-pal0',
    displayName: 'CGA Palette 0 (High)',
    shortName: 'CGA Pal0 Hi',
    year: 1981,
    displayCategoryId: 'ibm-pc',
    constraintSummary: 'Green/Red/Yellow + background',
  },
  'cga-mode4-pal1-low': {
    presetId: 'cga-mode4-pal1-low',
    descriptionKey: 'cga-pal1',
    displayName: 'CGA Palette 1 (Low)',
    shortName: 'CGA Pal1 Lo',
    year: 1981,
    displayCategoryId: 'ibm-pc',
    constraintSummary: 'Cyan/Magenta/White + background',
  },
  'cga-mode4-pal1-high': {
    presetId: 'cga-mode4-pal1-high',
    descriptionKey: 'cga-pal1',
    displayName: 'CGA Palette 1 (High)',
    shortName: 'CGA Pal1 Hi',
    year: 1981,
    displayCategoryId: 'ibm-pc',
    constraintSummary: 'Cyan/Magenta/White + background',
  },
  'cga-composite': {
    presetId: 'cga-composite',
    descriptionKey: 'cga-composite',
    displayName: 'CGA Composite',
    shortName: 'CGA Comp',
    year: 1981,
    displayCategoryId: 'ibm-pc',
    constraintSummary: '16 artifact colors',
  },
  'tandy-1000': {
    presetId: 'tandy-1000',
    descriptionKey: 'tandy',
    displayName: 'Tandy 1000',
    shortName: 'Tandy',
    year: 1984,
    displayCategoryId: 'ibm-pc',
    constraintSummary: 'Full 16 RGBI at 320\u00d7200',
  },
  ega: {
    presetId: 'ega',
    descriptionKey: 'ega',
    displayName: 'EGA',
    shortName: 'EGA',
    year: 1984,
    displayCategoryId: 'ibm-pc',
    constraintSummary: '16 from 64 (rgbRGB)',
  },
  'vga-mode13h': {
    presetId: 'vga-mode13h',
    descriptionKey: 'vga-mode13h',
    displayName: 'VGA Mode 13h',
    shortName: 'VGA 13h',
    year: 1987,
    displayCategoryId: 'ibm-pc',
    constraintSummary: '256 from 262,144 (RGB666)',
  },
  'vga-mode12h': {
    presetId: 'vga-mode12h',
    descriptionKey: 'vga-mode12h',
    displayName: 'VGA Mode 12h',
    shortName: 'VGA 12h',
    year: 1987,
    displayCategoryId: 'ibm-pc',
    constraintSummary: '16 from 262,144 at 640\u00d7480',
  },

  // ── Arcade ──
  cps1: {
    presetId: 'cps1',
    descriptionKey: 'cps1',
    displayName: 'Capcom CPS-1',
    shortName: 'CPS-1',
    year: 1988,
    displayCategoryId: 'arcade',
    constraintSummary: '192 palettes \u00d7 16 colors',
  },
  cps2: {
    presetId: 'cps2',
    descriptionKey: 'cps2',
    displayName: 'Capcom CPS-2',
    shortName: 'CPS-2',
    year: 1993,
    displayCategoryId: 'arcade',
    constraintSummary: 'CPS-1 enhanced, more sprites',
  },
  cps3: {
    presetId: 'cps3',
    descriptionKey: 'cps3',
    displayName: 'Capcom CPS-3',
    shortName: 'CPS-3',
    year: 1996,
    displayCategoryId: 'arcade',
    constraintSummary: '64\u2013256 colors per tile',
  },
  'sega-system16': {
    presetId: 'sega-system16',
    descriptionKey: 'sega-system16',
    displayName: 'Sega System 16',
    shortName: 'System 16',
    year: 1985,
    displayCategoryId: 'arcade',
    constraintSummary: '12-bit RGB, 4096 simultaneous',
  },
  'namco-galaxian': {
    presetId: 'namco-galaxian',
    descriptionKey: 'namco-galaxian',
    displayName: 'Namco Galaxian',
    shortName: 'Galaxian',
    year: 1979,
    displayCategoryId: 'arcade',
    constraintSummary: 'PROM-fixed palette',
  },

  // ── Fantasy ──
  pico8: {
    presetId: 'pico8',
    descriptionKey: 'pico8',
    displayName: 'PICO-8',
    shortName: 'PICO-8',
    year: 2015,
    displayCategoryId: 'fantasy',
    constraintSummary: '16 fixed colors, 128\u00d7128',
  },
  tic80: {
    presetId: 'tic80',
    descriptionKey: 'tic80',
    displayName: 'TIC-80',
    shortName: 'TIC-80',
    year: 2017,
    displayCategoryId: 'fantasy',
    constraintSummary: '16 customizable colors, 240\u00d7136',
  },
  picotron: {
    presetId: 'picotron',
    descriptionKey: 'picotron',
    displayName: 'Picotron',
    shortName: 'Picotron',
    year: 2024,
    displayCategoryId: 'fantasy',
    constraintSummary: '64 colors, 480\u00d7270',
  },
};

// ── Build enriched data ──

const allPresets = listPresets();

const enrichedMap = new Map<string, EnrichedSystem>();

for (const preset of allPresets) {
  const ui = PRESET_UI_MAP[preset.id];
  if (!ui) continue;
  const description = SYSTEM_DESCRIPTIONS[ui.descriptionKey];
  if (!description) continue;
  enrichedMap.set(preset.id, { preset, ui, description });
}

/** Get all enriched systems for a display category, sorted by year */
export function getSystemsByCategory(categoryId: string): EnrichedSystem[] {
  const results: EnrichedSystem[] = [];
  for (const system of enrichedMap.values()) {
    if (system.ui.displayCategoryId === categoryId) {
      results.push(system);
    }
  }
  return results.sort((a, b) => a.ui.year - b.ui.year);
}

/** Get enriched system by preset ID */
export function getEnrichedSystem(
  presetId: string,
): EnrichedSystem | undefined {
  return enrichedMap.get(presetId);
}

/** Get description for a preset ID */
export function getSystemDescription(
  presetId: string,
): SystemDescription | undefined {
  const ui = PRESET_UI_MAP[presetId];
  if (!ui) return undefined;
  return SYSTEM_DESCRIPTIONS[ui.descriptionKey];
}

/** Search systems by name */
export function searchSystems(query: string): EnrichedSystem[] {
  const q = query.toLowerCase();
  const results: EnrichedSystem[] = [];
  for (const system of enrichedMap.values()) {
    if (
      system.ui.displayName.toLowerCase().includes(q) ||
      system.ui.shortName.toLowerCase().includes(q) ||
      system.preset.name.toLowerCase().includes(q) ||
      system.preset.system.toLowerCase().includes(q)
    ) {
      results.push(system);
    }
  }
  return results.sort((a, b) => a.ui.year - b.ui.year);
}

/** Get all categories with their system counts */
export function getCategoriesWithCounts() {
  return CATEGORIES.map((cat) => ({
    ...cat,
    count: getSystemsByCategory(cat.id).length,
  }));
}

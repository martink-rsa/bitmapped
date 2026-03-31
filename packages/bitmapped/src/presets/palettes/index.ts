// NES
export {
  NES_2C02_NESTOPIA,
  NES_FCEUX,
  NES_FIREBRANDX,
  NES_EMPHASIS_FACTORS,
} from './nes-palettes.js';

// C64
export { C64_PEPTO, C64_COLODORE, C64_VICE } from './c64-palettes.js';

// ZX Spectrum
export { ZX_SPECTRUM_D8, ZX_SPECTRUM_D7 } from './zx-spectrum-palettes.js';

// TMS9918A (ColecoVision, MSX, SG-1000)
export { TMS9918A_PALETTE } from './tms9918a-palette.js';

// CGA
export {
  CGA_RGBI,
  CGA_PALETTE_0_LOW,
  CGA_PALETTE_0_HIGH,
  CGA_PALETTE_1_LOW,
  CGA_PALETTE_1_HIGH,
} from './cga-palettes.js';

// EGA
export { generateEGAPalette, EGA_DEFAULT_REGISTERS } from './ega-palette.js';

// Amstrad CPC
export { CPC_PALETTE, CPC_FIRMWARE_TO_HW } from './cpc-palette.js';

// PICO-8
export { PICO8_STANDARD, PICO8_EXTENDED } from './pico8-palette.js';

// Atari 2600
export { ATARI_2600_NTSC } from './atari2600-palette.js';

// Miscellaneous
export {
  BBC_MICRO_PALETTE,
  VIRTUAL_BOY,
  TIC80_SWEETIE16,
  THOMSON_MO5,
  APPLE2_HIRES_GROUP1,
  APPLE2_HIRES_GROUP2,
  APPLE2_LORES,
  GAMEBOY_DMG_GREEN,
  GAMEBOY_POCKET_GRAY,
  GAMEBOY_LIGHT_GREEN,
} from './misc-palettes.js';

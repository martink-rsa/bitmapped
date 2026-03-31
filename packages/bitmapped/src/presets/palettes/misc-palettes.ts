/** BBC Micro 8-color palette (1-bit per channel RGB) */
export const BBC_MICRO_PALETTE: readonly string[] = [
  '#000000',
  '#FF0000',
  '#00FF00',
  '#FFFF00',
  '#0000FF',
  '#FF00FF',
  '#00FFFF',
  '#FFFFFF',
];

/** Virtual Boy 4-shade red palette */
export const VIRTUAL_BOY: readonly string[] = [
  '#000000',
  '#550000',
  '#A40000',
  '#EF0000',
];

/** TIC-80 default palette (Sweetie 16) */
export const TIC80_SWEETIE16: readonly string[] = [
  '#1A1C2C',
  '#5D275D',
  '#B13E53',
  '#EF7D57',
  '#FFCD75',
  '#A7F070',
  '#38B764',
  '#257179',
  '#29366F',
  '#3B5DC9',
  '#41A6F6',
  '#73EFF7',
  '#F4F4F4',
  '#94B0C2',
  '#566C86',
  '#333C57',
];

/**
 * Thomson MO5 uses 4-bit PBGR encoding.
 * P = "Pastel" bit (desaturates, does NOT dim).
 * Special cases: pastel black = gray, pastel white = orange.
 */
export const THOMSON_MO5: readonly string[] = [
  '#000000',
  '#FF0000',
  '#00FF00',
  '#FFFF00', // Basic: Blk, Red, Grn, Yel
  '#0000FF',
  '#FF00FF',
  '#00FFFF',
  '#FFFFFF', // Basic: Blu, Mag, Cyn, Wht
  '#BBBBBB',
  '#DD7777',
  '#77DD77',
  '#DDDD77', // Pastel: Gray, P.Red, P.Grn, P.Yel
  '#7777DD',
  '#DD77DD',
  '#77DDDD',
  '#DD8800', // Pastel: P.Blu, P.Mag, P.Cyn, Orange
];

/** Apple II Hi-Res artifact colors (NTSC composite at 2× subcarrier) */
export const APPLE2_HIRES_GROUP1: readonly string[] = [
  '#000000',
  '#FF44FD',
  '#14F53C',
  '#FFFFFF',
];
export const APPLE2_HIRES_GROUP2: readonly string[] = [
  '#000000',
  '#14CFFD',
  '#FF6A3C',
  '#FFFFFF',
];

/** Apple II Lo-Res 16-color palette */
export const APPLE2_LORES: readonly string[] = [
  '#000000',
  '#722640',
  '#40337F',
  '#E434FE',
  '#0C5940',
  '#808080',
  '#1B9AFE',
  '#BFB3FF',
  '#404C00',
  '#E46501',
  '#808080',
  '#F1A6BF',
  '#1BCB01',
  '#BFCC80',
  '#8DD9BF',
  '#FFFFFF',
];

/** Game Boy DMG green-tinted LCD */
export const GAMEBOY_DMG_GREEN: readonly string[] = [
  '#9BBC0F',
  '#8BAC0F',
  '#306230',
  '#0F380F',
];

/** Game Boy Pocket gray LCD */
export const GAMEBOY_POCKET_GRAY: readonly string[] = [
  '#FFFFFF',
  '#A9A9A9',
  '#545454',
  '#000000',
];

/** Game Boy Light green-backlit LCD */
export const GAMEBOY_LIGHT_GREEN: readonly string[] = [
  '#00B800',
  '#009800',
  '#186818',
  '#004000',
];

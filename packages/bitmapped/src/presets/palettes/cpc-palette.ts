/**
 * Amstrad CPC: 3 levels per channel (NOT 3-bit).
 * Gate Array hardware pen values 0-26.
 *
 * Level mapping: Off=0x00, Half=0x80, Full=0xFF
 * (some sources use 0x7F for Half — 0x80 is hardware-measured)
 */
export const CPC_PALETTE: readonly string[] = [
  '#000000',
  '#000080',
  '#0000FF',
  '#800000',
  '#800080',
  '#8000FF',
  '#FF0000',
  '#FF0080',
  '#FF00FF',
  '#008000',
  '#008080',
  '#0080FF',
  '#808000',
  '#808080',
  '#8080FF',
  '#FF8000',
  '#FF8080',
  '#FF80FF',
  '#00FF00',
  '#00FF80',
  '#00FFFF',
  '#80FF00',
  '#80FF80',
  '#80FFFF',
  '#FFFF00',
  '#FFFF80',
  '#FFFFFF',
];

/** Hardware pen number to palette index mapping (Gate Array firmware numbers differ from logical order) */
export const CPC_FIRMWARE_TO_HW: Record<number, number> = {
  0: 20,
  1: 4,
  2: 21,
  3: 28,
  4: 24,
  5: 29,
  6: 12,
  7: 5,
  8: 13,
  9: 22,
  10: 6,
  11: 23,
  12: 30,
  13: 0,
  14: 31,
  15: 14,
  16: 7,
  17: 15,
  18: 18,
  19: 2,
  20: 19,
  21: 26,
  22: 25,
  23: 27,
  24: 10,
  25: 3,
  26: 11,
};

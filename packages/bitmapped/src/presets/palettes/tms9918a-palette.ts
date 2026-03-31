/**
 * TMS9918A palette (used by ColecoVision, MSX1, SG-1000, TI-99/4A).
 * sRGB approximations of YPbPr composite output with γ=1.6.
 * Index 0 = transparent (render as background color in practice).
 */
export const TMS9918A_PALETTE: readonly string[] = [
  '#000000', // 0: Transparent (use as black)
  '#000000', // 1: Black
  '#21C842', // 2: Medium Green
  '#5EDC78', // 3: Light Green
  '#5455ED', // 4: Dark Blue
  '#7D76FC', // 5: Light Blue
  '#D4524D', // 6: Dark Red
  '#42EBF5', // 7: Cyan
  '#FC5554', // 8: Medium Red
  '#FF7978', // 9: Light Red
  '#D4C154', // 10: Dark Yellow
  '#E6CE80', // 11: Light Yellow
  '#21B03B', // 12: Dark Green
  '#C95BBA', // 13: Magenta
  '#CCCCCC', // 14: Gray
  '#FFFFFF', // 15: White
];

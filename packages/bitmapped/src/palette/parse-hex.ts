import type { Palette } from '../core/types.js';

/**
 * Parses a text string containing hex colors into a Palette.
 *
 * Matches `#RGB`, `#RRGGBB`, and bare `RRGGBB` patterns.
 * Three-character hex values are expanded to six characters.
 *
 * @param text - The text containing hex color values
 * @returns The parsed Palette
 */
export function parseHex(text: string): Palette {
  const pattern = /#([0-9A-Fa-f]{3})\b|#?([0-9A-Fa-f]{6})\b/g;
  const palette: Palette = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    let hex: string;

    if (match[2]) {
      // 6-char match
      hex = match[2];
    } else if (match[1]) {
      // 3-char match — expand
      const c = match[1];
      hex = c[0]! + c[0]! + c[1]! + c[1]! + c[2]! + c[2]!;
    } else {
      continue;
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    palette.push({ color: { r, g, b } });
  }

  return palette;
}

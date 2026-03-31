import type { Palette } from '../core/types.js';

/**
 * Parses a GIMP Palette (.gpl) format string into a Palette.
 *
 * Lines starting with `#` or non-numeric characters are treated as
 * comments or headers. Data lines have format: `R G B\tOptional Name`.
 *
 * @param text - The GPL file content as a string
 * @returns The parsed Palette
 */
export function parseGPL(text: string): Palette {
  const palette: Palette = [];
  const lines = text.split(/\r?\n/);
  const dataLinePattern = /^\s*(\d+)\s+(\d+)\s+(\d+)\s*(.*)?$/;

  for (const line of lines) {
    const match = dataLinePattern.exec(line);
    if (!match) continue;

    const r = Math.max(0, Math.min(255, parseInt(match[1]!, 10)));
    const g = Math.max(0, Math.min(255, parseInt(match[2]!, 10)));
    const b = Math.max(0, Math.min(255, parseInt(match[3]!, 10)));
    const name = match[4]?.trim() || undefined;

    palette.push({
      color: { r, g, b },
      ...(name ? { name } : {}),
    });
  }

  return palette;
}

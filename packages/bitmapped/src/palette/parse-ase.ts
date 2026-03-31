import type { Palette } from '../core/types.js';

/**
 * Parses an Adobe Swatch Exchange (.ase) binary file into a Palette.
 *
 * The ASE format is big-endian throughout. Only RGB color entries are extracted;
 * CMYK, LAB, and Gray entries are skipped.
 *
 * @param buffer - The raw binary content of the .ase file
 * @returns The parsed Palette containing only RGB colors
 */
export function parseASE(buffer: ArrayBuffer): Palette {
  if (buffer.byteLength < 12) {
    throw new Error(
      `Invalid ASE file: buffer too small (need at least 12 bytes, got ${buffer.byteLength})`,
    );
  }

  const view = new DataView(buffer);
  const palette: Palette = [];

  // Verify signature "ASEF"
  const sig = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3),
  );

  if (sig !== 'ASEF') {
    throw new Error(
      `Invalid ASE file: expected signature "ASEF", got "${sig}"`,
    );
  }

  // Skip version (2 + 2 bytes)
  const blockCount = view.getUint32(8, false);
  let offset = 12;

  for (let i = 0; i < blockCount; i++) {
    if (offset + 6 > buffer.byteLength) break;

    const blockType = view.getUint16(offset, false);
    const blockLength = view.getUint32(offset + 2, false);
    const blockEnd = offset + 6 + blockLength;

    if (blockType === 0x0001 && blockEnd <= buffer.byteLength) {
      // Color entry
      let pos = offset + 6;

      // Name length (in UTF-16 code units, including null terminator)
      if (pos + 2 > buffer.byteLength) break;
      const nameLength = view.getUint16(pos, false);
      pos += 2;

      // Read UTF-16BE name
      if (pos + nameLength * 2 > buffer.byteLength) break;
      let name = '';
      for (let c = 0; c < nameLength - 1; c++) {
        name += String.fromCharCode(view.getUint16(pos + c * 2, false));
      }
      pos += nameLength * 2;

      // Color model (4-byte ASCII)
      if (pos + 4 > buffer.byteLength) break;
      const model = String.fromCharCode(
        view.getUint8(pos),
        view.getUint8(pos + 1),
        view.getUint8(pos + 2),
        view.getUint8(pos + 3),
      );
      pos += 4;

      if (model === 'RGB ') {
        if (pos + 12 > buffer.byteLength) break;
        const r = Math.round(view.getFloat32(pos, false) * 255);
        const g = Math.round(view.getFloat32(pos + 4, false) * 255);
        const b = Math.round(view.getFloat32(pos + 8, false) * 255);

        palette.push({
          color: {
            r: Math.max(0, Math.min(255, r)),
            g: Math.max(0, Math.min(255, g)),
            b: Math.max(0, Math.min(255, b)),
          },
          ...(name.trim() ? { name: name.trim() } : {}),
        });
      }
      // Skip non-RGB color models (CMYK, LAB, Gray)
    }
    // Skip group start (0xC001) and group end (0xC002) blocks

    offset = blockEnd;
  }

  return palette;
}

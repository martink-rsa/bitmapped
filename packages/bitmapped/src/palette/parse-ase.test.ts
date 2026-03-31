import { describe, it, expect } from 'vitest';
import { parseASE } from './parse-ase.js';

/**
 * Helper to create a minimal valid ASE binary buffer.
 * ASE format: "ASEF" signature, version (2+2 bytes), block count (4 bytes),
 * then color entry blocks.
 */
function createASEBuffer(
  entries: {
    name: string;
    model: string;
    values: number[];
  }[],
): ArrayBuffer {
  // Calculate total size
  let totalSize = 12; // header: 4 (sig) + 2 (major) + 2 (minor) + 4 (count)

  const blockBuffers: ArrayBuffer[] = [];

  for (const entry of entries) {
    const nameLength = entry.name.length + 1; // +1 for null terminator
    const nameBytes = nameLength * 2; // UTF-16
    const valuesBytes = entry.values.length * 4; // float32 each
    // Block: type(2) + length(4) + nameLength(2) + name(nameBytes) + model(4) + values + colorType(2)
    const blockLength = 2 + nameBytes + 4 + valuesBytes + 2;
    const blockTotalSize = 6 + blockLength; // 6 = type(2) + blockLength(4)

    const blockBuf = new ArrayBuffer(blockTotalSize);
    const blockView = new DataView(blockBuf);

    let pos = 0;
    // Block type: 0x0001 = color entry
    blockView.setUint16(pos, 0x0001, false);
    pos += 2;
    // Block length
    blockView.setUint32(pos, blockLength, false);
    pos += 4;
    // Name length (in UTF-16 code units, including null)
    blockView.setUint16(pos, nameLength, false);
    pos += 2;
    // Name (UTF-16BE)
    for (let i = 0; i < entry.name.length; i++) {
      blockView.setUint16(pos, entry.name.charCodeAt(i), false);
      pos += 2;
    }
    // Null terminator
    blockView.setUint16(pos, 0, false);
    pos += 2;
    // Color model (4 ASCII chars)
    for (let i = 0; i < 4; i++) {
      blockView.setUint8(pos, entry.model.charCodeAt(i));
      pos++;
    }
    // Color values (float32)
    for (const val of entry.values) {
      blockView.setFloat32(pos, val, false);
      pos += 4;
    }
    // Color type (0 = Global)
    blockView.setUint16(pos, 0, false);

    blockBuffers.push(blockBuf);
    totalSize += blockTotalSize;
  }

  // Assemble the full buffer
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // Signature "ASEF"
  view.setUint8(0, 0x41); // A
  view.setUint8(1, 0x53); // S
  view.setUint8(2, 0x45); // E
  view.setUint8(3, 0x46); // F
  // Version 1.0
  view.setUint16(4, 1, false);
  view.setUint16(6, 0, false);
  // Block count
  view.setUint32(8, entries.length, false);

  // Copy block data
  let offset = 12;
  for (const blockBuf of blockBuffers) {
    bytes.set(new Uint8Array(blockBuf), offset);
    offset += blockBuf.byteLength;
  }

  return buffer;
}

describe('parseASE', () => {
  it('throws on invalid signature', () => {
    const buffer = new ArrayBuffer(12);
    const view = new DataView(buffer);
    view.setUint8(0, 0x42); // B instead of A
    view.setUint8(1, 0x53);
    view.setUint8(2, 0x45);
    view.setUint8(3, 0x46);
    view.setUint32(8, 0, false);

    expect(() => parseASE(buffer)).toThrow('Invalid ASE file');
  });

  it('parses an empty ASE file (no blocks)', () => {
    const buffer = createASEBuffer([]);
    const palette = parseASE(buffer);
    expect(palette).toEqual([]);
  });

  it('parses a single RGB color entry', () => {
    const buffer = createASEBuffer([
      { name: 'Red', model: 'RGB ', values: [1.0, 0.0, 0.0] },
    ]);

    const palette = parseASE(buffer);
    expect(palette).toHaveLength(1);
    expect(palette[0]!.color).toEqual({ r: 255, g: 0, b: 0 });
    expect(palette[0]!.name).toBe('Red');
  });

  it('parses multiple RGB color entries', () => {
    const buffer = createASEBuffer([
      { name: 'Red', model: 'RGB ', values: [1.0, 0.0, 0.0] },
      { name: 'Green', model: 'RGB ', values: [0.0, 1.0, 0.0] },
      { name: 'Blue', model: 'RGB ', values: [0.0, 0.0, 1.0] },
    ]);

    const palette = parseASE(buffer);
    expect(palette).toHaveLength(3);
    expect(palette[0]!.color).toEqual({ r: 255, g: 0, b: 0 });
    expect(palette[1]!.color).toEqual({ r: 0, g: 255, b: 0 });
    expect(palette[2]!.color).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('skips non-RGB color models (CMYK)', () => {
    const buffer = createASEBuffer([
      { name: 'Red', model: 'RGB ', values: [1.0, 0.0, 0.0] },
      { name: 'Cyan', model: 'CMYK', values: [1.0, 0.0, 0.0, 0.0] },
    ]);

    const palette = parseASE(buffer);
    expect(palette).toHaveLength(1);
    expect(palette[0]!.name).toBe('Red');
  });

  it('handles fractional RGB values', () => {
    const buffer = createASEBuffer([
      { name: 'Mid Gray', model: 'RGB ', values: [0.5, 0.5, 0.5] },
    ]);

    const palette = parseASE(buffer);
    expect(palette).toHaveLength(1);
    expect(palette[0]!.color).toEqual({ r: 128, g: 128, b: 128 });
  });

  it('clamps out-of-range values to 0-255', () => {
    const buffer = createASEBuffer([
      { name: 'Clamped', model: 'RGB ', values: [1.5, -0.5, 0.5] },
    ]);

    const palette = parseASE(buffer);
    expect(palette).toHaveLength(1);
    expect(palette[0]!.color.r).toBe(255);
    expect(palette[0]!.color.g).toBe(0);
    expect(palette[0]!.color.b).toBe(128);
  });

  it('omits name when entry name is empty', () => {
    const buffer = createASEBuffer([
      { name: '', model: 'RGB ', values: [1.0, 0.0, 0.0] },
    ]);

    const palette = parseASE(buffer);
    expect(palette).toHaveLength(1);
    expect(palette[0]!.name).toBeUndefined();
  });

  it('throws on empty buffer', () => {
    const buffer = new ArrayBuffer(0);
    expect(() => parseASE(buffer)).toThrow('buffer too small');
  });

  it('throws on buffer smaller than header (< 12 bytes)', () => {
    const buffer = new ArrayBuffer(4);
    expect(() => parseASE(buffer)).toThrow('buffer too small');
  });

  it('handles truncated block data gracefully', () => {
    // Create a valid header claiming 1 block, but truncate the buffer
    const buffer = new ArrayBuffer(14); // header (12) + partial block type (2)
    const view = new DataView(buffer);
    view.setUint8(0, 0x41); // A
    view.setUint8(1, 0x53); // S
    view.setUint8(2, 0x45); // E
    view.setUint8(3, 0x46); // F
    view.setUint16(4, 1, false);
    view.setUint16(6, 0, false);
    view.setUint32(8, 1, false); // 1 block
    // Only 2 bytes left — not enough for a full block header (6 bytes)
    expect(() => parseASE(buffer)).not.toThrow();
  });
});

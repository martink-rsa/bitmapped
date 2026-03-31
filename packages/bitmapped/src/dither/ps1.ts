/**
 * PS1 GPU dither matrix (asymmetric 4×4).
 * Applied per-channel BEFORE truncating 8-bit → 5-bit.
 * Values are added to the 8-bit channel value, then clamped 0-255.
 */
export const PS1_DITHER_MATRIX = [
  [-4, 0, -3, 1],
  [2, -2, 3, -1],
  [-3, 1, -4, 0],
  [3, -1, 2, -2],
] as const;

/**
 * Apply PS1-style ordered dithering to an image.
 * Adds the asymmetric 4x4 matrix values per-channel, then quantizes to 5-bit.
 */
export function applyPS1Dither(imageData: ImageData): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const w = imageData.width;
  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const d = PS1_DITHER_MATRIX[y & 3]![x & 3]!;
      // Add dither bias per channel
      const r = Math.max(0, Math.min(255, data[i]! + d));
      const g = Math.max(0, Math.min(255, data[i + 1]! + d));
      const b = Math.max(0, Math.min(255, data[i + 2]! + d));
      // Quantize to 5-bit and expand back to 8-bit
      data[i] = ((r >> 3) << 3) | ((r >> 3) >> 2);
      data[i + 1] = ((g >> 3) << 3) | ((g >> 3) >> 2);
      data[i + 2] = ((b >> 3) << 3) | ((b >> 3) >> 2);
    }
  }
  return new ImageData(data, w, imageData.height);
}

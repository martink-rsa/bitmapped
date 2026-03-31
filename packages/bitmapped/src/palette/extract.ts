import type { RGB, Palette } from '../core/types.js';

interface ColorBucket {
  colors: RGB[];
}

/**
 * Finds which RGB channel has the largest range in a set of colors.
 */
function findLongestChannel(colors: RGB[]): 'r' | 'g' | 'b' {
  let rMin = 255,
    rMax = 0;
  let gMin = 255,
    gMax = 0;
  let bMin = 255,
    bMax = 0;

  for (const c of colors) {
    if (c.r < rMin) rMin = c.r;
    if (c.r > rMax) rMax = c.r;
    if (c.g < gMin) gMin = c.g;
    if (c.g > gMax) gMax = c.g;
    if (c.b < bMin) bMin = c.b;
    if (c.b > bMax) bMax = c.b;
  }

  const rRange = rMax - rMin;
  const gRange = gMax - gMin;
  const bRange = bMax - bMin;

  if (rRange >= gRange && rRange >= bRange) return 'r';
  if (gRange >= bRange) return 'g';
  return 'b';
}

/**
 * Computes the average color of a set of RGB values.
 */
function averageColor(colors: RGB[]): RGB {
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;

  for (const c of colors) {
    rSum += c.r;
    gSum += c.g;
    bSum += c.b;
  }

  const count = colors.length;
  return {
    r: Math.round(rSum / count),
    g: Math.round(gSum / count),
    b: Math.round(bSum / count),
  };
}

/**
 * Extracts a palette from an image using a median-cut algorithm.
 *
 * Quantizes the color space by repeatedly splitting the color range with the
 * largest extent along its longest axis. Returns the average color of each
 * final bucket.
 *
 * @param imageData - The source ImageData to extract colors from
 * @param maxColors - Maximum number of colors to extract (default: 16)
 * @returns The extracted Palette
 */
export function extractPalette(
  imageData: ImageData,
  maxColors: number = 16,
): Palette {
  const { data, width, height } = imageData;
  const pixelCount = width * height;

  // Sample pixels — for large images, sample every Nth pixel
  const sampleRate = pixelCount > 10000 ? Math.ceil(pixelCount / 10000) : 1;
  const colors: RGB[] = [];

  for (let i = 0; i < pixelCount; i += sampleRate) {
    const offset = i * 4;
    colors.push({
      r: data[offset]!,
      g: data[offset + 1]!,
      b: data[offset + 2]!,
    });
  }

  // Start with a single bucket containing all sampled pixels
  const buckets: ColorBucket[] = [{ colors }];

  // Split until we reach maxColors buckets
  while (buckets.length < maxColors) {
    // Find the bucket with the largest color range
    let bestBucketIndex = 0;
    let bestRange = 0;

    let bestChannel: 'r' | 'g' | 'b' = 'r';

    for (let i = 0; i < buckets.length; i++) {
      const bucket = buckets[i]!;
      if (bucket.colors.length < 2) continue;

      const channel = findLongestChannel(bucket.colors);
      let min = 255;
      let max = 0;
      for (const c of bucket.colors) {
        if (c[channel] < min) min = c[channel];
        if (c[channel] > max) max = c[channel];
      }
      const range = max - min;
      if (range > bestRange) {
        bestRange = range;
        bestBucketIndex = i;
        bestChannel = channel;
      }
    }

    // If no bucket can be split further, stop
    if (bestRange === 0) break;

    const bucket = buckets[bestBucketIndex]!;
    const channel = bestChannel;

    // Sort by the longest channel and split at the median
    bucket.colors.sort((a, b) => a[channel] - b[channel]);
    const mid = Math.floor(bucket.colors.length / 2);

    const left: ColorBucket = { colors: bucket.colors.slice(0, mid) };
    const right: ColorBucket = { colors: bucket.colors.slice(mid) };

    buckets.splice(bestBucketIndex, 1, left, right);
  }

  // Average each bucket to get the representative color
  return buckets
    .filter((b) => b.colors.length > 0)
    .map((b) => ({
      color: averageColor(b.colors),
    }));
}

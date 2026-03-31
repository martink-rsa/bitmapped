import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { process as processImage } from '../core/pipeline.js';
import { listPresets } from './registry.js';
import { enumerateColorSpace } from './quantize.js';
import type { HardwarePreset, Palette } from '../core/types.js';

const FIXTURES_DIR = path.join(__dirname, '..', '__fixtures__');
const SOURCES_DIR = path.join(FIXTURES_DIR, 'sources');
const SNAPSHOTS_DIR = path.join(FIXTURES_DIR, 'snapshots');
const DIFFS_DIR = path.join(SNAPSHOTS_DIR, '__diffs__');

const UPDATE_SNAPSHOTS = process.env.UPDATE_SNAPSHOTS === 'true';

const SOURCE_IMAGES = [
  { name: 'color-test-chart', file: 'color-test-chart.png' },
  { name: 'sample-image', file: 'sample-image.png' },
];

function loadPNG(filePath: string): ImageData {
  const buffer = fs.readFileSync(filePath);
  const png = PNG.sync.read(buffer);
  return new ImageData(new Uint8ClampedArray(png.data), png.width, png.height);
}

function encodePNG(imageData: ImageData): Buffer {
  const png = new PNG({
    width: imageData.width,
    height: imageData.height,
  });
  png.data = Buffer.from(imageData.data);
  return PNG.sync.write(png);
}

function getPalette(preset: HardwarePreset): Palette {
  if (preset.palette && preset.palette.length > 0) {
    return preset.palette;
  }
  if (preset.colorSpace) {
    return enumerateColorSpace(preset.colorSpace).map((color) => ({
      color,
    }));
  }
  return [];
}

// Pre-load source images once for all tests
const sourceImageData = new Map<string, ImageData>();
for (const source of SOURCE_IMAGES) {
  sourceImageData.set(
    source.name,
    loadPNG(path.join(SOURCES_DIR, source.file)),
  );
}

const presets = listPresets();

describe('Preset Snapshots', () => {
  for (const preset of presets) {
    describe(`${preset.name} (${preset.id})`, () => {
      for (const source of SOURCE_IMAGES) {
        it(`matches snapshot for ${source.name}`, () => {
          const sourceImage = sourceImageData.get(source.name)!;

          const palette = getPalette(preset);

          const result = processImage(sourceImage, {
            blockSize: 2,
            palette,
            dithering: 'floyd-steinberg',
            distanceAlgorithm: 'redmean',
            constraintType: preset.constraintType,
            hamConfig: preset.hamConfig,
            attributeBlockConfig: preset.attributeBlock,
            tilePaletteConfig:
              preset.paletteLayout && preset.tileSize
                ? {
                    tileWidth: preset.tileSize.width,
                    tileHeight: preset.tileSize.height,
                    subpaletteCount: preset.paletteLayout.subpaletteCount,
                    colorsPerSubpalette:
                      preset.paletteLayout.colorsPerSubpalette,
                    sharedTransparent: preset.paletteLayout.sharedTransparent,
                  }
                : undefined,
            perRowInTileConfig:
              preset.tileSize && preset.constraintType === 'per-row-in-tile'
                ? {
                    tileWidth: preset.tileSize.width,
                    tileHeight: preset.tileSize.height,
                  }
                : undefined,
            scanlineConfig: preset.scanlineLimits?.maxColors
              ? {
                  maxColorsPerLine: preset.scanlineLimits.maxColors,
                }
              : undefined,
            artifactConfig: preset.artifactConfig,
          });

          const refDir = path.join(SNAPSHOTS_DIR, preset.id);
          const refPath = path.join(refDir, `${source.name}.png`);

          // First-run or update mode: write the snapshot
          if (UPDATE_SNAPSHOTS || !fs.existsSync(refPath)) {
            fs.mkdirSync(refDir, { recursive: true });
            fs.writeFileSync(refPath, encodePNG(result.imageData));
            if (!UPDATE_SNAPSHOTS) {
              console.warn(
                `No reference found for ${preset.id}/${source.name} — writing initial snapshot`,
              );
            }
            return;
          }

          // Compare against stored reference
          const reference = loadPNG(refPath);
          const { width, height } = result.imageData;

          expect(reference.width).toBe(width);
          expect(reference.height).toBe(height);

          const diff = new PNG({ width, height });
          const numDiff = pixelmatch(
            new Uint8Array(result.imageData.data.buffer),
            new Uint8Array(reference.data.buffer),
            diff.data,
            width,
            height,
            { threshold: 0 },
          );

          if (numDiff > 0) {
            fs.mkdirSync(DIFFS_DIR, { recursive: true });
            const diffPath = path.join(
              DIFFS_DIR,
              `${preset.id}-${source.name}.png`,
            );
            fs.writeFileSync(diffPath, PNG.sync.write(diff));
            expect.fail(
              `${numDiff} pixels differ for ${preset.id}/${source.name}. Diff image: ${diffPath}`,
            );
          }
        }, 60_000);
      }
    });
  }
});

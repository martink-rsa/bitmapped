import type {
  ProcessOptions,
  ProcessResult,
  PixelateResult,
  RGB,
  OrderedDitherPattern,
} from './types.js';
import { pixelateResample, renderPixelateResult } from './pixelate.js';
import { createPaletteMatcher } from '../color/match.js';
import { createImageData } from './buffer.js';
import { floydSteinberg } from '../dither/floyd-steinberg.js';
import { atkinsonDither } from '../dither/atkinson.js';
import { orderedDither } from '../dither/ordered-dither.js';
import { matrices } from '../dither/matrices/index.js';
import { fitToResolution } from './resize.js';
import { applyFilters } from '../preprocess/apply-filters.js';
import { hasActiveFilters } from '../preprocess/has-active-filters.js';
import { applyPS1Dither } from '../dither/ps1.js';
import { solveHAM } from '../constraints/ham.js';
import { solveAttributeClash } from '../constraints/attribute-clash.js';
import { solveTilePalette } from '../constraints/tile-palette.js';
import { solvePerRowInTile } from '../constraints/per-row-in-tile.js';
import { solveScanline } from '../constraints/scanline.js';
import { solveApple2Artifact } from '../constraints/apple2-artifact.js';
import { solveCGASubpalette } from '../constraints/cga-subpalette.js';
import { extractPalette } from '../palette/extract.js';

/** Default matrix sizes per pattern */
const DEFAULT_MATRIX_SIZES: Partial<Record<OrderedDitherPattern, number>> = {
  checkerboard: 2,
  'blue-noise': 64,
};

/** Converts a 2D RGB grid into a small ImageData (1 pixel per grid cell). */
function gridToImageData(
  grid: RGB[][],
  width: number,
  height: number,
): ImageData {
  const imageData = createImageData(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = grid[y]![x]!;
      const i = (y * width + x) * 4;
      imageData.data[i] = color.r;
      imageData.data[i + 1] = color.g;
      imageData.data[i + 2] = color.b;
      imageData.data[i + 3] = 255;
    }
  }
  return imageData;
}

/** Reads an ImageData back into a 2D RGB grid. */
function imageDataToGrid(imageData: ImageData): RGB[][] {
  const { width, height } = imageData;
  const grid: RGB[][] = [];
  for (let y = 0; y < height; y++) {
    const row: RGB[] = [];
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      row.push({
        r: imageData.data[i]!,
        g: imageData.data[i + 1]!,
        b: imageData.data[i + 2]!,
      });
    }
    grid.push(row);
  }
  return grid;
}

/**
 * The main processing pipeline: pixelate → match → dither → output.
 *
 * 1. Pixelates the input image using block averaging
 * 2. Matches each block's color to the nearest palette color
 * 3. Optionally applies dithering
 * 4. Produces the final ImageData output
 *
 * @param imageData - The source ImageData to process
 * @param options - Processing options (blockSize, palette, dithering, distanceAlgorithm)
 * @returns The processed result containing the output ImageData and color grid
 */
export function process(
  imageData: ImageData,
  options: ProcessOptions,
): ProcessResult {
  const {
    blockSize,
    palette,
    dithering = 'none',
    distanceAlgorithm = 'redmean',
    ditherStrength,
    ditherMatrixSize,
    ditherMatrix,
    targetResolution,
    resizeFit,
    resizeMethod,
    filters,
    constraintType,
    hamConfig,
    attributeBlockConfig,
    tilePaletteConfig,
    perRowInTileConfig,
    scanlineConfig,
    artifactConfig,
  } = options;

  // Step -1: Optionally apply CSS filters to source image
  let workingImage =
    filters && hasActiveFilters(filters)
      ? applyFilters(imageData, filters)
      : imageData;
  let effectiveResolution: { width: number; height: number } | undefined;
  if (targetResolution) {
    workingImage = fitToResolution(
      workingImage,
      targetResolution,
      resizeFit,
      resizeMethod,
    );
    effectiveResolution = {
      width: workingImage.width,
      height: workingImage.height,
    };
  }

  const { width, height } = workingImage;

  // Step 1: Pixelate using block averaging
  const pixelateResult = pixelateResample(workingImage, blockSize);

  // If palette is empty, skip colour matching and dithering (preserve original colours)
  if (palette.length === 0) {
    const outputImageData = renderPixelateResult(pixelateResult, width, height);
    return {
      imageData: outputImageData,
      grid: pixelateResult.grid,
      width,
      height,
      effectiveResolution,
    };
  }

  // HAM constraint: use the HAM solver instead of standard palette match + dither
  if (constraintType === 'ham' && hamConfig) {
    const gridImg = gridToImageData(
      pixelateResult.grid,
      pixelateResult.width,
      pixelateResult.height,
    );
    // Extract an optimal base palette from the image via median-cut
    const basePalette = extractPalette(gridImg, hamConfig.basePaletteSize);
    const hamResult = solveHAM(
      gridImg,
      basePalette,
      hamConfig,
      distanceAlgorithm,
    );
    const hamGrid = imageDataToGrid(hamResult);
    const hamPixelateResult: PixelateResult = {
      ...pixelateResult,
      grid: hamGrid,
    };
    const outputImageData = renderPixelateResult(
      hamPixelateResult,
      width,
      height,
    );
    return {
      imageData: outputImageData,
      grid: hamGrid,
      width,
      height,
      effectiveResolution,
    };
  }

  // Non-HAM hardware constraints: apply after pixelation, return early.
  // If the required config for a constraint is missing, fall through to
  // the normal palette-match + dither pipeline.
  if (
    constraintType &&
    constraintType !== 'ham' &&
    constraintType !== 'none' &&
    constraintType !== 'monochrome-global'
  ) {
    let constrainedImg: ImageData | null = null;

    const gridImg = gridToImageData(
      pixelateResult.grid,
      pixelateResult.width,
      pixelateResult.height,
    );

    switch (constraintType) {
      case 'attribute-block': {
        if (attributeBlockConfig) {
          constrainedImg = solveAttributeClash(
            gridImg,
            palette,
            attributeBlockConfig,
            distanceAlgorithm,
          );
        }
        break;
      }
      case 'per-tile-palette': {
        if (tilePaletteConfig) {
          constrainedImg = solveTilePalette(
            gridImg,
            palette,
            tilePaletteConfig,
            distanceAlgorithm,
          );
        }
        break;
      }
      case 'per-row-in-tile': {
        if (perRowInTileConfig) {
          constrainedImg = solvePerRowInTile(
            gridImg,
            palette,
            perRowInTileConfig.tileWidth,
            perRowInTileConfig.tileHeight,
            distanceAlgorithm,
          );
        }
        break;
      }
      case 'per-scanline': {
        if (scanlineConfig) {
          constrainedImg = solveScanline(
            gridImg,
            palette,
            scanlineConfig.maxColorsPerLine,
            distanceAlgorithm,
          );
        }
        break;
      }
      case 'artifact-color': {
        if (artifactConfig) {
          constrainedImg = solveApple2Artifact(
            gridImg,
            artifactConfig.paletteSets,
            artifactConfig.pixelsPerGroup,
            distanceAlgorithm,
          );
        }
        break;
      }
      case 'sub-palette-lock': {
        constrainedImg = solveCGASubpalette(
          gridImg,
          palette,
          distanceAlgorithm,
        );
        break;
      }
    }

    if (constrainedImg) {
      const constrainedGrid = imageDataToGrid(constrainedImg);
      const constrainedResult: PixelateResult = {
        ...pixelateResult,
        grid: constrainedGrid,
      };
      const outputImageData = renderPixelateResult(
        constrainedResult,
        width,
        height,
      );
      return {
        imageData: outputImageData,
        grid: constrainedGrid,
        width,
        height,
        effectiveResolution,
      };
    }
  }

  // Step 2: Create palette matcher
  const matcher = createPaletteMatcher(palette, distanceAlgorithm);
  const matchColor = (color: RGB): RGB => matcher(color).color;

  // Step 3: Match each block color to palette and render to full-size ImageData
  const matchedGrid = pixelateResult.grid.map((row) =>
    row.map((color) => matchColor(color)),
  );

  const matchedResult = {
    ...pixelateResult,
    grid: matchedGrid,
  };

  // Render the matched grid to an ImageData at original dimensions
  const renderedImageData = renderPixelateResult(matchedResult, width, height);

  // Step 4: Optionally apply dithering at the grid level
  let outputImageData: ImageData;
  let outputGrid = matchedGrid;

  if (dithering === 'none') {
    outputImageData = renderedImageData;
  } else {
    // Convert the block grid to a small ImageData (1 pixel per block)
    // so dithering operates across blocks, not within them
    const gridImageData = gridToImageData(
      pixelateResult.grid,
      pixelateResult.width,
      pixelateResult.height,
    );

    let ditheredImageData: ImageData;

    switch (dithering) {
      case 'floyd-steinberg':
        ditheredImageData = floydSteinberg(gridImageData, matchColor);
        break;
      case 'atkinson':
        ditheredImageData = atkinsonDither(gridImageData, matchColor);
        break;
      case 'custom':
        if (!ditherMatrix) {
          throw new Error(
            "ditherMatrix is required when dithering is 'custom'",
          );
        }
        ditheredImageData = orderedDither(
          gridImageData,
          palette,
          ditherMatrix,
          { distanceAlgorithm, strength: ditherStrength },
        );
        break;
      case 'bayer':
      case 'clustered-dot':
      case 'horizontal-line':
      case 'vertical-line':
      case 'diagonal-line':
      case 'checkerboard':
      case 'blue-noise': {
        const defaultSize = DEFAULT_MATRIX_SIZES[dithering] ?? 8;
        const matrixSize = ditherMatrixSize ?? defaultSize;
        const matrix = matrices[dithering](matrixSize);
        ditheredImageData = orderedDither(gridImageData, palette, matrix, {
          distanceAlgorithm,
          strength: ditherStrength,
        });
        break;
      }
      case 'ps1-ordered': {
        const ps1Dithered = applyPS1Dither(gridImageData);
        const ps1Data = new Uint8ClampedArray(ps1Dithered.data);
        for (let i = 0; i < ps1Data.length; i += 4) {
          const matched = matchColor({
            r: ps1Data[i]!,
            g: ps1Data[i + 1]!,
            b: ps1Data[i + 2]!,
          });
          ps1Data[i] = matched.r;
          ps1Data[i + 1] = matched.g;
          ps1Data[i + 2] = matched.b;
        }
        ditheredImageData = new ImageData(
          ps1Data,
          ps1Dithered.width,
          ps1Dithered.height,
        );
        break;
      }
      default: {
        const _exhaustive: never = dithering;
        throw new Error(`Unknown dithering algorithm: ${_exhaustive}`);
      }
    }

    // Convert dithered result back to grid and expand to full resolution
    const ditheredGrid = imageDataToGrid(ditheredImageData);
    outputGrid = ditheredGrid;
    const ditheredResult: PixelateResult = {
      ...pixelateResult,
      grid: ditheredGrid,
    };
    outputImageData = renderPixelateResult(ditheredResult, width, height);
  }

  return {
    imageData: outputImageData,
    grid: outputGrid,
    width,
    height,
    effectiveResolution,
  };
}

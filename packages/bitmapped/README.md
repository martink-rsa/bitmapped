# bitmapped

Palette-aware image pixelation for pixel artists and game developers.

Takes images, pixelates them via Canvas block averaging, matches colors to user-provided palettes using perceptual color distance algorithms, optionally applies dithering, and exports the result.

[Documentation](https://martink-rsa.github.io/bitmapped/) | [Live Demo](https://bitmapped.pages.dev) | [GitHub](https://github.com/martink-rsa/bitmapped)

## Installation

```bash
npm install bitmapped
```

## Quick Start

```typescript
import { process } from 'bitmapped';
import { parseHex } from 'bitmapped/palette';

// Define a palette
const palette = parseHex(
  '#000000 #1D2B53 #7E2553 #008751 #AB5236 #5F574F #C2C3C7 #FFF1E8',
);

// Process an image
const result = process(imageData, {
  blockSize: 8,
  palette,
  dithering: 'floyd-steinberg',
  distanceAlgorithm: 'oklab',
});

// result.imageData is the pixelated, palette-matched ImageData
```

## Subpath Imports

Cherry-pick only what you need:

```typescript
import { redmeanDistance, oklabDistance } from 'bitmapped/color';
import { parseHex, parseGPL, parseASE } from 'bitmapped/palette';
import { floydSteinberg, bayerDither } from 'bitmapped/dither';
import { toPNGBlob, downloadPNG } from 'bitmapped/export';
```

## API Overview

### Core

The main `process()` pipeline: pixelate → color match → dither → export.

- `process(imageData, options)` — Full processing pipeline
- `pixelateBlockAverage(imageData, blockSize)` — Block-average pixelation
- `pixelateDownscale(imageData, blockSize)` — Fast downscale-upscale pixelation

### Color (`bitmapped/color`)

Color distance algorithms and palette matching.

- `createPaletteMatcher(palette, algorithm)` — Create a reusable color matcher
- `findNearestColor(color, palette, algorithm)` — Find closest palette color
- `findNearestColors(color, palette, n, algorithm)` — Find N closest palette colors
- `mapImageToPalette(imageData, palette, algorithm)` — Map all pixels to palette

### Distance Algorithms

| Algorithm   | Accuracy | Performance | Best For                  |
| ----------- | -------- | ----------- | ------------------------- |
| `euclidean` | Low      | Fastest     | Quick previews            |
| `redmean`   | Medium   | Fast        | General use               |
| `cie76`     | High     | Medium      | Color-critical work       |
| `ciede2000` | Highest  | Slow        | Maximum accuracy          |
| `oklab`     | High     | Medium      | Best accuracy/speed ratio |

### Palette (`bitmapped/palette`)

Parse palette files and extract colors from images.

| Format                | Function                               | File Extension |
| --------------------- | -------------------------------------- | -------------- |
| GIMP Palette          | `parseGPL(text)`                       | `.gpl`         |
| Hex list              | `parseHex(text)`                       | `.hex`, `.txt` |
| Adobe Swatch Exchange | `parseASE(buffer)`                     | `.ase`         |
| Image extraction      | `extractPalette(imageData, maxColors)` | any image      |

### Dither (`bitmapped/dither`)

| Algorithm        | Type            | Error Diffused | Character                 |
| ---------------- | --------------- | -------------- | ------------------------- |
| `floydSteinberg` | Error diffusion | 100%           | Smooth gradients          |
| `atkinsonDither` | Error diffusion | 75%            | High contrast, retro feel |
| `bayerDither`    | Ordered         | N/A            | Crosshatch pattern        |

### Export (`bitmapped/export`)

- `toPNGBlob(canvas)` — Convert canvas to PNG Blob
- `downloadPNG(canvas, filename)` — Trigger PNG download
- `imageDataToBlob(imageData)` — Convert ImageData to PNG Blob

## License

MIT

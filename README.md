# bitmapped

A zero-dependency TypeScript library for palette-aware image pixelation with hardware-accurate retro system presets.

Transform any image into pixel art that respects the actual color limitations of classic hardware — NES, Game Boy, C64, CGA, Amiga, and 49 more systems.

## Features

- **54 hardware presets** across 7 categories (Nintendo, Sega, computers, IBM PC, arcade, fantasy consoles, and more)
- **8 constraint solvers** that reproduce real hardware limitations (attribute clash, tile palettes, HAM mode, scanline limits, artifact color, etc.)
- **12 dithering algorithms** — error diffusion (Floyd-Steinberg, Atkinson), ordered (Bayer, blue noise, clustered dot, line patterns, checkerboard), PS1-style, and custom matrices
- **5 color distance algorithms** — Euclidean, Redmean, CIE76, CIEDE2000, Oklab
- **8 image preprocessing filters** — brightness, contrast, saturation, grayscale, sepia, invert, hue rotate, blur
- **4 export formats** — PNG, JPEG, WebP, SVG
- **Zero runtime dependencies** — all algorithms implemented from scratch
- **Dual ESM/CJS output** with full TypeScript types and tree-shaking support

## Install

```bash
npm install bitmapped
```

## Quick start

```ts
import { process } from 'bitmapped';
import { getPreset } from 'bitmapped/presets';

const preset = getPreset('gameboy-dmg');

const result = process(imageData, {
  blockSize: 4,
  palette: preset.palette,
  dithering: 'floyd-steinberg',
  distanceAlgorithm: 'oklab',
});

// result.imageData — the pixelated ImageData
// result.grid     — 2D RGB array of block colors
```

## Subpath exports

```ts
import { process } from 'bitmapped'; // Core pipeline
import { getPreset, listPresets } from 'bitmapped/presets'; // Hardware presets
import { oklabDistance } from 'bitmapped/color'; // Color distance & matching
import { floydSteinberg } from 'bitmapped/dither'; // Dithering algorithms
import { parsePaletteHex } from 'bitmapped/palette'; // Palette parsers (hex, GPL, ASE)
import { toPNGBlob } from 'bitmapped/export'; // Export as PNG/JPEG/WebP/SVG
import { applyFilters } from 'bitmapped/preprocess'; // Image filters
```

## Presets

54 presets across 7 categories:

| Category  | Count | Systems                                                                                                                    |
| --------- | ----- | -------------------------------------------------------------------------------------------------------------------------- |
| Computers | 20    | C64, ZX Spectrum, Amiga (OCS/HAM/EHB), Apple II, Amstrad CPC, BBC Micro, MSX, Atari ST/STE, Thomson MO5, Macintosh, VIC-20 |
| IBM PC    | 9     | CGA (4 mode-4 variants + composite), Tandy, EGA, VGA (mode 13h/12h)                                                        |
| Nintendo  | 8     | Game Boy (DMG/Pocket/Color), NES (NTSC/PAL), SNES, GBA, Virtual Boy                                                        |
| Arcade    | 5     | CPS1, CPS2, CPS3, Sega System 16, Namco Galaxian                                                                           |
| Other     | 5     | Atari 2600, PS1, Neo-Geo, ColecoVision                                                                                     |
| Sega      | 4     | Master System, Genesis, Game Gear                                                                                          |
| Fantasy   | 3     | PICO-8, TIC-80, Picotron                                                                                                   |

Presets include fixed-LUT palettes (Game Boy, NES, CGA, PICO-8) and RGB bit-depth color spaces (Genesis, Amiga, VGA) with `enumerateColorSpace()` for runtime palette generation.

## Packages

This is a pnpm monorepo with three workspaces:

- [`bitmapped`](./packages/bitmapped) — The core library ([npm](https://www.npmjs.com/package/bitmapped))
- [`bitmapped-demo`](./apps/demo) — Interactive React 19 demo app
- [`bitmapped-docs`](./apps/docs) — Documentation site (Nextra 4 + Next.js 15)

## Development

```bash
pnpm install              # Install all dependencies
pnpm dev                  # Start library watcher + demo dev server
pnpm test                 # Run all tests
pnpm build                # Build all packages
pnpm typecheck            # Type-check all packages
pnpm lint                 # Lint all packages
pnpm format               # Format with Prettier
pnpm validate             # Run all checks (lint, typecheck, test, format)
```

### Docs site

```bash
pnpm --filter bitmapped-docs dev      # Dev server at localhost:3000
pnpm --filter bitmapped-docs build    # Static export to apps/docs/out/
```

The docs site requires the library to be built first (`pnpm --filter bitmapped build`).

## License

MIT

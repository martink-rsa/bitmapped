# CLAUDE.md

## Project overview

**bitmapped** is a zero-dependency TypeScript library for palette-aware image pixelation, published to npm. It ships with 54 hardware presets for retro systems (NES, Game Boy, C64, CGA, Amiga, etc.) and includes constraint solvers that reproduce the actual color limitations of each system.

The repo is a pnpm monorepo with three workspaces:

- `packages/bitmapped` - The core library (npm: `bitmapped`)
- `apps/demo` - Interactive React demo app
- `apps/docs` - Documentation site (Nextra 4 + Next.js 15, static export)

## Commands

```bash
pnpm install              # Install all dependencies
pnpm dev                  # Start library watcher + demo dev server (parallel)
pnpm build                # Build all packages (turbo)
pnpm test                 # Run all tests (vitest)
pnpm test:watch           # Watch mode (library only)
pnpm lint                 # ESLint all packages
pnpm typecheck            # tsc --noEmit all packages
pnpm format               # Prettier write
pnpm format:check         # Prettier check
pnpm validate             # lint + typecheck + test + format:check (CI gate)
pnpm clean                # Remove all build artifacts and node_modules
```

Demo-specific:

```bash
pnpm --filter bitmapped-demo dev      # Dev server at localhost:5173
pnpm --filter bitmapped-demo build    # Production build
```

Library-specific:

```bash
pnpm --filter bitmapped test          # Library tests only
pnpm --filter bitmapped build         # Library build only
pnpm --filter bitmapped test:coverage # Coverage report
pnpm --filter bitmapped test:update-snapshots  # Update preset snapshots
```

Docs-specific:

```bash
pnpm --filter bitmapped-docs dev      # Dev server at localhost:3000
pnpm --filter bitmapped-docs build    # Static export to apps/docs/out/
```

The docs build depends on `packages/bitmapped` being built first.

## Architecture

### Library (`packages/bitmapped/src/`)

The core processing pipeline is: **filters -> resize -> pixelate -> palette match -> dither -> constraints**.

```
core/           Pipeline orchestrator, pixelation (block-average, bilinear), buffer ops, resize, all type definitions
color/          5 distance algorithms (euclidean, redmean, cie76, ciede2000, oklab), palette matching, color quantization
dither/         Error diffusion (Floyd-Steinberg, Atkinson), ordered (Bayer, blue noise, PS1, clustered-dot, line variants, checkerboard), custom matrices
palette/        Parsers (hex, GPL, ASE), median-cut extraction
presets/        54 hardware presets organized by category (nintendo/, sega/, computers/, ibm-pc/, arcade/, other/, fantasy/)
                palettes/ subfolder contains shared palette definitions (NES, C64, CGA, EGA, CPC, ZX, etc.)
constraints/    8 solvers: attribute clash (ZX/C64), per-tile palette (NES/SNES), per-row-in-tile, HAM (Amiga),
                scanline, artifact color (Apple II), CGA subpalette, Neo-Geo color encode/decode
preprocess/     CSS-style image filters (brightness, contrast, saturate, grayscale, sepia, invert, hue-rotate, blur)
export/         PNG/JPEG/WebP/SVG blob generation and download
```

Entry point: `process(imageData: ImageData, options: ProcessOptions): ProcessResult`

Subpath exports: `bitmapped/color`, `bitmapped/palette`, `bitmapped/dither`, `bitmapped/export`, `bitmapped/presets`, `bitmapped/preprocess`

### Demo app (`apps/demo/src/`)

React 19 + Vite 8 app with CSS Modules. All image processing runs in a Web Worker (`workers/process.worker.ts`).

```
components/     Header, Footer, ImageUpload, Canvas, Controls, SystemPicker, SystemInfo
data/           categories.ts, descriptions.ts, systems.ts (maps preset IDs to UI metadata)
hooks/          useProcessImage (worker lifecycle), useDebounce
workers/        process.worker.ts (receives ArrayBuffer, calls process(), returns ArrayBuffer)
```

State lives in `App.tsx` via `useState`. No external state management.

### Docs site (`apps/docs/`)

Nextra 4 + Next.js 15 App Router, static export for GitHub Pages. Content is MDX in `content/`, interactive components in `src/components/`.

```
app/                layout.tsx (replaces theme.config.tsx), catch-all [[...mdxPath]]/page.tsx
content/            MDX pages organized as: guides/, presets/, api/, concepts/
src/components/     LiveDemo, PaletteDisplay, SystemCard, BeforeAfter, CodeExample, ColorDistanceViz, ConstraintVisualizer
src/lib/            preset-data.ts (shared preset metadata helper)
public/images/      Sample images for demos
```

Key Nextra 4 patterns (different from Nextra 3):

- No `theme.config.tsx` — theme configured via JSX props in `app/layout.tsx`
- `mdx-components.tsx` at project root registers custom components
- `_meta.ts` files (not `.json`) define navigation ordering
- Search uses Pagefind (postbuild script), not Flexsearch
- `generateStaticParamsFor` + `importPage` in the catch-all route

## Key types

- `ProcessOptions` - blockSize, palette, dithering, distanceAlgorithm, targetResolution, resizeFit, resizeMethod, filters, constraintType + constraint configs
- `ProcessResult` - imageData, grid (2D RGB array), width, height, effectiveResolution
- `HardwarePreset` - id, name, category, system, region, palette, colorSpace, resolution, par, display, constraint config, recommended dithering/distance
- `Palette` = `PaletteColor[]` where `PaletteColor = { color: RGB, name?: string }`
- `DitheringAlgorithm` - 'none' | 'floyd-steinberg' | 'atkinson' | 'bayer' | 'clustered-dot' | 'horizontal-line' | 'vertical-line' | 'diagonal-line' | 'checkerboard' | 'blue-noise' | 'ps1-ordered' | 'custom'
- `DistanceAlgorithm` - 'euclidean' | 'redmean' | 'cie76' | 'ciede2000' | 'oklab'
- `ConstraintType` - 'attribute-block' | 'per-tile-palette' | 'per-scanline' | 'ham' | 'artifact-color' | 'sub-palette-lock' | 'per-row-in-tile' | 'monochrome-global' | 'none'

## Conventions

- Zero runtime dependencies in the core library — all algorithms implemented from scratch
- Pure functions throughout (side-effect free except export/download)
- Strict TypeScript: `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`
- Prettier: semicolons, single quotes, trailing commas, 80 char width
- Tests colocated with source as `*.test.ts`
- Library uses `tsup` for dual ESM/CJS output (target: ES2020)
- Changesets for versioning; `publint` + `@arethetypeswrong/cli` for package quality
- Little-endian ABGR 32-bit pixel packing for performance-critical paths
- Demo uses CSS Modules (not Tailwind), Lucide React for icons
- Docs use Nextra 4 (App Router), JetBrains Mono for headings, `image-rendering: pixelated` on demo canvases
- Docs components use `'use client'` directive (canvas/interactivity requires client-side rendering)

## Presets

54 presets across 7 categories:

| Category  | Count | Examples                                                                                                                                                     |
| --------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| computers | 20    | C64 (pepto/colodore/hires/multicolor), ZX Spectrum, Amiga (OCS/HAM/EHB), Apple II, Amstrad CPC, BBC Micro, MSX, Atari ST/STE, Thomson MO5, Macintosh, VIC-20 |
| ibm-pc    | 9     | CGA (4 mode-4 variants + composite), Tandy, EGA, VGA (mode 13h/12h)                                                                                          |
| nintendo  | 8     | Game Boy (DMG/Pocket/Color), NES (NTSC/PAL), SNES, GBA, Virtual Boy                                                                                          |
| arcade    | 5     | CPS1, CPS2, CPS3, Sega System 16, Namco Galaxian                                                                                                             |
| other     | 5     | Atari 2600 (NTSC/PAL), PS1, Neo-Geo, ColecoVision                                                                                                            |
| sega      | 4     | Master System, Genesis (NTSC/PAL), Game Gear                                                                                                                 |
| fantasy   | 3     | PICO-8, TIC-80, Picotron                                                                                                                                     |

Presets have two palette modes:

- **Fixed-LUT**: `preset.palette` contains the full color array (Game Boy, NES, C64, CGA, PICO-8, etc.)
- **RGB bit-depth**: `preset.colorSpace` defines bits-per-channel; use `enumerateColorSpace()` from `bitmapped/presets` to generate the full palette at runtime (Genesis, Amiga, VGA, etc.)

Some presets share descriptions in the demo app — e.g., `nes-ntsc` and `nes-pal` both use description key `nes`. The mapping is in `apps/demo/src/data/systems.ts`.

## CI/CD

Three GitHub Actions workflows in `.github/workflows/`:

- **ci.yml** — Runs on push to main and PRs: typecheck, lint, format:check, test, build, publint, attw
- **release.yml** — Runs on push to main: changeset versioning, npm publish with provenance
- **deploy-docs.yml** — Runs on push to main: builds lib + docs, runs Pagefind, deploys to GitHub Pages

## Testing

```bash
pnpm test                              # All tests
pnpm --filter bitmapped test           # Library only
pnpm --filter bitmapped test:coverage  # With coverage report
pnpm --filter bitmapped test:update-snapshots  # Update preset snapshots
pnpm --filter bitmapped test:snapshot-report   # Generate snapshot comparison report
```

Tests use Vitest. Node doesn't have `ImageData`, so a polyfill is provided in the test setup. Visual regression tests use `pixelmatch` and `pngjs`. Preset snapshots live in `src/__fixtures__/snapshots/` (54 directories, one per preset).

The demo app has Playwright as a dev dependency for e2e testing.

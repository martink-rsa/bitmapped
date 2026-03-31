# bitmapped demo

Interactive web app for converting images into hardware-accurate retro pixel art. Select from 53 real and fantasy system presets, adjust processing settings, and compare results side by side.

## Quick start

```bash
# From the monorepo root
pnpm install
pnpm dev          # Starts library watcher + demo dev server
```

Or run the demo in isolation:

```bash
cd apps/demo
pnpm dev          # http://localhost:5173
```

> The demo depends on the `bitmapped` workspace package. The library must be built (or watched) before the demo can resolve imports.

## Features

- **53 system presets** across 5 categories: Consoles, Home Computers, IBM PC, Arcade, Fantasy
- **Web Worker processing** keeps the UI responsive during heavy operations
- **3 comparison modes** - slider, side-by-side, toggle on hover
- **Educational system info** - palette display, specs table, "Why it looks like that" explainer for every system
- **Processing controls** - dithering algorithm, color distance, hardware constraints toggle, preprocessing filters
- **Export** - PNG download with configurable scale (1x-4x) and pixel aspect ratio correction
- **Clipboard** - one-click copy to clipboard
- **Dark/light theme** with a "Retro-Technical Museum" design aesthetic
- **Drag-and-drop** image upload with procedural sample images

## Architecture

```
src/
├── App.tsx                          # Root component, state management
├── App.module.css                   # App layout
├── global.css                       # Design tokens, resets, fonts
├── main.tsx                         # Entry point
├── components/
│   ├── Header/                      # Logo, theme toggle, GitHub link
│   ├── Footer/                      # Version, links
│   ├── ImageUpload/                 # Drop zone, file picker, sample grid
│   │   ├── ImageUploadZone.tsx
│   │   └── SampleGrid.tsx           # Procedurally generated sample images
│   ├── Canvas/                      # Image display and comparison
│   │   └── CanvasPanel.tsx          # Viewport, zoom, pan, comparison modes, download
│   ├── Controls/                    # Processing settings sidebar
│   │   └── ControlsPanel.tsx        # Dithering, distance, constraints, filters, output
│   ├── SystemPicker/                # Preset browser
│   │   └── SystemPicker.tsx         # Category tabs, search, card grid
│   └── SystemInfo/                  # Educational content
│       └── SystemInfoCard.tsx       # Palette display, specs table, constraint explainer
├── data/
│   ├── categories.ts                # 5 display categories
│   ├── descriptions.ts              # Educational text for each system
│   └── systems.ts                   # Maps 53 preset IDs to UI metadata
├── hooks/
│   ├── useProcessImage.ts           # Web Worker lifecycle, request tracking
│   └── useDebounce.ts               # Generic debounce for slider changes
└── workers/
    └── process.worker.ts            # Off-main-thread bitmapped processing
```

### Key design decisions

**CSS Modules** - Every component has co-located `*.module.css`. Design tokens live in `global.css` as CSS custom properties, accessible everywhere via `var(--token)`.

**Web Worker** - The `process()` call runs in a dedicated worker. ImageData is transferred as raw `ArrayBuffer` (zero-copy via transferable objects). A monotonic request ID discards stale responses when rapid parameter changes produce out-of-order results.

**Data layer** - The library exposes `HardwarePreset` objects with technical data (palette, resolution, constraints). The demo adds a parallel metadata layer (`data/systems.ts`) with display names, years, category assignments, and description keys. Multiple presets can share a single description (e.g., `nes-ntsc` and `nes-pal` both reference the `nes` description).

**No external state management** - React `useState` at the App level, passed as props. The app is small enough that Context/reducers add complexity without benefit.

## Tech stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Framework  | React 19                            |
| Bundler    | Vite 6                              |
| Language   | TypeScript 5.7                      |
| Styling    | CSS Modules + CSS custom properties |
| Icons      | Lucide React                        |
| Processing | `bitmapped` (workspace dependency)  |

## Scripts

```bash
pnpm dev       # Start dev server with HMR
pnpm build     # Production build to dist/
pnpm preview   # Preview production build locally
```

## Adding a new system preset

1. Add the `HardwarePreset` to `packages/bitmapped/src/presets/`
2. Add a `SystemUIMetadata` entry in `apps/demo/src/data/systems.ts` with its `presetId`, display name, year, category, and description key
3. Add or reuse a `SystemDescription` entry in `apps/demo/src/data/descriptions.ts`
4. The system will automatically appear in the picker under its assigned category

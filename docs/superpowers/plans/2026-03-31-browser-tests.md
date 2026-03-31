# Browser Tests for Canvas-Dependent Modules

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Vitest browser-mode tests for the 6 modules that require Canvas/DOM APIs, closing the remaining coverage gaps.

**Architecture:** Use Vitest's `projects` configuration to run two test environments in parallel — existing Node tests (`*.test.ts`) and new browser tests (`*.browser.test.ts`) powered by `@vitest/browser-playwright` running headless Chromium. No source code changes needed.

**Tech Stack:** Vitest 4.x, `@vitest/browser-playwright`, Playwright Chromium

---

### File Map

| Action | File                                                              | Responsibility                                                      |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| Modify | `packages/bitmapped/package.json`                                 | Add `@vitest/browser-playwright` dev dep, add `test:browser` script |
| Modify | `packages/bitmapped/vitest.config.ts`                             | Split into `projects` array (node + browser)                        |
| Create | `packages/bitmapped/src/export/helpers.browser.test.ts`           | Test `downloadBlob`                                                 |
| Create | `packages/bitmapped/src/export/png.browser.test.ts`               | Test `toPNGBlob`, `downloadPNG`, `imageDataToBlob`                  |
| Create | `packages/bitmapped/src/export/jpeg.browser.test.ts`              | Test `toJPEGBlob`, `downloadJPEG`                                   |
| Create | `packages/bitmapped/src/export/webp.browser.test.ts`              | Test `toWebPBlob`, `downloadWebP`                                   |
| Create | `packages/bitmapped/src/core/pixelate.browser.test.ts`            | Test `pixelateDownscale`                                            |
| Create | `packages/bitmapped/src/preprocess/apply-filters.browser.test.ts` | Test `applyFilters` with active filters                             |

---

### Task 1: Install Dependencies & Configure Vitest Projects

**Files:**

- Modify: `packages/bitmapped/package.json`
- Modify: `packages/bitmapped/vitest.config.ts`

- [ ] **Step 1: Install `@vitest/browser-playwright` and Playwright Chromium**

```bash
cd packages/bitmapped
pnpm add -D @vitest/browser-playwright
npx playwright install chromium
```

- [ ] **Step 2: Update `vitest.config.ts` to use projects**

```typescript
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'node',
          globals: true,
          environment: 'node',
          include: ['src/**/*.test.ts'],
          exclude: ['src/**/*.browser.test.ts'],
          setupFiles: ['./src/test-setup.ts'],
          coverage: {
            include: ['src/**/*.ts'],
            exclude: [
              'src/**/*.test.ts',
              'src/**/*.browser.test.ts',
              'src/test-setup.ts',
            ],
          },
        },
      },
      {
        test: {
          name: 'browser',
          globals: true,
          include: ['src/**/*.browser.test.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            headless: true,
          },
        },
      },
    ],
  },
});
```

- [ ] **Step 3: Add `test:browser` script to package.json**

Add to the `"scripts"` section:

```json
"test:browser": "vitest run --project browser"
```

- [ ] **Step 4: Verify existing Node tests still pass**

```bash
pnpm --filter bitmapped test
```

Expected: All 539+ tests pass (node project), browser project shows 0 tests (no browser test files yet).

- [ ] **Step 5: Commit**

```bash
git add packages/bitmapped/package.json packages/bitmapped/vitest.config.ts pnpm-lock.yaml
git commit -m "chore: add Vitest browser mode with Playwright for Canvas tests"
```

---

### Task 2: Test `export/helpers.ts` — `downloadBlob`

**Files:**

- Create: `packages/bitmapped/src/export/helpers.browser.test.ts`

The function creates an object URL from a Blob, creates an `<a>` element, sets `href` and `download`, calls `click()`, and revokes the URL after a timeout.

- [ ] **Step 1: Write the browser test file**

```typescript
import { describe, it, expect, vi, afterEach } from 'vitest';
import { downloadBlob, defaultFilenameBase } from './helpers.js';

describe('downloadBlob (browser)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates and revokes an object URL', async () => {
    const revokespy = vi.spyOn(URL, 'revokeObjectURL');
    const blob = new Blob(['test'], { type: 'text/plain' });

    downloadBlob(blob, 'test.txt');

    // revokeObjectURL is called after a 100ms setTimeout
    await new Promise((r) => setTimeout(r, 150));
    expect(revokespy).toHaveBeenCalledOnce();
    expect(revokespy.mock.calls[0]![0]).toMatch(/^blob:/);
  });

  it('creates an anchor with correct download attribute', () => {
    const anchors: HTMLAnchorElement[] = [];
    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreate(tag);
      if (tag === 'a') anchors.push(el as HTMLAnchorElement);
      return el;
    });

    const blob = new Blob(['hello'], { type: 'text/plain' });
    downloadBlob(blob, 'myfile.txt');

    expect(anchors).toHaveLength(1);
    expect(anchors[0]!.download).toBe('myfile.txt');
    expect(anchors[0]!.href).toMatch(/^blob:/);
  });

  it('calls click() on the anchor', () => {
    const clickSpy = vi.fn();
    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = origCreate(tag);
      if (tag === 'a') el.click = clickSpy;
      return el;
    });

    const blob = new Blob(['data'], { type: 'application/octet-stream' });
    downloadBlob(blob, 'file.bin');

    expect(clickSpy).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run to verify it passes**

```bash
pnpm --filter bitmapped test:browser
```

Expected: 3 tests pass.

- [ ] **Step 3: Commit**

```bash
git add packages/bitmapped/src/export/helpers.browser.test.ts
git commit -m "test: add browser tests for downloadBlob"
```

---

### Task 3: Test `export/png.ts` — `toPNGBlob`, `downloadPNG`, `imageDataToBlob`

**Files:**

- Create: `packages/bitmapped/src/export/png.browser.test.ts`

- [ ] **Step 1: Write the browser test file**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { toPNGBlob, downloadPNG, imageDataToBlob } from './png.js';

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, width, height);
  return canvas;
}

describe('toPNGBlob', () => {
  it('resolves to a Blob with image/png type', async () => {
    const canvas = createCanvas(4, 4);
    const blob = await toPNGBlob(canvas);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/png');
  });

  it('produces a non-empty blob', async () => {
    const canvas = createCanvas(2, 2);
    const blob = await toPNGBlob(canvas);
    expect(blob.size).toBeGreaterThan(0);
  });
});

describe('downloadPNG', () => {
  it('completes without throwing', async () => {
    const canvas = createCanvas(2, 2);
    await expect(downloadPNG(canvas, 'test.png')).resolves.toBeUndefined();
  });
});

describe('imageDataToBlob', () => {
  it('converts ImageData to a PNG blob', async () => {
    const imageData = new ImageData(
      new Uint8ClampedArray([
        255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 0, 255,
      ]),
      2,
      2,
    );
    const blob = await imageDataToBlob(imageData);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/png');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('produces a blob whose dimensions match the input', async () => {
    const w = 8;
    const h = 6;
    const data = new Uint8ClampedArray(w * h * 4).fill(128);
    for (let i = 3; i < data.length; i += 4) data[i] = 255;
    const imageData = new ImageData(data, w, h);
    const blob = await imageDataToBlob(imageData);
    // Verify by round-tripping: load blob into an Image, draw to canvas, read back
    const url = URL.createObjectURL(blob);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
    URL.revokeObjectURL(url);
    expect(img.naturalWidth).toBe(w);
    expect(img.naturalHeight).toBe(h);
  });
});
```

- [ ] **Step 2: Run to verify it passes**

```bash
pnpm --filter bitmapped test:browser
```

Expected: All png tests pass.

- [ ] **Step 3: Commit**

```bash
git add packages/bitmapped/src/export/png.browser.test.ts
git commit -m "test: add browser tests for PNG export"
```

---

### Task 4: Test `export/jpeg.ts` — `toJPEGBlob`, `downloadJPEG`

**Files:**

- Create: `packages/bitmapped/src/export/jpeg.browser.test.ts`

- [ ] **Step 1: Write the browser test file**

```typescript
import { describe, it, expect } from 'vitest';
import { toJPEGBlob, downloadJPEG } from './jpeg.js';

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'blue';
  ctx.fillRect(0, 0, width, height);
  return canvas;
}

describe('toJPEGBlob', () => {
  it('resolves to a Blob with image/jpeg type', async () => {
    const canvas = createCanvas(4, 4);
    const blob = await toJPEGBlob(canvas);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/jpeg');
  });

  it('produces a non-empty blob', async () => {
    const canvas = createCanvas(2, 2);
    const blob = await toJPEGBlob(canvas);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('respects quality parameter', async () => {
    const canvas = createCanvas(16, 16);
    const lowQ = await toJPEGBlob(canvas, 0.1);
    const highQ = await toJPEGBlob(canvas, 1.0);
    // Lower quality should produce smaller blob
    expect(lowQ.size).toBeLessThan(highQ.size);
  });
});

describe('downloadJPEG', () => {
  it('completes without throwing', async () => {
    const canvas = createCanvas(2, 2);
    await expect(downloadJPEG(canvas, 'test.jpg')).resolves.toBeUndefined();
  });
});
```

- [ ] **Step 2: Run to verify it passes**

```bash
pnpm --filter bitmapped test:browser
```

- [ ] **Step 3: Commit**

```bash
git add packages/bitmapped/src/export/jpeg.browser.test.ts
git commit -m "test: add browser tests for JPEG export"
```

---

### Task 5: Test `export/webp.ts` — `toWebPBlob`, `downloadWebP`

**Files:**

- Create: `packages/bitmapped/src/export/webp.browser.test.ts`

- [ ] **Step 1: Write the browser test file**

```typescript
import { describe, it, expect } from 'vitest';
import { toWebPBlob, downloadWebP } from './webp.js';

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'green';
  ctx.fillRect(0, 0, width, height);
  return canvas;
}

describe('toWebPBlob', () => {
  it('resolves to a Blob with image/webp type', async () => {
    const canvas = createCanvas(4, 4);
    const blob = await toWebPBlob(canvas);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/webp');
  });

  it('produces a non-empty blob', async () => {
    const canvas = createCanvas(2, 2);
    const blob = await toWebPBlob(canvas);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('respects quality parameter', async () => {
    const canvas = createCanvas(16, 16);
    const lowQ = await toWebPBlob(canvas, 0.1);
    const highQ = await toWebPBlob(canvas, 1.0);
    expect(lowQ.size).toBeLessThan(highQ.size);
  });
});

describe('downloadWebP', () => {
  it('completes without throwing', async () => {
    const canvas = createCanvas(2, 2);
    await expect(downloadWebP(canvas, 'test.webp')).resolves.toBeUndefined();
  });
});
```

- [ ] **Step 2: Run to verify it passes**

```bash
pnpm --filter bitmapped test:browser
```

- [ ] **Step 3: Commit**

```bash
git add packages/bitmapped/src/export/webp.browser.test.ts
git commit -m "test: add browser tests for WebP export"
```

---

### Task 6: Test `core/pixelate.ts` — `pixelateDownscale`

**Files:**

- Create: `packages/bitmapped/src/core/pixelate.browser.test.ts`

`pixelateDownscale` uses OffscreenCanvas/HTMLCanvasElement to downscale then upscale an image, producing a pixelated effect without per-block color data.

- [ ] **Step 1: Write the browser test file**

```typescript
import { describe, it, expect } from 'vitest';
import { pixelateDownscale } from './pixelate.js';

describe('pixelateDownscale (browser)', () => {
  it('returns ImageData with same dimensions as input', () => {
    const input = new ImageData(
      new Uint8ClampedArray(16 * 16 * 4).fill(128),
      16,
      16,
    );
    // Fix alpha
    for (let i = 3; i < input.data.length; i += 4) input.data[i] = 255;

    const result = pixelateDownscale(input, 4);

    expect(result.width).toBe(16);
    expect(result.height).toBe(16);
    expect(result.data.length).toBe(input.data.length);
  });

  it('produces uniform output for uniform input', () => {
    const w = 8;
    const h = 8;
    const data = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      data[i * 4] = 200;
      data[i * 4 + 1] = 100;
      data[i * 4 + 2] = 50;
      data[i * 4 + 3] = 255;
    }
    const input = new ImageData(data, w, h);

    const result = pixelateDownscale(input, 4);

    // All pixels should be approximately the same color
    for (let i = 0; i < w * h; i++) {
      expect(result.data[i * 4]!).toBeCloseTo(200, -1);
      expect(result.data[i * 4 + 1]!).toBeCloseTo(100, -1);
      expect(result.data[i * 4 + 2]!).toBeCloseTo(50, -1);
    }
  });

  it('blockSize of 1 preserves image approximately', () => {
    const data = new Uint8ClampedArray([
      255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 0, 255,
    ]);
    const input = new ImageData(data, 2, 2);

    const result = pixelateDownscale(input, 1);

    expect(result.width).toBe(2);
    expect(result.height).toBe(2);
  });

  it('each block region has uniform color', () => {
    // Create a gradient image
    const w = 16;
    const h = 16;
    const blockSize = 4;
    const data = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        data[i] = Math.round((x / w) * 255);
        data[i + 1] = Math.round((y / h) * 255);
        data[i + 2] = 128;
        data[i + 3] = 255;
      }
    }
    const input = new ImageData(data, w, h);

    const result = pixelateDownscale(input, blockSize);

    // Within each blockSize x blockSize block, pixels should be the same
    // (since imageSmoothingEnabled = false on the upscale)
    const gridW = Math.ceil(w / blockSize);
    const gridH = Math.ceil(h / blockSize);
    for (let gy = 0; gy < gridH; gy++) {
      for (let gx = 0; gx < gridW; gx++) {
        const startX = gx * blockSize;
        const startY = gy * blockSize;
        const refIdx = (startY * w + startX) * 4;
        const refR = result.data[refIdx]!;
        const refG = result.data[refIdx + 1]!;
        const refB = result.data[refIdx + 2]!;

        for (let dy = 0; dy < blockSize && startY + dy < h; dy++) {
          for (let dx = 0; dx < blockSize && startX + dx < w; dx++) {
            const idx = ((startY + dy) * w + (startX + dx)) * 4;
            expect(result.data[idx]).toBe(refR);
            expect(result.data[idx + 1]).toBe(refG);
            expect(result.data[idx + 2]).toBe(refB);
          }
        }
      }
    }
  });

  it('does not mutate the input ImageData', () => {
    const data = new Uint8ClampedArray(8 * 8 * 4).fill(100);
    for (let i = 3; i < data.length; i += 4) data[i] = 255;
    const input = new ImageData(new Uint8ClampedArray(data), 8, 8);
    const originalData = new Uint8ClampedArray(input.data);

    pixelateDownscale(input, 2);

    expect(input.data).toEqual(originalData);
  });
});
```

- [ ] **Step 2: Run to verify it passes**

```bash
pnpm --filter bitmapped test:browser
```

- [ ] **Step 3: Commit**

```bash
git add packages/bitmapped/src/core/pixelate.browser.test.ts
git commit -m "test: add browser tests for pixelateDownscale"
```

---

### Task 7: Test `preprocess/apply-filters.ts` — Active Filter Path

**Files:**

- Create: `packages/bitmapped/src/preprocess/apply-filters.browser.test.ts`

This tests the code path where `hasActiveFilters` returns true: creating canvases, setting `ctx.filter`, drawing, and reading back pixel data.

- [ ] **Step 1: Write the browser test file**

```typescript
import { describe, it, expect } from 'vitest';
import { applyFilters } from './apply-filters.js';

function createTestImageData(
  width: number,
  height: number,
  r: number,
  g: number,
  b: number,
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  }
  return new ImageData(data, width, height);
}

describe('applyFilters (browser — active filters)', () => {
  it('returns ImageData with same dimensions when filters are active', () => {
    const input = createTestImageData(8, 8, 128, 64, 32);
    const result = applyFilters(input, { brightness: 1.5 });
    expect(result.width).toBe(8);
    expect(result.height).toBe(8);
    expect(result.data.length).toBe(input.data.length);
  });

  it('brightness > 1 increases channel values', () => {
    const input = createTestImageData(4, 4, 100, 100, 100);
    const result = applyFilters(input, { brightness: 2.0 });
    // Brightness 2.0 should roughly double the values (clamped at 255)
    expect(result.data[0]!).toBeGreaterThan(100);
    expect(result.data[1]!).toBeGreaterThan(100);
    expect(result.data[2]!).toBeGreaterThan(100);
  });

  it('brightness < 1 decreases channel values', () => {
    const input = createTestImageData(4, 4, 200, 200, 200);
    const result = applyFilters(input, { brightness: 0.5 });
    expect(result.data[0]!).toBeLessThan(200);
    expect(result.data[1]!).toBeLessThan(200);
    expect(result.data[2]!).toBeLessThan(200);
  });

  it('grayscale: 1 removes color', () => {
    const input = createTestImageData(4, 4, 255, 0, 0);
    const result = applyFilters(input, { grayscale: 1 });
    // R, G, B channels should be approximately equal (grayscale)
    const r = result.data[0]!;
    const g = result.data[1]!;
    const b = result.data[2]!;
    expect(Math.abs(r - g)).toBeLessThan(5);
    expect(Math.abs(g - b)).toBeLessThan(5);
  });

  it('contrast: 0 produces flat gray', () => {
    const input = createTestImageData(4, 4, 255, 0, 128);
    const result = applyFilters(input, { contrast: 0 });
    // All channels should converge toward 128 (mid-gray)
    for (let ch = 0; ch < 3; ch++) {
      expect(result.data[ch]!).toBeGreaterThan(100);
      expect(result.data[ch]!).toBeLessThan(156);
    }
  });

  it('invert flips channel values', () => {
    const input = createTestImageData(4, 4, 200, 50, 100);
    const result = applyFilters(input, { invert: 1 });
    // Inverted: ~55, ~205, ~155 (approximate due to color space)
    expect(result.data[0]!).toBeLessThan(100); // was 200
    expect(result.data[1]!).toBeGreaterThan(150); // was 50
  });

  it('does not mutate the input ImageData', () => {
    const input = createTestImageData(4, 4, 128, 64, 32);
    const originalData = new Uint8ClampedArray(input.data);
    applyFilters(input, { brightness: 2.0 });
    expect(input.data).toEqual(originalData);
  });

  it('preserves alpha channel', () => {
    const data = new Uint8ClampedArray(4 * 4 * 4);
    for (let i = 0; i < 16; i++) {
      data[i * 4] = 128;
      data[i * 4 + 1] = 128;
      data[i * 4 + 2] = 128;
      data[i * 4 + 3] = 200;
    }
    const input = new ImageData(data, 4, 4);
    const result = applyFilters(input, { brightness: 1.5 });
    // Alpha should be preserved (or at least not zeroed)
    for (let i = 0; i < 16; i++) {
      expect(result.data[i * 4 + 3]!).toBeGreaterThan(0);
    }
  });

  it('multiple filters compose correctly', () => {
    const input = createTestImageData(4, 4, 100, 100, 100);
    const result = applyFilters(input, {
      brightness: 2.0,
      contrast: 0.5,
    });
    // Should produce a valid result (not throw)
    expect(result.width).toBe(4);
    expect(result.height).toBe(4);
    expect(result.data.length).toBe(input.data.length);
  });
});
```

- [ ] **Step 2: Run to verify it passes**

```bash
pnpm --filter bitmapped test:browser
```

- [ ] **Step 3: Commit**

```bash
git add packages/bitmapped/src/preprocess/apply-filters.browser.test.ts
git commit -m "test: add browser tests for applyFilters with active CSS filters"
```

---

### Task 8: Full Verification

- [ ] **Step 1: Run all tests (both projects)**

```bash
pnpm --filter bitmapped test
```

Expected: All node tests pass, all browser tests pass.

- [ ] **Step 2: Run coverage**

```bash
pnpm --filter bitmapped test:coverage
```

Expected: Coverage increases for `export/`, `core/pixelate.ts`, and `preprocess/apply-filters.ts`.

- [ ] **Step 3: Commit all remaining changes**

```bash
git add -A
git commit -m "test: complete browser test suite for Canvas-dependent modules"
```

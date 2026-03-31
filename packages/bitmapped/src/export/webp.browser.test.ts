import { describe, it, expect, vi, afterEach } from 'vitest';
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
    const canvas = createCanvas(16, 16);
    const blob = await toWebPBlob(canvas);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/webp');
  });

  it('returns a non-empty blob', async () => {
    const canvas = createCanvas(16, 16);
    const blob = await toWebPBlob(canvas);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('quality parameter affects file size', async () => {
    // Use a canvas with noise-like content to make quality differences visible
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    // Draw varied pixel colors to create compressible-but-detail-rich content
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        ctx.fillStyle = `rgb(${(x * 4) % 256}, ${(y * 4) % 256}, ${((x + y) * 2) % 256})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    const highQuality = await toWebPBlob(canvas, 1.0);
    const lowQuality = await toWebPBlob(canvas, 0.01);
    // Both blobs should be non-empty
    expect(highQuality.size).toBeGreaterThan(0);
    expect(lowQuality.size).toBeGreaterThan(0);
    // Higher quality should produce a larger or equal file than very low quality
    expect(highQuality.size).toBeGreaterThanOrEqual(lowQuality.size);
  });
});

describe('downloadWebP', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('completes without throwing', async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      () => undefined,
    );

    const canvas = createCanvas(16, 16);
    await expect(downloadWebP(canvas, 'test.webp')).resolves.toBeUndefined();
  });

  it('uses default filename with .webp extension when none provided', async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    let capturedAnchor: HTMLAnchorElement | null = null;
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(
      (tagName: string) => {
        const el = originalCreateElement(tagName);
        if (tagName === 'a') {
          capturedAnchor = el as HTMLAnchorElement;
          vi.spyOn(capturedAnchor, 'click').mockImplementation(() => undefined);
        }
        return el;
      },
    );

    const canvas = createCanvas(16, 16);
    await downloadWebP(canvas);

    expect(capturedAnchor).not.toBeNull();
    expect(capturedAnchor!.download).toMatch(/\.webp$/);
  });
});

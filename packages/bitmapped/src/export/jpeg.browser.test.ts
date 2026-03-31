import { describe, it, expect, vi, afterEach } from 'vitest';
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
    const canvas = createCanvas(16, 16);
    const blob = await toJPEGBlob(canvas);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/jpeg');
  });

  it('produces a non-empty blob', async () => {
    const canvas = createCanvas(16, 16);
    const blob = await toJPEGBlob(canvas);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('low quality produces a smaller blob than high quality', async () => {
    const canvas = createCanvas(16, 16);
    const lowQualityBlob = await toJPEGBlob(canvas, 0.1);
    const highQualityBlob = await toJPEGBlob(canvas, 1.0);
    expect(lowQualityBlob.size).toBeLessThan(highQualityBlob.size);
  });

  it('uses default quality of 0.92 when none is provided', async () => {
    const canvas = createCanvas(16, 16);
    const defaultBlob = await toJPEGBlob(canvas);
    const explicitBlob = await toJPEGBlob(canvas, 0.92);
    expect(defaultBlob.size).toBe(explicitBlob.size);
  });
});

describe('downloadJPEG', () => {
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
    await expect(downloadJPEG(canvas, 'test.jpg')).resolves.toBeUndefined();
  });

  it('calls downloadBlob with a .jpg filename by default', async () => {
    const createObjectURL = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:fake-url');
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
    await downloadJPEG(canvas);

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(capturedAnchor).not.toBeNull();
    expect(capturedAnchor!.download).toMatch(/\.jpg$/);
  });

  it('uses provided filename', async () => {
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
    await downloadJPEG(canvas, 'my-image.jpg');

    expect(capturedAnchor!.download).toBe('my-image.jpg');
  });
});

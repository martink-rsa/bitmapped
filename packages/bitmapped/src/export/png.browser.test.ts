import { describe, it, expect, vi, afterEach } from 'vitest';
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

function createImageData(width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255; // R
    data[i + 1] = 0; // G
    data[i + 2] = 0; // B
    data[i + 3] = 255; // A
  }
  return new ImageData(data, width, height);
}

describe('toPNGBlob', () => {
  it('resolves to a Blob with image/png type', async () => {
    const canvas = createCanvas(4, 4);
    const blob = await toPNGBlob(canvas);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/png');
  });

  it('resolves to a non-empty blob', async () => {
    const canvas = createCanvas(8, 8);
    const blob = await toPNGBlob(canvas);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('rejects when canvas.toBlob returns null', async () => {
    const canvas = createCanvas(2, 2);
    vi.spyOn(canvas, 'toBlob').mockImplementation((callback) => {
      callback(null);
    });
    await expect(toPNGBlob(canvas)).rejects.toThrow(
      'Failed to create PNG blob from canvas',
    );
  });
});

describe('downloadPNG', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('completes without throwing', async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      () => undefined,
    );

    const canvas = createCanvas(4, 4);
    await expect(downloadPNG(canvas)).resolves.toBeUndefined();
  });

  it('uses a default .png filename when none provided', async () => {
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

    const canvas = createCanvas(4, 4);
    await downloadPNG(canvas);

    expect(capturedAnchor).not.toBeNull();
    expect(capturedAnchor!.download).toMatch(/\.png$/);
  });

  it('uses the provided filename', async () => {
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

    const canvas = createCanvas(4, 4);
    await downloadPNG(canvas, 'my-image.png');

    expect(capturedAnchor).not.toBeNull();
    expect(capturedAnchor!.download).toBe('my-image.png');
  });
});

describe('imageDataToBlob', () => {
  it('converts ImageData to a PNG Blob', async () => {
    const imageData = createImageData(8, 8);
    const blob = await imageDataToBlob(imageData);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/png');
  });

  it('returns a non-empty blob', async () => {
    const imageData = createImageData(4, 4);
    const blob = await imageDataToBlob(imageData);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('blob dimensions match input via round-trip through Image', async () => {
    const width = 10;
    const height = 6;
    const imageData = createImageData(width, height);
    const blob = await imageDataToBlob(imageData);

    const url = URL.createObjectURL(blob);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = url;
      });
      expect(img.naturalWidth).toBe(width);
      expect(img.naturalHeight).toBe(height);
    } finally {
      URL.revokeObjectURL(url);
    }
  });
});

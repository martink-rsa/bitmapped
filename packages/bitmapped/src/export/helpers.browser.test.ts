import { describe, it, expect, vi, afterEach } from 'vitest';
import { downloadBlob } from './helpers.js';

describe('downloadBlob', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates and revokes an object URL', async () => {
    const createObjectURL = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:fake-url');
    const revokeObjectURL = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      () => undefined,
    );

    const blob = new Blob(['test'], { type: 'image/png' });
    downloadBlob(blob, 'test.png');

    expect(createObjectURL).toHaveBeenCalledWith(blob);

    // revokeObjectURL fires inside a 100ms setTimeout — wait 150ms
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
  });

  it('creates an anchor with the correct href and download attribute', () => {
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

    const blob = new Blob(['pixels'], { type: 'image/png' });
    downloadBlob(blob, 'my-image.png');

    expect(capturedAnchor).not.toBeNull();
    expect(capturedAnchor!.href).toBe('blob:fake-url');
    expect(capturedAnchor!.download).toBe('my-image.png');
  });

  it('calls click() on the anchor element', () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    const blob = new Blob(['data'], { type: 'image/png' });
    downloadBlob(blob, 'download.png');

    expect(clickSpy).toHaveBeenCalledOnce();
  });
});

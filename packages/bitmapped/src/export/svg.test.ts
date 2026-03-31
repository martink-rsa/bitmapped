import { describe, it, expect } from 'vitest';
import { imageDataToSVG, toSVGBlob } from './svg.js';

function createImageData(
  width: number,
  height: number,
  pixels: number[],
): ImageData {
  return {
    width,
    height,
    data: new Uint8ClampedArray(pixels),
    colorSpace: 'srgb',
  };
}

describe('imageDataToSVG', () => {
  it('1x1 image produces valid SVG with one rect', () => {
    const img = createImageData(1, 1, [255, 0, 0, 255]);
    const svg = imageDataToSVG(img);
    expect(svg).toContain('<rect');
    const rectMatches = svg.match(/<rect /g);
    expect(rectMatches).toHaveLength(1);
  });

  it('SVG has correct width/height attributes matching ImageData dimensions', () => {
    const img = createImageData(3, 5, new Array(3 * 5 * 4).fill(0));
    const svg = imageDataToSVG(img);
    expect(svg).toContain('width="3"');
    expect(svg).toContain('height="5"');
  });

  it('single-color image merges all pixels per row into one wide rect', () => {
    // 4x2 image, all black
    const pixels = new Array(4 * 2 * 4).fill(0);
    // Set alpha to 255 for all pixels
    for (let i = 3; i < pixels.length; i += 4) {
      pixels[i] = 255;
    }
    const img = createImageData(4, 2, pixels);
    const svg = imageDataToSVG(img);

    // Should have exactly 2 rects (one per row), each with width="4"
    const rectMatches = svg.match(/<rect /g);
    expect(rectMatches).toHaveLength(2);
    expect(svg).toContain('width="4"');
  });

  it('alternating colors produce individual rects (no merging)', () => {
    // 4x1 image: red, green, red, green
    const img = createImageData(
      4,
      1,
      [255, 0, 0, 255, 0, 255, 0, 255, 255, 0, 0, 255, 0, 255, 0, 255],
    );
    const svg = imageDataToSVG(img);
    const rectMatches = svg.match(/<rect /g);
    expect(rectMatches).toHaveLength(4);
    // Each rect should have width="1"
    const widthMatches = svg.match(/width="1"/g);
    expect(widthMatches).toHaveLength(4);
  });

  it('SVG starts with <svg xmlns= and ends with </svg>', () => {
    const img = createImageData(1, 1, [0, 0, 0, 255]);
    const svg = imageDataToSVG(img);
    expect(svg).toMatch(/^<svg xmlns="/);
    expect(svg).toMatch(/<\/svg>$/);
  });

  it('shape-rendering="crispEdges" attribute present', () => {
    const img = createImageData(1, 1, [0, 0, 0, 255]);
    const svg = imageDataToSVG(img);
    expect(svg).toContain('shape-rendering="crispEdges"');
  });

  it('rect fill colors are correct hex values', () => {
    // Red pixel
    const img = createImageData(1, 1, [255, 0, 0, 255]);
    const svg = imageDataToSVG(img);
    expect(svg).toContain('fill="#ff0000"');
  });

  it('2x2 image with different colors produces correct rects', () => {
    // Row 0: red, green; Row 1: blue, white
    const img = createImageData(
      2,
      2,
      [255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255],
    );
    const svg = imageDataToSVG(img);
    const rectMatches = svg.match(/<rect /g);
    expect(rectMatches).toHaveLength(4);

    expect(svg).toContain('fill="#ff0000"');
    expect(svg).toContain('fill="#00ff00"');
    expect(svg).toContain('fill="#0000ff"');
    expect(svg).toContain('fill="#ffffff"');
  });

  it('transparent pixels are skipped (no rect emitted)', () => {
    // 2x1 image: one opaque red, one fully transparent
    const img = createImageData(2, 1, [255, 0, 0, 255, 0, 0, 0, 0]);
    const svg = imageDataToSVG(img);
    const rectMatches = svg.match(/<rect /g);
    expect(rectMatches).toHaveLength(1);
    expect(svg).toContain('fill="#ff0000"');
  });

  it('semi-transparent pixels include opacity attribute', () => {
    // 1x1 image with alpha = 128
    const img = createImageData(1, 1, [255, 0, 0, 128]);
    const svg = imageDataToSVG(img);
    expect(svg).toContain('opacity="0.502"');
  });

  it('multi-row image: each row processed independently', () => {
    // 3x2 image: row 0 all red (should merge to 1 rect),
    // row 1: red, green, red (should produce 3 rects)
    const img = createImageData(
      3,
      2,
      [
        // Row 0: red, red, red
        255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255,
        // Row 1: red, green, red
        255, 0, 0, 255, 0, 255, 0, 255, 255, 0, 0, 255,
      ],
    );
    const svg = imageDataToSVG(img);
    const rectMatches = svg.match(/<rect /g);
    // Row 0: 1 merged rect; Row 1: 3 individual rects
    expect(rectMatches).toHaveLength(4);

    // Row 0 merged rect should have width="3"
    expect(svg).toContain(
      '<rect x="0" y="0" width="3" height="1" fill="#ff0000"/>',
    );
    // Row 1 rects
    expect(svg).toContain(
      '<rect x="0" y="1" width="1" height="1" fill="#ff0000"/>',
    );
    expect(svg).toContain(
      '<rect x="1" y="1" width="1" height="1" fill="#00ff00"/>',
    );
    expect(svg).toContain(
      '<rect x="2" y="1" width="1" height="1" fill="#ff0000"/>',
    );
  });
});

describe('toSVGBlob', () => {
  it('returns a Blob with SVG MIME type', () => {
    const img = createImageData(1, 1, [255, 0, 0, 255]);
    const blob = toSVGBlob(img);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/svg+xml');
  });

  it('blob size is positive', () => {
    const img = createImageData(
      2,
      2,
      [0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255],
    );
    const blob = toSVGBlob(img);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('blob text matches imageDataToSVG output', async () => {
    const img = createImageData(2, 1, [255, 0, 0, 255, 0, 255, 0, 255]);
    const blob = toSVGBlob(img);
    const text = await blob.text();
    const expected = imageDataToSVG(img);
    expect(text).toBe(expected);
  });
});

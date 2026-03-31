import { describe, it, expect } from 'vitest';
import type { Palette } from '../core/types.js';
import {
  createPaletteMatcher,
  findNearestColor,
  findNearestColors,
  mapImageToPalette,
} from './match.js';

const testPalette: Palette = [
  { color: { r: 255, g: 0, b: 0 }, name: 'Red' },
  { color: { r: 0, g: 255, b: 0 }, name: 'Green' },
  { color: { r: 0, g: 0, b: 255 }, name: 'Blue' },
  { color: { r: 255, g: 255, b: 0 }, name: 'Yellow' },
  { color: { r: 0, g: 0, b: 0 }, name: 'Black' },
  { color: { r: 255, g: 255, b: 255 }, name: 'White' },
];

describe('findNearestColor', () => {
  it('matches red input to the red palette entry', () => {
    const result = findNearestColor({ r: 250, g: 10, b: 5 }, testPalette);
    expect(result.name).toBe('Red');
  });

  it('matches blue input to the blue palette entry', () => {
    const result = findNearestColor({ r: 10, g: 5, b: 240 }, testPalette);
    expect(result.name).toBe('Blue');
  });

  it('matches black input to the black palette entry', () => {
    const result = findNearestColor({ r: 5, g: 5, b: 5 }, testPalette);
    expect(result.name).toBe('Black');
  });

  it('matches exact palette color to itself', () => {
    const result = findNearestColor({ r: 255, g: 255, b: 0 }, testPalette);
    expect(result.name).toBe('Yellow');
  });
});

describe('createPaletteMatcher', () => {
  it('returns a working closure', () => {
    const matcher = createPaletteMatcher(testPalette, 'euclidean');
    const result = matcher({ r: 200, g: 10, b: 10 });
    expect(result.name).toBe('Red');
  });

  it('works with different algorithms', () => {
    const algorithms = ['euclidean', 'redmean', 'oklab'] as const;
    for (const algo of algorithms) {
      const matcher = createPaletteMatcher(testPalette, algo);
      const result = matcher({ r: 0, g: 240, b: 10 });
      expect(result.name).toBe('Green');
    }
  });
});

describe('findNearestColors', () => {
  it('returns the correct number of results', () => {
    const results = findNearestColors({ r: 255, g: 0, b: 0 }, testPalette, 3);
    expect(results).toHaveLength(3);
  });

  it('returns results sorted by distance (closest first)', () => {
    const results = findNearestColors({ r: 255, g: 0, b: 0 }, testPalette, 3);
    expect(results[0]!.name).toBe('Red');
  });

  it('handles n larger than palette size', () => {
    const results = findNearestColors(
      { r: 128, g: 128, b: 128 },
      testPalette,
      100,
    );
    expect(results).toHaveLength(testPalette.length);
  });
});

describe('mapImageToPalette', () => {
  it('maps all pixels to palette colors', () => {
    const data = new Uint8ClampedArray([
      200,
      10,
      10,
      255, // near red
      10,
      200,
      10,
      255, // near green
      10,
      10,
      200,
      255, // near blue
      5,
      5,
      5,
      255, // near black
    ]);
    const imgData = new ImageData(data, 2, 2);

    const result = mapImageToPalette(imgData, testPalette, 'euclidean');

    expect(result.width).toBe(2);
    expect(result.height).toBe(2);

    // Check that each pixel is now exactly a palette color
    expect(result.data[0]).toBe(255); // red -> Red
    expect(result.data[1]).toBe(0);
    expect(result.data[2]).toBe(0);

    expect(result.data[4]).toBe(0); // green -> Green
    expect(result.data[5]).toBe(255);
    expect(result.data[6]).toBe(0);
  });

  it('does not modify the input ImageData', () => {
    const data = new Uint8ClampedArray([128, 128, 128, 255]);
    const imgData = new ImageData(data, 1, 1);
    const originalData = new Uint8ClampedArray(data);

    mapImageToPalette(imgData, testPalette);

    expect(imgData.data).toEqual(originalData);
  });

  it('preserves alpha channel at 255', () => {
    const data = new Uint8ClampedArray([128, 128, 128, 255]);
    const imgData = new ImageData(data, 1, 1);
    const result = mapImageToPalette(imgData, testPalette);
    expect(result.data[3]).toBe(255);
  });
});

describe('findNearestColors edge cases', () => {
  it('throws for empty palette', () => {
    expect(() => findNearestColors({ r: 128, g: 128, b: 128 }, [], 3)).toThrow(
      'empty palette',
    );
  });
});

describe('findNearestColors sorting', () => {
  it('returns results in ascending distance order', () => {
    const results = findNearestColors(
      { r: 128, g: 128, b: 128 },
      testPalette,
      testPalette.length,
    );

    // First result should be closest, last should be farthest
    expect(results).toHaveLength(testPalette.length);
    // White or Black should be closest to mid-gray
    const firstName = results[0]!.name;
    expect(['White', 'Black']).toContain(firstName);
  });
});

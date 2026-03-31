/**
 * Generate sample images for the docs site demos.
 * Run with: node apps/docs/scripts/generate-samples.mjs
 *
 * Creates gradient.png and geometric.png using Node canvas.
 * For landscape.png and portrait.png, use the existing repo images
 * or any small royalty-free images resized to fit.
 */

import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'images', 'examples');

if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

// We can't use canvas in a basic Node script without native deps.
// Instead, generate raw PPM files and note that actual PNG generation
// requires a canvas library or external tool.

function generatePPM(width, height, pixelFn) {
  const header = `P6\n${width} ${height}\n255\n`;
  const data = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixelFn(x, y, width, height);
      const offset = (y * width + x) * 3;
      data[offset] = r;
      data[offset + 1] = g;
      data[offset + 2] = b;
    }
  }
  return Buffer.concat([Buffer.from(header, 'ascii'), data]);
}

// Gradient: smooth RGB gradient (256×192)
const gradient = generatePPM(256, 192, (x, y, w, h) => {
  const r = Math.floor((x / w) * 255);
  const g = Math.floor((y / h) * 255);
  const b = Math.floor(((w - x) / w) * 255);
  return [r, g, b];
});
writeFileSync(join(outDir, 'gradient.ppm'), gradient);

// Geometric: bold shapes (320×240)
const geometric = generatePPM(320, 240, (x, y, w, h) => {
  const cx = w / 2, cy = h / 2;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

  // Concentric bands
  if (dist < 40) return [255, 60, 60];
  if (dist < 70) return [60, 180, 60];
  if (dist < 100) return [60, 60, 255];

  // Diagonal stripes
  const stripe = Math.floor((x + y) / 20) % 4;
  if (stripe === 0) return [255, 200, 0];
  if (stripe === 1) return [0, 180, 200];
  if (stripe === 2) return [200, 0, 180];
  return [30, 30, 50];
});
writeFileSync(join(outDir, 'geometric.ppm'), geometric);

console.log(`Generated PPM files in ${outDir}`);
console.log('Convert to PNG with: convert gradient.ppm gradient.png');
console.log('Or use any image editor to save as PNG.');
console.log('');
console.log('For landscape.png and portrait.png, resize the repo sample images:');
console.log('  cp ../../RGB-24bits-palette-sample-image.jpg landscape source');
console.log('  Then resize to ~400x300 and save as PNG');

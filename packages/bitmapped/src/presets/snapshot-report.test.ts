import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { listPresets } from './registry.js';
import type { HardwarePreset } from '../core/types.js';

const FIXTURES_DIR = path.join(__dirname, '..', '__fixtures__');
const SOURCES_DIR = path.join(FIXTURES_DIR, 'sources');
const SNAPSHOTS_DIR = path.join(FIXTURES_DIR, 'snapshots');
const REPORT_DIR = path.join(SNAPSHOTS_DIR, '__report__');

const CATEGORY_LABELS: Record<string, string> = {
  computer: 'Computers',
  nintendo: 'Nintendo',
  sega: 'Sega',
  'ibm-pc': 'IBM PC',
  arcade: 'Arcade',
  fantasy: 'Fantasy',
  other: 'Other',
};

const CATEGORY_ORDER = [
  'computer',
  'nintendo',
  'sega',
  'ibm-pc',
  'arcade',
  'fantasy',
  'other',
];

interface PresetEntry {
  preset: HardwarePreset;
  colorTestChart: Buffer;
  sampleImage: Buffer;
}

function collectImages(): PresetEntry[] {
  return listPresets()
    .filter((preset) => {
      const dir = path.join(SNAPSHOTS_DIR, preset.id);
      return (
        fs.existsSync(path.join(dir, 'color-test-chart.png')) &&
        fs.existsSync(path.join(dir, 'sample-image.png'))
      );
    })
    .map((preset) => ({
      preset,
      colorTestChart: fs.readFileSync(
        path.join(SNAPSHOTS_DIR, preset.id, 'color-test-chart.png'),
      ),
      sampleImage: fs.readFileSync(
        path.join(SNAPSHOTS_DIR, preset.id, 'sample-image.png'),
      ),
    }));
}

function groupByCategory(entries: PresetEntry[]): Map<string, PresetEntry[]> {
  const grouped = new Map<string, PresetEntry[]>();
  for (const entry of entries) {
    const cat = entry.preset.category;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(entry);
  }
  return grouped;
}

function getImageDimensions(pngBuffer: Buffer): {
  width: number;
  height: number;
} {
  const png = PNG.sync.read(pngBuffer);
  return { width: png.width, height: png.height };
}

// ---------------------------------------------------------------------------
// HTML Report
// ---------------------------------------------------------------------------

function generateHTML(entries: PresetEntry[]): string {
  const grouped = groupByCategory(entries);
  const sourceChart = fs.readFileSync(
    path.join(SOURCES_DIR, 'color-test-chart.png'),
  );
  const sourceSample = fs.readFileSync(
    path.join(SOURCES_DIR, 'sample-image.png'),
  );
  const date = new Date().toISOString().slice(0, 10);

  let categorySections = '';
  for (const cat of CATEGORY_ORDER) {
    const items = grouped.get(cat);
    if (!items || items.length === 0) continue;
    const label = CATEGORY_LABELS[cat] ?? cat;

    let cards = '';
    for (const entry of items) {
      const b64Chart = entry.colorTestChart.toString('base64');
      const b64Sample = entry.sampleImage.toString('base64');
      cards += `
      <div class="card">
        <div class="card-header">
          <span class="preset-name">${entry.preset.name}</span>
          <span class="preset-id">${entry.preset.id}</span>
        </div>
        <div class="card-images">
          <figure>
            <img src="data:image/png;base64,${b64Chart}" alt="${entry.preset.id} color-test-chart">
            <figcaption>color-test-chart</figcaption>
          </figure>
          <figure>
            <img src="data:image/png;base64,${b64Sample}" alt="${entry.preset.id} sample-image">
            <figcaption>sample-image</figcaption>
          </figure>
        </div>
      </div>`;
    }

    categorySections += `
    <section class="category">
      <h2>${label}</h2>
      <div class="category-grid">${cards}
      </div>
    </section>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bitmapped — Preset Snapshot Report</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0c0c18;
    --surface: #161628;
    --border: #2a2a4a;
    --text: #e4e4ef;
    --text-muted: #8888a0;
    --accent: #818cf8;
    --accent-dim: #4f46e5;
  }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    max-width: 1440px;
    margin: 0 auto;
    padding: 2.5rem 2rem;
    line-height: 1.5;
  }
  header { text-align: center; margin-bottom: 3rem; }
  header h1 {
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 0.5rem;
  }
  header h1 span { color: var(--accent); }
  header .meta { color: var(--text-muted); font-size: 0.9rem; }
  .sources {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 3rem;
  }
  .sources h2 {
    font-size: 1rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 1rem;
  }
  .sources .source-images {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
  }
  .sources figure { text-align: center; }
  .sources figcaption {
    color: var(--text-muted);
    font-size: 0.8rem;
    margin-top: 0.5rem;
    font-family: 'SF Mono', 'Fira Code', monospace;
  }
  .sources img {
    image-rendering: pixelated;
    border: 1px solid var(--border);
    border-radius: 4px;
    height: 200px;
    width: auto;
  }
  .category { margin-bottom: 2.5rem; }
  .category > h2 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--accent);
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
  }
  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
    gap: 1rem;
  }
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 1rem;
    transition: border-color 0.15s;
  }
  .card:hover { border-color: var(--accent-dim); }
  .card-header {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }
  .preset-name { font-weight: 600; font-size: 0.95rem; }
  .preset-id {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 0.8rem;
    color: var(--text-muted);
  }
  .card-images {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .card-images figure { text-align: center; }
  .card-images figcaption {
    color: var(--text-muted);
    font-size: 0.75rem;
    margin-top: 0.4rem;
    font-family: 'SF Mono', 'Fira Code', monospace;
  }
  .card-images img {
    image-rendering: pixelated;
    border: 1px solid var(--border);
    border-radius: 3px;
    height: 160px;
    width: auto;
  }

  @media print {
    body { background: #fff; color: #111; padding: 1rem; }
    :root { --surface: #f5f5f5; --border: #ccc; --text: #111; --text-muted: #666; --accent: #4f46e5; }
    .card:hover { border-color: var(--border); }
    .category-grid { grid-template-columns: repeat(2, 1fr); }
    .card-images img { height: 120px; }
    .sources img { height: 150px; }
    .category { break-inside: avoid; }
    .card { break-inside: avoid; }
  }
</style>
</head>
<body>
<header>
  <h1><span>bitmapped</span> Preset Snapshot Report</h1>
  <p class="meta">Generated ${date} &middot; ${entries.length} presets &middot; ${entries.length * 2} images</p>
</header>

<div class="sources">
  <h2>Source Images</h2>
  <div class="source-images">
    <figure>
      <img src="data:image/png;base64,${sourceChart.toString('base64')}" alt="color-test-chart source">
      <figcaption>color-test-chart.png (258 &times; 200)</figcaption>
    </figure>
    <figure>
      <img src="data:image/png;base64,${sourceSample.toString('base64')}" alt="sample-image source">
      <figcaption>sample-image.png (150 &times; 200)</figcaption>
    </figure>
  </div>
</div>
${categorySections}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// PDF Report
// ---------------------------------------------------------------------------

function scaleToFit(
  origW: number,
  origH: number,
  maxW: number,
  maxH: number,
): { width: number; height: number } {
  const scale = Math.min(maxW / origW, maxH / origH, 1);
  return { width: origW * scale, height: origH * scale };
}

async function generatePDF(entries: PresetEntry[]): Promise<Uint8Array> {
  const grouped = groupByCategory(entries);
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const W = 595.28;
  const H = 841.89;
  const M = 40; // margin
  const CW = W - 2 * M; // content width
  const COL_GAP = 16;
  const COL_W = (CW - COL_GAP) / 2;
  const IMG_MAX_H = 160;
  const PRESET_GAP = 24;
  const CAT_HEADER_H = 32;

  const BG = rgb(0.047, 0.047, 0.094); // #0c0c18
  const SURFACE = rgb(0.086, 0.086, 0.157); // #161628
  const TEXT_COLOR = rgb(0.894, 0.894, 0.937);
  const MUTED = rgb(0.533, 0.533, 0.627);
  const ACCENT = rgb(0.506, 0.549, 0.973);

  function newPage() {
    const page = pdfDoc.addPage([W, H]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: W,
      height: H,
      color: BG,
    });
    return page;
  }

  // --- Title page ---
  const titlePage = newPage();

  titlePage.drawText('bitmapped', {
    x: M,
    y: H - M - 40,
    size: 36,
    font: fontBold,
    color: ACCENT,
  });
  titlePage.drawText('Preset Snapshot Report', {
    x: M,
    y: H - M - 72,
    size: 20,
    font: fontRegular,
    color: TEXT_COLOR,
  });

  const date = new Date().toISOString().slice(0, 10);
  titlePage.drawText(
    `Generated ${date}  •  ${entries.length} presets  •  ${entries.length * 2} images`,
    {
      x: M,
      y: H - M - 100,
      size: 10,
      font: fontRegular,
      color: MUTED,
    },
  );

  // Source images on title page
  const sourceChartBuf = fs.readFileSync(
    path.join(SOURCES_DIR, 'color-test-chart.png'),
  );
  const sourceSampleBuf = fs.readFileSync(
    path.join(SOURCES_DIR, 'sample-image.png'),
  );
  const srcChartImg = await pdfDoc.embedPng(sourceChartBuf);
  const srcSampleImg = await pdfDoc.embedPng(sourceSampleBuf);

  titlePage.drawText('Source Images', {
    x: M,
    y: H - M - 140,
    size: 12,
    font: fontBold,
    color: TEXT_COLOR,
  });

  const srcChartDims = scaleToFit(
    srcChartImg.width,
    srcChartImg.height,
    COL_W,
    200,
  );
  const srcSampleDims = scaleToFit(
    srcSampleImg.width,
    srcSampleImg.height,
    COL_W,
    200,
  );
  const srcY = H - M - 160;

  titlePage.drawImage(srcChartImg, {
    x: M,
    y: srcY - srcChartDims.height,
    width: srcChartDims.width,
    height: srcChartDims.height,
  });
  titlePage.drawText('color-test-chart.png', {
    x: M,
    y: srcY - srcChartDims.height - 14,
    size: 8,
    font: fontRegular,
    color: MUTED,
  });

  titlePage.drawImage(srcSampleImg, {
    x: M + COL_W + COL_GAP,
    y: srcY - srcSampleDims.height,
    width: srcSampleDims.width,
    height: srcSampleDims.height,
  });
  titlePage.drawText('sample-image.png', {
    x: M + COL_W + COL_GAP,
    y: srcY - srcSampleDims.height - 14,
    size: 8,
    font: fontRegular,
    color: MUTED,
  });

  // --- Preset pages ---
  let page = newPage();
  let y = H - M;

  async function ensureSpace(needed: number) {
    if (y - needed < M) {
      page = newPage();
      y = H - M;
    }
  }

  for (const cat of CATEGORY_ORDER) {
    const items = grouped.get(cat);
    if (!items || items.length === 0) continue;

    await ensureSpace(CAT_HEADER_H + 250);

    // Category header
    const label = CATEGORY_LABELS[cat] ?? cat;
    y -= 6;
    page.drawRectangle({
      x: M,
      y: y - CAT_HEADER_H + 6,
      width: CW,
      height: 1,
      color: ACCENT,
    });
    page.drawText(label, {
      x: M,
      y: y - CAT_HEADER_H + 12,
      size: 14,
      font: fontBold,
      color: ACCENT,
    });
    y -= CAT_HEADER_H + 8;

    for (const entry of items) {
      const chartDims = getImageDimensions(entry.colorTestChart);
      const sampleDims = getImageDimensions(entry.sampleImage);

      const scaledChart = scaleToFit(
        chartDims.width,
        chartDims.height,
        COL_W,
        IMG_MAX_H,
      );
      const scaledSample = scaleToFit(
        sampleDims.width,
        sampleDims.height,
        COL_W,
        IMG_MAX_H,
      );
      const rowImgH = Math.max(scaledChart.height, scaledSample.height);
      const rowH = 22 + rowImgH + 16 + PRESET_GAP;

      await ensureSpace(rowH);

      // Preset name
      page.drawText(entry.preset.name, {
        x: M,
        y: y - 14,
        size: 11,
        font: fontBold,
        color: TEXT_COLOR,
      });
      page.drawText(`  ${entry.preset.id}`, {
        x: M + fontBold.widthOfTextAtSize(entry.preset.name, 11),
        y: y - 14,
        size: 9,
        font: fontRegular,
        color: MUTED,
      });
      y -= 22;

      // Card background
      page.drawRectangle({
        x: M - 6,
        y: y - rowImgH - 20,
        width: CW + 12,
        height: rowImgH + 24,
        color: SURFACE,
        borderColor: rgb(0.165, 0.165, 0.29),
        borderWidth: 0.5,
      });

      // Images
      const chartImg = await pdfDoc.embedPng(entry.colorTestChart);
      const sampleImg = await pdfDoc.embedPng(entry.sampleImage);

      page.drawImage(chartImg, {
        x: M,
        y: y - scaledChart.height - 4,
        width: scaledChart.width,
        height: scaledChart.height,
      });
      page.drawImage(sampleImg, {
        x: M + COL_W + COL_GAP,
        y: y - scaledSample.height - 4,
        width: scaledSample.width,
        height: scaledSample.height,
      });

      y -= rowImgH + 16 + PRESET_GAP;
    }
  }

  return pdfDoc.save();
}

// ---------------------------------------------------------------------------
// Test entry point
// ---------------------------------------------------------------------------

describe('Snapshot Report', () => {
  it('generates HTML and PDF report', async () => {
    const entries = collectImages();
    expect(entries.length).toBeGreaterThan(0);

    fs.mkdirSync(REPORT_DIR, { recursive: true });

    const html = generateHTML(entries);
    const htmlPath = path.join(REPORT_DIR, 'snapshot-report.html');
    fs.writeFileSync(htmlPath, html);

    const pdfBytes = await generatePDF(entries);
    const pdfPath = path.join(REPORT_DIR, 'snapshot-report.pdf');
    fs.writeFileSync(pdfPath, pdfBytes);

    console.log(`HTML report: ${htmlPath}`);
    console.log(`PDF report:  ${pdfPath}`);
  }, 120_000);
});

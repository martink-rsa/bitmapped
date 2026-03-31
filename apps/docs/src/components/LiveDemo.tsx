'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import type { DitheringAlgorithm, ProcessOptions } from 'bitmapped';
import { process } from 'bitmapped';
import { getPreset, listPresets } from 'bitmapped/presets';
import { getPaletteForPreset } from '../lib/preset-data';

interface LiveDemoProps {
  defaultPreset?: string;
  showPresetSelector?: boolean;
  showDitheringControls?: boolean;
  showConstraintToggle?: boolean;
  allowUpload?: boolean;
  sampleImage?: string;
  displayWidth?: number;
  showComparison?: boolean;
}

const DITHERING_OPTIONS: DitheringAlgorithm[] = [
  'none',
  'floyd-steinberg',
  'atkinson',
  'bayer',
  'blue-noise',
  'ps1-ordered',
];

export function LiveDemo({
  defaultPreset = 'gameboy-dmg',
  showPresetSelector = true,
  showDitheringControls = true,
  showConstraintToggle = false,
  allowUpload = false,
  sampleImage,
  displayWidth = 512,
  showComparison = false,
}: LiveDemoProps) {
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);
  const [presetId, setPresetId] = useState(defaultPreset);
  const [dithering, setDithering] = useState<DitheringAlgorithm>('none');
  const [enforceConstraints, setEnforceConstraints] = useState(true);
  const [sourceImageData, setSourceImageData] = useState<ImageData | null>(
    null,
  );
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const allPresets = listPresets();
  const preset = getPreset(presetId);

  // Load sample image on mount
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = sampleImage ?? '/images/examples/landscape.jpg';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height);
      setSourceImageData(data);
    };
    img.onerror = () => {
      // Generate a simple gradient as fallback
      const w = 256;
      const h = 192;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const r = Math.floor((x / w) * 255);
          const g = Math.floor((y / h) * 255);
          const b = Math.floor(((w - x) / w) * 255);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
      setSourceImageData(ctx.getImageData(0, 0, w, h));
    };
  }, [sampleImage]);

  // Draw original
  useEffect(() => {
    if (!sourceImageData || !originalCanvasRef.current) return;
    const canvas = originalCanvasRef.current;
    canvas.width = sourceImageData.width;
    canvas.height = sourceImageData.height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(sourceImageData, 0, 0);
  }, [sourceImageData]);

  // Process image when inputs change
  const processImage = useCallback(() => {
    if (!sourceImageData || !preset) return;

    setProcessing(true);
    setError(null);

    // Use setTimeout to avoid blocking UI
    setTimeout(() => {
      try {
        const palette = getPaletteForPreset(preset);
        const options: ProcessOptions = {
          blockSize: Math.max(
            1,
            Math.floor(sourceImageData.width / preset.resolution.width),
          ),
          palette,
          dithering,
          distanceAlgorithm: 'redmean',
        };

        if (enforceConstraints && preset.constraintType) {
          options.constraintType = preset.constraintType;
          if (preset.attributeBlock) {
            options.attributeBlockConfig = {
              width: preset.attributeBlock.width,
              height: preset.attributeBlock.height,
              maxColors: preset.attributeBlock.maxColors,
              brightLocked: preset.attributeBlock.brightLocked,
              globalBackground: preset.attributeBlock.globalBackground,
            };
          }
          if (preset.paletteLayout && preset.tileSize) {
            options.tilePaletteConfig = {
              tileWidth: preset.tileSize.width,
              tileHeight: preset.tileSize.height,
              subpaletteCount: preset.paletteLayout.subpaletteCount,
              colorsPerSubpalette: preset.paletteLayout.colorsPerSubpalette,
              sharedTransparent: preset.paletteLayout.sharedTransparent,
            };
          }
          if (preset.hamConfig) {
            options.hamConfig = {
              basePaletteSize: preset.hamConfig.basePaletteSize,
              modifyBits: preset.hamConfig.modifyBits,
            };
          }
          if (preset.scanlineLimits?.maxColors) {
            options.scanlineConfig = {
              maxColorsPerLine: preset.scanlineLimits.maxColors,
            };
          }
          if (preset.artifactConfig) {
            options.artifactConfig = {
              pixelsPerGroup: preset.artifactConfig.pixelsPerGroup,
              paletteSets: preset.artifactConfig.paletteSets,
            };
          }
        }

        const result = process(sourceImageData, options);

        if (outputCanvasRef.current) {
          const canvas = outputCanvasRef.current;
          canvas.width = result.imageData.width;
          canvas.height = result.imageData.height;
          const ctx = canvas.getContext('2d')!;
          ctx.putImageData(result.imageData, 0, 0);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Processing failed');
      } finally {
        setProcessing(false);
      }
    }, 0);
  }, [sourceImageData, preset, dithering, enforceConstraints]);

  // Debounced processing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(processImage, 150);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [processImage]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      setSourceImageData(ctx.getImageData(0, 0, img.width, img.height));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleDownload = () => {
    if (!outputCanvasRef.current) return;
    const link = document.createElement('a');
    link.download = `bitmapped-${presetId}.png`;
    link.href = outputCanvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="live-demo">
      <div className="live-demo-controls">
        {showPresetSelector && (
          <label>
            System
            <select
              value={presetId}
              onChange={(e) => setPresetId(e.target.value)}
            >
              {allPresets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {showDitheringControls && (
          <label>
            Dithering
            <select
              value={dithering}
              onChange={(e) =>
                setDithering(e.target.value as DitheringAlgorithm)
              }
            >
              {DITHERING_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        )}
        {showConstraintToggle && (
          <label style={{ flexDirection: 'row', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={enforceConstraints}
              onChange={(e) => setEnforceConstraints(e.target.checked)}
            />
            Enforce constraints
          </label>
        )}
        {allowUpload && (
          <label>
            Upload image
            <input type="file" accept="image/*" onChange={handleUpload} />
          </label>
        )}
        <button
          onClick={handleDownload}
          style={{
            padding: '0.4rem 0.8rem',
            borderRadius: 4,
            border: '1px solid rgba(128,128,128,0.3)',
            background: 'rgba(128,128,128,0.1)',
            cursor: 'pointer',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.8rem',
            color: 'inherit',
          }}
        >
          Download PNG
        </button>
        {processing && <span className="demo-spinner" />}
      </div>

      {error && (
        <div
          style={{
            color: '#ff6b6b',
            fontSize: '0.85rem',
            marginBottom: '0.5rem',
          }}
        >
          {error}
        </div>
      )}

      <div className="live-demo-canvas-wrapper">
        {showComparison && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '0.75rem',
                opacity: 0.6,
                marginBottom: 4,
              }}
            >
              Original
            </div>
            <canvas
              ref={originalCanvasRef}
              className="demo-canvas"
              style={{ maxWidth: displayWidth / 2, height: 'auto' }}
            />
          </div>
        )}
        <div style={{ textAlign: 'center' }}>
          {showComparison && (
            <div
              style={{
                fontSize: '0.75rem',
                opacity: 0.6,
                marginBottom: 4,
              }}
            >
              {preset?.name ?? presetId}
            </div>
          )}
          <canvas
            ref={outputCanvasRef}
            className="demo-canvas"
            style={{
              maxWidth: showComparison ? displayWidth / 2 : displayWidth,
              height: 'auto',
            }}
          />
        </div>
      </div>
    </div>
  );
}

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Clipboard,
  SplitSquareVertical,
  Columns2,
  ToggleLeft,
  Image,
  ImageOff,
  X,
} from 'lucide-react';
import type { HardwarePreset, ProcessResult } from 'bitmapped';
import styles from './Canvas.module.css';

interface CanvasPanelProps {
  sourceImageData: ImageData;
  processResult: ProcessResult | null;
  processing: boolean;
  processingTime: number;
  activePreset: HardwarePreset | undefined;
  comparisonMode: 'output' | 'original' | 'slider' | 'side-by-side' | 'toggle';
  onComparisonModeChange: (
    mode: 'output' | 'original' | 'slider' | 'side-by-side' | 'toggle',
  ) => void;
  exportScale: number;
  correctPAR: boolean;
  sourceFileName: string;
  onCancelProcessing: () => void;
  error: string | null;
}

export function CanvasPanel({
  sourceImageData,
  processResult,
  processing,
  processingTime,
  activePreset,
  comparisonMode,
  onComparisonModeChange,
  exportScale,
  correctPAR,
  sourceFileName,
  onCancelProcessing,
  error,
}: CanvasPanelProps) {
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [fitZoom, setFitZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const [sliderPos, setSliderPos] = useState(0.5);
  const [isHovering, setIsHovering] = useState(false);
  const isDraggingSlider = useRef(false);

  const imgW = sourceImageData.width;
  const imgH = sourceImageData.height;

  // Calculate fit zoom
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const obs = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width: vw, height: vh } = entry.contentRect;
      const fit = Math.min(vw / imgW, vh / imgH, 4);
      setFitZoom(fit);
      setZoom(fit);
      setPanOffset({ x: 0, y: 0 });
    });
    obs.observe(viewport);
    return () => obs.disconnect();
  }, [imgW, imgH]);

  // Draw original canvas
  useEffect(() => {
    const canvas = originalCanvasRef.current;
    if (!canvas) return;
    canvas.width = imgW;
    canvas.height = imgH;
    canvas.getContext('2d')?.putImageData(sourceImageData, 0, 0);
  }, [sourceImageData, imgW, imgH, comparisonMode]);

  // Draw processed canvas
  useEffect(() => {
    const canvas = processedCanvasRef.current;
    if (!canvas) return;
    const data = processResult?.imageData ?? sourceImageData;
    canvas.width = data.width;
    canvas.height = data.height;
    canvas.getContext('2d')?.putImageData(data, 0, 0);
  }, [processResult, sourceImageData, comparisonMode]);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(z * 2, 32)), []);
  const zoomOut = useCallback(
    () => setZoom((z) => Math.max(z / 2, fitZoom / 2)),
    [fitZoom],
  );
  const zoomFit = useCallback(() => {
    setZoom(fitZoom);
    setPanOffset({ x: 0, y: 0 });
  }, [fitZoom]);

  const zoomPct = Math.round(zoom * 100);

  // Pan
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= fitZoom) return;
      // If in slider mode, check if near the slider line
      if (comparisonMode === 'slider' && processResult) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        if (Math.abs(x - sliderPos) < 0.02) {
          isDraggingSlider.current = true;
          return;
        }
      }
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        ox: panOffset.x,
        oy: panOffset.y,
      };
    },
    [zoom, fitZoom, panOffset, comparisonMode, processResult, sliderPos],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDraggingSlider.current) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = Math.max(
          0,
          Math.min(1, (e.clientX - rect.left) / rect.width),
        );
        setSliderPos(x);
        return;
      }
      if (!isPanning) return;
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPanOffset({
        x: panStartRef.current.ox + dx,
        y: panStartRef.current.oy + dy,
      });
    },
    [isPanning],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    isDraggingSlider.current = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
    isDraggingSlider.current = false;
    setIsHovering(false);
  }, []);

  // Download
  const handleDownload = useCallback(() => {
    const data = processResult?.imageData ?? sourceImageData;
    let w = data.width * exportScale;
    const h = data.height * exportScale;
    if (correctPAR && activePreset) {
      const par = activePreset.par;
      w = Math.round(w * (par.x / par.y));
    }
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    const tmp = document.createElement('canvas');
    tmp.width = data.width;
    tmp.height = data.height;
    tmp.getContext('2d')!.putImageData(data, 0, 0);
    ctx.drawImage(tmp, 0, 0, w, h);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const presetSlug = activePreset?.id ?? 'custom';
      const baseName = sourceFileName.replace(/\.[^.]+$/, '') || 'image';
      a.download = `bitmapped-${presetSlug}-${baseName}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, [
    processResult,
    sourceImageData,
    exportScale,
    correctPAR,
    activePreset,
    sourceFileName,
  ]);

  // Clipboard
  const handleCopy = useCallback(async () => {
    try {
      const data = processResult?.imageData ?? sourceImageData;
      const canvas = document.createElement('canvas');
      canvas.width = data.width;
      canvas.height = data.height;
      canvas.getContext('2d')!.putImageData(data, 0, 0);
      const blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob(res, 'image/png'),
      );
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
      }
    } catch (err) {
      console.warn('Failed to copy image to clipboard:', err);
    }
  }, [processResult, sourceImageData]);

  // Count unique colors in result
  const colorCount = useMemo(
    () => (processResult ? countColors(processResult.imageData) : null),
    [processResult],
  );
  const maxColors = activePreset?.simultaneousColors ?? null;

  const outW = processResult?.imageData.width ?? imgW;
  const outH = processResult?.imageData.height ?? imgH;

  return (
    <div className={styles.panel}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <button
            className={styles.toolbarBtn}
            onClick={zoomOut}
            aria-label="Zoom out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            className={styles.zoomLabel}
            onClick={zoomFit}
            title="Fit to view"
          >
            {zoomPct}%
          </button>
          <button
            className={styles.toolbarBtn}
            onClick={zoomIn}
            aria-label="Zoom in"
          >
            <ZoomIn size={14} />
          </button>
          <button
            className={styles.toolbarBtn}
            onClick={zoomFit}
            aria-label="Fit to view"
          >
            <Maximize2 size={14} />
          </button>
        </div>

        {processResult && (
          <div className={styles.segmented}>
            <button
              className={`${styles.segmentedBtn} ${comparisonMode === 'output' ? styles.segmentedBtnActive : ''}`}
              onClick={() => onComparisonModeChange('output')}
              aria-label="Output only"
              title="Output"
            >
              <Image size={13} />
            </button>
            <button
              className={`${styles.segmentedBtn} ${comparisonMode === 'original' ? styles.segmentedBtnActive : ''}`}
              onClick={() => onComparisonModeChange('original')}
              aria-label="Original only"
              title="Original"
            >
              <ImageOff size={13} />
            </button>
            <button
              className={`${styles.segmentedBtn} ${comparisonMode === 'slider' ? styles.segmentedBtnActive : ''}`}
              onClick={() => onComparisonModeChange('slider')}
              aria-label="Slider comparison"
              title="Slider"
            >
              <SplitSquareVertical size={13} />
            </button>
            <button
              className={`${styles.segmentedBtn} ${comparisonMode === 'side-by-side' ? styles.segmentedBtnActive : ''}`}
              onClick={() => onComparisonModeChange('side-by-side')}
              aria-label="Side by side comparison"
              title="Side by side"
            >
              <Columns2 size={13} />
            </button>
            <button
              className={`${styles.segmentedBtn} ${comparisonMode === 'toggle' ? styles.segmentedBtnActive : ''}`}
              onClick={() => onComparisonModeChange('toggle')}
              aria-label="Toggle comparison"
              title="Toggle on hover"
            >
              <ToggleLeft size={13} />
            </button>
          </div>
        )}

        <div className={styles.toolbarGroup}>
          <button
            className={styles.toolbarBtn}
            onClick={handleCopy}
            aria-label="Copy to clipboard"
            title="Copy to clipboard"
          >
            <Clipboard size={14} />
          </button>
          <button
            className={styles.toolbarBtn}
            onClick={handleDownload}
            aria-label="Download PNG"
            title="Download PNG"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Viewport */}
      <div
        ref={viewportRef}
        className={styles.viewport}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setIsHovering(true)}
        style={{
          cursor: isPanning ? 'grabbing' : zoom > fitZoom ? 'grab' : 'default',
        }}
        role="img"
        aria-label={
          activePreset
            ? `Image processed with ${activePreset.name} preset`
            : 'Source image'
        }
      >
        {error && (
          <div className={styles.errorBanner} role="alert">
            {error}
          </div>
        )}
        {processing && <div className={styles.progressBar} />}
        {processing && (
          <button
            className={styles.cancelBtn}
            onClick={onCancelProcessing}
            aria-label="Cancel processing"
            title="Cancel processing"
          >
            <X size={14} />
          </button>
        )}

        {comparisonMode === 'output' && processResult ? (
          <div
            className={styles.comparisonContainer}
            style={{
              transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
            }}
          >
            <canvas ref={processedCanvasRef} className={styles.canvas} />
          </div>
        ) : comparisonMode === 'original' && processResult ? (
          <div
            className={styles.comparisonContainer}
            style={{
              transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
            }}
          >
            <canvas ref={originalCanvasRef} className={styles.canvas} />
          </div>
        ) : comparisonMode === 'side-by-side' && processResult ? (
          <div
            style={{
              display: 'flex',
              gap: 2,
              transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
            }}
          >
            <div style={{ position: 'relative' }}>
              <canvas ref={originalCanvasRef} className={styles.canvas} />
              <span
                className={`${styles.comparisonLabel} ${styles.comparisonLabelLeft}`}
              >
                Original
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <canvas ref={processedCanvasRef} className={styles.canvas} />
              <span
                className={`${styles.comparisonLabel} ${styles.comparisonLabelLeft}`}
              >
                {activePreset?.name ?? 'Processed'}
              </span>
            </div>
          </div>
        ) : comparisonMode === 'toggle' && processResult ? (
          <div
            className={styles.comparisonContainer}
            style={{
              transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
            }}
          >
            {/* Show original on hover, processed by default */}
            <canvas
              ref={processedCanvasRef}
              className={styles.canvas}
              style={{ display: isHovering ? 'none' : 'block' }}
            />
            <canvas
              ref={originalCanvasRef}
              className={styles.canvas}
              style={{
                display: isHovering ? 'block' : 'none',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />
            <span
              className={`${styles.comparisonLabel} ${styles.comparisonLabelLeft}`}
            >
              {isHovering ? 'Original' : (activePreset?.name ?? 'Processed')}
            </span>
          </div>
        ) : (
          /* Slider mode (default) or no processResult */
          <div
            className={styles.comparisonContainer}
            style={{
              transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
            }}
          >
            <canvas ref={originalCanvasRef} className={styles.canvas} />
            {processResult && (
              <>
                <canvas
                  ref={processedCanvasRef}
                  className={styles.canvas}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    clipPath: `inset(0 ${(1 - sliderPos) * 100}% 0 0)`,
                  }}
                />
                <div
                  className={styles.sliderLine}
                  style={{ left: `${sliderPos * 100}%` }}
                >
                  <div className={styles.sliderHandle} />
                </div>
                <span
                  className={`${styles.comparisonLabel} ${styles.comparisonLabelLeft}`}
                >
                  Original
                </span>
                <span
                  className={`${styles.comparisonLabel} ${styles.comparisonLabelRight}`}
                >
                  {activePreset?.name ?? 'Processed'}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <span>
          {imgW} &times; {imgH}
          {processResult && (
            <>
              {' '}
              &rarr; {outW} &times; {outH}
            </>
          )}
        </span>
        {colorCount !== null && (
          <>
            <span className={styles.footerSep}>|</span>
            <span>
              {colorCount}
              {maxColors ? ` / ${maxColors}` : ''} colors
            </span>
          </>
        )}
        {processingTime > 0 && (
          <>
            <span className={styles.footerSep}>|</span>
            <span className={styles.footerAccent}>
              {processingTime.toFixed(1)}ms
            </span>
          </>
        )}
        {activePreset && (
          <>
            <span className={styles.footerSep}>|</span>
            <span>{activePreset.name}</span>
          </>
        )}
      </div>
    </div>
  );
}

function countColors(imageData: ImageData): number {
  const data = imageData.data;
  const colors = new Set<number>();
  for (let i = 0; i < data.length; i += 4) {
    colors.add((data[i]! << 16) | (data[i + 1]! << 8) | data[i + 2]!);
  }
  return colors.size;
}

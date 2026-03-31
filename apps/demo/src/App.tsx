import { useState, useCallback, useEffect, useMemo } from 'react';
import type {
  DitheringAlgorithm,
  DistanceAlgorithm,
  FilterOptions,
  HardwarePreset,
  Palette,
  ProcessOptions,
} from 'bitmapped';
import { FILTER_DEFAULTS, hasActiveFilters } from 'bitmapped';
import { getPreset, enumerateColorSpace } from 'bitmapped/presets';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { ImageUploadZone } from './components/ImageUpload/ImageUploadZone';
import { CanvasPanel } from './components/Canvas/CanvasPanel';
import { ControlsPanel } from './components/Controls/ControlsPanel';
import { useProcessImage } from './hooks/useProcessImage';
import { useDebounce } from './hooks/useDebounce';
import styles from './App.module.css';

/** Max color space size we'll fully enumerate for processing */
const MAX_ENUMERABLE_COLORS = 32768;

/** Build a Palette from a HardwarePreset (handles both fixed-LUT and colorSpace presets) */
function getPaletteForPreset(preset: HardwarePreset): Palette {
  if (preset.colorSpace && preset.colorSpace.type === 'programmable') {
    const totalColors = (1 << preset.colorSpace.bitsPerChannel) ** 3;
    if (totalColors <= MAX_ENUMERABLE_COLORS) {
      const colors = enumerateColorSpace(preset.colorSpace);
      return colors.map((c, i) => ({ color: c, name: `#${i}` }));
    }
  }
  if (preset.palette && preset.palette.length > 0) {
    return preset.palette;
  }
  if (preset.colorSpace) {
    const colors = enumerateColorSpace(preset.colorSpace);
    return colors.map((c, i) => ({ color: c, name: `#${i}` }));
  }
  return [];
}

export function App() {
  // Theme
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Image
  const [sourceImageData, setSourceImageData] = useState<ImageData | null>(
    null,
  );
  const [sourceFileName, setSourceFileName] = useState('');

  // Preset
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // Processing options
  const [dithering, setDithering] = useState<DitheringAlgorithm>('none');
  const [ditherStrength, setDitherStrength] = useState(1);
  const [distanceAlgorithm, setDistanceAlgorithm] =
    useState<DistanceAlgorithm>('redmean');
  const [enforceConstraints, setEnforceConstraints] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    ...FILTER_DEFAULTS,
  });

  // Output
  const [exportScale, setExportScale] = useState(1);
  const [correctPAR, setCorrectPAR] = useState(false);

  // Comparison
  const [comparisonMode, setComparisonMode] = useState<
    'output' | 'original' | 'slider' | 'side-by-side' | 'toggle'
  >('output');

  // Worker hook
  const {
    result: processResult,
    processing,
    processingTime,
    error,
    processImage,
    cancelProcessing,
  } = useProcessImage();

  const activePreset: HardwarePreset | undefined = activePresetId
    ? getPreset(activePresetId)
    : undefined;

  // Debounce filters for slider changes
  const debouncedFilters = useDebounce(filters, 100);

  // Build process options from current state
  const processOptions: ProcessOptions | null = useMemo(() => {
    if (!activePreset) return null;

    const palette = getPaletteForPreset(activePreset);

    const opts: ProcessOptions = {
      blockSize: 1,
      palette,
      dithering,
      ditherStrength,
      distanceAlgorithm,
      targetResolution: {
        width: activePreset.resolution.width,
        height: activePreset.resolution.height,
      },
      resizeFit: 'contain',
      resizeMethod: 'bilinear',
    };

    if (hasActiveFilters(debouncedFilters)) {
      opts.filters = debouncedFilters;
    }

    if (enforceConstraints && activePreset.constraintType) {
      opts.constraintType = activePreset.constraintType;
      if (activePreset.hamConfig) {
        opts.hamConfig = activePreset.hamConfig;
      }
      if (activePreset.attributeBlock) {
        opts.attributeBlockConfig = activePreset.attributeBlock;
      }
      if (activePreset.paletteLayout && activePreset.tileSize) {
        opts.tilePaletteConfig = {
          tileWidth: activePreset.tileSize.width,
          tileHeight: activePreset.tileSize.height,
          subpaletteCount: activePreset.paletteLayout.subpaletteCount,
          colorsPerSubpalette: activePreset.paletteLayout.colorsPerSubpalette,
          sharedTransparent: activePreset.paletteLayout.sharedTransparent,
        };
      }
      if (
        activePreset.tileSize &&
        activePreset.constraintType === 'per-row-in-tile'
      ) {
        opts.perRowInTileConfig = {
          tileWidth: activePreset.tileSize.width,
          tileHeight: activePreset.tileSize.height,
        };
      }
      if (activePreset.scanlineLimits?.maxColors) {
        opts.scanlineConfig = {
          maxColorsPerLine: activePreset.scanlineLimits.maxColors,
        };
      }
      if (activePreset.artifactConfig) {
        opts.artifactConfig = activePreset.artifactConfig;
      }
    }

    return opts;
  }, [
    activePreset,
    dithering,
    ditherStrength,
    distanceAlgorithm,
    debouncedFilters,
    enforceConstraints,
  ]);

  // Trigger processing when options or image changes
  useEffect(() => {
    if (!sourceImageData || !processOptions) return;
    processImage(sourceImageData, processOptions);
  }, [sourceImageData, processOptions, processImage]);

  // When preset changes, use its recommended dithering/distance if available
  const handlePresetChange = useCallback((presetId: string) => {
    setActivePresetId(presetId);
    const preset = getPreset(presetId);
    if (preset?.recommendedDithering) {
      setDithering(preset.recommendedDithering);
    }
    if (preset?.recommendedDistance) {
      setDistanceAlgorithm(preset.recommendedDistance);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const handleImageLoad = useCallback(
    (imageData: ImageData, fileName: string) => {
      setSourceImageData(imageData);
      setSourceFileName(fileName);
    },
    [],
  );

  const handleChangeImage = useCallback(() => {
    setSourceImageData(null);
    setSourceFileName('');
    setActivePresetId(null);
  }, []);

  return (
    <div className={styles.app} data-theme={theme}>
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main className={styles.main}>
        {!sourceImageData ? (
          <ImageUploadZone onImageLoad={handleImageLoad} />
        ) : (
          <div className={styles.workspace}>
            <div className={styles.canvasArea}>
              <CanvasPanel
                sourceImageData={sourceImageData}
                processResult={processResult}
                processing={processing}
                processingTime={processingTime}
                activePreset={activePreset}
                comparisonMode={comparisonMode}
                onComparisonModeChange={setComparisonMode}
                exportScale={exportScale}
                correctPAR={correctPAR}
                sourceFileName={sourceFileName}
                onCancelProcessing={cancelProcessing}
                error={error}
              />
            </div>
            <div className={styles.controlsArea}>
              <ControlsPanel
                activePresetId={activePresetId}
                onPresetChange={handlePresetChange}
                dithering={dithering}
                onDitheringChange={setDithering}
                ditherStrength={ditherStrength}
                onDitherStrengthChange={setDitherStrength}
                distanceAlgorithm={distanceAlgorithm}
                onDistanceAlgorithmChange={setDistanceAlgorithm}
                enforceConstraints={enforceConstraints}
                onEnforceConstraintsChange={setEnforceConstraints}
                filters={filters}
                onFiltersChange={setFilters}
                exportScale={exportScale}
                onExportScaleChange={setExportScale}
                correctPAR={correctPAR}
                onCorrectPARChange={setCorrectPAR}
                onChangeImage={handleChangeImage}
                activePreset={activePreset}
              />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

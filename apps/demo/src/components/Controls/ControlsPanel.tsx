import { useState, useCallback } from 'react';
import { ChevronDown, ImageOff } from 'lucide-react';
import type {
  DitheringAlgorithm,
  DistanceAlgorithm,
  FilterOptions,
  HardwarePreset,
} from 'bitmapped';
import { FILTER_DEFAULTS } from 'bitmapped';
import { SystemPicker } from '../SystemPicker/SystemPicker';
import { SystemInfoCard } from '../SystemInfo/SystemInfoCard';
import styles from './Controls.module.css';

interface ControlsPanelProps {
  activePresetId: string | null;
  onPresetChange: (id: string) => void;
  dithering: DitheringAlgorithm;
  onDitheringChange: (d: DitheringAlgorithm) => void;
  ditherStrength: number;
  onDitherStrengthChange: (s: number) => void;
  distanceAlgorithm: DistanceAlgorithm;
  onDistanceAlgorithmChange: (a: DistanceAlgorithm) => void;
  enforceConstraints: boolean;
  onEnforceConstraintsChange: (v: boolean) => void;
  filters: FilterOptions;
  onFiltersChange: (f: FilterOptions) => void;
  exportScale: number;
  onExportScaleChange: (s: number) => void;
  correctPAR: boolean;
  onCorrectPARChange: (v: boolean) => void;
  onChangeImage: () => void;
  activePreset: HardwarePreset | undefined;
}

function Collapsible({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.section}>
      <button
        className={styles.collapsibleHeader}
        onClick={() => setOpen(!open)}
      >
        <span>{title}</span>
        <ChevronDown
          size={14}
          className={`${styles.collapsibleChevron} ${open ? styles.collapsibleChevronOpen : ''}`}
        />
      </button>
      {open && <div className={styles.collapsibleBody}>{children}</div>}
    </div>
  );
}

const DITHERING_OPTIONS: { value: DitheringAlgorithm; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'floyd-steinberg', label: 'Floyd-Steinberg' },
  { value: 'atkinson', label: 'Atkinson' },
  { value: 'bayer', label: 'Bayer (ordered)' },
  { value: 'blue-noise', label: 'Blue Noise' },
  { value: 'ps1-ordered', label: 'PS1 Ordered' },
];

const DISTANCE_OPTIONS: {
  value: DistanceAlgorithm;
  label: string;
  hint: string;
}[] = [
  { value: 'redmean', label: 'Redmean', hint: 'Fast, good default' },
  { value: 'oklab', label: 'Oklab', hint: 'Modern perceptual, fast' },
  { value: 'ciede2000', label: 'CIEDE2000', hint: 'Gold standard, slow' },
  { value: 'cie76', label: 'CIE76', hint: 'Perceptual via Lab' },
  { value: 'euclidean', label: 'Euclidean', hint: 'Fastest, least accurate' },
];

export function ControlsPanel({
  activePresetId,
  onPresetChange,
  dithering,
  onDitheringChange,
  ditherStrength,
  onDitherStrengthChange,
  distanceAlgorithm,
  onDistanceAlgorithmChange,
  enforceConstraints,
  onEnforceConstraintsChange,
  filters,
  onFiltersChange,
  exportScale,
  onExportScaleChange,
  correctPAR,
  onCorrectPARChange,
  onChangeImage,
  activePreset,
}: ControlsPanelProps) {
  const updateFilter = useCallback(
    (key: keyof FilterOptions, value: number) => {
      onFiltersChange({ ...filters, [key]: value });
    },
    [filters, onFiltersChange],
  );

  const resetFilters = useCallback(() => {
    onFiltersChange({ ...FILTER_DEFAULTS });
  }, [onFiltersChange]);

  const isOrdered =
    dithering === 'bayer' ||
    dithering === 'blue-noise' ||
    dithering === 'ps1-ordered';

  return (
    <div className={styles.panel}>
      {/* System Picker */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>System</div>
        <SystemPicker
          activePresetId={activePresetId}
          onSelect={onPresetChange}
        />
      </div>

      {/* System Info */}
      {activePreset && (
        <SystemInfoCard
          preset={activePreset}
          constraintsEnabled={enforceConstraints}
        />
      )}

      {/* Processing */}
      <Collapsible title="Processing">
        <div className={styles.field}>
          <label className={styles.label}>Dithering</label>
          <select
            className={styles.select}
            value={dithering}
            onChange={(e) =>
              onDitheringChange(e.target.value as DitheringAlgorithm)
            }
          >
            {DITHERING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {isOrdered && (
          <div className={styles.field}>
            <label className={styles.label}>Dither Strength</label>
            <div className={styles.sliderRow}>
              <input
                type="range"
                className={styles.slider}
                min={0}
                max={1}
                step={0.05}
                value={ditherStrength}
                onChange={(e) =>
                  onDitherStrengthChange(parseFloat(e.target.value))
                }
              />
              <span className={styles.sliderValue}>
                {Math.round(ditherStrength * 100)}%
              </span>
            </div>
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label}>Color Distance</label>
          <select
            className={styles.select}
            value={distanceAlgorithm}
            onChange={(e) =>
              onDistanceAlgorithmChange(e.target.value as DistanceAlgorithm)
            }
          >
            {DISTANCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} — {opt.hint}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <div className={styles.toggleRow}>
            <span className={styles.toggleLabel}>
              Enforce hardware constraints
            </span>
            <button
              className={`${styles.toggle} ${enforceConstraints ? styles.toggleOn : ''}`}
              onClick={() => onEnforceConstraintsChange(!enforceConstraints)}
              role="switch"
              aria-checked={enforceConstraints}
            >
              <div className={styles.toggleKnob} />
            </button>
          </div>
          <p className={styles.toggleDescription}>
            {enforceConstraints
              ? 'Full hardware emulation — attribute blocks, per-tile palettes, scanline limits.'
              : 'Palette-only quantization — each pixel independently matched.'}
          </p>
        </div>
      </Collapsible>

      {/* Preprocessing */}
      <Collapsible title="Preprocessing" defaultOpen={false}>
        <div className={styles.field}>
          <label className={styles.label}>Brightness</label>
          <div className={styles.sliderRow}>
            <input
              type="range"
              className={styles.slider}
              min={0}
              max={2}
              step={0.05}
              value={filters.brightness ?? 1}
              onChange={(e) =>
                updateFilter('brightness', parseFloat(e.target.value))
              }
            />
            <span className={styles.sliderValue}>
              {Math.round((filters.brightness ?? 1) * 100)}%
            </span>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Contrast</label>
          <div className={styles.sliderRow}>
            <input
              type="range"
              className={styles.slider}
              min={0}
              max={2}
              step={0.05}
              value={filters.contrast ?? 1}
              onChange={(e) =>
                updateFilter('contrast', parseFloat(e.target.value))
              }
            />
            <span className={styles.sliderValue}>
              {Math.round((filters.contrast ?? 1) * 100)}%
            </span>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Saturation</label>
          <div className={styles.sliderRow}>
            <input
              type="range"
              className={styles.slider}
              min={0}
              max={2}
              step={0.05}
              value={filters.saturate ?? 1}
              onChange={(e) =>
                updateFilter('saturate', parseFloat(e.target.value))
              }
            />
            <span className={styles.sliderValue}>
              {Math.round((filters.saturate ?? 1) * 100)}%
            </span>
          </div>
        </div>

        <button className={styles.changeImageBtn} onClick={resetFilters}>
          Reset filters
        </button>
      </Collapsible>

      {/* Output */}
      <Collapsible title="Output" defaultOpen={false}>
        <div className={styles.field}>
          <label className={styles.label}>Export Scale</label>
          <div className={styles.scaleGroup}>
            {[1, 2, 3, 4].map((s) => (
              <button
                key={s}
                className={`${styles.scaleBtn} ${exportScale === s ? styles.scaleBtnActive : ''}`}
                onClick={() => onExportScaleChange(s)}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {activePreset && activePreset.par.x !== activePreset.par.y && (
          <div className={styles.field}>
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>
                Aspect ratio correction
              </span>
              <button
                className={`${styles.toggle} ${correctPAR ? styles.toggleOn : ''}`}
                onClick={() => onCorrectPARChange(!correctPAR)}
                role="switch"
                aria-checked={correctPAR}
              >
                <div className={styles.toggleKnob} />
              </button>
            </div>
            <p className={styles.variantInfo}>
              PAR {activePreset.par.x}:{activePreset.par.y}
            </p>
          </div>
        )}
      </Collapsible>

      {/* Change Image */}
      <div className={styles.section}>
        <button className={styles.changeImageBtn} onClick={onChangeImage}>
          <ImageOff
            size={12}
            style={{ marginRight: 6, verticalAlign: 'middle' }}
          />
          Change image
        </button>
      </div>
    </div>
  );
}

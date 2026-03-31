import { useMemo } from 'react';
import type { HardwarePreset } from 'bitmapped';
import { getEnrichedSystem } from '../../data/systems';
import styles from './SystemInfo.module.css';

interface SystemInfoCardProps {
  preset: HardwarePreset;
  constraintsEnabled: boolean;
}

function PaletteDisplay({ preset }: { preset: HardwarePreset }) {
  const colors = useMemo(() => {
    if (preset.palette && preset.palette.length > 0) {
      return preset.palette;
    }
    return null;
  }, [preset]);

  if (!colors) {
    return (
      <div className={styles.paletteInfo}>
        {preset.totalColors
          ? `${preset.totalColors} total colors (RGB bit-depth system)`
          : 'RGB bit-depth system'}
      </div>
    );
  }

  return (
    <div>
      <div className={styles.paletteGrid}>
        {colors.map((c, i) => (
          <div
            key={i}
            className={styles.paletteSwatch}
            style={{
              background: `rgb(${c.color.r},${c.color.g},${c.color.b})`,
            }}
            title={`#${c.color.r.toString(16).padStart(2, '0')}${c.color.g.toString(16).padStart(2, '0')}${c.color.b.toString(16).padStart(2, '0')} ${c.name ?? `#${i}`}`}
            aria-label={`Color ${c.name ?? i}: rgb(${c.color.r},${c.color.g},${c.color.b})`}
          />
        ))}
      </div>
      <div className={styles.paletteInfo}>
        {preset.totalColors ?? colors.length} total
        {preset.simultaneousColors
          ? ` \u00b7 ${preset.simultaneousColors} simultaneous`
          : ''}
      </div>
    </div>
  );
}

function SpecsTable({ preset }: { preset: HardwarePreset }) {
  const rows: [string, string][] = [];

  rows.push([
    'Resolution',
    `${preset.resolution.width} \u00d7 ${preset.resolution.height}`,
  ]);
  rows.push(['Pixel aspect', `${preset.par.x}:${preset.par.y}`]);

  if (preset.tileSize) {
    rows.push([
      'Tile size',
      `${preset.tileSize.width} \u00d7 ${preset.tileSize.height}`,
    ]);
  }

  if (preset.paletteLayout) {
    rows.push([
      'Palettes',
      `${preset.paletteLayout.subpaletteCount} \u00d7 ${preset.paletteLayout.colorsPerSubpalette} colors`,
    ]);
  }

  if (preset.constraintType && preset.constraintType !== 'none') {
    const labels: Record<string, string> = {
      'attribute-block': 'Attribute block',
      'per-tile-palette': 'Per-tile palette',
      'per-scanline': 'Per-scanline',
      ham: 'Hold-And-Modify',
      'artifact-color': 'Artifact color',
      'sub-palette-lock': 'Sub-palette lock',
      'per-row-in-tile': 'Per-row-in-tile',
      'monochrome-global': 'Monochrome',
    };
    rows.push([
      'Constraint',
      labels[preset.constraintType] ?? preset.constraintType,
    ]);
  }

  return (
    <div className={styles.specs}>
      {rows.map(([label, value]) => (
        <div key={label} className={styles.specsRow}>
          <span className={styles.specsLabel}>{label}</span>
          <span className={styles.specsValue}>{value}</span>
        </div>
      ))}
    </div>
  );
}

export function SystemInfoCard({
  preset,
  constraintsEnabled,
}: SystemInfoCardProps) {
  const enriched = useMemo(() => getEnrichedSystem(preset.id), [preset.id]);
  if (!enriched) return null;

  const { description } = enriched;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.name}>{enriched.ui.displayName}</div>
        <div className={styles.era}>
          {description.era} &middot; {description.maker}
        </div>
      </div>

      <div className={styles.paletteSection}>
        <div className={styles.paletteSectionTitle}>Palette</div>
        <PaletteDisplay preset={preset} />
      </div>

      <div className={styles.paletteSectionTitle}>Specs</div>
      <SpecsTable preset={preset} />

      <div
        className={`${styles.explainer} ${!constraintsEnabled ? styles.dimmed : ''}`}
      >
        <div className={styles.explainerTitle}>Why it looks like that</div>
        <p className={styles.explainerText}>{description.explanation}</p>
      </div>
    </div>
  );
}

import { useState, useMemo, useCallback } from 'react';
import type { HardwarePreset } from 'bitmapped';
import {
  getSystemsByCategory,
  searchSystems,
  getCategoriesWithCounts,
  type EnrichedSystem,
} from '../../data/systems';
import styles from './SystemPicker.module.css';

interface SystemPickerProps {
  activePresetId: string | null;
  onSelect: (presetId: string) => void;
}

function PaletteSwatchStrip({ preset }: { preset: HardwarePreset }) {
  const colors = useMemo(() => {
    if (preset.palette && preset.palette.length > 0) {
      return preset.palette.slice(0, 16).map((c) => {
        return `rgb(${c.color.r},${c.color.g},${c.color.b})`;
      });
    }
    // For RGB-bitdepth systems, show a gradient sample
    return ['#333', '#666', '#999', '#ccc'];
  }, [preset]);

  return (
    <div className={styles.swatchStrip}>
      {colors.map((color, i) => (
        <div key={i} className={styles.swatch} style={{ background: color }} />
      ))}
    </div>
  );
}

function SystemCard({
  system,
  isActive,
  onSelect,
}: {
  system: EnrichedSystem;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
      onClick={onSelect}
    >
      <PaletteSwatchStrip preset={system.preset} />
      <div className={styles.cardHeader}>
        <span className={styles.cardName}>{system.ui.shortName}</span>
        <span className={styles.cardYear}>{system.ui.year}</span>
      </div>
      <div className={styles.cardMeta}>
        {system.preset.resolution.width}\u00d7{system.preset.resolution.height}
        {system.preset.simultaneousColors
          ? ` \u00b7 ${system.preset.simultaneousColors} colors`
          : ''}
      </div>
      <div className={styles.cardConstraint}>{system.ui.constraintSummary}</div>
    </button>
  );
}

export function SystemPicker({ activePresetId, onSelect }: SystemPickerProps) {
  const categories = useMemo(() => getCategoriesWithCounts(), []);
  const [activeCategory, setActiveCategory] = useState(
    categories[0]?.id ?? 'consoles',
  );
  const [searchQuery, setSearchQuery] = useState('');

  const systems = useMemo(() => {
    if (searchQuery.trim()) {
      return searchSystems(searchQuery.trim());
    }
    return getSystemsByCategory(activeCategory);
  }, [activeCategory, searchQuery]);

  const handleSelect = useCallback(
    (presetId: string) => {
      onSelect(presetId);
    },
    [onSelect],
  );

  return (
    <div className={styles.picker}>
      {/* Search */}
      <input
        className={styles.search}
        type="text"
        placeholder="Search systems..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Category tabs */}
      {!searchQuery.trim() && (
        <div className={styles.tabs}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.tab} ${activeCategory === cat.id ? styles.tabActive : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
              <span className={styles.tabCount}>{cat.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* System grid */}
      <div className={styles.grid}>
        {systems.length === 0 ? (
          <div className={styles.noResults}>
            No systems match "{searchQuery}"
          </div>
        ) : (
          systems.map((system) => (
            <SystemCard
              key={system.preset.id}
              system={system}
              isActive={system.preset.id === activePresetId}
              onSelect={() => handleSelect(system.preset.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

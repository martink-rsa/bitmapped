'use client';

import { useState } from 'react';

interface PaletteDisplayProps {
  colors: string[];
  labels?: string[];
  columns?: number;
  swatchSize?: number;
  showHex?: boolean;
  groupLabel?: string;
}

export function PaletteDisplay({
  colors,
  labels,
  columns,
  swatchSize = 32,
  showHex = false,
  groupLabel,
}: PaletteDisplayProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const cols =
    columns ?? Math.min(colors.length, Math.ceil(Math.sqrt(colors.length)));

  return (
    <div style={{ margin: '1rem 0' }}>
      {groupLabel && (
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '0.5rem',
            opacity: 0.7,
          }}
        >
          {groupLabel}
        </div>
      )}
      <div
        className="palette-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${swatchSize}px)`,
          gap: '4px',
        }}
      >
        {colors.map((color, i) => (
          <div
            key={`${color}-${i}`}
            className="palette-swatch"
            title={labels?.[i] ?? color}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              width: swatchSize,
              height: swatchSize,
              backgroundColor: color,
              borderRadius: '3px',
            }}
          >
            {showHex && hoveredIndex === i && (
              <div
                style={{
                  position: 'absolute',
                  bottom: -20,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '0.65rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  whiteSpace: 'nowrap',
                  background: 'rgba(0,0,0,0.8)',
                  color: '#fff',
                  padding: '1px 4px',
                  borderRadius: 2,
                  zIndex: 10,
                }}
              >
                {color}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

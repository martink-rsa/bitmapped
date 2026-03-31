'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface BeforeAfterProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  width?: number;
}

export function BeforeAfter({
  beforeSrc,
  afterSrc,
  beforeLabel = 'Original',
  afterLabel = 'Processed',
  width = 512,
}: BeforeAfterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);

  const updatePosition = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const clientX = 'touches' in e ? e.touches[0]!.clientX : e.clientX;
      updatePosition(clientX);
    };

    const handleUp = () => setDragging(false);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [dragging, updatePosition]);

  return (
    <div
      ref={containerRef}
      className="before-after"
      style={{ width, maxWidth: '100%', aspectRatio: '4/3' }}
      onMouseDown={(e) => {
        setDragging(true);
        updatePosition(e.clientX);
      }}
      onTouchStart={(e) => {
        setDragging(true);
        updatePosition(e.touches[0]!.clientX);
      }}
    >
      {/* Before image (full width) */}
      <img
        src={beforeSrc}
        alt={beforeLabel}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* After image (clipped) */}
      <img
        src={afterSrc}
        alt={afterLabel}
        className="demo-canvas"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          clipPath: `inset(0 0 0 ${position}%)`,
        }}
      />

      {/* Labels */}
      <span className="before-after-label" style={{ left: 8 }}>
        {beforeLabel}
      </span>
      <span className="before-after-label" style={{ right: 8 }}>
        {afterLabel}
      </span>

      {/* Divider */}
      <div className="before-after-divider" style={{ left: `${position}%` }} />
    </div>
  );
}

'use client';

{
  /* TODO: Implement constraint visualizer that overlays a grid on
    processed output showing block/tile boundaries and per-block
    color assignments. Toggle grid, hover to show block colors. */
}

export function ConstraintVisualizer() {
  return (
    <div
      style={{
        border: '1px dashed rgba(128,128,128,0.3)',
        borderRadius: 8,
        padding: '2rem',
        textAlign: 'center',
        opacity: 0.6,
        margin: '1.5rem 0',
      }}
    >
      <p style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Interactive Constraint Visualizer
      </p>
      <p style={{ fontSize: '0.85rem' }}>Coming soon</p>
    </div>
  );
}

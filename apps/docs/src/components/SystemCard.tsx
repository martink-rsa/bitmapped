'use client';

interface SystemCardProps {
  name: string;
  id: string;
  resolution: string;
  totalColors: number;
  simultaneousColors: number;
  constraintType: string;
  href: string;
}

export function SystemCard({
  name,
  resolution,
  totalColors,
  simultaneousColors,
  constraintType,
  href,
}: SystemCardProps) {
  return (
    <a className="system-card" href={href}>
      <h3
        style={{
          margin: '0 0 0.5rem',
          fontSize: '1rem',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {name}
      </h3>
      <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
        <div>{resolution}</div>
        <div>
          {simultaneousColors} of {totalColors} colors
        </div>
        <div style={{ marginTop: '0.25rem', fontStyle: 'italic' }}>
          {constraintType}
        </div>
      </div>
    </a>
  );
}

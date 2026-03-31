'use client';

import { useState, type ReactNode } from 'react';

interface CodeExampleProps {
  code: string;
  language?: string;
  output?: ReactNode;
}

export function CodeExample({
  code,
  language = 'typescript',
  output,
}: CodeExampleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={output ? 'code-example' : ''}>
      <div style={{ position: 'relative' }}>
        <button
          onClick={handleCopy}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            padding: '4px 8px',
            fontSize: '0.75rem',
            fontFamily: "'JetBrains Mono', monospace",
            background: 'rgba(128,128,128,0.2)',
            border: '1px solid rgba(128,128,128,0.3)',
            borderRadius: 4,
            cursor: 'pointer',
            color: 'inherit',
            zIndex: 1,
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <pre
          style={{
            padding: '1rem',
            borderRadius: 8,
            overflow: 'auto',
            fontSize: '0.85rem',
            margin: 0,
          }}
        >
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
      {output && (
        <div
          style={{
            border: '1px solid rgba(128,128,128,0.2)',
            borderRadius: 8,
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {output}
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useCallback } from 'react';
import styles from './ImageUpload.module.css';

interface SampleGridProps {
  onSelect: (imageData: ImageData, fileName: string) => void;
}

interface SampleDef {
  label: string;
  fileName: string;
  src: string;
}

const SAMPLES: SampleDef[] = [
  { label: 'Parrot', fileName: 'parrot.jpg', src: '/samples/parrot.jpg' },
  { label: 'Tulips', fileName: 'tulips.jpg', src: '/samples/tulips.jpg' },
  { label: 'Tokyo', fileName: 'tokyo.jpg', src: '/samples/tokyo.jpg' },
  { label: 'Burano', fileName: 'burano.jpg', src: '/samples/burano.jpg' },
];

function SampleCard({
  sample,
  onSelect,
}: {
  sample: SampleDef;
  onSelect: (imageData: ImageData, fileName: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageDataRef = useRef<ImageData | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      imageDataRef.current = ctx.getImageData(
        0,
        0,
        img.naturalWidth,
        img.naturalHeight,
      );
    };
    img.src = sample.src;
  }, [sample]);

  const handleClick = useCallback(() => {
    if (imageDataRef.current) {
      onSelect(imageDataRef.current, sample.fileName);
    }
  }, [onSelect, sample.fileName]);

  return (
    <button className={styles.sampleCard} onClick={handleClick}>
      <canvas ref={canvasRef} className={styles.sampleCanvas} />
      <span className={styles.sampleLabel}>{sample.label}</span>
    </button>
  );
}

export function SampleGrid({ onSelect }: SampleGridProps) {
  return (
    <div className={styles.sampleGrid}>
      {SAMPLES.map((sample) => (
        <SampleCard key={sample.label} sample={sample} onSelect={onSelect} />
      ))}
    </div>
  );
}

import { useCallback, useRef, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { SampleGrid } from './SampleGrid';
import styles from './ImageUpload.module.css';

interface ImageUploadZoneProps {
  onImageLoad: (imageData: ImageData, fileName: string) => void;
}

export function ImageUploadZone({ onImageLoad }: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onerror = () => URL.revokeObjectURL(url);
      img.onload = () => {
        URL.revokeObjectURL(url);
        // Downscale large images
        let { width, height } = img;
        const maxDim = 2048;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        onImageLoad(imageData, file.name);
      };
      img.src = url;
    },
    [onImageLoad],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        loadFile(file);
      }
    },
    [loadFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) loadFile(file);
    },
    [loadFile],
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={styles.uploadZone}>
      <div
        className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleClick();
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileChange}
          className="sr-only"
          tabIndex={-1}
        />
        <div className={styles.dropIcon}>
          {isDragging ? <ImageIcon size={40} /> : <Upload size={40} />}
        </div>
        <p className={styles.dropTitle}>
          {isDragging ? 'Drop to load' : 'Drop an image here'}
        </p>
        <p className={styles.dropHint}>or click to browse</p>
        <p className={styles.dropFormats}>
          PNG &middot; JPG &middot; WebP &middot; GIF
        </p>
      </div>
      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>or try a sample</span>
        <span className={styles.dividerLine} />
      </div>
      <SampleGrid onSelect={onImageLoad} />
    </div>
  );
}

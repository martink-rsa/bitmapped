/** Generates a timestamped filename base (without extension). */
export function defaultFilenameBase(): string {
  const now = new Date();
  return (
    now.toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15) +
    '-bitmapped'
  );
}

/** Triggers a browser download from a Blob. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

import { useRef, useState, useCallback, useEffect } from 'react';
import type { ProcessOptions, ProcessResult } from 'bitmapped';
import type { WorkerResponse, WorkerRequest } from '../workers/process.worker';

function createWorker() {
  return new Worker(new URL('../workers/process.worker.ts', import.meta.url), {
    type: 'module',
  });
}

export function useProcessImage() {
  const workerRef = useRef<Worker | null>(null);
  const requestIdRef = useRef(0);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const processingRef = useRef(false);
  const [processingTime, setProcessingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const startTimeRef = useRef(0);

  const attachWorkerHandler = useCallback((worker: Worker) => {
    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const data = e.data;

      // Discard stale responses
      if (data.requestId !== requestIdRef.current) return;

      if (data.type === 'result') {
        const imageData = new ImageData(
          new Uint8ClampedArray(data.buffer),
          data.width,
          data.height,
        );

        setResult({
          imageData,
          grid: [], // Grid not transferred for perf — not needed for display
          width: data.gridWidth,
          height: data.gridHeight,
        });
        setProcessingTime(performance.now() - startTimeRef.current);
        processingRef.current = false;
        setProcessing(false);
        setError(null);
      } else if (data.type === 'error') {
        setError(data.message);
        processingRef.current = false;
        setProcessing(false);
      }
    };

    worker.onerror = (event: ErrorEvent) => {
      setError(event.message || 'Worker encountered an error');
      processingRef.current = false;
      setProcessing(false);
    };
  }, []);

  useEffect(() => {
    const worker = createWorker();
    attachWorkerHandler(worker);
    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, [attachWorkerHandler]);

  const cancelProcessing = useCallback(() => {
    // Terminate the running worker and spin up a fresh one
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    const worker = createWorker();
    attachWorkerHandler(worker);
    workerRef.current = worker;
    // Bump request ID so any in-flight response from the old worker is ignored
    requestIdRef.current++;
    processingRef.current = false;
    setProcessing(false);
    setError(null);
  }, [attachWorkerHandler]);

  const processImage = useCallback(
    (imageData: ImageData, options: ProcessOptions) => {
      // Terminate the current worker if it's busy — this cancels stale work
      if (processingRef.current && workerRef.current) {
        workerRef.current.terminate();
        const worker = createWorker();
        attachWorkerHandler(worker);
        workerRef.current = worker;
      }

      const worker = workerRef.current;
      if (!worker) return;

      const id = ++requestIdRef.current;
      startTimeRef.current = performance.now();
      processingRef.current = true;
      setProcessing(true);
      setError(null);

      // Clone the buffer so we can transfer it
      const buffer = imageData.data.buffer.slice(0);

      const request: WorkerRequest = {
        type: 'process',
        buffer,
        width: imageData.width,
        height: imageData.height,
        options,
        requestId: id,
      };

      worker.postMessage(request, [buffer]);
    },
    [attachWorkerHandler],
  );

  return {
    result,
    processing,
    processingTime,
    error,
    processImage,
    cancelProcessing,
  };
}

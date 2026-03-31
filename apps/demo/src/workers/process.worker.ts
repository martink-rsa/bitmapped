import { process } from 'bitmapped';
import type { ProcessOptions } from 'bitmapped';

export interface WorkerRequest {
  type: 'process';
  buffer: ArrayBuffer;
  width: number;
  height: number;
  options: ProcessOptions;
  requestId: number;
}

export interface WorkerResultResponse {
  type: 'result';
  buffer: ArrayBuffer;
  width: number;
  height: number;
  gridWidth: number;
  gridHeight: number;
  requestId: number;
}

export interface WorkerErrorResponse {
  type: 'error';
  message: string;
  requestId: number;
}

export type WorkerResponse = WorkerResultResponse | WorkerErrorResponse;

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { buffer, width, height, options, requestId } = e.data;

  try {
    // Reconstruct ImageData from transferred buffer
    const data = new Uint8ClampedArray(buffer);
    const imageData = new ImageData(data, width, height);

    const result = process(imageData, options);

    // Transfer the result buffer back (zero-copy)
    const resultBuffer = result.imageData.data.buffer.slice(0);

    const response: WorkerResultResponse = {
      type: 'result',
      buffer: resultBuffer,
      width: result.imageData.width,
      height: result.imageData.height,
      gridWidth: result.width,
      gridHeight: result.height,
      requestId,
    };

    self.postMessage(response, { transfer: [resultBuffer] });
  } catch (error) {
    const response: WorkerErrorResponse = {
      type: 'error',
      message: error instanceof Error ? error.message : 'Processing failed',
      requestId,
    };
    self.postMessage(response);
  }
};

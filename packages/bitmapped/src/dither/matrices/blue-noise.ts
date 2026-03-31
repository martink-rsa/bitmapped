import type { ThresholdMatrix } from '../../core/types.js';

/**
 * Generates a blue noise threshold matrix using the void-and-cluster algorithm.
 * Produces the most visually uniform distribution of all ordered methods —
 * no visible structure or repeating patterns.
 *
 * For size 64, returns the precomputed matrix directly.
 * For smaller sizes, crops the top-left portion.
 * For larger sizes, tiles the 64×64 base. Note: tiling degrades blue noise
 * properties for sizes > 64 as the periodicity introduces visible patterns.
 *
 * @param size - The matrix dimension (default: 64)
 * @returns A 2D array of normalized threshold values in the 0–1 range
 */
export function generateBlueNoiseMatrix(size: number): ThresholdMatrix {
  if (size < 2) {
    throw new Error(`Blue noise matrix size must be >= 2, got ${size}`);
  }

  const base = getPrecomputed64();

  const matrix: ThresholdMatrix = [];
  for (let y = 0; y < size; y++) {
    matrix[y] = [];
    for (let x = 0; x < size; x++) {
      matrix[y]![x] = base[y % 64]![x % 64]!;
    }
  }

  return matrix;
}

/** Lazily cached 64×64 blue noise matrix */
let cached64: ThresholdMatrix | null = null;

function getPrecomputed64(): ThresholdMatrix {
  if (cached64) return cached64;
  cached64 = generateVoidAndCluster(64);
  return cached64;
}

/**
 * Void-and-cluster algorithm for generating blue noise threshold matrices.
 * Produces a spatially uniform distribution of threshold values.
 */
function generateVoidAndCluster(size: number): ThresholdMatrix {
  const n = size * size;
  const sigma = 1.5;
  const sigmaSquared = sigma * sigma;

  // Step 1: Start with a fraction of randomly placed initial points
  const binary = new Uint8Array(n);
  const initialCount = Math.max(1, Math.floor(n / 10));

  // Use a deterministic seed for reproducibility
  let seed = 12345;
  const rng = (): number => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  const placed = new Set<number>();
  while (placed.size < initialCount) {
    const idx = Math.floor(rng() * n);
    if (!placed.has(idx)) {
      placed.add(idx);
      binary[idx] = 1;
    }
  }

  // Precompute Gaussian kernel (toroidal wrapping)
  const kernelRadius = Math.min(Math.floor(size / 2), 10);
  const kernel: number[][] = [];
  for (let dy = -kernelRadius; dy <= kernelRadius; dy++) {
    const row: number[] = [];
    for (let dx = -kernelRadius; dx <= kernelRadius; dx++) {
      row.push(Math.exp(-(dx * dx + dy * dy) / (2 * sigmaSquared)));
    }
    kernel.push(row);
  }

  // Compute energy map for a binary pattern
  function computeEnergy(pattern: Uint8Array): Float64Array {
    const energy = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      if (pattern[i] === 0) continue;
      const py = Math.floor(i / size);
      const px = i % size;
      for (let dy = -kernelRadius; dy <= kernelRadius; dy++) {
        for (let dx = -kernelRadius; dx <= kernelRadius; dx++) {
          const ny = (((py + dy) % size) + size) % size;
          const nx = (((px + dx) % size) + size) % size;
          const ei = ny * size + nx;
          energy[ei] =
            energy[ei]! + kernel[dy + kernelRadius]![dx + kernelRadius]!;
        }
      }
    }
    return energy;
  }

  // Update energy incrementally when adding/removing a point
  function updateEnergy(energy: Float64Array, idx: number, sign: number): void {
    const py = Math.floor(idx / size);
    const px = idx % size;
    for (let dy = -kernelRadius; dy <= kernelRadius; dy++) {
      for (let dx = -kernelRadius; dx <= kernelRadius; dx++) {
        const ny = (((py + dy) % size) + size) % size;
        const nx = (((px + dx) % size) + size) % size;
        const ei = ny * size + nx;
        energy[ei] =
          energy[ei]! + sign * kernel[dy + kernelRadius]![dx + kernelRadius]!;
      }
    }
  }

  // Step 2-3: Swap tightest cluster point to largest void until stable
  let energy = computeEnergy(binary);

  for (let iter = 0; iter < n; iter++) {
    // Find tightest cluster (highest energy among set points)
    let clusterIdx = -1;
    let clusterEnergy = -Infinity;
    for (let i = 0; i < n; i++) {
      if (binary[i] === 1 && energy[i]! > clusterEnergy) {
        clusterEnergy = energy[i]!;
        clusterIdx = i;
      }
    }

    // Find largest void (lowest energy among empty points)
    let voidIdx = -1;
    let voidEnergy = Infinity;
    for (let i = 0; i < n; i++) {
      if (binary[i] === 0 && energy[i]! < voidEnergy) {
        voidEnergy = energy[i]!;
        voidIdx = i;
      }
    }

    if (clusterIdx === voidIdx || clusterIdx === -1 || voidIdx === -1) break;

    // Check if swapping improves uniformity
    if (clusterEnergy - voidEnergy < 0.001) break;

    // Swap
    binary[clusterIdx] = 0;
    updateEnergy(energy, clusterIdx, -1);
    binary[voidIdx] = 1;
    updateEnergy(energy, voidIdx, 1);
  }

  // Step 4: Assign threshold ranks
  const ranks = new Float64Array(n);
  const pattern = new Uint8Array(binary);

  // Phase 1: Remove points one at a time (tightest cluster first)
  // This assigns ranks to the initially set points (high rank = removed last)
  energy = computeEnergy(pattern);
  let onesCount = 0;
  for (let i = 0; i < n; i++) {
    if (pattern[i] === 1) onesCount++;
  }

  for (let rank = onesCount - 1; rank >= 0; rank--) {
    // Find tightest cluster
    let clusterIdx = -1;
    let clusterEnergy = -Infinity;
    for (let i = 0; i < n; i++) {
      if (pattern[i] === 1 && energy[i]! > clusterEnergy) {
        clusterEnergy = energy[i]!;
        clusterIdx = i;
      }
    }
    if (clusterIdx === -1) break;

    ranks[clusterIdx] = rank;
    pattern[clusterIdx] = 0;
    updateEnergy(energy, clusterIdx, -1);
  }

  // Phase 2: Add points to largest voids (assigns ranks to the empty points)
  // Reset pattern to the initial binary state
  pattern.set(binary);
  energy = computeEnergy(pattern);

  for (let rank = onesCount; rank < n; rank++) {
    // Find largest void (empty spot with lowest energy = furthest from all points)
    let voidIdx = -1;
    let minEnergy = Infinity;
    for (let i = 0; i < n; i++) {
      if (pattern[i] === 0 && energy[i]! < minEnergy) {
        minEnergy = energy[i]!;
        voidIdx = i;
      }
    }
    if (voidIdx === -1) break;

    ranks[voidIdx] = rank;
    pattern[voidIdx] = 1;
    updateEnergy(energy, voidIdx, 1);
  }

  // Step 5: Normalize to 0–1
  const matrix: ThresholdMatrix = [];
  for (let y = 0; y < size; y++) {
    matrix[y] = [];
    for (let x = 0; x < size; x++) {
      matrix[y]![x] = (ranks[y * size + x]! + 0.5) / n;
    }
  }

  return matrix;
}

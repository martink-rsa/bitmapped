import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'color/index': 'src/color/index.ts',
    'palette/index': 'src/palette/index.ts',
    'dither/index': 'src/dither/index.ts',
    'export/index': 'src/export/index.ts',
    'presets/index': 'src/presets/index.ts',
    'preprocess/index': 'src/preprocess/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  clean: true,
  treeshake: true,
  sourcemap: true,
  target: 'es2020',
  outDir: 'dist',
});

import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig((env) => ({
  build: {
    outDir: "lib/bundles",
    sourcemap: true,
    emptyOutDir: false,
    watch: env.mode === 'watch' ? { /* ... */ } : undefined,
    lib: {
      entry: path.resolve(__dirname, 'src', 'browser', 'index.ts'),
      name: "AssembleJS",
      formats: ['iife'],
      fileName: (_format) => 'asmbl.client.bundle.js',
    }
  }
}));
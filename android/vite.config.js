import { defineConfig } from 'vite';

export default defineConfig({
  root: 'web',
  base: './',
  build: {
    outDir: '../www',
    emptyOutDir: true,
    target: 'es2020',
  },
});

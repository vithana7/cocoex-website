import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: './',
  build: {
    target: 'es2018',
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
  server: {
    port: 5173,
    open: true,
  },
});

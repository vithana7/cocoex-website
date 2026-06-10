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
    // Never let the browser cache the dev shell — always serve the latest.
    headers: { 'Cache-Control': 'no-store' },
  },
});

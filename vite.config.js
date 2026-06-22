import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import observatory from './vite-plugin-observatory.mjs';

export default defineConfig({
  root: '.',
  // Absolute base: the site is hosted at the domain root (cocoex.xyz), and the
  // observatory lives at the nested path /observatory/ — a relative base ('./')
  // would resolve that page's asset URLs against /observatory/ and 404. (E1)
  base: '/',
  plugins: [observatory()],
  build: {
    target: 'es2018',
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        observatory: resolve(__dirname, 'observatory/index.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: true,
    // Never let the browser cache the dev shell — always serve the latest.
    headers: { 'Cache-Control': 'no-store' },
  },
});

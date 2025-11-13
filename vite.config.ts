import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    open: true,
    proxy: {
      // "/api": "http://pulsar.imsi.athenarc.gr:9680",
      '/api': {
        target: 'http://vis-api:8080',
      },
      '/experiments': {
        target: 'http://vis-api:8080',
      },
      '/auth': {
        target: 'http://vis-api:5521',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth/, '')
      },
      '/eusome': {
        target: 'http://app:8000',
        rewrite: (path) => path.replace(/^\/eusome/, '')
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'src/setupTests',
    mockReset: true,
  },
});

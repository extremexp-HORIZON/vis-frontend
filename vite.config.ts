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
        target: 'http://localhost:8080',
      },
      '/experiments': {
        target: 'http://localhost:8080',
      },
      '/auth': {
        target: 'http://localhost:5521',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth/, '')
      }
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'src/setupTests',
    mockReset: true,
  },
});

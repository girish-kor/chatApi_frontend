import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    // Proxy /api requests to the remote API during local development to avoid CORS
    proxy: {
      '/api': {
        target: 'https://chatapi.miniproject.in',
        changeOrigin: true,
        secure: true,
        // Vite will forward the path as-is; no rewrite necessary in this case
        ws: false,
      },
    },
  },

  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});

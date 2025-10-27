import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true, // auto-open browser
    cors: true,
    proxy: {
      // Proxy /api requests to the remote ChatAPI to avoid CORS during local development.
      // Keep the /api prefix so upstream routes like /api/users remain intact.
      '/api': {
        target: 'https://chatapi.miniproject.in',
        changeOrigin: true,
        secure: true,
        // No rewrite: forward the path as-is so /api/users -> https://chatapi.miniproject.in/api/users
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});

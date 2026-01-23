import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@lib': path.resolve(__dirname, 'src/lib'),
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Ensure hash changes with content
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1] || '';
          const name = info[0] || 'asset';
          return `${name}-[hash].[ext]`;
        },
        chunkFileNames: 'chunk-[hash].js',
        entryFileNames: 'entry-[hash].js',
      },
    },
    // Force hash generation
    minify: 'terser',
    sourcemap: false,
  },
});

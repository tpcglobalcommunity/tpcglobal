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
    },
    dedupe: ['react', 'react-dom'],
  },
  define: {
    __BUILD_SHA__: JSON.stringify(process.env.CF_PAGES_COMMIT_SHA || process.env.COMMIT_REF || "dev"),
    __BUILD_ID__: JSON.stringify(process.env.CF_PAGES_BUILD_ID || ""),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    VITE_BUILD_TIME: JSON.stringify(new Date().toISOString()),
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

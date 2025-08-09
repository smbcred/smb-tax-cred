/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './client/src/test/setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'client/src/test/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@components': path.resolve(__dirname, './client/src/components'),
      '@services': path.resolve(__dirname, './client/src/services'),
      '@utils': path.resolve(__dirname, './client/src/utils'),
      '@types': path.resolve(__dirname, './client/src/types'),
      '@hooks': path.resolve(__dirname, './client/src/hooks'),
      '@pages': path.resolve(__dirname, './client/src/pages'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
});
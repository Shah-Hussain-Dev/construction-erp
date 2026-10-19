import { defineConfig } from 'vitest/config';
import path from 'path';
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  test: { include: ['tests/**/*.test.{ts,tsx}'], testTimeout: 15000, hookTimeout: 15000 },
});

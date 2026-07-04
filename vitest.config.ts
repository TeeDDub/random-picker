import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: { '@': resolve(process.cwd(), '.') },
  },
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
  },
});

import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    testTimeout: 15000,
    hookTimeout: 15000,
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['app/api/**/*.ts', 'lib/**/*.ts', 'infra/**/*.ts', 'core/**/*.ts'],
      thresholds: {
        lines: 20,
        statements: 20,
        branches: 30,
        functions: 40,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname)
    }
  }
})

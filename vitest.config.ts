import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['app/api/**/*.ts', 'lib/**/*.ts', 'infra/**/*.ts', 'core/**/*.ts'],
      thresholds: {
        lines: 65,
        statements: 65,
        branches: 60,
        functions: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname)
    }
  }
})

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    fileParallelism: false,
    hookTimeout: 120000,
    testTimeout: 30000,
    env: {
      PORT: '4000',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/specflow-test',
      JWT_SECRET: 'test-access-secret-which-is-long-enough',
      JWT_REFRESH_SECRET: 'test-refresh-secret-which-is-long-enough',
      FRONTEND_URL: 'http://localhost:5173',
      NODE_ENV: 'test',
    },
  },
})

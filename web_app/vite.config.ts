import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Reads the project root .env so the dev proxy follows the API port (SERVER_PORT)
  const rootEnv = loadEnv(mode, '..', '')
  const apiTarget = process.env.API_PROXY_TARGET ?? `http://localhost:${rootEnv.SERVER_PORT || 8080}`

  return {
    plugins: [react()],
    server: {
      proxy: { '/api': { target: apiTarget, changeOrigin: true } },
    },
    test: {
      include: ['src/**/*.test.{ts,tsx}'],
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: { modules: { classNameStrategy: 'non-scoped' } },
    },
  }
})

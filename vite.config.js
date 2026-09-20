import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,
    // Full level playthroughs through the DOM run several seconds on CI runners.
    testTimeout: 20000,
  },
})

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { handleDevinChat } from './devin-chat-server.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), 'DEVIN_'))
  return {
  plugins: [react(), {
    name: 'devin-chat-api',
    configureServer(server) {
      server.middlewares.use('/api/devin-chat', handleDevinChat)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/devin-chat', handleDevinChat)
    },
  }],
  test: {
    environment: 'jsdom',
    globals: false,
    // Full level playthroughs through the DOM run several seconds on CI runners.
    testTimeout: 20000,
  },
  }
})

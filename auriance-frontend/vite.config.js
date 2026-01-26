import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js'
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true, // Listen on all local IPs
    cors: true,
    proxy: {
      '/auth': 'http://localhost:8090',
      '/api': 'http://localhost:8090',
    }
  }
})
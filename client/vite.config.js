import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Forward /api/* to the Express server so the client can call fetch('/api/...')
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})

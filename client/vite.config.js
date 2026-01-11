import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://hack4delhi-fgm5.onrender.com',
        changeOrigin: true,
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    include: ['react-pdf', 'pdfjs-dist'],
  },
  server: {
    allowedHosts: [
      '5f56-192-172-245-4.ngrok-free.app'
    ]
  }
})

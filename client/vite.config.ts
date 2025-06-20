import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
<<<<<<< HEAD
    port: 5177,
=======
    port: 5199, // Use port 5199 as requested
    host: true, // Allow external connections
>>>>>>> dashboard-only
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['react-leaflet', 'leaflet', 'recharts'],
  },
  build: {
    commonjsOptions: {
      include: [/react-leaflet/, /leaflet/, /recharts/, /node_modules/],
    },
  },
})

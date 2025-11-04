import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 🚀 CONFIGURACIÓN DE HOST Y PUERTO (Clave para acceso móvil)
  server: {
    host: '192.168.1.7', // Fuerza a escuchar en la IP local
    port: 5173,         // Fuerza el puerto 5173 (el que está activo)
    strictPort: true,   // Asegura que use este puerto
    hmr: {
      clientPort: 5173  // Asegura que la recarga rápida (HMR) use el puerto correcto
    }
  }
})

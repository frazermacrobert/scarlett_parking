import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/scarlett_parking/',   // match the repo name
  plugins: [react()],
  build: { outDir: 'dist' }
})


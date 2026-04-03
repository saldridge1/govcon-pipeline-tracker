import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/govcon-pipeline-tracker/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})

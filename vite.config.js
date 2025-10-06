import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync } from 'fs'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-redirects',
      closeBundle() {
        const source = 'public/_redirects'
        const dest = 'dist/_redirects'
        if (existsSync(source)) {
          copyFileSync(source, dest)
          console.log('Arquivo _redirects copiado para dist/')
        } else {
          console.warn('Arquivo _redirects não encontrado em /public')
        }
      }
    }
  ],
})

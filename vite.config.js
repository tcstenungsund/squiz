import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    // react(),
    basicSsl()
  ],
  server: {
    https: true,
    host: 'localhost',
    port: 5173,        
    strictPort: true, 
  }
})


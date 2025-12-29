
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Importante: '.' garante que o app funcione em qualquer subpasta (como /finanzaapp/)
  base: './',
  define: {
    // Injeta a API_KEY do GitHub Secrets durante o build
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'recharts', 'lucide-react']
        }
      }
    }
  }
});


import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Define o caminho base como relativo para suportar qualquer subpasta no GitHub Pages
  base: './',
  define: {
    // A chave é injetada automaticamente pelo ambiente de execução
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'recharts', 'lucide-react'],
          genai: ['@google/genai']
        }
      }
    }
  }
});

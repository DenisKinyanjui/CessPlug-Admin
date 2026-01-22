import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 3000, // 👈 change this to any free port (e.g., 3000, 5174, 8080)
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});

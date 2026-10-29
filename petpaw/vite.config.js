import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    // Laravel API (php artisan serve). Avoids CORS during development.
    proxy: { '/api': 'http://127.0.0.1:8000' },
  },
});

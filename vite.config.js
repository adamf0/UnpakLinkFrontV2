import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // base: "/asj_rbac/",
  server: {
    host: true,
    allowedHosts: ['*'],
    proxy: {
      '/realms': {
        target: 'https://gerbang.unpak.ac.id',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react(), tailwindcss(),],
  resolve: {
    alias: {
      "@assets": path.resolve(__dirname, "src/assets"),
      "@src": path.resolve(__dirname, "src"),
      "@": path.resolve(__dirname, "src"),
    },
  }
})
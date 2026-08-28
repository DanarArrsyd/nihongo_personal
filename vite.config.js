import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'Nihongo Personal',
        short_name: 'Nihongo',
        description: 'A personal workspace for structured Japanese study.',
        theme_color: '#F8F5EF',
        background_color: '#F8F5EF',
        display: 'standalone',
        start_url: '/',
        scope: '/',
      },
      workbox: {
        navigateFallback: '/index.html',
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: true,
  },
})

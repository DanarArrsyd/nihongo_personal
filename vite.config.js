import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      registerType: 'prompt',
      manifest: {
        id: '/',
        name: 'Nihongo Personal',
        short_name: 'Nihongo',
        description: 'A personal workspace for structured Japanese study.',
        lang: 'id',
        theme_color: '#F8F5EF',
        background_color: '#F8F5EF',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        categories: ['education', 'productivity'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          { name: 'Daily Mission', short_name: 'Mission', url: '/mission' },
          { name: 'Review', short_name: 'Review', url: '/review' },
          { name: 'Library', short_name: 'Library', url: '/library' },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'nihongo-fonts',
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 365,
                maxEntries: 140,
              },
            },
          },
        ],
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

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // This handles the "Will it update?" question automatically
      includeAssets: ['favicon.png', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Nexus',
        short_name: 'Nexus',
        description: 'My awesome notes application',
        theme_color: '#ffffff',
        icons: [
          {
            // src: 'pwa-192x192.png',
            src: 'apple-touch-icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            // src: 'pwa-512x512.png',
            src: 'apple-touch-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})
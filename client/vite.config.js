import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'MyGarage - Cyfrowy dziennik pojazdu',
        short_name: 'MyGarage',
        description: 'Aplikacja dla entuzjastów motoryzacji',
        theme_color: '#1e293b',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3204/3204121.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn-icons-png.flaticon.com/512/3204/3204121.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
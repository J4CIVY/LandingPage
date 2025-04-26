// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';


export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['Favicon_BSK_Motorcycle_Team_40x40.webp', 'Logo_Letras_Motoclub_BSK_Motorcycle_Team_Blue_192X192.png', 'Logo_Letras_Motoclub_BSK_Motorcycle_Team_White_500X500.png'],
      manifest: {
        name: 'BSK Motorcycle Team',
        short_name: 'BSK MT',
        start_url: '/',
        display: 'standalone',
        background_color: '#000031',
        theme_color: '#ffffff',
        orientation: 'portrait',
        lang: 'es-CO',
        icons: [
          {
            src: '/Logo_Letras_Motoclub_BSK_Motorcycle_Team_Blue_192X192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/Logo_Letras_Motoclub_BSK_Motorcycle_Team_White_500X500.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});

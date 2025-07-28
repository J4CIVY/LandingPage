import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['Favicon_BSK_Motorcycle_Team_40x40.webp', 'Logo_Letras_Motoclub_BSK_Motorcycle_Team_Blue_192X192.webp', 'Logo_Letras_Motoclub_BSK_Motorcycle_Team_White_500X500.png'],
      manifest: {
        name: 'BSK Motorcycle Team',
        short_name: 'BSK MT',
        description: 'Sitio web oficial del motoclub BSK Motorcycle Team. Únete a nuestra comunidad de motociclistas.',
        start_url: '/',
        display: 'standalone',
        background_color: '#000031',
        theme_color: '#ffffff',
        orientation: 'portrait',
        lang: 'es-CO',
        icons: [
          {
            src: '/Logo_Letras_Motoclub_BSK_Motorcycle_Team_Blue_192X192.webp',
            sizes: '192x192',
            type: 'image/webp'
          },
          {
            src: '/Logo_Letras_Motoclub_BSK_Motorcycle_Team_White_500X500.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/Logo_Letras_Motoclub_BSK_Motorcycle_Team_White_500X500.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  build: {
    sourcemap: true,
  }
});

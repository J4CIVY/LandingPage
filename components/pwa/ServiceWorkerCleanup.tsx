'use client';

import { useEffect } from 'react';

/**
 * Componente para limpiar Service Workers obsoletos y caches problemáticos
 */
export const ServiceWorkerCleanup = () => {
  useEffect(() => {
    const cleanupObsoleteServiceWorkers = async () => {
      if ('serviceWorker' in navigator) {
        try {
          // Solo ejecutar en producción
          if (process.env.NODE_ENV !== 'production') {
            return;
          }

          console.log('[SW Cleanup] Iniciando limpieza de caches problemáticos...');

          // Limpiar cachés problemáticos INMEDIATAMENTE
          // No esperamos mensaje del SW porque puede estar roto
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            console.log('[SW Cleanup] Caches encontrados:', cacheNames);
            
            // Filtrar caches problemáticos que causan el error de precaching
            const problematicCaches = cacheNames.filter(name => 
              name.includes('precache') || 
              name.includes('workbox-precache') ||
              name.includes('buildmanifest') ||
              name.includes('ssgmanifest') ||
              name.includes('webpack') ||
              name.includes('chunk-error-handler')
            );

            if (problematicCaches.length > 0) {
              console.log('[SW Cleanup] Eliminando caches problemáticos:', problematicCaches);
              
              for (const cacheName of problematicCaches) {
                try {
                  const deleted = await caches.delete(cacheName);
                  console.log(`[SW Cleanup] ${deleted ? '✅' : '❌'} Cache eliminado:`, cacheName);
                } catch (err) {
                  console.warn('[SW Cleanup] Error al eliminar cache:', cacheName, err);
                }
              }
              
              console.log('[SW Cleanup] ✅ Limpieza completada. Recargando para aplicar cambios...');
              
              // Recargar la página después de limpiar caches problemáticos
              // pero solo si no lo hemos hecho recientemente (evitar loop)
              const lastCleanup = localStorage.getItem('last-sw-cleanup');
              const now = Date.now();
              
              if (!lastCleanup || now - parseInt(lastCleanup) > 60000) {
                localStorage.setItem('last-sw-cleanup', now.toString());
                setTimeout(() => window.location.reload(), 1000);
              }
            } else {
              console.log('[SW Cleanup] No se encontraron caches problemáticos');
            }
          }
          
        } catch (error) {
          console.warn('[SW Cleanup] Error durante la limpieza:', error);
        }
      }
    };

    // Ejecutar después de que la página se haya cargado completamente
    if (document.readyState === 'complete') {
      cleanupObsoleteServiceWorkers();
    } else {
      window.addEventListener('load', cleanupObsoleteServiceWorkers);
      return () => window.removeEventListener('load', cleanupObsoleteServiceWorkers);
    }
  }, []);

  return null; // Este componente no renderiza nada
};

export default ServiceWorkerCleanup;
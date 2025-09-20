'use client';

import { useEffect } from 'react';

/**
 * Componente para limpiar Service Workers obsoletos
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

          // Obtener todas las registraciones de Service Workers
          const registrations = await navigator.serviceWorker.getRegistrations();
          
          // Verificar si hay Service Workers con problemas de precaching
          for (const registration of registrations) {
            if (registration.active) {
              // Enviar mensaje al Service Worker para verificar si tiene problemas
              const channel = new MessageChannel();
              
              channel.port1.onmessage = async (event) => {
                if (event.data.hasPreachingErrors) {
                  console.log('[SW Cleanup] Detectado SW con errores de precaching, limpiando...');
                  
                  // Limpiar cachés problemáticos
                  if ('caches' in window) {
                    const cacheNames = await caches.keys();
                    const problematicCaches = cacheNames.filter(name => 
                      name.includes('precache') || 
                      name.includes('workbox-precache') ||
                      name.includes('buildmanifest') ||
                      name.includes('ssgmanifest')
                    );

                    for (const cacheName of problematicCaches) {
                      console.log('[SW Cleanup] Eliminando caché problemático:', cacheName);
                      await caches.delete(cacheName);
                    }
                  }

                  // Desregistrar el SW problemático
                  await registration.unregister();
                  console.log('[SW Cleanup] Service Worker problemático desregistrado');
                }
              };

              registration.active.postMessage({ 
                type: 'CHECK_PRECACHING_ERRORS' 
              }, [channel.port2]);
            }
          }
          
        } catch (error) {
          console.warn('[SW Cleanup] Error durante la verificación:', error);
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
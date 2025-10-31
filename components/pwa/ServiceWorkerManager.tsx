/**
 * Service Worker para optimizaciones PWA y cache
 * Mejora la performance y habilita funcionalidades offline
 */

'use client';

import { useEffect } from 'react';

export function useServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
          
          // Verifica actualizaciones cada 30 minutos
          setInterval(() => {
            registration.update();
          }, 30 * 60 * 1000);
          
          // Maneja nuevas versiones del Service Worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nueva versión disponible
                  if (confirm('Nueva versión disponible. ¿Recargar página?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          // Don't block the app if service worker fails
          console.warn('SW registration failed: ', registrationError);
          // Clear any corrupted caches
          if ('caches' in window) {
            caches.keys().then(names => {
              names.forEach(name => {
                if (name.includes('precache') || name.includes('workbox')) {
                  caches.delete(name).catch(console.warn);
                }
              });
            });
          }
        });

      // Listen for service worker errors
      navigator.serviceWorker.addEventListener('error', (error) => {
        console.warn('Service Worker error:', error);
      });

      // Handle service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_ERROR') {
          console.warn('Cache error from SW:', event.data.error);
        }
      });
    }
  }, []);
}

// Hook para gestión de cache manual (mantener si hay contexto útil)
export function useCacheManagement() {
  const clearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('Cache cleared');
    }
  };

  const getCacheSize = async () => {
    if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        available: estimate.quota || 0,
        percentage: estimate.usage && estimate.quota ? 
          Math.round((estimate.usage / estimate.quota) * 100) : 0
      };
    }
    return null;
  };

  const preloadCriticalResources = async (urls: string[]) => {
    if ('caches' in window) {
      const cache = await caches.open('critical-resources-v1');
      await cache.addAll(urls);
      console.log('Critical resources preloaded');
    }
  };

  return {
    clearCache,
    getCacheSize,
    preloadCriticalResources,
  };
}

// Componente para gestión de PWA (mantener si hay contexto útil)
export const PWAManager: React.FC = () => {
  useServiceWorker();
  
  useEffect(() => {
  // Gestión de instalación PWA (mantener si hay contexto útil)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let deferredPrompt: any;
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      
  // Muestra botón de instalación personalizado tras unos segundos
      setTimeout(() => {
        if (deferredPrompt && !window.matchMedia('(display-mode: standalone)').matches) {
          // Crea notificación de instalación
          const installBanner = document.createElement('div');
          installBanner.className = 'fixed bottom-4 left-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between';
          
          // SECURITY FIX: Build DOM safely instead of innerHTML
          const contentDiv = document.createElement('div');
          
          const titleP = document.createElement('p');
          titleP.className = 'font-semibold';
          titleP.textContent = 'Instala BSK MT';
          
          const descP = document.createElement('p');
          descP.className = 'text-sm';
          descP.textContent = 'Acceso rápido desde tu dispositivo';
          
          contentDiv.appendChild(titleP);
          contentDiv.appendChild(descP);
          
          const buttonsDiv = document.createElement('div');
          buttonsDiv.className = 'flex gap-2';
          
          const installBtn = document.createElement('button');
          installBtn.id = 'install-btn';
          installBtn.className = 'bg-white text-green-600 px-3 py-1 rounded text-sm font-medium';
          installBtn.textContent = 'Instalar';
          
          const dismissBtn = document.createElement('button');
          dismissBtn.id = 'dismiss-btn';
          dismissBtn.className = 'text-white underline text-sm';
          dismissBtn.textContent = 'Cerrar';
          
          buttonsDiv.appendChild(installBtn);
          buttonsDiv.appendChild(dismissBtn);
          
          installBanner.appendChild(contentDiv);
          installBanner.appendChild(buttonsDiv);
          
          document.body.appendChild(installBanner);
          
          installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
              deferredPrompt.prompt();
              const result = await deferredPrompt.userChoice;
              console.log('PWA install result:', result);
              deferredPrompt = null;
              installBanner.remove();
            }
          });
          
          dismissBtn?.addEventListener('click', () => {
            installBanner.remove();
            localStorage.setItem('pwa-install-dismissed', 'true');
          });
          
          // Auto-remueve después de 10 segundos
          setTimeout(() => {
            if (document.body.contains(installBanner)) {
              installBanner.remove();
            }
          }, 10000);
        }
      }, 5000);
    };

  // Solo muestra si no se ha descartado antes
    if (!localStorage.getItem('pwa-install-dismissed')) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

  // Detecta cuando la PWA se instala
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      localStorage.removeItem('pwa-install-dismissed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return null;
};

// Hook para gestión de estado offline (mantener si hay contexto útil)
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
  // Muestra mensaje de reconexión
        console.log('Back online!');
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      console.log('Gone offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}

import { useState } from 'react';

export default {
  useServiceWorker,
  useCacheManagement,
  useOfflineStatus,
  PWAManager,
};

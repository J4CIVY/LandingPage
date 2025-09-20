/**
 * Script para limpiar Service Workers obsoletos y cachés problemáticos
 * Se ejecuta automáticamente al cargar la aplicación
 */

export const cleanupObsoleteServiceWorkers = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Obtener todas las registraciones de Service Workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      // Desregistrar Service Workers obsoletos
      for (const registration of registrations) {
        if (registration.scope.includes('bskmt.com')) {
          console.log('[SW Cleanup] Limpiando Service Worker obsoleto:', registration.scope);
          await registration.unregister();
        }
      }

      // Limpiar cachés obsoletos
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const obsoleteCaches = cacheNames.filter(name => 
          name.includes('precache') || 
          name.includes('workbox-precache') ||
          name.includes('buildmanifest')
        );

        for (const cacheName of obsoleteCaches) {
          console.log('[SW Cleanup] Eliminando caché obsoleto:', cacheName);
          await caches.delete(cacheName);
        }
      }

      console.log('[SW Cleanup] Limpieza de Service Worker completada');
      
      // Recargar para registrar el nuevo Service Worker
      if (registrations.length > 0) {
        console.log('[SW Cleanup] Recargando para aplicar el nuevo Service Worker...');
        window.location.reload();
      }
      
    } catch (error) {
      console.warn('[SW Cleanup] Error durante la limpieza:', error);
    }
  }
};

// Auto-ejecutar al cargar el módulo
if (typeof window !== 'undefined') {
  cleanupObsoleteServiceWorkers();
}
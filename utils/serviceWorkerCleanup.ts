/**
 * Script para limpiar Service Workers obsoletos y cachés problemáticos
 * Se ejecuta automáticamente al cargar la aplicación
 */

export const cleanupObsoleteServiceWorkers = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Obtiene todas las registraciones de Service Workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      // Lista de hosts permitidos para Service Workers
      const allowedHosts = [
        'bskmt.com',
        'www.bskmt.com',
        'localhost',
        '127.0.0.1'
      ];
      
      // Desregistra Service Workers obsoletos
      for (const registration of registrations) {
        try {
          // Parsear la URL del scope para obtener el hostname
          const scopeUrl = new URL(registration.scope);
          const hostname = scopeUrl.hostname;
          
          // Verificar si el hostname está en la lista de permitidos
          // o si es un subdominio válido de bskmt.com
          const isAllowed = allowedHosts.includes(hostname) || 
                           hostname.endsWith('.bskmt.com');
          
          if (isAllowed) {
            console.log('[SW Cleanup] Limpiando Service Worker obsoleto:', registration.scope);
            await registration.unregister();
          } else {
            console.warn('[SW Cleanup] Service Worker de dominio no permitido ignorado:', hostname);
          }
        } catch (error) {
          console.error('[SW Cleanup] Error al parsear scope del Service Worker:', registration.scope, error);
        }
      }

  // Limpia cachés obsoletos
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
      
  // Recarga para registrar el nuevo Service Worker
      if (registrations.length > 0) {
        console.log('[SW Cleanup] Recargando para aplicar el nuevo Service Worker...');
        window.location.reload();
      }
      
    } catch (error) {
      console.warn('[SW Cleanup] Error durante la limpieza:', error);
    }
  }
};

// Auto-ejecutar al cargar el módulo (mantener si hay contexto útil)
if (typeof window !== 'undefined') {
  void cleanupObsoleteServiceWorkers();
}
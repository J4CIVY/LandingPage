import RankingUpdateService from '@/lib/services/RankingUpdateService';

let isInitialized = false;

/**
 * Inicializa los servicios del servidor una sola vez
 */
export async function initializeServerServices() {
  if (isInitialized) {
    return;
  }

  try {
    console.log('Inicializando servicios del servidor...');
    
    // Inicializar el servicio de actualización de rankings
    const rankingService = RankingUpdateService.getInstance();
    await rankingService.initialize();
    
    isInitialized = true;
    console.log('Servicios del servidor inicializados correctamente');
    
  } catch (error) {
    console.error('Error inicializando servicios del servidor:', error);
  }
}

// Auto-inicializar en el lado del servidor
if (typeof window === 'undefined') {
  initializeServerServices();
}
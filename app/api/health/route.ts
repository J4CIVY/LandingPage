import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse 
} from '@/lib/api-utils';
import { db } from '@/lib/database';

/**
 * GET /api/health
 * Verifica el estado de salud de la API
 */
async function handleGet(request: NextRequest) {
  const start = Date.now();
  
  try {
    // Verificar la base de datos
    const dbStats = db.getStats();
    
    const responseTime = Date.now() - start;
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      database: {
        status: 'connected',
        collections: dbStats
      },
      dependencies: {
        nodejs: process.version,
        platform: process.platform,
        arch: process.arch
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      }
    };

    return createSuccessResponse(
      healthStatus,
      'API funcionando correctamente'
    );
  } catch (error) {
    return createSuccessResponse(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Error en verificación de salud'
      },
      'Error en verificación de salud',
      500
    );
  }
}

export async function GET(request: NextRequest) {
  return withErrorHandling(handleGet)(request);
}

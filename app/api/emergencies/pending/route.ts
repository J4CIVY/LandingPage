import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse
} from '@/lib/api-utils';
import connectDB from '@/lib/mongodb';
import Emergency from '@/lib/models/Emergency';

/**
 * GET /api/emergencies/pending
 * Obtiene todas las emergencias pendientes ordenadas por prioridad
 */
async function handleGet(request: NextRequest) {
  await connectDB();
  
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  
  // Obtener emergencias pendientes
  const emergencies = await Emergency.find({
    status: { $in: ['pending', 'in-progress'] },
    isActive: true
  })
  .sort({ 
    priority: -1, // Ordenar por prioridad descendente
    createdAt: 1   // Las más antiguas primero para misma prioridad
  })
  .limit(limit)
  .populate('assignedTo', 'firstName lastName phone')
  .exec();
  
  // Calcular estadísticas rápidas
  const stats = await Emergency.aggregate([
    {
      $match: {
        status: { $in: ['pending', 'in-progress'] },
        isActive: true
      }
    },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const priorityStats = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  };
  
  stats.forEach(stat => {
    priorityStats[stat._id as keyof typeof priorityStats] = stat.count;
  });
  
  const totalPending = Object.values(priorityStats).reduce((sum, count) => sum + count, 0);
  
  return createSuccessResponse({
    emergencies,
    stats: {
      total: totalPending,
      byPriority: priorityStats
    }
  }, 'Emergencias pendientes obtenidas exitosamente');
}

// Handler principal
export async function GET(request: NextRequest) {
  return withErrorHandling(handleGet)(request);
}

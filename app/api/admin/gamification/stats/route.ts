import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AdminRequest } from '@/lib/auth-admin';
import connectDB from '@/lib/mongodb';
import { EstadisticasUsuario } from '@/lib/models/Gamification';
import { TransaccionPuntos } from '@/lib/models/Gamification';
import { Recompensa, CanjeRecompensa } from '@/lib/models/Gamification';


// GET /api/admin/gamification/stats - Obtener estadísticas de gamificación para admin
export async function GET(req: NextRequest) {
  const adminRequest = req as AdminRequest;
  
  // Verificar permisos de administrador
  const authCheck = await requireAdmin(adminRequest);
  if (authCheck) return authCheck;

  try {
    await connectDB();

    // Obtener fecha de inicio del mes
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    // 1. Puntos generados este mes
    const puntosGeneradosMes = await TransaccionPuntos.aggregate([
      {
        $match: {
          tipo: { $in: ['ganancia', 'bonificacion'] },
          fechaTransaccion: { $gte: inicioMes },
          activo: true
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$cantidad' }
        }
      }
    ]);

    // 2. Total de canjes
    const totalCanjes = await CanjeRecompensa.countDocuments({
      estado: { $in: ['completado', 'procesando', 'pendiente'] }
    });

    // 3. Canjes este mes
    const canjesEsteMes = await CanjeRecompensa.countDocuments({
      fechaCanje: { $gte: inicioMes },
      estado: { $in: ['completado', 'procesando', 'pendiente'] }
    });

    // 4. Total de puntos en circulación
    const puntosCirculacion = await EstadisticasUsuario.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$puntos.total' }
        }
      }
    ]);

    // 5. Recompensas más canjeadas
    const recompensasMasCanjeadas = await CanjeRecompensa.aggregate([
      {
        $match: {
          estado: 'completado'
        }
      },
      {
        $group: {
          _id: '$recompensaId',
          cantidad: { $sum: 1 },
          puntosTotal: { $sum: '$puntosUtilizados' }
        }
      },
      {
        $sort: { cantidad: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'recompensas',
          localField: '_id',
          foreignField: '_id',
          as: 'recompensa'
        }
      },
      {
        $unwind: '$recompensa'
      },
      {
        $project: {
          recompensaId: '$_id',
          cantidad: 1,
          puntosTotal: 1,
          nombre: '$recompensa.nombre',
          imagen: '$recompensa.imagen'
        }
      }
    ]);

    // 6. Top miembros activos (más puntos)
    const topMiembrosActivos = await EstadisticasUsuario.find()
      .sort({ 'puntos.total': -1 })
      .limit(10)
      .populate('usuarioId', 'firstName lastName email profileImage')
      .lean();

    // 7. Usuarios activos este mes
    const usuariosActivosEsteMes = await TransaccionPuntos.distinct('usuarioId', {
      fechaTransaccion: { $gte: inicioMes },
      activo: true
    });

    // 8. Distribución de puntos por nivel
    const distribucionNiveles = await EstadisticasUsuario.aggregate([
      {
        $group: {
          _id: '$nivel.actual',
          cantidad: { $sum: 1 },
          puntosPromedio: { $avg: '$puntos.total' }
        }
      },
      {
        $sort: { cantidad: -1 }
      }
    ]);

    // 9. Total de recompensas disponibles
    const totalRecompensas = await Recompensa.countDocuments({ disponible: true });

    // 10. Stock total de recompensas
    const stockRecompensas = await Recompensa.aggregate([
      {
        $match: { disponible: true, stock: { $ne: null } }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$stock' }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        puntosGeneradosMes: puntosGeneradosMes[0]?.total || 0,
        totalCanjes,
        canjesEsteMes,
        totalPuntosCirculacion: puntosCirculacion[0]?.total || 0,
        recompensasMasCanjeadas,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        topMiembrosActivos: topMiembrosActivos.map((stat: any) => ({
          id: stat.usuarioId?._id,
          nombre: `${stat.usuarioId?.firstName} ${stat.usuarioId?.lastName}`,
          email: stat.usuarioId?.email,
          avatar: stat.usuarioId?.profileImage,
          puntosTotales: stat.puntos?.total || 0,
          nivel: stat.nivel?.actual || 'Novato',
          eventosAsistidos: stat.eventos?.asistidos || 0
        })),
        usuariosActivosEsteMes: usuariosActivosEsteMes.length,
        distribucionNiveles,
        totalRecompensas,
        stockRecompensas: stockRecompensas[0]?.total || 0,
        resumen: {
          mensaje: `${usuariosActivosEsteMes.length} usuarios activos este mes`,
          puntosPromedio: puntosCirculacion[0]?.total / Math.max(topMiembrosActivos.length, 1) || 0,
          tasaCanje: totalCanjes > 0 ? (canjesEsteMes / totalCanjes * 100).toFixed(1) : 0
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de gamificación:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

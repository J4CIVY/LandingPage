import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PQRSDF from '@/lib/models/PQRSDF';
import { rateLimit } from '@/utils/rateLimit';
import { verifyAuth } from '@/lib/auth-utils';

// Rate limiting
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 500,
});

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    try {
      const clientIP = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown';
      await limiter.check(clientIP, 10); // 10 requests per minute
    } catch {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes' },
        { status: 429 }
      );
    }

    // Verificar autenticación
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get('usuarioId');

    // Construir filtros
    const filtros: any = {};
    
    // Si no es admin, solo mostrar estadísticas del usuario
    if (authResult.user.role !== 'admin') {
      filtros.usuarioId = authResult.user.id;
    } else if (usuarioId) {
      filtros.usuarioId = usuarioId;
    }

    // Obtener estadísticas básicas
    const [
      totalSolicitudes,
      estadisticasPorEstado,
      estadisticasPorCategoria,
      solicitudesConSatisfaccion
    ] = await Promise.all([
      // Total de solicitudes
      PQRSDF.countDocuments(filtros),
      
      // Estadísticas por estado
      PQRSDF.aggregate([
        { $match: filtros },
        { 
          $group: {
            _id: '$estado',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Estadísticas por categoría
      PQRSDF.aggregate([
        { $match: filtros },
        { 
          $group: {
            _id: '$categoria',
            count: { $sum: 1 }
          }
        }
      ]),

      // Solicitudes con calificación de satisfacción
      PQRSDF.find({
        ...filtros,
        satisfaccion: { $exists: true, $ne: null }
      }).select('satisfaccion fechaCreacion fechaCierre').lean()
    ]);

    // Formatear estadísticas por estado
    const porEstado = {
      en_revision: 0,
      respondida: 0,
      cerrada: 0,
      escalada: 0
    };

    estadisticasPorEstado.forEach(stat => {
      porEstado[stat._id as keyof typeof porEstado] = stat.count;
    });

    // Formatear estadísticas por categoría
    const porCategoria = {
      peticion: 0,
      queja: 0,
      reclamo: 0,
      sugerencia: 0,
      denuncia: 0,
      felicitacion: 0
    };

    estadisticasPorCategoria.forEach(stat => {
      porCategoria[stat._id as keyof typeof porCategoria] = stat.count;
    });

    // Calcular tiempo promedio de respuesta
    let tiempoPromedioRespuesta = 0;
    if (solicitudesConSatisfaccion.length > 0) {
      const tiemposRespuesta = solicitudesConSatisfaccion
        .filter(s => s.fechaCierre)
        .map(s => {
          const inicio = new Date(s.fechaCreacion).getTime();
          const fin = new Date(s.fechaCierre!).getTime();
          return (fin - inicio) / (1000 * 60 * 60); // horas
        });

      if (tiemposRespuesta.length > 0) {
        tiempoPromedioRespuesta = Math.round(
          tiemposRespuesta.reduce((a, b) => a + b, 0) / tiemposRespuesta.length
        );
      }
    }

    // Calcular satisfacción promedio
    let satisfaccionPromedio = 0;
    if (solicitudesConSatisfaccion.length > 0) {
      const satisfacciones = solicitudesConSatisfaccion
        .filter(s => s.satisfaccion)
        .map(s => s.satisfaccion!);

      if (satisfacciones.length > 0) {
        satisfaccionPromedio = Number(
          (satisfacciones.reduce((a, b) => a + b, 0) / satisfacciones.length).toFixed(1)
        );
      }
    }

    // Obtener estadísticas mensuales (últimos 6 meses)
    const seiseMesesAtras = new Date();
    seiseMesesAtras.setMonth(seiseMesesAtras.getMonth() - 6);

    const estadisticasMensuales = await PQRSDF.aggregate([
      { 
        $match: {
          ...filtros,
          fechaCreacion: { $gte: seiseMesesAtras }
        }
      },
      {
        $group: {
          _id: {
            año: { $year: '$fechaCreacion' },
            mes: { $month: '$fechaCreacion' }
          },
          total: { $sum: 1 },
          resueltas: {
            $sum: {
              $cond: [
                { $in: ['$estado', ['respondida', 'cerrada']] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { '_id.año': 1, '_id.mes': 1 } }
    ]);

    const respuesta = {
      total: totalSolicitudes,
      porEstado,
      porCategoria,
      tiempoPromedioRespuesta,
      satisfaccionPromedio,
      estadisticasMensuales,
      fechaActualizacion: new Date()
    };

    return NextResponse.json(respuesta);

  } catch (error) {
    console.error('Error al obtener estadísticas PQRSDF:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
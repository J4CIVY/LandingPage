import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ReporteContenido } from '@/lib/models/Comunidad';
import { verifySession } from '@/lib/auth-utils';
import { Types } from 'mongoose';

// GET - Obtener reportes (solo moderadores/admins)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { exito: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar permisos de moderador/admin
    if (!['admin', 'moderator'].includes(session.user.role)) {
      return NextResponse.json(
        { exito: false, error: 'Sin permisos para ver reportes' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado') || 'pendiente';
    const tipo = searchParams.get('tipo');
    const limite = parseInt(searchParams.get('limite') || '20');
    const pagina = parseInt(searchParams.get('pagina') || '1');
    const skip = (pagina - 1) * limite;

    // Construir filtro
    const filtro: any = {};
    if (estado !== 'todos') {
      filtro.estado = estado;
    }
    if (tipo) {
      filtro.tipoContenido = tipo;
    }

    // Obtener reportes
    const reportes = await ReporteContenido
      .find(filtro)
      .populate('reportadoPor', 'firstName lastName email')
      .populate('moderadorId', 'firstName lastName email')
      .sort({ fechaReporte: -1 })
      .skip(skip)
      .limit(limite)
      .exec();

    // Obtener total para paginación
    const total = await ReporteContenido.countDocuments(filtro);

    // Transformar datos para el frontend
    const reportesTransformados = reportes.map(reporte => ({
      id: reporte._id.toString(),
      tipoContenido: reporte.tipoContenido,
      contenidoId: reporte.contenidoId.toString(),
      motivo: reporte.motivo,
      descripcion: reporte.descripcion,
      reportadoPor: {
        id: reporte.reportadoPor._id.toString(),
        nombre: `${reporte.reportadoPor.firstName} ${reporte.reportadoPor.lastName}`,
        email: reporte.reportadoPor.email
      },
      fechaReporte: reporte.fechaReporte,
      estado: reporte.estado,
      moderador: reporte.moderadorId ? {
        id: reporte.moderadorId._id.toString(),
        nombre: `${reporte.moderadorId.firstName} ${reporte.moderadorId.lastName}`
      } : null,
      fechaResolucion: reporte.fechaResolucion,
      accionTomada: reporte.accionTomada
    }));

    return NextResponse.json({
      exito: true,
      datos: {
        reportes: reportesTransformados,
        paginacion: {
          paginaActual: pagina,
          totalPaginas: Math.ceil(total / limite),
          totalReportes: total,
          tieneAnterior: pagina > 1,
          tieneSiguiente: pagina < Math.ceil(total / limite)
        }
      },
      mensaje: 'Reportes obtenidos exitosamente'
    });

  } catch (error) {
    console.error('Error al obtener reportes:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo reporte
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { exito: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { tipoContenido, contenidoId, motivo, descripcion } = await request.json();

    // Validaciones
    if (!tipoContenido || !contenidoId || !motivo) {
      return NextResponse.json(
        { exito: false, error: 'Tipo de contenido, ID y motivo son obligatorios' },
        { status: 400 }
      );
    }

    if (!['publicacion', 'comentario', 'mensaje'].includes(tipoContenido)) {
      return NextResponse.json(
        { exito: false, error: 'Tipo de contenido no válido' },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(contenidoId)) {
      return NextResponse.json(
        { exito: false, error: 'ID de contenido inválido' },
        { status: 400 }
      );
    }

    const motivosValidos = [
      'spam', 'contenido_inapropiado', 'acoso', 'lenguaje_ofensivo', 
      'informacion_falsa', 'contenido_duplicado', 'otros'
    ];

    if (!motivosValidos.includes(motivo)) {
      return NextResponse.json(
        { exito: false, error: 'Motivo de reporte no válido' },
        { status: 400 }
      );
    }

    // Verificar que no haya reportado ya este contenido
    const reporteExistente = await ReporteContenido.findOne({
      tipoContenido,
      contenidoId,
      reportadoPor: session.user.id
    });

    if (reporteExistente) {
      return NextResponse.json(
        { exito: false, error: 'Ya has reportado este contenido anteriormente' },
        { status: 400 }
      );
    }

    // Crear nuevo reporte
    const nuevoReporte = new ReporteContenido({
      tipoContenido,
      contenidoId,
      motivo,
      descripcion: descripcion?.trim() || '',
      reportadoPor: session.user.id,
      fechaReporte: new Date(),
      estado: 'pendiente'
    });

    await nuevoReporte.save();

    return NextResponse.json({
      exito: true,
      datos: { reporteId: nuevoReporte._id.toString() },
      mensaje: 'Reporte enviado exitosamente. Será revisado por nuestro equipo de moderación.'
    });

  } catch (error) {
    console.error('Error al crear reporte:', error);
    return NextResponse.json(
      { exito: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
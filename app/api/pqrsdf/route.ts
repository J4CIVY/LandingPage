import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PQRSDF from '@/lib/models/PQRSDF';
import { rateLimit } from '@/utils/rateLimit';
import { verifyAuth } from '@/lib/auth-utils';
import { requireCSRFToken } from '@/lib/csrf-protection';

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
    const categoria = searchParams.get('categoria');
    const estado = searchParams.get('estado');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'fechaCreacion';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Construir filtros
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filtros: any = {};
    
    if (usuarioId) {
      filtros.usuarioId = usuarioId;
    }

    if (categoria) {
      filtros.categoria = categoria;
    }

    if (estado) {
      filtros.estado = estado;
    }

    // Si no es admin, solo mostrar solicitudes del usuario
    if (authResult.user.role !== 'admin' && !usuarioId) {
      filtros.usuarioId = authResult.user.id;
    }

    // Calcular skip para paginación
    const skip = (page - 1) * limit;

    // Construir sort
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Obtener solicitudes
    const solicitudes = await PQRSDF.find(filtros)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Obtener total para paginación
    const total = await PQRSDF.countDocuments(filtros);

    // Formatear fechas para el frontend
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const solicitudesFormateadas = solicitudes.map((solicitud: any) => ({
      ...solicitud,
      id: solicitud._id.toString(),
      _id: solicitud._id.toString(),
      fechaCreacion: solicitud.fechaCreacion,
      fechaActualizacion: solicitud.fechaActualizacion,
      fechaCierre: solicitud.fechaCierre || undefined,
      fechaLimiteRespuesta: solicitud.fechaLimiteRespuesta || undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mensajes: solicitud.mensajes.map((mensaje: any) => ({
        ...mensaje,
        fechaCreacion: mensaje.fechaCreacion
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      timeline: solicitud.timeline.map((evento: any) => ({
        ...evento,
        fecha: evento.fecha
      }))
    }));

    return NextResponse.json({
      solicitudes: solicitudesFormateadas,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener solicitudes PQRSDF:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 0. CSRF Protection
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    // Rate limiting
    try {
      const clientIP = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown';
      await limiter.check(clientIP, 5); // 5 requests per minute
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

    const body = await request.json();
    
    // 1. Validate request body with pqrsdfSchema
    const { pqrsdfSchema } = await import('@/lib/validation-schemas');
    const validationResult = pqrsdfSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.issues },
        { status: 400 }
      );
    }
    
    const validatedData = validationResult.data;

    // Generar número de solicitud
    const numeroSolicitud = await PQRSDF.generarNumeroSolicitud();

    // Crear la solicitud
    const fechaActual = new Date();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const datosNuevaSolicitud: any = {
      numeroSolicitud,
      usuarioId: authResult.user.id,
      categoria: validatedData.categoria,
      subcategoria: validatedData.subcategoria,
      asunto: validatedData.asunto,
      descripcion: validatedData.descripcion,
      prioridad: validatedData.prioridad,
      estado: 'en_revision',
      fechaCreacion: fechaActual,
      fechaActualizacion: fechaActual,
      adjuntos: [],
      mensajes: [],
      timeline: [{
        id: `tl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tipo: 'creada',
        descripcion: 'Solicitud creada',
        fecha: fechaActual,
        autorId: authResult.user.id,
        autorNombre: authResult.user.email || 'Usuario'
      }]
    };

    // Agregar campos de reembolso si aplica
    if (validatedData.subcategoria === 'reembolso') {
      datosNuevaSolicitud.eventoId = validatedData.eventoId;
      datosNuevaSolicitud.eventoNombre = validatedData.eventoNombre;
      datosNuevaSolicitud.montoReembolso = validatedData.montoReembolso;
      datosNuevaSolicitud.ordenPago = validatedData.ordenPago;
      datosNuevaSolicitud.datosBancarios = validatedData.datosBancarios;
      
      // Marcar como alta prioridad si es reembolso
      datosNuevaSolicitud.prioridad = 'alta';
    }

    const nuevaSolicitud = new PQRSDF(datosNuevaSolicitud);
    await nuevaSolicitud.save();

    // Formatear respuesta
    const solicitudFormateada = {
      ...nuevaSolicitud.toObject(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      id: (nuevaSolicitud._id as any).toString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      _id: (nuevaSolicitud._id as any).toString()
    };

    return NextResponse.json(
      { 
        message: 'Solicitud creada exitosamente',
        solicitud: solicitudFormateada
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error al crear solicitud PQRSDF:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
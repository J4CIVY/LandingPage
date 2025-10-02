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
    const categoria = searchParams.get('categoria');
    const estado = searchParams.get('estado');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'fechaCreacion';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Construir filtros
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
    const solicitudesFormateadas = solicitudes.map((solicitud: any) => ({
      ...solicitud,
      id: solicitud._id.toString(),
      _id: solicitud._id.toString(),
      fechaCreacion: solicitud.fechaCreacion,
      fechaActualizacion: solicitud.fechaActualizacion,
      fechaCierre: solicitud.fechaCierre || undefined,
      fechaLimiteRespuesta: solicitud.fechaLimiteRespuesta || undefined,
      mensajes: solicitud.mensajes.map((mensaje: any) => ({
        ...mensaje,
        fechaCreacion: mensaje.fechaCreacion
      })),
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
    const { 
      categoria, 
      subcategoria,
      asunto, 
      descripcion, 
      prioridad = 'media',
      eventoId,
      eventoNombre,
      montoReembolso,
      ordenPago,
      datosBancarios
    } = body;

    // Validar campos requeridos
    if (!categoria || !asunto || !descripcion) {
      return NextResponse.json(
        { error: 'Categoria, asunto y descripción son requeridos' },
        { status: 400 }
      );
    }

    // Validar categoría
    const categoriasValidas = ['peticion', 'queja', 'reclamo', 'sugerencia', 'denuncia', 'felicitacion'];
    if (!categoriasValidas.includes(categoria)) {
      return NextResponse.json(
        { error: 'Categoría no válida' },
        { status: 400 }
      );
    }

    // Validar subcategoría si se proporciona
    if (subcategoria) {
      const subcategoriasValidas = ['general', 'reembolso', 'cambio_datos', 'certificado', 'otro'];
      if (!subcategoriasValidas.includes(subcategoria)) {
        return NextResponse.json(
          { error: 'Subcategoría no válida' },
          { status: 400 }
        );
      }
    }

    // Validar campos de reembolso si la subcategoría es 'reembolso'
    if (subcategoria === 'reembolso') {
      if (!eventoId || !datosBancarios) {
        return NextResponse.json(
          { error: 'Para reembolsos son requeridos eventoId y datosBancarios' },
          { status: 400 }
        );
      }

      // Validar datos bancarios
      const camposRequeridos = ['nombreTitular', 'tipoDocumento', 'numeroDocumento', 'banco', 'tipoCuenta', 'numeroCuenta', 'emailConfirmacion', 'telefonoContacto'];
      for (const campo of camposRequeridos) {
        if (!datosBancarios[campo]) {
          return NextResponse.json(
            { error: `El campo ${campo} es requerido en datos bancarios` },
            { status: 400 }
          );
        }
      }
    }

    // Validar prioridad
    const prioridadesValidas = ['baja', 'media', 'alta', 'urgente'];
    if (!prioridadesValidas.includes(prioridad)) {
      return NextResponse.json(
        { error: 'Prioridad no válida' },
        { status: 400 }
      );
    }

    // Generar número de solicitud
    const numeroSolicitud = await PQRSDF.generarNumeroSolicitud();

    // Crear la solicitud
    const fechaActual = new Date();
    const datosNuevaSolicitud: any = {
      numeroSolicitud,
      usuarioId: authResult.user.id,
      categoria,
      subcategoria,
      asunto,
      descripcion,
      prioridad,
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
    if (subcategoria === 'reembolso') {
      datosNuevaSolicitud.eventoId = eventoId;
      datosNuevaSolicitud.eventoNombre = eventoNombre;
      datosNuevaSolicitud.montoReembolso = montoReembolso;
      datosNuevaSolicitud.ordenPago = ordenPago;
      datosNuevaSolicitud.datosBancarios = datosBancarios;
      
      // Marcar como alta prioridad si es reembolso
      datosNuevaSolicitud.prioridad = 'alta';
    }

    const nuevaSolicitud = new PQRSDF(datosNuevaSolicitud);
    await nuevaSolicitud.save();

    // Formatear respuesta
    const solicitudFormateada = {
      ...nuevaSolicitud.toObject(),
      id: (nuevaSolicitud._id as any).toString(),
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
import { 
  Solicitud, 
  Mensaje, 
  TimelineEvento, 
  CrearSolicitudDto,
  SolicitudCategoria,
  SolicitudEstado
} from '@/types/pqrsdf';

// Datos mock para desarrollo
export const SOLICITUDES_MOCK: Solicitud[] = [
  {
    id: '1',
    numeroSolicitud: 'PQRS-2025-0001',
    usuarioId: 'user1',
    categoria: 'peticion',
    asunto: 'Solicitud de información sobre eventos próximos',
    descripcion: 'Quisiera obtener información detallada sobre los próximos eventos del club, incluyendo fechas, ubicaciones y requisitos para participar.',
    estado: 'respondida',
    prioridad: 'media',
    fechaCreacion: new Date('2025-01-10T10:00:00'),
    fechaActualizacion: new Date('2025-01-12T14:30:00'),
    adjuntos: [],
    mensajes: [
      {
        id: 'm1',
        solicitudId: '1',
        contenido: 'Hola, me gustaría conocer más detalles sobre los eventos programados para este trimestre.',
        tipo: 'usuario',
        autorNombre: 'Juan Pérez',
        fechaCreacion: new Date('2025-01-10T10:00:00'),
        adjuntos: []
      },
      {
        id: 'm2',
        solicitudId: '1',
        contenido: 'Hola Juan, gracias por tu consulta. Te enviamos el calendario de eventos actualizado. Puedes ver todos los detalles en la sección de eventos del dashboard.',
        tipo: 'admin',
        autorNombre: 'Administrador BSK',
        fechaCreacion: new Date('2025-01-12T14:30:00'),
        adjuntos: []
      }
    ],
    timeline: [
      {
        id: 't1',
        solicitudId: '1',
        tipo: 'creada',
        descripcion: 'Solicitud creada',
        fecha: new Date('2025-01-10T10:00:00'),
        autorNombre: 'Juan Pérez'
      },
      {
        id: 't2',
        solicitudId: '1',
        tipo: 'respondida',
        descripcion: 'Solicitud respondida por el administrador',
        fecha: new Date('2025-01-12T14:30:00'),
        autorNombre: 'Administrador BSK'
      }
    ]
  },
  {
    id: '2',
    numeroSolicitud: 'PQRS-2025-0002',
    usuarioId: 'user1',
    categoria: 'queja',
    asunto: 'Problema con el sistema de registro',
    descripcion: 'El sistema de registro para eventos presenta errores constantes y no permite completar la inscripción.',
    estado: 'en_revision',
    prioridad: 'alta',
    fechaCreacion: new Date('2025-01-15T09:15:00'),
    fechaActualizacion: new Date('2025-01-15T09:15:00'),
    adjuntos: [],
    mensajes: [
      {
        id: 'm3',
        solicitudId: '2',
        contenido: 'He intentado registrarme para el evento del próximo fin de semana pero el sistema muestra errores cuando trato de completar el formulario.',
        tipo: 'usuario',
        autorNombre: 'Juan Pérez',
        fechaCreacion: new Date('2025-01-15T09:15:00'),
        adjuntos: []
      }
    ],
    timeline: [
      {
        id: 't3',
        solicitudId: '2',
        tipo: 'creada',
        descripcion: 'Solicitud creada',
        fecha: new Date('2025-01-15T09:15:00'),
        autorNombre: 'Juan Pérez'
      }
    ]
  },
  {
    id: '3',
    numeroSolicitud: 'PQRS-2025-0003',
    usuarioId: 'user1',
    categoria: 'sugerencia',
    asunto: 'Mejora en la aplicación móvil',
    descripcion: 'Sería útil tener notificaciones push para eventos próximos y recordatorios importantes.',
    estado: 'cerrada',
    prioridad: 'baja',
    fechaCreacion: new Date('2025-01-08T16:45:00'),
    fechaActualizacion: new Date('2025-01-14T11:20:00'),
    fechaCierre: new Date('2025-01-14T11:20:00'),
    adjuntos: [],
    mensajes: [
      {
        id: 'm4',
        solicitudId: '3',
        contenido: 'Sugiero implementar notificaciones push para mantener a los miembros informados sobre eventos y actividades importantes.',
        tipo: 'usuario',
        autorNombre: 'Juan Pérez',
        fechaCreacion: new Date('2025-01-08T16:45:00'),
        adjuntos: []
      },
      {
        id: 'm5',
        solicitudId: '3',
        contenido: 'Excelente sugerencia Juan. Hemos añadido esta funcionalidad a nuestro roadmap de desarrollo. Esperamos implementarla en las próximas actualizaciones.',
        tipo: 'admin',
        autorNombre: 'Desarrollador BSK',
        fechaCreacion: new Date('2025-01-14T11:20:00'),
        adjuntos: []
      }
    ],
    timeline: [
      {
        id: 't4',
        solicitudId: '3',
        tipo: 'creada',
        descripcion: 'Solicitud creada',
        fecha: new Date('2025-01-08T16:45:00'),
        autorNombre: 'Juan Pérez'
      },
      {
        id: 't5',
        solicitudId: '3',
        tipo: 'respondida',
        descripcion: 'Solicitud respondida y evaluada',
        fecha: new Date('2025-01-14T11:20:00'),
        autorNombre: 'Desarrollador BSK'
      },
      {
        id: 't6',
        solicitudId: '3',
        tipo: 'cerrada',
        descripcion: 'Solicitud cerrada - Sugerencia implementada en roadmap',
        fecha: new Date('2025-01-14T11:20:00'),
        autorNombre: 'Desarrollador BSK'
      }
    ]
  }
];

// Servicio mock para manejo de solicitudes
export class PQRSDFService {
  private static solicitudes: Solicitud[] = [...SOLICITUDES_MOCK];
  private static contadorSolicitudes = 4;

  // Obtener todas las solicitudes del usuario
  static async obtenerSolicitudes(usuarioId: string): Promise<Solicitud[]> {
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return this.solicitudes.filter(s => s.usuarioId === usuarioId);
  }

  // Obtener una solicitud específica
  static async obtenerSolicitud(id: string): Promise<Solicitud | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return this.solicitudes.find(s => s.id === id) || null;
  }

  // Crear nueva solicitud
  static async crearSolicitud(usuarioId: string, datos: CrearSolicitudDto): Promise<Solicitud> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const numeroSolicitud = `PQRS-2025-${String(this.contadorSolicitudes).padStart(4, '0')}`;
    const ahora = new Date();
    
    const nuevaSolicitud: Solicitud = {
      id: String(this.contadorSolicitudes),
      numeroSolicitud,
      usuarioId,
      categoria: datos.categoria,
      asunto: datos.asunto,
      descripcion: datos.descripcion,
      estado: 'en_revision',
      prioridad: 'media',
      fechaCreacion: ahora,
      fechaActualizacion: ahora,
      adjuntos: [], // En un entorno real, se procesarían los archivos
      mensajes: [],
      timeline: [{
        id: `t${this.contadorSolicitudes}`,
        solicitudId: String(this.contadorSolicitudes),
        tipo: 'creada',
        descripcion: 'Solicitud creada',
        fecha: ahora,
        autorNombre: 'Usuario' // En un entorno real, se obtendría del contexto de usuario
      }]
    };

    this.solicitudes.push(nuevaSolicitud);
    this.contadorSolicitudes++;

    return nuevaSolicitud;
  }

  // Enviar mensaje en una solicitud
  static async enviarMensaje(solicitudId: string, contenido: string, autorNombre: string): Promise<Mensaje> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const solicitud = this.solicitudes.find(s => s.id === solicitudId);
    if (!solicitud) {
      throw new Error('Solicitud no encontrada');
    }

    const nuevoMensaje: Mensaje = {
      id: `m${Date.now()}`,
      solicitudId,
      contenido,
      tipo: 'usuario',
      autorNombre,
      fechaCreacion: new Date(),
      adjuntos: []
    };

    solicitud.mensajes.push(nuevoMensaje);
    solicitud.fechaActualizacion = new Date();

    // Agregar evento al timeline
    const timelineEvento: TimelineEvento = {
      id: `t${Date.now()}`,
      solicitudId,
      tipo: 'mensaje',
      descripcion: 'Nuevo mensaje agregado',
      fecha: new Date(),
      autorNombre
    };

    solicitud.timeline.push(timelineEvento);

    return nuevoMensaje;
  }

  // Cerrar solicitud
  static async cerrarSolicitud(solicitudId: string, autorNombre: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const solicitud = this.solicitudes.find(s => s.id === solicitudId);
    if (!solicitud) {
      throw new Error('Solicitud no encontrada');
    }

    solicitud.estado = 'cerrada';
    solicitud.fechaCierre = new Date();
    solicitud.fechaActualizacion = new Date();

    // Agregar evento al timeline
    const timelineEvento: TimelineEvento = {
      id: `t${Date.now()}`,
      solicitudId,
      tipo: 'cerrada',
      descripcion: 'Solicitud cerrada por el usuario',
      fecha: new Date(),
      autorNombre
    };

    solicitud.timeline.push(timelineEvento);
  }

  // Generar número de solicitud
  static generarNumeroSolicitud(): string {
    const año = new Date().getFullYear();
    const numero = String(this.contadorSolicitudes).padStart(4, '0');
    return `PQRS-${año}-${numero}`;
  }

  // Estadísticas mock
  static async obtenerEstadisticas(usuarioId: string) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const solicitudesUsuario = this.solicitudes.filter(s => s.usuarioId === usuarioId);
    
    return {
      total: solicitudesUsuario.length,
      porEstado: {
        en_revision: solicitudesUsuario.filter(s => s.estado === 'en_revision').length,
        respondida: solicitudesUsuario.filter(s => s.estado === 'respondida').length,
        cerrada: solicitudesUsuario.filter(s => s.estado === 'cerrada').length,
        escalada: solicitudesUsuario.filter(s => s.estado === 'escalada').length
      },
      porCategoria: {
        peticion: solicitudesUsuario.filter(s => s.categoria === 'peticion').length,
        queja: solicitudesUsuario.filter(s => s.categoria === 'queja').length,
        reclamo: solicitudesUsuario.filter(s => s.categoria === 'reclamo').length,
        sugerencia: solicitudesUsuario.filter(s => s.categoria === 'sugerencia').length,
        denuncia: solicitudesUsuario.filter(s => s.categoria === 'denuncia').length,
        felicitacion: solicitudesUsuario.filter(s => s.categoria === 'felicitacion').length
      },
      tiempoPromedioRespuesta: 24, // horas
      satisfaccionPromedio: 4.2
    };
  }
}
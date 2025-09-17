import { 
  Solicitud, 
  Mensaje, 
  TimelineEvento, 
  CrearSolicitudDto,
  SolicitudCategoria,
  SolicitudEstado,
  EstadisticasSolicitudes
} from '@/types/pqrsdf';

// Configuración de la API
const API_BASE_URL = '/api/pqrsdf';

// Utility function para manejar errores de fetch
const handleFetchError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// Datos mock para desarrollo (mantenemos como fallback)
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

// Servicio para manejo de solicitudes PQRSDF
export class PQRSDFService {
  
  // Obtener solicitudes del usuario
  static async obtenerSolicitudes(usuarioId: string): Promise<Solicitud[]> {
    try {
      console.log('PQRSDFService.obtenerSolicitudes llamado con usuarioId:', usuarioId);
      
      const response = await fetch(`${API_BASE_URL}?usuarioId=${encodeURIComponent(usuarioId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'no-cache'
      });

      const data = await handleFetchError(response);
      console.log('Solicitudes obtenidas desde API:', data);
      
      return data.solicitudes || [];
    } catch (error) {
      console.error('Error al obtener solicitudes desde API:', error);
      
      // Fallback a datos mock en caso de error
      console.log('Usando datos mock como fallback');
      const solicitudesMock = await this.obtenerSolicitudesMock(usuarioId);
      return solicitudesMock;
    }
  }

  // Obtener una solicitud específica
  static async obtenerSolicitud(id: string): Promise<Solicitud | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'no-cache'
      });

      if (response.status === 404) {
        return null;
      }

      const data = await handleFetchError(response);
      return data;
    } catch (error) {
      console.error('Error al obtener solicitud desde API:', error);
      return null;
    }
  }

  // Crear nueva solicitud
  static async crearSolicitud(usuarioId: string, datos: CrearSolicitudDto): Promise<Solicitud> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      const data = await handleFetchError(response);
      console.log('Solicitud creada:', data);
      
      return data.solicitud;
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      throw error;
    }
  }

  // Enviar mensaje en una solicitud
  static async enviarMensaje(solicitudId: string, contenido: string, autorNombre: string): Promise<Mensaje> {
    try {
      const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(solicitudId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accion: 'agregar_mensaje',
          datos: {
            contenido,
            autorNombre
          }
        })
      });

      const data = await handleFetchError(response);
      
      // Retornar el último mensaje agregado
      const mensajes = data.solicitud.mensajes;
      return mensajes[mensajes.length - 1];
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw error;
    }
  }

  // Cambiar estado de solicitud (solo admin)
  static async cambiarEstado(
    solicitudId: string, 
    nuevoEstado: SolicitudEstado, 
    descripcion?: string
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(solicitudId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accion: 'cambiar_estado',
          datos: {
            estado: nuevoEstado,
            descripcion
          }
        })
      });

      await handleFetchError(response);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      throw error;
    }
  }

  // Calificar solicitud
  static async calificarSolicitud(
    solicitudId: string, 
    satisfaccion: number, 
    comentario?: string
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(solicitudId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accion: 'calificar',
          datos: {
            satisfaccion,
            comentario
          }
        })
      });

      await handleFetchError(response);
    } catch (error) {
      console.error('Error al calificar solicitud:', error);
      throw error;
    }
  }

  // Cerrar solicitud
  static async cerrarSolicitud(solicitudId: string, autorNombre: string): Promise<void> {
    try {
      await this.cambiarEstado(solicitudId, 'cerrada', 'Solicitud cerrada por el usuario');
    } catch (error) {
      console.error('Error al cerrar solicitud:', error);
      throw error;
    }
  }

  // Obtener estadísticas
  static async obtenerEstadisticas(usuarioId: string): Promise<EstadisticasSolicitudes> {
    try {
      console.log('PQRSDFService.obtenerEstadisticas llamado con usuarioId:', usuarioId);
      
      const response = await fetch(`${API_BASE_URL}/estadisticas?usuarioId=${encodeURIComponent(usuarioId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'no-cache'
      });

      const data = await handleFetchError(response);
      console.log('Estadísticas obtenidas desde API:', data);
      
      return data;
    } catch (error) {
      console.error('Error al obtener estadísticas desde API:', error);
      
      // Fallback a estadísticas mock
      console.log('Usando estadísticas mock como fallback');
      return await this.obtenerEstadisticasMock(usuarioId);
    }
  }

  // ===== MÉTODOS MOCK DE FALLBACK =====
  private static solicitudes: Solicitud[] = [...SOLICITUDES_MOCK];
  private static contadorSolicitudes = 4;

  private static async obtenerSolicitudesMock(usuarioId: string): Promise<Solicitud[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    console.log('Usando datos mock para usuario:', usuarioId);
    
    let solicitudesUsuario = this.solicitudes.filter(s => s.usuarioId === usuarioId);
    
    if (solicitudesUsuario.length === 0) {
      // Crear solicitudes de ejemplo para este usuario
      const solicitudesEjemplo = this.crearSolicitudesEjemplo(usuarioId);
      this.solicitudes.push(...solicitudesEjemplo);
      solicitudesUsuario = solicitudesEjemplo;
    }
    
    return solicitudesUsuario;
  }

  private static async obtenerEstadisticasMock(usuarioId: string): Promise<EstadisticasSolicitudes> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const solicitudesUsuario = await this.obtenerSolicitudesMock(usuarioId);
    
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

  // Crear solicitudes de ejemplo para un nuevo usuario
  private static crearSolicitudesEjemplo(usuarioId: string): Solicitud[] {
    const ahora = new Date();
    const hace3Dias = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const hace1Semana = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return [
      {
        id: `${usuarioId}_1`,
        numeroSolicitud: `PQRS-2025-${String(this.contadorSolicitudes + 1).padStart(4, '0')}`,
        usuarioId,
        categoria: 'peticion',
        asunto: 'Información sobre próximos eventos',
        descripcion: 'Solicito información sobre los eventos programados para este mes.',
        estado: 'respondida',
        prioridad: 'media',
        fechaCreacion: hace1Semana,
        fechaActualizacion: hace3Dias,
        adjuntos: [],
        mensajes: [
          {
            id: `m_${usuarioId}_1`,
            solicitudId: `${usuarioId}_1`,
            contenido: 'Solicito información sobre los eventos programados para este mes.',
            tipo: 'usuario',
            autorNombre: 'Usuario',
            fechaCreacion: hace1Semana,
            adjuntos: []
          },
          {
            id: `m_${usuarioId}_2`,
            solicitudId: `${usuarioId}_1`,
            contenido: 'Hola, puedes revisar el calendario de eventos en el dashboard. Se actualiza semanalmente.',
            tipo: 'admin',
            autorNombre: 'Administrador',
            fechaCreacion: hace3Dias,
            adjuntos: []
          }
        ],
        timeline: [
          {
            id: `t_${usuarioId}_1`,
            solicitudId: `${usuarioId}_1`,
            tipo: 'creada',
            descripcion: 'Solicitud creada',
            fecha: hace1Semana,
            autorNombre: 'Usuario'
          },
          {
            id: `t_${usuarioId}_2`,
            solicitudId: `${usuarioId}_1`,
            tipo: 'respondida',
            descripcion: 'Solicitud respondida',
            fecha: hace3Dias,
            autorNombre: 'Administrador'
          }
        ]
      },
      {
        id: `${usuarioId}_2`,
        numeroSolicitud: `PQRS-2025-${String(this.contadorSolicitudes + 2).padStart(4, '0')}`,
        usuarioId,
        categoria: 'sugerencia',
        asunto: 'Mejora en notificaciones',
        descripcion: 'Sería útil tener notificaciones push para eventos importantes.',
        estado: 'en_revision',
        prioridad: 'media',
        fechaCreacion: ahora,
        fechaActualizacion: ahora,
        adjuntos: [],
        mensajes: [
          {
            id: `m_${usuarioId}_3`,
            solicitudId: `${usuarioId}_2`,
            contenido: 'Sugiero implementar notificaciones push para mantener informados a los miembros.',
            tipo: 'usuario',
            autorNombre: 'Usuario',
            fechaCreacion: ahora,
            adjuntos: []
          }
        ],
        timeline: [
          {
            id: `t_${usuarioId}_3`,
            solicitudId: `${usuarioId}_2`,
            tipo: 'creada',
            descripcion: 'Solicitud creada',
            fecha: ahora,
            autorNombre: 'Usuario'
          }
        ]
      }
    ];
  }
}
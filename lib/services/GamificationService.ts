import mongoose from 'mongoose';
import User from '@/lib/models/User';
import Event from '@/lib/models/Event';
import connectToDatabase from '@/lib/mongodb';
import { 
  TransaccionPuntos, 
  EstadisticasUsuario, 
  Recompensa, 
  CanjeRecompensa,
  ITransaccionPuntos,
  IEstadisticasUsuario,
  IRecompensa,
  ICanjeRecompensa
} from '@/lib/models/Gamification';
import { Achievement, UserAchievement, IAchievement, IUserAchievement } from '@/lib/models/Achievement';

export interface AccionPuntos {
  tipo: 'registro_evento' | 'asistencia_evento' | 'publicacion' | 'comentario' | 'reaccion' | 'bonificacion' | 'referido' | 'voluntariado' | 'organizacion_evento' | 'liderazgo_proyecto' | 'mentoría';
  puntos: number;
  descripcion: string;
}

export const ACCIONES_PUNTOS: Record<string, AccionPuntos> = {
  registro_evento: {
    tipo: 'registro_evento',
    puntos: 50, // Actualizado para alinear con sistema de eventos
    descripcion: 'Registro en evento'
  },
  asistencia_evento: {
    tipo: 'asistencia_evento',
    puntos: 100, // Actualizado para alinear con sistema de eventos
    descripcion: 'Asistencia confirmada a evento'
  },
  publicacion: {
    tipo: 'publicacion',
    puntos: 10, // Incrementado para balance con nuevos valores
    descripcion: 'Publicación en comunidad'
  },
  comentario: {
    tipo: 'comentario',
    puntos: 2,
    descripcion: 'Comentario en publicación'
  },
  reaccion: {
    tipo: 'reaccion',
    puntos: 1,
    descripcion: 'Reacción recibida'
  },
  bonificacion: {
    tipo: 'bonificacion',
    puntos: 0,
    descripcion: 'Bonificación manual'
  },
  referido: {
    tipo: 'referido',
    puntos: 300, // Incrementado para alinear con sistema de membresías
    descripcion: 'Usuario referido se registró'
  },
  // Nuevas acciones alineadas con sistema de membresías
  voluntariado: {
    tipo: 'voluntariado',
    puntos: 200,
    descripcion: 'Participación en actividad de voluntariado'
  },
  organizacion_evento: {
    tipo: 'organizacion_evento',
    puntos: 500,
    descripcion: 'Organización de evento oficial'
  },
  liderazgo_proyecto: {
    tipo: 'liderazgo_proyecto',
    puntos: 1000,
    descripcion: 'Liderazgo en proyecto comunitario'
  },
  mentoría: {
    tipo: 'mentoría',
    puntos: 150,
    descripcion: 'Mentoría a nuevos miembros'
  }
};

// Niveles alineados con el sistema de membresías
export const NIVELES = [
  // Niveles iniciales de gamificación (antes de membresías oficiales)
  { nombre: 'Aspirante', puntos: 0, icono: '🌱', color: '#10B981', descripcion: 'Nuevo en la comunidad BSK' },
  { nombre: 'Explorador', puntos: 250, icono: '🔍', color: '#6B7280', descripcion: 'Comenzando a participar' },
  { nombre: 'Participante', puntos: 500, icono: '🚀', color: '#3B82F6', descripcion: 'Participante activo' },
  
  // Niveles alineados con membresías oficiales
  { nombre: 'Friend', puntos: 1000, icono: '🤝', color: '#8B5CF6', descripcion: 'Miembro Friend del BSK MT' },
  { nombre: 'Rider', puntos: 1500, icono: '🏍️', color: '#059669', descripcion: 'Rider activo y comprometido' },
  { nombre: 'Pro', puntos: 3000, icono: '⚡', color: '#F59E0B', descripcion: 'Motociclista experimentado' },
  { nombre: 'Legend', puntos: 9000, icono: '🏆', color: '#DC2626', descripcion: 'Leyenda de la comunidad' },
  { nombre: 'Master', puntos: 18000, icono: '👑', color: '#7C3AED', descripcion: 'Maestro del motociclismo' },
  
  // Niveles especiales y de élite
  { nombre: 'Volunteer', puntos: 25000, icono: '🤲', color: '#059669', descripcion: 'Voluntario comprometido' },
  { nombre: 'Leader', puntos: 40000, icono: '💎', color: '#1F2937', descripcion: 'Líder de la comunidad BSK' },
  { nombre: 'Mito BSK', puntos: 60000, icono: '🔥', color: '#DC2626', descripcion: 'Leyenda viviente del BSK MT' }
];

export class GamificationService {
  
  // Obtener estadísticas completas del usuario
  static async obtenerEstadisticasUsuario(usuarioId: string): Promise<any> {
    try {
      // Buscar o crear estadísticas del usuario
      let estadisticas = await EstadisticasUsuario.findOne({ usuarioId });
      
      if (!estadisticas) {
        estadisticas = await this.crearEstadisticasIniciales(usuarioId);
      }

      // Actualizar estadísticas en tiempo real
      await this.actualizarEstadisticasUsuario(usuarioId);
      
      // Volver a obtener las estadísticas actualizadas
      estadisticas = await EstadisticasUsuario.findOne({ usuarioId }).lean();
      
      // Obtener información adicional
      const user = await User.findById(usuarioId).select('firstName lastName joinDate membershipType').lean();
      const ranking = await this.obtenerRankingUsuario(usuarioId);
      const nivel = this.calcularNivel(estadisticas?.puntos?.total || 0);
      const proximasRecompensas = await this.obtenerProximasRecompensas(estadisticas?.puntos?.total || 0);
      
      return {
        usuario: user,
        estadisticas: estadisticas,
        ranking: ranking,
        nivel: nivel,
        proximasRecompensas: proximasRecompensas,
        nivelInfo: {
          actual: nivel.nombre,
          icono: nivel.icono,
          color: nivel.color,
          puntosActuales: estadisticas?.puntos?.total || 0,
          puntosSiguienteNivel: nivel.siguienteNivel?.puntos || 0,
          progreso: nivel.progreso
        }
      };
    } catch (error) {
      console.error('Error al obtener estadísticas del usuario:', error);
      throw error;
    }
  }

  // Crear estadísticas iniciales para un usuario
  static async crearEstadisticasIniciales(usuarioId: string): Promise<any> {
    const estadisticas = new EstadisticasUsuario({
      usuarioId,
      puntos: {
        total: 0,
        ganados: 0,
        canjeados: 0,
        pendientes: 0,
        hoy: 0,
        esteMes: 0,
        esteAno: 0
      },
      eventos: {
        registrados: 0,
        asistidos: 0,
        favoritos: 0,
        organizados: 0,
        cancelados: 0
      },
      actividad: {
        diasActivo: 0,
        ultimaConexion: new Date(),
        rachaActual: 1,
        mejorRacha: 1,
        interacciones: 0
      },
      ranking: {
        posicionActual: 0,
        posicionAnterior: 0,
        mejorPosicion: 0,
        cambioSemanal: 0
      },
      nivel: {
        actual: 'Novato',
        puntosSiguienteNivel: 100,
        progreso: 0,
        experienciaTotal: 0
      },
      logros: {
        total: 0
      }
    });

    return await estadisticas.save();
  }

  // Actualizar estadísticas del usuario basadas en datos reales
  static async actualizarEstadisticasUsuario(usuarioId: string): Promise<void> {
    try {
      const user = await User.findById(usuarioId)
        .populate('events')
        .populate('attendedEvents')
        .populate('favoriteEvents')
        .lean();

      if (!user) return;

      // Calcular puntos reales basados en transacciones
      const transacciones = await TransaccionPuntos.find({ 
        usuarioId, 
        activo: true 
      }).lean();

      const puntosGanados = transacciones
        .filter(t => t.tipo === 'ganancia' || t.tipo === 'bonificacion')
        .reduce((sum, t) => sum + t.cantidad, 0);

      const puntosCanjeados = transacciones
        .filter(t => t.tipo === 'canje')
        .reduce((sum, t) => sum + t.cantidad, 0);

      const puntosTotal = puntosGanados - puntosCanjeados;

      // Calcular puntos de hoy, este mes, este año
      const hoy = new Date();
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const inicioAno = new Date(hoy.getFullYear(), 0, 1);

      const puntosHoy = transacciones
        .filter(t => {
          const fecha = new Date(t.fechaTransaccion);
          return fecha.toDateString() === hoy.toDateString() && 
                 (t.tipo === 'ganancia' || t.tipo === 'bonificacion');
        })
        .reduce((sum, t) => sum + t.cantidad, 0);

      const puntosEsteMes = transacciones
        .filter(t => {
          const fecha = new Date(t.fechaTransaccion);
          return fecha >= inicioMes && 
                 (t.tipo === 'ganancia' || t.tipo === 'bonificacion');
        })
        .reduce((sum, t) => sum + t.cantidad, 0);

      const puntosEsteAno = transacciones
        .filter(t => {
          const fecha = new Date(t.fechaTransaccion);
          return fecha >= inicioAno && 
                 (t.tipo === 'ganancia' || t.tipo === 'bonificacion');
        })
        .reduce((sum, t) => sum + t.cantidad, 0);

      // Calcular estadísticas de eventos
      const eventosRegistrados = (user as any).events?.length || 0;
      const eventosAsistidos = (user as any).attendedEvents?.length || 0;
      const eventosFavoritos = (user as any).favoriteEvents?.length || 0;

      // Calcular días activo
      const joinDate = new Date((user as any).joinDate || (user as any).createdAt);
      const diasActivo = Math.floor((hoy.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

      // Actualizar estadísticas
      await EstadisticasUsuario.findOneAndUpdate(
        { usuarioId },
        {
          $set: {
            'puntos.total': puntosTotal,
            'puntos.ganados': puntosGanados,
            'puntos.canjeados': puntosCanjeados,
            'puntos.hoy': puntosHoy,
            'puntos.esteMes': puntosEsteMes,
            'puntos.esteAno': puntosEsteAno,
            'eventos.registrados': eventosRegistrados,
            'eventos.asistidos': eventosAsistidos,
            'eventos.favoritos': eventosFavoritos,
            'actividad.diasActivo': diasActivo,
            'actividad.ultimaConexion': new Date(),
            fechaActualizacion: new Date()
          }
        },
        { upsert: true }
      );

      // Actualizar nivel
      const nivel = this.calcularNivel(puntosTotal);
      await EstadisticasUsuario.findOneAndUpdate(
        { usuarioId },
        {
          $set: {
            'nivel.actual': nivel.nombre,
            'nivel.puntosSiguienteNivel': nivel.siguienteNivel?.puntos || 0,
            'nivel.progreso': nivel.progreso,
            'nivel.experienciaTotal': puntosTotal
          }
        }
      );

    } catch (error) {
      console.error('Error actualizando estadísticas:', error);
    }
  }

  // Otorgar puntos por una acción específica
  static async otorgarPuntos(
    usuarioId: string, 
    tipoAccion: string, 
    metadata?: any
  ): Promise<ITransaccionPuntos> {
    const accion = ACCIONES_PUNTOS[tipoAccion];
    if (!accion) {
      throw new Error(`Tipo de acción no válido: ${tipoAccion}`);
    }

    const transaccion = new TransaccionPuntos({
      usuarioId,
      tipo: 'ganancia',
      cantidad: accion.puntos,
      razon: accion.descripcion,
      metadata
    });

    await transaccion.save();
    await this.actualizarEstadisticasUsuario(usuarioId);

    // Verificar logros después de otorgar puntos
    try {
      const gamificationService = new GamificationService();
      await gamificationService.verificarLogros(usuarioId);
    } catch (error) {
      console.error('Error verificando logros después de otorgar puntos:', error);
      // No interrumpir el flujo principal si falla la verificación de logros
    }

    return transaccion;
  }

  // Calcular nivel basado en puntos
  static calcularNivel(puntos: number): any {
    let nivelActual = NIVELES[0];
    let siguienteNivel = NIVELES[1];

    for (let i = 0; i < NIVELES.length; i++) {
      if (puntos >= NIVELES[i].puntos) {
        nivelActual = NIVELES[i];
        siguienteNivel = NIVELES[i + 1];
      } else {
        break;
      }
    }

    const puntosParaSiguienteNivel = siguienteNivel ? siguienteNivel.puntos - nivelActual.puntos : 0;
    const puntosEnNivelActual = puntos - nivelActual.puntos;
    const progreso = siguienteNivel ? (puntosEnNivelActual / puntosParaSiguienteNivel) * 100 : 100;

    return {
      ...nivelActual,
      siguienteNivel,
      progreso: Math.min(Math.max(progreso, 0), 100),
      puntosParaSiguienteNivel,
      puntosEnNivelActual
    };
  }

  // Obtener ranking del usuario
  static async obtenerRankingUsuario(usuarioId: string): Promise<any> {
    try {
      const estadisticas = await EstadisticasUsuario.find({})
        .sort({ 'puntos.total': -1 })
        .lean();

      const posicion = estadisticas.findIndex(e => e.usuarioId.toString() === usuarioId) + 1;
      const totalUsuarios = estadisticas.length;

      return {
        posicion,
        totalUsuarios,
        percentil: Math.round((1 - (posicion / totalUsuarios)) * 100)
      };
    } catch (error) {
      console.error('Error obteniendo ranking:', error);
      return { posicion: 0, totalUsuarios: 0, percentil: 0 };
    }
  }

  // Obtener próximas recompensas alcanzables
  static async obtenerProximasRecompensas(puntosActuales: number): Promise<any[]> {
    try {
      const recompensas = await Recompensa.find({
        disponible: true,
        costoPuntos: { $gte: puntosActuales },
        $or: [
          { validoHasta: null },
          { validoHasta: { $gte: new Date() } }
        ]
      })
      .sort({ costoPuntos: 1 })
      .limit(3)
      .lean();

      return recompensas;
    } catch (error) {
      console.error('Error obteniendo próximas recompensas:', error);
      return [];
    }
  }

  // Obtener historial de transacciones
  static async obtenerHistorialTransacciones(
    usuarioId: string, 
    limite: number = 10, 
    pagina: number = 1
  ): Promise<any> {
    try {
      const skip = (pagina - 1) * limite;
      
      const transacciones = await TransaccionPuntos.find({ usuarioId, activo: true })
        .sort({ fechaTransaccion: -1 })
        .skip(skip)
        .limit(limite)
        .populate('metadata.eventoId', 'title date')
        .populate('metadata.recompensaId', 'nombre')
        .lean();

      const total = await TransaccionPuntos.countDocuments({ usuarioId, activo: true });

      return {
        transacciones,
        total,
        pagina,
        totalPaginas: Math.ceil(total / limite)
      };
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      return { transacciones: [], total: 0, pagina: 1, totalPaginas: 0 };
    }
  }

    // Obtener leaderboard
  static async obtenerLeaderboard(limite: number = 10): Promise<any> {
    try {
      const leaderboard = await EstadisticasUsuario.find({})
        .sort({ 'puntos.total': -1 })
        .limit(limite)
        .populate('usuarioId', 'firstName lastName profileImage membershipType')
        .lean();

      return leaderboard.map((item, index) => ({
        posicion: index + 1,
        usuario: item.usuarioId,
        puntos: item.puntos.total,
        nivel: item.nivel.actual,
        cambioSemanal: item.ranking.cambioSemanal || 0
      }));
    } catch (error) {
      console.error('Error obteniendo leaderboard:', error);
      return [];
    }
  }

  // Obtener actividad semanal del usuario
  static async obtenerActividadSemanal(usuarioId: string): Promise<any> {
    try {
      await connectToDatabase();
      
      // Calcular fechas de los últimos 7 días
      const hoy = new Date();
      const hace7Dias = new Date(hoy);
      hace7Dias.setDate(hace7Dias.getDate() - 6);
      hace7Dias.setHours(0, 0, 0, 0);

      // Obtener transacciones de los últimos 7 días
      const transacciones = await TransaccionPuntos.find({
        usuarioId,
        fechaTransaccion: {
          $gte: hace7Dias,
          $lte: new Date()
        },
        tipo: 'ganancia' // Solo puntos ganados
      }).sort({ fechaTransaccion: 1 }).lean();

      // Crear array para los últimos 7 días
      const actividadPorDia = [];
      for (let i = 6; i >= 0; i--) {
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() - i);
        fecha.setHours(0, 0, 0, 0);

        const fechaSiguiente = new Date(fecha);
        fechaSiguiente.setDate(fecha.getDate() + 1);

        // Filtrar transacciones de este día
        const transaccionesDia = transacciones.filter(t => {
          const fechaTransaccion = new Date(t.fechaTransaccion);
          return fechaTransaccion >= fecha && fechaTransaccion < fechaSiguiente;
        });

        const puntosDia = transaccionesDia.reduce((total, t) => total + t.puntos, 0);
        const actividadesDia = transaccionesDia.length;

        actividadPorDia.push({
          dia: fecha.toLocaleDateString('es-ES', { weekday: 'short' }),
          fecha: fecha.toISOString().split('T')[0],
          puntos: puntosDia,
          actividades: actividadesDia,
          esHoy: i === 0
        });
      }

      // Calcular totales
      const totalPuntos = actividadPorDia.reduce((sum, dia) => sum + dia.puntos, 0);
      const totalActividades = actividadPorDia.reduce((sum, dia) => sum + dia.actividades, 0);

      return {
        actividades: actividadPorDia,
        resumen: {
          totalPuntosSemana: totalPuntos,
          totalActividadesSemana: totalActividades,
          promedioDiario: Math.round(totalPuntos / 7),
          diasActivos: actividadPorDia.filter(dia => dia.actividades > 0).length
        }
      };

    } catch (error) {
      console.error('Error obteniendo actividad semanal:', error);
      return {
        actividades: [],
        resumen: {
          totalPuntosSemana: 0,
          totalActividadesSemana: 0,
          promedioDiario: 0,
          diasActivos: 0
        }
      };
    }
  }

  // Obtener todas las recompensas disponibles
  static async obtenerRecompensas(): Promise<any[]> {
    try {
      await connectToDatabase();
      
      const recompensas = await Recompensa.find({ activa: true })
        .sort({ puntosRequeridos: 1 })
        .lean();

      return recompensas || [];
    } catch (error) {
      console.error('Error obteniendo recompensas:', error);
      return [];
    }
  }

  // Canjear una recompensa
  static async canjearRecompensa(usuarioId: string, recompensaId: string): Promise<any> {
    try {
      await connectToDatabase();
      
      // Obtener la recompensa
      const recompensa = await Recompensa.findById(recompensaId);
      if (!recompensa || !recompensa.activa) {
        return { success: false, error: 'Recompensa no disponible' };
      }

      // Verificar stock
      if (recompensa.stock <= 0) {
        return { success: false, error: 'Sin stock disponible' };
      }

      // Obtener estadísticas del usuario
      const estadisticas = await EstadisticasUsuario.findOne({ usuarioId });
      if (!estadisticas) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      // Verificar puntos suficientes
      if (estadisticas.puntos.actual < recompensa.puntosRequeridos) {
        return { success: false, error: 'Puntos insuficientes' };
      }

      // Procesar el canje
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Crear registro de canje
        const canje = new CanjeRecompensa({
          usuarioId,
          recompensaId,
          puntosGastados: recompensa.puntosRequeridos,
          estado: 'completado',
          fechaCanje: new Date()
        });
        await canje.save({ session });

        // Restar puntos del usuario
        await EstadisticasUsuario.findOneAndUpdate(
          { usuarioId },
          { 
            $inc: { 'puntos.actual': -recompensa.puntosRequeridos },
            $set: { fechaActualizacion: new Date() }
          },
          { session }
        );

        // Crear transacción de puntos
        const transaccion = new TransaccionPuntos({
          usuarioId,
          tipo: 'gasto',
          puntos: -recompensa.puntosRequeridos,
          razon: `Canje de recompensa: ${recompensa.nombre}`,
          metadata: {
            recompensaId,
            categoria: 'canje'
          },
          fechaTransaccion: new Date()
        });
        await transaccion.save({ session });

        // Reducir stock de la recompensa
        await Recompensa.findByIdAndUpdate(
          recompensaId,
          { $inc: { stock: -1 } },
          { session }
        );

        await session.commitTransaction();
        
        // Verificar logros después del canje
        try {
          const gamificationService = new GamificationService();
          await gamificationService.verificarLogros(usuarioId);
        } catch (error) {
          console.error('Error verificando logros después del canje:', error);
          // No fallar el canje si hay error en logros
        }
        
        return { 
          success: true, 
          canje: {
            id: canje._id,
            recompensa: recompensa.nombre,
            puntosGastados: recompensa.puntosRequeridos,
            fecha: new Date()
          }
        };

      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }

    } catch (error) {
      console.error('Error canjeando recompensa:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error procesando canje' 
      };
    }
  }

  // === MÉTODOS PARA LOGROS ===

  /**
   * Inicializar logros por defecto del sistema
   */
  async inicializarLogros(): Promise<void> {
    try {
      await connectToDatabase();

      const logrosDefault = [
        // Logros básicos de inicio
        {
          id: 'primer_paso',
          nombre: 'Primer Paso',
          descripcion: 'Únete al sistema de puntos BSK MT',
          icono: '🎯',
          categoria: 'Bienvenida',
          condiciones: {
            tipo: 'puntos_acumulados',
            valor: 1,
            operador: 'mayor_igual'
          },
          recompensa: {
            puntos: 50
          },
          orden: 1
        },
        {
          id: 'explorador_activo',
          nombre: 'Explorador Activo',
          descripcion: 'Alcanza el nivel Explorador',
          icono: '🔍',
          categoria: 'Progreso',
          condiciones: {
            tipo: 'puntos_acumulados',
            valor: 250,
            operador: 'mayor_igual'
          },
          recompensa: {
            puntos: 100
          },
          orden: 2
        },
        {
          id: 'participante_comprometido',
          nombre: 'Participante Comprometido',
          descripcion: 'Alcanza el nivel Participante',
          icono: '�',
          categoria: 'Progreso',
          condiciones: {
            tipo: 'puntos_acumulados',
            valor: 500,
            operador: 'mayor_igual'
          },
          recompensa: {
            puntos: 150
          },
          orden: 3
        },
        
        // Logros de membresías oficiales
        {
          id: 'friend_bsk',
          nombre: 'Friend BSK',
          descripcion: 'Alcanza la membresía Friend',
          icono: '🤝',
          categoria: 'Membresía',
          condiciones: {
            tipo: 'puntos_acumulados',
            valor: 1000,
            operador: 'mayor_igual'
          },
          recompensa: {
            puntos: 200
          },
          orden: 4
        },
        {
          id: 'rider_oficial',
          nombre: 'Rider Oficial',
          descripcion: 'Alcanza la membresía Rider',
          icono: '🏍️',
          categoria: 'Membresía',
          condiciones: {
            tipo: 'puntos_acumulados',
            valor: 1500,
            operador: 'mayor_igual'
          },
          recompensa: {
            puntos: 300
          },
          orden: 5
        },
        {
          id: 'pro_experiente',
          nombre: 'Pro Experiente',
          descripcion: 'Alcanza la membresía Pro',
          icono: '⚡',
          categoria: 'Membresía',
          condiciones: {
            tipo: 'puntos_acumulados',
            valor: 3000,
            operador: 'mayor_igual'
          },
          recompensa: {
            puntos: 500
          },
          orden: 6
        },
        {
          id: 'legend_mitologica',
          nombre: 'Legend Mitológica',
          descripcion: 'Alcanza la membresía Legend',
          icono: '🏆',
          categoria: 'Membresía',
          condiciones: {
            tipo: 'puntos_acumulados',
            valor: 9000,
            operador: 'mayor_igual'
          },
          recompensa: {
            puntos: 1000
          },
          orden: 7
        },
        {
          id: 'master_supremo',
          nombre: 'Master Supremo',
          descripcion: 'Alcanza la membresía Master',
          icono: '�',
          categoria: 'Membresía',
          condiciones: {
            tipo: 'puntos_acumulados',
            valor: 18000,
            operador: 'mayor_igual'
          },
          recompensa: {
            puntos: 2000
          },
          orden: 8
        },
        
        // Logros de actividad comunitaria
        {
          id: 'voluntario_comprometido',
          nombre: 'Voluntario Comprometido',
          descripcion: 'Participa en 5 actividades de voluntariado',
          icono: '🤲',
          categoria: 'Voluntariado',
          condiciones: {
            tipo: 'voluntariados_participados',
            valor: 5,
            operador: 'mayor_igual'
          },
          recompensa: {
            puntos: 500
          },
          orden: 9
        },
        {
          id: 'organizador_eventos',
          nombre: 'Organizador de Eventos',
          descripcion: 'Organiza 3 eventos oficiales',
          icono: '📅',
          categoria: 'Liderazgo',
          condiciones: {
            tipo: 'eventos_organizados',
            valor: 3,
            operador: 'mayor_igual'
          },
          recompensa: {
            puntos: 750
          },
          orden: 10
        },
        {
          id: 'mentor_sabio',
          nombre: 'Mentor Sabio',
          descripcion: 'Mentoriza a 10 nuevos miembros',
          icono: '🧙‍♂️',
          categoria: 'Mentoría',
          condiciones: {
            tipo: 'mentorias_realizadas',
            valor: 10,
            operador: 'mayor_igual'
          },
          recompensa: {
            puntos: 1000
          },
          orden: 11
        },
        {
          id: 'lider_nato',
          nombre: 'Líder Nato',
          descripcion: 'Alcanza la membresía Leader',
          icono: '💎',
          categoria: 'Elite',
          condiciones: {
            tipo: 'puntos_acumulados',
            valor: 40000,
            operador: 'mayor_igual'
          },
          recompensa: {
            puntos: 5000
          },
          orden: 12
        },
        {
          id: 'mito_bsk',
          nombre: 'Mito BSK',
          descripcion: 'Conviértete en leyenda viviente',
          icono: '�',
          categoria: 'Elite',
          condiciones: {
            tipo: 'puntos_acumulados',
            valor: 60000,
            operador: 'mayor_igual'
          },
          recompensa: {
            puntos: 10000
          },
          orden: 13
        }
      ];

      for (const logroData of logrosDefault) {
        await Achievement.findOneAndUpdate(
          { id: logroData.id },
          logroData,
          { upsert: true, new: true }
        );
      }

      console.log('✅ Logros inicializados correctamente');
    } catch (error) {
      console.error('Error inicializando logros:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los logros de un usuario con su progreso
   */
  async obtenerLogrosUsuario(usuarioId: string): Promise<any[]> {
    try {
      await connectToDatabase();

      // Obtener todos los logros disponibles
      const logros = await Achievement.find({ activo: true }).sort({ orden: 1 });

      // Obtener progreso del usuario para cada logro
      const logrosConProgreso = await Promise.all(
        logros.map(async (logro) => {
          // Buscar el progreso del usuario para este logro
          let userAchievement = await UserAchievement.findOne({
            usuarioId: new mongoose.Types.ObjectId(usuarioId),
            achievementId: logro._id
          });

          // Si no existe, crear uno nuevo con progreso 0
          if (!userAchievement) {
            const progreso = await this.calcularProgresoLogro(usuarioId, logro);
            
            userAchievement = new UserAchievement({
              usuarioId: new mongoose.Types.ObjectId(usuarioId),
              achievementId: logro._id,
              desbloqueado: progreso.desbloqueado,
              fechaDesbloqueo: progreso.desbloqueado ? new Date() : undefined,
              progreso: {
                actual: progreso.actual,
                total: progreso.total
              }
            });

            await userAchievement.save();

            // Si se desbloqueó por primera vez, dar recompensa
            if (progreso.desbloqueado && logro.recompensa?.puntos) {
              await this.otorgarRecompensaLogro(
                usuarioId,
                logro.recompensa.puntos,
                `Logro desbloqueado: ${logro.nombre}`
              );
            }
          }

          return {
            id: logro.id,
            nombre: logro.nombre,
            descripcion: logro.descripcion,
            icono: logro.icono,
            categoria: logro.categoria,
            desbloqueado: userAchievement.desbloqueado,
            fechaDesbloqueo: userAchievement.fechaDesbloqueo?.toISOString().split('T')[0],
            progreso: userAchievement.progreso,
            recompensa: logro.recompensa
          };
        })
      );

      return logrosConProgreso;
    } catch (error) {
      console.error('Error obteniendo logros usuario:', error);
      throw error;
    }
  }

  /**
   * Calcular el progreso actual de un usuario para un logro específico
   */
  private async calcularProgresoLogro(usuarioId: string, logro: IAchievement): Promise<{
    actual: number;
    total: number;
    desbloqueado: boolean;
  }> {
    try {
      const { tipo, valor, operador } = logro.condiciones;
      let valorActual = 0;

      switch (tipo) {
        case 'puntos_acumulados':
          const estadisticas = await EstadisticasUsuario.findOne({
            usuarioId: new mongoose.Types.ObjectId(usuarioId)
          });
          valorActual = estadisticas?.estadisticas?.puntos?.total || 0;
          break;

        case 'recompensas_canjeadas':
          const canjes = await CanjeRecompensa.countDocuments({
            usuarioId: new mongoose.Types.ObjectId(usuarioId)
          });
          valorActual = canjes;
          break;

        case 'eventos_participados':
          const user = await User.findById(usuarioId).select('events');
          valorActual = user?.events?.length || 0;
          break;

        case 'meses_activo':
          const usuario = await User.findById(usuarioId).select('fechaRegistro');
          if (usuario?.fechaRegistro) {
            const mesesActivo = Math.floor(
              (Date.now() - usuario.fechaRegistro.getTime()) / (1000 * 60 * 60 * 24 * 30)
            );
            valorActual = mesesActivo;
          }
          break;

        case 'ranking_posicion':
          // Obtener posición actual simplificada
          valorActual = 999; // Valor por defecto para cuando no está en el ranking
          break;

        default:
          valorActual = 0;
      }

      // Evaluar si se cumple la condición
      let desbloqueado = false;
      switch (operador) {
        case 'mayor_igual':
          desbloqueado = valorActual >= valor;
          break;
        case 'igual':
          desbloqueado = valorActual === valor;
          break;
        case 'menor_igual':
          desbloqueado = valorActual <= valor;
          break;
        default:
          desbloqueado = valorActual >= valor;
      }

      return {
        actual: valorActual,
        total: valor,
        desbloqueado
      };
    } catch (error) {
      console.error('Error calculando progreso logro:', error);
      return { actual: 0, total: logro.condiciones.valor, desbloqueado: false };
    }
  }

  /**
   * Verificar y actualizar logros de un usuario después de una acción
   */
  async verificarLogros(usuarioId: string): Promise<string[]> {
    try {
      await connectToDatabase();

      const logrosObtenidos: string[] = [];
      const logros = await Achievement.find({ activo: true });

      for (const logro of logros) {
        const userAchievement = await UserAchievement.findOne({
          usuarioId: new mongoose.Types.ObjectId(usuarioId),
          achievementId: logro._id
        });

        // Solo verificar logros no desbloqueados
        if (!userAchievement?.desbloqueado) {
          const progreso = await this.calcularProgresoLogro(usuarioId, logro);

          if (userAchievement) {
            // Actualizar progreso existente
            userAchievement.progreso = {
              actual: progreso.actual,
              total: progreso.total
            };

            if (progreso.desbloqueado && !userAchievement.desbloqueado) {
              userAchievement.desbloqueado = true;
              userAchievement.fechaDesbloqueo = new Date();
              logrosObtenidos.push(logro.nombre);

              // Otorgar recompensa si la hay
              if (logro.recompensa?.puntos) {
                await this.otorgarRecompensaLogro(
                  usuarioId,
                  logro.recompensa.puntos,
                  `Logro desbloqueado: ${logro.nombre}`
                );
              }
            }

            await userAchievement.save();
          } else if (progreso.desbloqueado) {
            // Crear nuevo logro desbloqueado
            await UserAchievement.create({
              usuarioId: new mongoose.Types.ObjectId(usuarioId),
              achievementId: logro._id,
              desbloqueado: true,
              fechaDesbloqueo: new Date(),
              progreso: {
                actual: progreso.actual,
                total: progreso.total
              }
            });

            logrosObtenidos.push(logro.nombre);

            // Otorgar recompensa si la hay
            if (logro.recompensa?.puntos) {
              await this.otorgarRecompensaLogro(
                usuarioId,
                logro.recompensa.puntos,
                `Logro desbloqueado: ${logro.nombre}`
              );
            }
          }
        }
      }

      return logrosObtenidos;
    } catch (error) {
      console.error('Error verificando logros:', error);
      return [];
    }
  }

  /**
   * Otorgar puntos por recompensa de logro
   */
  private async otorgarRecompensaLogro(
    usuarioId: string,
    puntos: number,
    descripcion: string
  ): Promise<void> {
    try {
      await connectToDatabase();

      const transaccion = new TransaccionPuntos({
        usuarioId: new mongoose.Types.ObjectId(usuarioId),
        tipo: 'ganancia',
        cantidad: puntos,
        razon: descripcion,
        metadata: {
          origen: 'logro',
          categoria: 'recompensa'
        }
      });

      await transaccion.save();
      await GamificationService.actualizarEstadisticasUsuario(usuarioId);

      console.log(`✅ Recompensa de logro otorgada: ${puntos} puntos a usuario ${usuarioId}`);
    } catch (error) {
      console.error('Error otorgando recompensa de logro:', error);
      throw error;
    }
  }
}
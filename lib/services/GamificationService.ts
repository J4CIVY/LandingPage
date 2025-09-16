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

export interface AccionPuntos {
  tipo: 'registro_evento' | 'asistencia_evento' | 'publicacion' | 'comentario' | 'reaccion' | 'bonificacion' | 'referido';
  puntos: number;
  descripcion: string;
}

export const ACCIONES_PUNTOS: Record<string, AccionPuntos> = {
  registro_evento: {
    tipo: 'registro_evento',
    puntos: 10,
    descripcion: 'Registro en evento'
  },
  asistencia_evento: {
    tipo: 'asistencia_evento',
    puntos: 25,
    descripcion: 'Asistencia confirmada a evento'
  },
  publicacion: {
    tipo: 'publicacion',
    puntos: 5,
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
    puntos: 50,
    descripcion: 'Usuario referido se registró'
  }
};

export const NIVELES = [
  { nombre: 'Novato', puntos: 0, icono: '🌱', color: '#10B981' },
  { nombre: 'Principiante', puntos: 100, icono: '🚀', color: '#3B82F6' },
  { nombre: 'Motociclista', puntos: 300, icono: '🏍️', color: '#8B5CF6' },
  { nombre: 'Aventurero', puntos: 600, icono: '🗺️', color: '#F59E0B' },
  { nombre: 'Explorador', puntos: 1000, icono: '🧭', color: '#EF4444' },
  { nombre: 'Veterano', puntos: 1500, icono: '🏆', color: '#84CC16' },
  { nombre: 'Experto', puntos: 2500, icono: '⭐', color: '#06B6D4' },
  { nombre: 'Maestro', puntos: 4000, icono: '👑', color: '#8B5CF6' },
  { nombre: 'Leyenda', puntos: 6000, icono: '💎', color: '#F97316' },
  { nombre: 'Mito BSK', puntos: 10000, icono: '🔥', color: '#DC2626' }
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
}
import { connectToDatabase } from '@/lib/mongodb';
import { UsuarioRanking } from '@/lib/models/Comunidad';

/**
 * Servicio para manejar puntos y gamificación
 */

export interface PuntosConfig {
  publicacion: number;
  comentario: number;
  reaccionRecibida: number;
  participacionEvento: number;
  creaEvento: number;
  primeraPublicacion: number;
  comentarioUtil: number;
  invitarAmigo: number;
}

// Configuración de puntos actualizada para alinear con sistema de membresías
export const PUNTOS_CONFIG: PuntosConfig = {
  publicacion: 10,
  comentario: 2,
  reaccionRecibida: 1,
  participacionEvento: 100, // Actualizado de 25 a 100 para alinear con asistencia_evento
  creaEvento: 500, // Actualizado de 15 a 500 para alinear con organizacion_evento
  primeraPublicacion: 50, // Incrementado para dar mejor bienvenida
  comentarioUtil: 5,
  invitarAmigo: 300 // Actualizado de 30 a 300 para alinear con referidos
};

/**
 * Actualizar puntos de un usuario
 */
export async function actualizarPuntos(
  usuarioId: string,
  tipo: keyof PuntosConfig,
  cantidad: number = 1
): Promise<void> {
  try {
    await connectToDatabase();
    
    const puntos = PUNTOS_CONFIG[tipo] * cantidad;
    
    // Buscar o crear registro de ranking para el usuario
    let ranking = await UsuarioRanking.findOne({ usuarioId });
    
    if (!ranking) {
      // Crear nuevo registro de ranking
      ranking = new UsuarioRanking({
        usuarioId,
        puntos: {
          publicaciones: 0,
          comentarios: 0,
          reaccionesRecibidas: 0,
          participacionEventos: 0,
          total: 0
        },
        nivel: 'aspirante',
        insignias: [],
        fechaActualizacion: new Date()
      });
    }
    
    // Actualizar puntos según el tipo
    switch (tipo) {
      case 'publicacion':
        ranking.puntos.publicaciones += puntos;
        break;
      case 'comentario':
        ranking.puntos.comentarios += puntos;
        break;
      case 'reaccionRecibida':
        ranking.puntos.reaccionesRecibidas += puntos;
        break;
      case 'participacionEvento':
      case 'creaEvento':
        ranking.puntos.participacionEventos += puntos;
        break;
      case 'primeraPublicacion':
        ranking.puntos.publicaciones += puntos;
        break;
      case 'comentarioUtil':
        ranking.puntos.comentarios += puntos;
        break;
      case 'invitarAmigo':
        // Los puntos por invitar se pueden agregar a cualquier categoría o crear una nueva
        ranking.puntos.participacionEventos += puntos;
        break;
    }
    
    // Recalcular total
    ranking.puntos.total = 
      ranking.puntos.publicaciones + 
      ranking.puntos.comentarios + 
      ranking.puntos.reaccionesRecibidas + 
      ranking.puntos.participacionEventos;
    
    // Actualizar nivel basado en puntos totales
    ranking.nivel = calcularNivel(ranking.puntos.total);
    
    // Actualizar fecha de modificación
    ranking.fechaActualizacion = new Date();
    
    // Guardar cambios
    await ranking.save();
    
  } catch (error) {
    console.error('Error al actualizar puntos:', error);
    throw error;
  }
}

/**
 * Calcular nivel basado en puntos totales
 */
function calcularNivel(puntosTotal: number): string {
  if (puntosTotal >= 40000) return 'leader';
  if (puntosTotal >= 25000) return 'volunteer';
  if (puntosTotal >= 18000) return 'master';
  if (puntosTotal >= 9000) return 'legend';
  if (puntosTotal >= 3000) return 'pro';
  if (puntosTotal >= 1500) return 'rider';
  if (puntosTotal >= 1000) return 'friend';
  if (puntosTotal >= 500) return 'participante';
  if (puntosTotal >= 250) return 'explorador';
  return 'aspirante';
}

/**
 * Verificar si es la primera publicación del usuario
 */
export async function esPrimeraPublicacion(usuarioId: string): Promise<boolean> {
  try {
    await connectToDatabase();
    
    const ranking = await UsuarioRanking.findOne({ usuarioId });
    
    // Si no existe ranking o tiene 0 publicaciones, es la primera
    return !ranking || ranking.puntos.publicaciones === 0;
    
  } catch (error) {
    console.error('Error al verificar primera publicación:', error);
    return false;
  }
}

/**
 * Obtener estadísticas de puntos de un usuario
 */
export async function obtenerEstadisticasUsuario(usuarioId: string) {
  try {
    await connectToDatabase();
    
    const ranking = await UsuarioRanking.findOne({ usuarioId });
    
    if (!ranking) {
      return {
        puntos: {
          publicaciones: 0,
          comentarios: 0,
          reaccionesRecibidas: 0,
          participacionEventos: 0,
          total: 0
        },
        nivel: 'aspirante',
        insignias: []
      };
    }
    
    return {
      puntos: ranking.puntos,
      nivel: ranking.nivel,
      insignias: ranking.insignias
    };
    
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
}
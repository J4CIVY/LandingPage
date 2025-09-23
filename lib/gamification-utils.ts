import mongoose from 'mongoose';
import { TransaccionPuntos } from '@/lib/models/Gamification';
import Event from '@/lib/models/Event';

/**
 * Otorga puntos a un usuario por asistir a un evento
 * @param usuarioId - ID del usuario que asistió
 * @param eventoId - ID del evento al que asistió
 * @returns Promise<boolean> - true si se otorgaron los puntos, false si ya los había recibido o el evento no otorga puntos
 */
export async function otorgarPuntosPorAsistencia(
  usuarioId: string | mongoose.Types.ObjectId, 
  eventoId: string | mongoose.Types.ObjectId
): Promise<boolean> {
  try {
    // Obtener el evento para verificar los puntos que otorga
    const evento = await Event.findById(eventoId);
    if (!evento || !evento.pointsAwarded || evento.pointsAwarded <= 0) {
      console.log(`Evento ${eventoId} no otorga puntos o no existe`);
      return false;
    }

    // Verificar si ya se otorgaron puntos por este evento
    const transaccionExistente = await TransaccionPuntos.findOne({
      usuarioId: usuarioId,
      'metadata.eventoId': eventoId,
      tipo: 'ganancia',
      razon: 'Asistencia a evento',
      activo: true
    });

    if (transaccionExistente) {
      console.log(`Usuario ${usuarioId} ya recibió puntos por el evento ${eventoId}`);
      return false;
    }

    // Crear nueva transacción de puntos
    const nuevaTransaccion = new TransaccionPuntos({
      usuarioId: usuarioId,
      tipo: 'ganancia',
      cantidad: evento.pointsAwarded,
      razon: 'Asistencia a evento',
      metadata: {
        eventoId: eventoId,
        accionTipo: 'asistencia_evento',
        detalles: `Asistencia confirmada al evento: ${evento.name}`
      },
      fechaTransaccion: new Date(),
      activo: true
    });

    await nuevaTransaccion.save();
    
    console.log(`Puntos otorgados: ${evento.pointsAwarded} puntos a usuario ${usuarioId} por evento ${eventoId}`);
    return true;

  } catch (error) {
    console.error('Error otorgando puntos por asistencia:', error);
    return false;
  }
}

/**
 * Revoca puntos de un usuario por cancelación de asistencia a un evento
 * @param usuarioId - ID del usuario
 * @param eventoId - ID del evento
 * @returns Promise<boolean> - true si se revocaron los puntos, false si no había puntos otorgados
 */
export async function revocarPuntosPorAsistencia(
  usuarioId: string | mongoose.Types.ObjectId, 
  eventoId: string | mongoose.Types.ObjectId
): Promise<boolean> {
  try {
    // Buscar la transacción de puntos por este evento
    const transaccion = await TransaccionPuntos.findOne({
      usuarioId: usuarioId,
      'metadata.eventoId': eventoId,
      tipo: 'ganancia',
      razon: 'Asistencia a evento',
      activo: true
    });

    if (!transaccion) {
      console.log(`No se encontraron puntos otorgados al usuario ${usuarioId} por el evento ${eventoId}`);
      return false;
    }

    // Desactivar la transacción original
    transaccion.activo = false;
    await transaccion.save();

    // Crear una transacción de penalización para restar los puntos
    const transaccionPenalizacion = new TransaccionPuntos({
      usuarioId: usuarioId,
      tipo: 'penalizacion',
      cantidad: transaccion.cantidad,
      razon: 'Cancelación de asistencia a evento',
      metadata: {
        eventoId: eventoId,
        accionTipo: 'cancelacion_asistencia_evento',
        detalles: `Cancelación de asistencia confirmada - reversión de puntos`,
        transaccionOriginalId: transaccion._id
      },
      fechaTransaccion: new Date(),
      activo: true
    });

    await transaccionPenalizacion.save();
    
    console.log(`Puntos revocados: ${transaccion.cantidad} puntos al usuario ${usuarioId} por cancelación de asistencia al evento ${eventoId}`);
    return true;

  } catch (error) {
    console.error('Error revocando puntos por asistencia:', error);
    return false;
  }
}

/**
 * Obtiene el total de puntos de un usuario
 * @param usuarioId - ID del usuario
 * @returns Promise<number> - Total de puntos del usuario
 */
export async function obtenerPuntosTotales(usuarioId: string | mongoose.Types.ObjectId): Promise<number> {
  try {
    const transacciones = await TransaccionPuntos.find({
      usuarioId: usuarioId,
      activo: true
    });

    const total = transacciones.reduce((sum, transaccion) => {
      if (transaccion.tipo === 'ganancia' || transaccion.tipo === 'bonificacion') {
        return sum + transaccion.cantidad;
      } else if (transaccion.tipo === 'canje' || transaccion.tipo === 'penalizacion') {
        return sum - transaccion.cantidad;
      }
      return sum;
    }, 0);

    return Math.max(0, total); // Asegurar que no sea negativo
  } catch (error) {
    console.error('Error obteniendo puntos totales:', error);
    return 0;
  }
}
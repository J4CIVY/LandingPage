import { NextRequest } from 'next/server';
import { 
  createSuccessResponse, 
  createErrorResponse,
  HTTP_STATUS 
} from '@/lib/api-utils';
import { requireCSRFToken } from '@/lib/csrf-protection';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import User from '@/lib/models/User';
import { AdminRequest, requireAdmin } from '@/lib/auth-admin';
import { otorgarPuntosPorAsistencia, revocarPuntosPorAsistencia } from '@/lib/gamification-utils';
import mongoose from 'mongoose';

/**
 * PATCH /api/admin/events/[id]/attendance
 * Marca o desmarca la asistencia de un participante en un evento
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const adminRequest = req as AdminRequest;
  
  // SECURITY: CSRF Protection
  const csrfError = requireCSRFToken(adminRequest);
  if (csrfError) return csrfError;
  
  // Verificar permisos de administrador
  const authCheck = await requireAdmin(adminRequest);
  if (authCheck) return authCheck;

  try {
    await connectDB();
    const { id } = await context.params;
    const { participantId, action } = await req.json();

    // Validar datos de entrada
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return createErrorResponse(
        'ID de evento inválido',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (!mongoose.Types.ObjectId.isValid(participantId)) {
      return createErrorResponse(
        'ID de participante inválido',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (!['mark', 'unmark'].includes(action)) {
      return createErrorResponse(
        'Acción inválida. Debe ser "mark" o "unmark"',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Obtener el evento
    const event = await Event.findById(id);
    if (!event) {
      return createErrorResponse(
        'Evento no encontrado',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Verificar que el participante esté registrado en el evento
    if (!event.participants || !event.participants.includes(participantId)) {
      return createErrorResponse(
        'El usuario no está registrado en este evento',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Obtener el usuario
    const user = await User.findById(participantId);
    if (!user) {
      return createErrorResponse(
        'Usuario no encontrado',
        HTTP_STATUS.NOT_FOUND
      );
    }

    if (action === 'mark') {
      // Marcar asistencia
      if (!event.attendedParticipants) {
        event.attendedParticipants = [];
      }
      
      if (!event.attendedParticipants.includes(participantId)) {
        event.attendedParticipants.push(participantId);
        await event.save();
      }

      // Agregar evento a la lista de eventos asistidos del usuario
      if (!user.attendedEvents) {
        user.attendedEvents = [];
      }

      if (!user.attendedEvents.includes(id)) {
        user.attendedEvents.push(id);
        await user.save();
      }

      // Otorgar puntos por asistencia al evento
      try {
        await otorgarPuntosPorAsistencia(participantId, id);
      } catch (error) {
        console.error('Error otorgando puntos por asistencia:', error);
        // No fallar la operación por errores en puntos, solo registrar el error
      }

      return createSuccessResponse(
        {
          eventId: id,
          participantId,
          attended: true,
          attendedCount: event.attendedParticipants.length
        },
        'Asistencia marcada exitosamente'
      );

    } else {
      // Desmarcar asistencia
      if (event.attendedParticipants) {
        event.attendedParticipants = event.attendedParticipants.filter(
          (pId: mongoose.Types.ObjectId) => !pId.equals(participantId)
        );
        await event.save();
      }

      // Remover evento de la lista de eventos asistidos del usuario
      if (user.attendedEvents) {
        user.attendedEvents = user.attendedEvents.filter(
          (eventId: mongoose.Types.ObjectId) => !eventId.equals(id)
        );
        await user.save();
      }

      // Revocar puntos por cancelación de asistencia
      try {
        await revocarPuntosPorAsistencia(participantId, id);
      } catch (error) {
        console.error('Error revocando puntos por asistencia:', error);
        // No fallar la operación por errores en puntos, solo registrar el error
      }

      return createSuccessResponse(
        {
          eventId: id,
          participantId,
          attended: false,
          attendedCount: event.attendedParticipants?.length || 0
        },
        'Asistencia desmarcada exitosamente'
      );
    }

  } catch (error) {
    console.error('Error en PATCH /api/admin/events/[id]/attendance:', error);
    return createErrorResponse(
      'Error interno del servidor',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * GET /api/admin/events/[id]/attendance
 * Obtiene la lista de participantes registrados y asistentes
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const adminRequest = req as AdminRequest;
  
  // Verificar permisos de administrador
  const authCheck = await requireAdmin(adminRequest);
  if (authCheck) return authCheck;

  try {
    await connectDB();
    const { id } = await context.params;

    // Validar ID del evento
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return createErrorResponse(
        'ID de evento inválido',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Obtener el evento con participantes y asistentes
    const event = await Event.findById(id)
      .populate('participants', 'firstName lastName email membershipType')
      .populate('attendedParticipants', 'firstName lastName email membershipType');

    if (!event) {
      return createErrorResponse(
        'Evento no encontrado',
        HTTP_STATUS.NOT_FOUND
      );
    }

    interface Participant {
      _id: mongoose.Types.ObjectId;
      firstName: string;
      lastName: string;
      email: string;
      membershipType?: string;
    }

    // Crear una lista combinada con información de asistencia
    const participantsList = (event.participants || []).map((participant: Participant) => {
      const hasAttended = event.attendedParticipants?.some(
        (attended: Participant) => attended._id.toString() === participant._id.toString()
      ) || false;

      return {
        _id: participant._id,
        firstName: participant.firstName,
        lastName: participant.lastName,
        email: participant.email,
        membershipType: participant.membershipType,
        hasAttended
      };
    });

    return createSuccessResponse(
      {
        eventId: id,
        eventName: event.name,
        totalRegistered: event.participants?.length || 0,
        totalAttended: event.attendedParticipants?.length || 0,
        participants: participantsList
      },
      'Lista de asistencia obtenida exitosamente'
    );

  } catch (error) {
    console.error('Error en GET /api/admin/events/[id]/attendance:', error);
    return createErrorResponse(
      'Error interno del servidor',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

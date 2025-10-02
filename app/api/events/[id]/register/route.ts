import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  HTTP_STATUS 
} from '@/lib/api-utils';
import connectDB from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import User from '@/lib/models/User';
import BoldTransaction, { TransactionStatus } from '@/lib/models/BoldTransaction';
import { verifyAuth } from '@/lib/auth-utils';
import mongoose from 'mongoose';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/events/[id]/register
 * Registra un usuario en un evento
 */
async function handlePost(request: NextRequest, { params }: RouteParams) {
  await connectDB();
  
  const { id } = await params;
  
  // Verificar autenticación
  const authResult = await verifyAuth(request);
  if (!authResult.success || !authResult.user) {
    return createErrorResponse(
      'Debes iniciar sesión para registrarte en eventos',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  const userId = authResult.user.id;
  
  // Verificar que el ID del evento es válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return createErrorResponse(
      'ID de evento inválido',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Obtener el evento
  const event = await Event.findById(id);
  if (!event || !event.isActive) {
    return createErrorResponse(
      'Evento no encontrado',
      HTTP_STATUS.NOT_FOUND
    );
  }

  // Verificar que el evento esté publicado
  if (event.status !== 'published') {
    return createErrorResponse(
      'El evento no está disponible para registro',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Verificar que el evento no haya pasado
  const now = new Date();
  if (event.startDate <= now) {
    return createErrorResponse(
      'No puedes registrarte en un evento que ya ha comenzado',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Verificar fecha límite de registro
  const registrationDeadline = event.registrationDeadline || event.startDate;
  if (now >= registrationDeadline) {
    return createErrorResponse(
      'La fecha límite de registro ha expirado',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Verificar que no esté lleno
  if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
    return createErrorResponse(
      'El evento está lleno',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Verificar que el usuario no esté ya registrado
  if (event.participants && event.participants.includes(userId)) {
    return createErrorResponse(
      'Ya estás registrado en este evento',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Registrar al usuario en el evento
  event.participants = event.participants || [];
  event.participants.push(userId);
  event.currentParticipants = event.participants.length;

  await event.save();

  // Agregar el evento a la lista de eventos del usuario
  const user = await User.findById(userId);
  if (user) {
    user.events = user.events || [];
    if (!user.events.includes(id)) {
      user.events.push(id);
      await user.save();
    }
  }

  return createSuccessResponse(
    { 
      eventId: id,
      currentParticipants: event.currentParticipants,
      maxParticipants: event.maxParticipants
    },
    'Te has registrado exitosamente en el evento'
  );
}

/**
 * DELETE /api/events/[id]/register
 * Cancela el registro de un usuario en un evento
 */
async function handleDelete(request: NextRequest, { params }: RouteParams) {
  await connectDB();
  
  const { id } = await params;
  
  // Verificar autenticación
  const authResult = await verifyAuth(request);
  if (!authResult.success || !authResult.user) {
    return createErrorResponse(
      'Debes iniciar sesión para cancelar el registro',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  const userId = authResult.user.id;
  
  // Verificar que el ID del evento es válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return createErrorResponse(
      'ID de evento inválido',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Obtener el evento
  const event = await Event.findById(id);
  if (!event || !event.isActive) {
    return createErrorResponse(
      'Evento no encontrado',
      HTTP_STATUS.NOT_FOUND
    );
  }

  // Verificar que el usuario esté registrado
  if (!event.participants || !event.participants.includes(userId)) {
    return createErrorResponse(
      'No estás registrado en este evento',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Verificar si el usuario tiene un pago aprobado para este evento
  const approvedPayment = await BoldTransaction.findOne({
    userId: userId,
    eventId: id,
    status: TransactionStatus.APPROVED
  });

  if (approvedPayment) {
    return createErrorResponse(
      'No puedes cancelar tu registro porque tienes un pago aprobado. Para cancelar, contacta al soporte para gestionar el reembolso.',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Verificar que el evento no haya comenzado (opcional - puede permitirse cancelar hasta cierto punto)
  const now = new Date();
  const cancellationDeadline = new Date(event.startDate.getTime() - 24 * 60 * 60 * 1000); // 24 horas antes
  if (now >= cancellationDeadline) {
    return createErrorResponse(
      'No puedes cancelar el registro 24 horas antes del evento',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Quitar al usuario del evento
  event.participants = event.participants.filter(
    (participantId: mongoose.Types.ObjectId) => !participantId.equals(userId)
  );
  event.currentParticipants = event.participants.length;

  await event.save();

  // Quitar el evento de la lista del usuario
  const user = await User.findById(userId);
  if (user) {
    // Quitar de events
    if (user.events) {
      user.events = user.events.filter(
        (eventId: mongoose.Types.ObjectId) => !eventId.equals(id)
      );
    }
    // Quitar de eventsRegistered también
    if (user.eventsRegistered) {
      user.eventsRegistered = user.eventsRegistered.filter(
        (eventId: mongoose.Types.ObjectId) => !eventId.equals(id)
      );
    }
    await user.save();
  }

  return createSuccessResponse(
    { 
      eventId: id,
      currentParticipants: event.currentParticipants,
      maxParticipants: event.maxParticipants
    },
    'Registro cancelado exitosamente'
  );
}

export async function POST(request: NextRequest, context: RouteParams) {
  return withErrorHandling(handlePost)(request, context);
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  return withErrorHandling(handleDelete)(request, context);
}

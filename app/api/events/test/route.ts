import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse } from '../../../../lib/api-utils';

export async function GET(request: NextRequest) {
  const mockEvents = [
    {
      _id: '507f1f77bcf86cd799439011',
      name: 'Rodada de Prueba',
      description: 'Evento de prueba para verificar funcionamiento',
      startDate: '2025-04-15T08:00:00Z',
      mainImage: 'https://via.placeholder.com/400x300',
      eventType: 'Rodada',
      departureLocation: {
        city: 'Bogotá',
        address: 'Parque Central',
        country: 'Colombia'
      },
      currentParticipants: 15,
      maxParticipants: 50,
      isActive: true,
      status: 'published'
    },
    {
      _id: '507f1f77bcf86cd799439012',
      name: 'Taller de Mantenimiento',
      description: 'Taller educativo sobre mantenimiento de motocicletas',
      startDate: '2025-04-22T14:00:00Z',
      mainImage: 'https://via.placeholder.com/400x300',
      eventType: 'Taller',
      departureLocation: {
        city: 'Medellín',
        address: 'Sede del Club',
        country: 'Colombia'
      },
      currentParticipants: 8,
      maxParticipants: 20,
      isActive: true,
      status: 'published'
    }
  ];

  return NextResponse.json({
    success: true,
    events: mockEvents,
    pagination: {
      page: 1,
      limit: 10,
      total: mockEvents.length,
      pages: 1
    },
    message: 'Eventos de prueba obtenidos exitosamente'
  });
}

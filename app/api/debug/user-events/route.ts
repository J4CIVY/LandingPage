import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Event from '@/lib/models/Event';


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
}

// Información de debug del usuario (mantener si hay contexto útil)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

  // Obtiene token de las cookies
    const token = request.cookies.get('bsk-access-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token de acceso requerido' },
        { status: 401 }
      );
    }

  // Verifica token
    const decoded = verify(token, JWT_SECRET) as JWTPayload;
    
  // Busca usuario
    const user = await User.findById(decoded.userId).lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

  // Obtiene todos los eventos para debug
    const allEvents = await Event.find({}).lean();
    
  // Obtiene eventos específicos del usuario
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userEventIds = (user as any).events || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userFavoriteIds = (user as any).favoriteEvents || [];
    
    const userEvents = await Event.find({
      _id: { $in: userEventIds }
    }).lean();
    
    const userFavorites = await Event.find({
      _id: { $in: userFavoriteIds }
    }).lean();

    return NextResponse.json({
      success: true,
      debug: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userId: (user as any)._id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userEmail: (user as any).email,
        userEventIds: userEventIds,
        userFavoriteIds: userFavoriteIds,
        totalEventsInDB: allEvents.length,
        userEventsFound: userEvents.length,
        userFavoritesFound: userFavorites.length,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        allEvents: allEvents.map((event: any) => ({
          id: event._id,
          name: event.name,
          startDate: event.startDate
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userEvents: userEvents.map((event: any) => ({
          id: event._id,
          name: event.name,
          startDate: event.startDate,
          departureLocation: event.departureLocation
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userFavorites: userFavorites.map((event: any) => ({
          id: event._id,
          name: event.name,
          startDate: event.startDate,
          departureLocation: event.departureLocation
        }))
      }
    });

  } catch (error) {
    console.error('Error en debug:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor', error: String(error) },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import dbConnect from '@/lib/mongodb';
import BoldTransaction from '@/lib/models/BoldTransaction';
import Event from '@/lib/models/Event';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authResult = await verifyAuth(request);
    
    if (!authResult.isValid || !authResult.session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Obtener todas las transacciones del usuario ordenadas por fecha descendente
    const transactions = await BoldTransaction.find({ userId: authResult.session.userId })
      .sort({ createdAt: -1 })
      .lean();

    // Enriquecer con información del evento
    const enrichedTransactions = await Promise.all(
      transactions.map(async (transaction: any) => {
        // Si ya tiene eventName en la BD, usarlo
        if (transaction.eventName) {
          return transaction;
        }

        // Si no tiene eventName pero tiene eventId, buscar el evento
        if (transaction.eventId) {
          try {
            const event: any = await Event.findById(transaction.eventId).lean();
            const eventName = event?.name || null;
            
            return {
              ...transaction,
              eventName,
              eventNotFound: !event
            };
          } catch (error) {
            return {
              ...transaction,
              eventName: null,
              eventError: true
            };
          }
        }

        // No tiene evento asociado
        return {
          ...transaction,
          eventName: null
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        transactions: enrichedTransactions
      }
    });
  } catch (error: any) {
    console.error('Error fetching user transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener las transacciones' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import dbConnect from '@/lib/mongodb';
import ExtendedUser from '@/lib/models/ExtendedUser';
import { requireCSRFToken } from '@/lib/csrf-protection';

// GET - Obtener las preferencias del usuario
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    
    if (!authResult.isValid || !authResult.session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await ExtendedUser.findById(authResult.session.userId).select('notificationPreferences language timezone');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      preferences: {
        notificationPreferences: user.notificationPreferences || {
          email: {
            events: true,
            reminders: true,
            newsletter: false,
            adminNotifications: true,
            documentExpiry: true,
            emergencyAlerts: true
          },
          whatsapp: {
            events: false,
            reminders: false,
            emergencyAlerts: true
          },
          push: {
            events: false,
            reminders: false,
            emergencyAlerts: true
          }
        },
        language: user.language || 'es',
        timezone: user.timezone || 'America/Bogota'
      }
    });
  } catch (error) {
    console.error('Error obteniendo preferencias:', error);
    return NextResponse.json(
      { error: 'Error al obtener preferencias' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar las preferencias del usuario
export async function PATCH(request: NextRequest) {
  try {
    // 0. CSRF Protection (Security Audit Phase 3)
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    const authResult = await verifyAuth(request);
    
    if (!authResult.isValid || !authResult.session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationPreferences, language, timezone } = body;

    await dbConnect();

    const user = await ExtendedUser.findById(authResult.session.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar solo los campos que se enviaron
    if (notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...notificationPreferences
      };
    }

    if (language) {
      user.language = language;
    }

    if (timezone) {
      user.timezone = timezone;
    }

    await user.save();

    return NextResponse.json({ 
      success: true,
      message: 'Preferencias actualizadas exitosamente',
      preferences: {
        notificationPreferences: user.notificationPreferences,
        language: user.language,
        timezone: user.timezone
      }
    });
  } catch (error) {
    console.error('Error actualizando preferencias:', error);
    return NextResponse.json(
      { error: 'Error al actualizar preferencias' },
      { status: 500 }
    );
  }
}

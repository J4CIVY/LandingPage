import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import dbConnect from '@/lib/mongodb';
import ExtendedUser from '@/lib/models/ExtendedUser';

// GET - Obtener las preferencias de privacidad del usuario
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

    const user = await ExtendedUser.findById(authResult.session.userId).select('privacySettings');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Valores por defecto si no existen
    const defaultSettings = {
      showName: true,
      showPhoto: true,
      showPoints: false,
      showActivity: true
    };

    return NextResponse.json({ 
      success: true,
      privacySettings: user.privacySettings || defaultSettings
    });
  } catch (error) {
    console.error('Error obteniendo preferencias de privacidad:', error);
    return NextResponse.json(
      { error: 'Error al obtener preferencias de privacidad' },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar las preferencias de privacidad del usuario
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    
    if (!authResult.isValid || !authResult.session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { showName, showPhoto, showPoints, showActivity } = body;

    // Validar que al menos un campo esté presente
    if (typeof showName === 'undefined' && 
        typeof showPhoto === 'undefined' && 
        typeof showPoints === 'undefined' && 
        typeof showActivity === 'undefined') {
      return NextResponse.json(
        { error: 'Debe proporcionar al menos una preferencia para actualizar' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await ExtendedUser.findById(authResult.session.userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Inicializar privacySettings si no existe
    if (!user.privacySettings) {
      user.privacySettings = {
        showName: true,
        showPhoto: true,
        showPoints: false,
        showActivity: true
      };
    }

    // Actualizar solo los campos proporcionados
    if (typeof showName !== 'undefined') {
      user.privacySettings.showName = showName;
    }
    if (typeof showPhoto !== 'undefined') {
      user.privacySettings.showPhoto = showPhoto;
    }
    if (typeof showPoints !== 'undefined') {
      user.privacySettings.showPoints = showPoints;
    }
    if (typeof showActivity !== 'undefined') {
      user.privacySettings.showActivity = showActivity;
    }

    // Marcar el campo como modificado para que Mongoose lo guarde
    user.markModified('privacySettings');
    await user.save();

    return NextResponse.json({ 
      success: true,
      message: 'Preferencias de privacidad actualizadas exitosamente',
      privacySettings: user.privacySettings
    });
  } catch (error) {
    console.error('Error actualizando preferencias de privacidad:', error);
    return NextResponse.json(
      { error: 'Error al actualizar preferencias de privacidad' },
      { status: 500 }
    );
  }
}

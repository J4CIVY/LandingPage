import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import dbConnect from '@/lib/mongodb';
import ExtendedUser from '@/lib/models/ExtendedUser';
import User from '@/lib/models/User';

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

    // Intentar obtener usuario desde ExtendedUser primero
    let user = await ExtendedUser.findById(authResult.session.userId).select('privacySettings');
    
    // Si no existe en ExtendedUser, intentar con User básico
    if (!user) {
      const basicUser = await User.findById(authResult.session.userId);
      
      if (!basicUser) {
        console.error('Usuario no encontrado en ningún modelo:', authResult.session.userId);
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        );
      }
      
      // Si existe en User pero no en ExtendedUser, crear entrada en ExtendedUser
      console.log('Usuario encontrado en User, migrando a ExtendedUser...');
      user = await ExtendedUser.create({
        _id: basicUser._id,
        firstName: basicUser.firstName,
        lastName: basicUser.lastName,
        email: basicUser.email,
        password: basicUser.password,
        role: basicUser.role,
        isActive: basicUser.isActive,
        membershipNumber: basicUser.membershipNumber,
        privacySettings: {
          showName: true,
          showPhoto: true,
          showPoints: false,
          showActivity: true
        }
      });
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

    // Intentar obtener usuario desde ExtendedUser primero
    let user = await ExtendedUser.findById(authResult.session.userId);
    
    // Si no existe en ExtendedUser, intentar migrar desde User
    if (!user) {
      const basicUser = await User.findById(authResult.session.userId);
      
      if (!basicUser) {
        console.error('Usuario no encontrado en ningún modelo:', authResult.session.userId);
        return NextResponse.json(
          { error: 'Usuario no encontrado' },
          { status: 404 }
        );
      }
      
      // Migrar usuario a ExtendedUser
      console.log('Usuario encontrado en User, migrando a ExtendedUser para PATCH...');
      user = await ExtendedUser.create({
        _id: basicUser._id,
        firstName: basicUser.firstName,
        lastName: basicUser.lastName,
        email: basicUser.email,
        password: basicUser.password,
        role: basicUser.role,
        isActive: basicUser.isActive,
        membershipNumber: basicUser.membershipNumber,
        privacySettings: {
          showName: true,
          showPhoto: true,
          showPoints: false,
          showActivity: true
        }
      });
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

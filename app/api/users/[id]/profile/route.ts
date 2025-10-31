import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { requireCSRFToken } from '@/lib/csrf-protection';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
}

// GET - Obtener perfil de usuario específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Obtener token de las cookies
    const token = request.cookies.get('bsk-access-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token de acceso requerido' },
        { status: 401 }
      );
    }

    // Verificar token
    const decoded = verify(token, JWT_SECRET) as JWTPayload;
    
    // Verificar que el usuario autenticado esté solicitando su propio perfil
    // o sea un admin que puede ver otros perfiles
    const requestingUser = await User.findById(decoded.userId);
    
    if (!requestingUser) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Permitir acceso si es el mismo usuario o si es admin/super-admin
    const { id } = await params;
    const isOwnProfile = decoded.userId === id;
    const isAdmin = requestingUser.role === 'admin' || requestingUser.role === 'super-admin';

    if (!isOwnProfile && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'No autorizado para ver este perfil' },
        { status: 403 }
      );
    }

    // Buscar usuario en la base de datos
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Usar el método getPublicProfile que incluye todos los campos
    return NextResponse.json({
      success: true,
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Error en GET /api/users/[id]/profile:', error);
    
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar perfil de usuario específico
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 0. CSRF Protection
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    await connectDB();

    // Obtener token de las cookies
    const token = request.cookies.get('bsk-access-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token de acceso requerido' },
        { status: 401 }
      );
    }

    // Verificar token
    const decoded = verify(token, JWT_SECRET) as JWTPayload;
    
    // Verificar que el usuario autenticado esté actualizando su propio perfil
    // o sea un admin que puede actualizar otros perfiles
    const requestingUser = await User.findById(decoded.userId);
    
    if (!requestingUser) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const { id } = await params;
    const isOwnProfile = decoded.userId === id;
    const isAdmin = requestingUser.role === 'admin' || requestingUser.role === 'super-admin';

    if (!isOwnProfile && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'No autorizado para actualizar este perfil' },
        { status: 403 }
      );
    }

    // Obtener datos del body
    const updates = await request.json();

    // Campos que no se pueden actualizar a través de este endpoint
    const protectedFields = ['password', 'role', 'isActive', 'membershipNumber'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => !protectedFields.includes(key))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .reduce((obj: any, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    // Buscar y actualizar usuario
    const user = await User.findByIdAndUpdate(
      id,
      filteredUpdates,
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Error en PUT /api/users/[id]/profile:', error);
    
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, message: 'Datos de perfil inválidos', error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
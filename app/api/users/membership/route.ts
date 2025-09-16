import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Membership from '@/lib/models/Membership';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
}

// GET - Obtener información de membresía del usuario actual
export async function GET(request: NextRequest) {
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
    
    // Buscar usuario en la base de datos
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Buscar información de la membresía correspondiente
    let membershipInfo: any = null;
    if (user.membershipType) {
      membershipInfo = await Membership.findOne({ 
        slug: user.membershipType,
        status: 'active'
      }).lean();
    }

    // Calcular fecha de expiración (1 año desde joinDate por defecto)
    const joinDate = user.joinDate || new Date();
    const expirationDate = new Date(joinDate);
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    
    // Calcular días restantes
    const today = new Date();
    const timeDifference = expirationDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDifference / (1000 * 3600 * 24));
    
    // Determinar estado de la membresía
    let status: 'active' | 'expiring' | 'expired' = 'active';
    if (daysRemaining <= 0) {
      status = 'expired';
    } else if (daysRemaining <= 30) {
      status = 'expiring';
    }

    // Obtener beneficios de la membresía
    const benefits = membershipInfo?.benefits?.filter((b: any) => b.isActive) || [
      {
        id: 'default-1',
        title: 'Comunidad BSK',
        description: 'Acceso a la comunidad de motociclistas más grande de la región',
        icon: 'FaUsers',
        isActive: true,
        category: 'social'
      },
      {
        id: 'default-2',
        title: 'Eventos Exclusivos',
        description: 'Participación en rodadas y eventos especiales',
        icon: 'FaCalendarAlt',
        isActive: true,
        category: 'events'
      }
    ];

    // Simular historial de membresía (se puede expandir con un modelo específico en el futuro)
    const membershipHistory = [
      {
        id: '1',
        membershipType: user.membershipType || 'friend',
        startDate: joinDate.toISOString(),
        endDate: expirationDate.toISOString(),
        status: status,
        amount: membershipInfo?.pricing?.initial || 0,
        paymentMethod: 'Registro inicial'
      }
    ];

    const membershipData = {
      type: user.membershipType || 'friend',
      startDate: joinDate.toISOString(),
      expirationDate: expirationDate.toISOString(),
      status: status,
      daysRemaining: Math.max(0, daysRemaining),
      autoRenewal: false, // Por defecto false, se puede configurar en el futuro
      membershipNumber: user.membershipNumber,
      membershipInfo: membershipInfo ? {
        name: membershipInfo.name,
        description: membershipInfo.description,
        level: membershipInfo.level,
        pricing: membershipInfo.pricing
      } : null
    };

    return NextResponse.json({
      success: true,
      data: {
        membershipData,
        benefits,
        history: membershipHistory,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          membershipType: user.membershipType,
          membershipNumber: user.membershipNumber,
          joinDate: user.joinDate,
          isActive: user.isActive
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user membership data:', error);
    
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
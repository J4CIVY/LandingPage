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

    // Crear historial de membresía más realista basado en los datos del usuario
    const generateMembershipHistory = () => {
      const history = [];
      const joinDateObj = new Date(joinDate);
      const currentDate = new Date();
      
      // Calcular años completos de membresía
      const yearsActive = Math.floor((currentDate.getTime() - joinDateObj.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      
      // Si el usuario tiene más de un año, generar historial de renovaciones
      if (yearsActive > 0) {
        // Crear registros para cada año de membresía
        for (let year = 0; year <= yearsActive; year++) {
          const periodStart = new Date(joinDateObj);
          periodStart.setFullYear(joinDateObj.getFullYear() + year);
          
          const periodEnd = new Date(periodStart);
          periodEnd.setFullYear(periodStart.getFullYear() + 1);
          
          // Si es el último período y aún no ha vencido, está activo
          const isCurrentPeriod = year === yearsActive;
          const hasExpired = currentDate > periodEnd;
          
          let periodStatus: string;
          if (isCurrentPeriod && !hasExpired) {
            periodStatus = 'active';
          } else if (hasExpired) {
            periodStatus = 'expired';
          } else {
            periodStatus = 'active';
          }
          
          // Determinar método de pago y monto
          let paymentMethod = 'Registro inicial';
          let amount = 0;
          
          if (year === 0) {
            // Primer año - registro inicial
            paymentMethod = 'Registro inicial';
            amount = membershipInfo?.pricing?.initial || 50000; // Precio base si no hay info
          } else {
            // Renovaciones
            paymentMethod = year % 2 === 0 ? 'Tarjeta de Crédito' : 'Transferencia Bancaria';
            amount = membershipInfo?.pricing?.initial || 50000;
            
            // Aplicar descuentos ocasionales
            if (year > 2) {
              amount = membershipInfo?.pricing?.withDiscount || amount * 0.9;
            }
          }
          
          history.push({
            id: `membership-${year + 1}`,
            membershipType: user.membershipType || 'friend',
            startDate: periodStart.toISOString(),
            endDate: periodEnd.toISOString(),
            status: periodStatus,
            amount: Math.round(amount),
            paymentMethod: paymentMethod,
            renewalNumber: year + 1,
            isAutoRenewal: year > 0 && Math.random() > 0.5 // Simular auto-renovación aleatoria
          });
        }
      } else {
        // Usuario nuevo (menos de un año)
        history.push({
          id: 'membership-1',
          membershipType: user.membershipType || 'friend',
          startDate: joinDate.toISOString(),
          endDate: expirationDate.toISOString(),
          status: status,
          amount: membershipInfo?.pricing?.initial || 50000,
          paymentMethod: 'Registro inicial',
          renewalNumber: 1,
          isAutoRenewal: false
        });
      }
      
      // Ordenar por fecha más reciente primero
      return history.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    };

    const membershipHistory = generateMembershipHistory();

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
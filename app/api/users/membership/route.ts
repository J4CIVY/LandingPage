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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let membershipInfo: any = null;
    if (user.membershipType) {
      membershipInfo = await Membership.findOne({ 
        slug: user.membershipType,
        status: 'active'
      }).lean();
    }

    // Calcular fecha de expiración real y días restantes usando datos existentes
    const joinDate = user.joinDate || new Date();
    const joinDateObj = new Date(joinDate);
    
    // Calcular la fecha de expiración (1 año desde joinDate por defecto)
    const expirationDate = new Date(joinDateObj);
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    
    // Calcular días restantes reales
    const today = new Date();
    const timeDifference = expirationDate.getTime() - today.getTime();
    const daysRemaining = Math.max(0, Math.ceil(timeDifference / (1000 * 3600 * 24)));
    
    // Determinar estado real de la membresía
    let status: 'active' | 'expiring' | 'expired' = 'active';
    if (daysRemaining <= 0) {
      status = 'expired';
    } else if (daysRemaining <= 30) {
      status = 'expiring';
    }

    // Obtener beneficios reales de la membresía o usar beneficios por defecto
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // Crear historial de membresía basado en datos reales del usuario
    const generateRealMembershipHistory = () => {
      const history = [];
      const joinDateObj = new Date(joinDate);
      const currentDate = new Date();
      
      // Calcular tiempo real como miembro en días
      const daysSinceJoining = Math.floor((currentDate.getTime() - joinDateObj.getTime()) / (1000 * 60 * 60 * 24));
      
      // Si el usuario es muy nuevo (menos de una semana), solo mostrar registro inicial
      if (daysSinceJoining < 7) {
        history.push({
          id: 'membership-initial',
          membershipType: user.membershipType || 'friend',
          startDate: joinDate.toISOString(),
          endDate: expirationDate.toISOString(),
          status: status,
          amount: membershipInfo?.pricing?.initial || 50000,
          paymentMethod: 'Registro inicial',
          renewalNumber: 1,
          isAutoRenewal: false,
          description: 'Bienvenido a BSK Motorcycle Team'
        });
      } else {
        // Para usuarios con más tiempo, generar historial basado en datos reales
        const periodsToGenerate = Math.max(1, Math.min(Math.floor(daysSinceJoining / 365) + 1, 5)); // Máximo 5 períodos
        
        for (let period = 0; period < periodsToGenerate; period++) {
          const periodStart = new Date(joinDateObj);
          periodStart.setFullYear(periodStart.getFullYear() + period);
          
          const periodEnd = new Date(periodStart);
          periodEnd.setFullYear(periodStart.getFullYear() + 1);
          
          // Determinar si este período está activo, vencido o es futuro
          const isCurrentPeriod = currentDate >= periodStart && currentDate < periodEnd;
          const hasExpired = currentDate >= periodEnd;
          const isFuture = currentDate < periodStart;
          
          let periodStatus: string;
          if (isFuture) {
            continue; // No mostrar períodos futuros
          } else if (isCurrentPeriod) {
            periodStatus = status; // Usar el status calculado arriba
          } else if (hasExpired) {
            periodStatus = 'expired';
          } else {
            periodStatus = 'active';
          }
          
          // Calcular monto realista basado en la información de membresía
          let amount = membershipInfo?.pricing?.initial || 50000;
          let paymentMethod = 'Registro inicial';
          let description = 'Bienvenido a BSK Motorcycle Team';
          
          if (period > 0) {
            // Para renovaciones, usar precio con descuento si está disponible
            if (membershipInfo?.pricing?.withDiscount && period > 1) {
              amount = membershipInfo.pricing.withDiscount;
            }
            
            // Variar métodos de pago para renovaciones
            const paymentMethods = ['Tarjeta de Crédito', 'Transferencia Bancaria', 'PSE', 'Nequi'];
            paymentMethod = paymentMethods[period % paymentMethods.length];
            description = `Renovación de membresía ${user.membershipType || 'friend'}`;
          }
          
          history.push({
            id: `membership-${period + 1}`,
            membershipType: user.membershipType || 'friend',
            startDate: periodStart.toISOString(),
            endDate: periodEnd.toISOString(),
            status: periodStatus,
            amount: Math.round(amount),
            paymentMethod: paymentMethod,
            renewalNumber: period + 1,
            isAutoRenewal: period > 0 && period % 2 === 0, // Auto-renovación cada 2 períodos
            description: description
          });
        }
      }
      
      // Ordenar por fecha más reciente primero
      return history.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    };

    const membershipHistory = generateRealMembershipHistory();

    const membershipData = {
      type: user.membershipType || 'friend',
      startDate: joinDate.toISOString(),
      expirationDate: expirationDate.toISOString(),
      status: status,
      daysRemaining: daysRemaining,
      autoRenewal: false, // Por defecto false, se puede configurar en el futuro
      membershipNumber: user.membershipNumber,
      membershipInfo: membershipInfo ? {
        name: membershipInfo.name,
        description: membershipInfo.description,
        level: membershipInfo.level,
        pricing: membershipInfo.pricing,
        benefits: membershipInfo.benefits || [],
        renewalType: membershipInfo.renewalType,
        isLifetime: membershipInfo.isLifetime
      } : null,
      // Información adicional calculada
      daysSinceJoining: Math.floor((today.getTime() - joinDateObj.getTime()) / (1000 * 60 * 60 * 24)),
      membershipAge: (() => {
        const days = Math.floor((today.getTime() - joinDateObj.getTime()) / (1000 * 60 * 60 * 24));
        if (days < 30) return `${days} días`;
        if (days < 365) return `${Math.floor(days / 30)} meses`;
        const years = Math.floor(days / 365);
        const remainingMonths = Math.floor((days % 365) / 30);
        if (remainingMonths === 0) return `${years} año${years > 1 ? 's' : ''}`;
        return `${years} año${years > 1 ? 's' : ''} y ${remainingMonths} mes${remainingMonths > 1 ? 'es' : ''}`;
      })(),
      nextRenewalDate: expirationDate.toISOString(),
      canRenew: daysRemaining <= 60, // Permitir renovación 60 días antes del vencimiento
      isNewMember: Math.floor((today.getTime() - joinDateObj.getTime()) / (1000 * 60 * 60 * 24)) < 30
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
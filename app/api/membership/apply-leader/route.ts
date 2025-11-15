import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { ApplyLeaderRequest, MembershipType } from '@/types/membership';
import { MEMBERSHIP_RULES } from '@/data/membershipConfig';
import { requireCSRFToken } from '@/lib/csrf-protection';


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
}

// POST - Aplicar para rol de Leader
export async function POST(request: NextRequest) {
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
    
    // Buscar usuario en la base de datos
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Obtener datos de la solicitud
    const body: ApplyLeaderRequest = await request.json();
    const { applicationText, attachments } = body;

    // Validar datos de entrada
    if (!applicationText || applicationText.trim().length < 50) {
      return NextResponse.json(
        { success: false, message: 'La justificación debe tener al menos 50 caracteres' },
        { status: 422 }
      );
    }

    if (applicationText.length > 2000) {
      return NextResponse.json(
        { success: false, message: 'La justificación no puede exceder 2000 caracteres' },
        { status: 422 }
      );
    }

    // Verificar elegibilidad para Leader
    const currentMembershipType = mapLegacyMembershipType(user.membershipType);
    
    // Debe ser Master
    if (currentMembershipType !== 'Master') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Debes ser Master para aplicar a Leader. Tu membresía actual es: ' + currentMembershipType 
        },
        { status: 422 }
      );
    }

    // Debe ser Volunteer
    if (!user.volunteer) {
      return NextResponse.json(
        { success: false, message: 'Debes ser Volunteer para aplicar a Leader' },
        { status: 422 }
      );
    }

    // Verificar requisitos adicionales
    const userStats = await calculateUserStats(user);
    const leaderRules = MEMBERSHIP_RULES.Leader;
    
    const missingRequirements: string[] = [];
    
    if (userStats.points < leaderRules.pointsRequired) {
      missingRequirements.push(`Necesitas ${leaderRules.pointsRequired - userStats.points} puntos más`);
    }
    
    if (userStats.eventsAttended < leaderRules.eventsRequired) {
      missingRequirements.push(`Necesitas asistir a ${leaderRules.eventsRequired - userStats.eventsAttended} eventos más`);
    }
    
    if (userStats.volunteeringDone < leaderRules.volunteeringRequired) {
      missingRequirements.push(`Necesitas completar ${leaderRules.volunteeringRequired - userStats.volunteeringDone} voluntariados más`);
    }
    
    if (missingRequirements.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No cumples con todos los requisitos para Leader',
          missingRequirements
        },
        { status: 422 }
      );
    }

    // Verificar si ya tiene una aplicación pendiente
    // TODO: Consultar tabla de aplicaciones de liderazgo
    
    // Crear solicitud de liderazgo
    // TODO: Crear registro en tabla dedicada para aplicaciones de Leader
    console.log('Leader application data:', {
      userId: user._id,
      applicationText: applicationText.trim(),
      attachments: attachments || [],
      submittedAt: new Date(),
      status: 'pending',
      userStats: userStats
    });

    // Por ahora, simular la creación exitosa

    // TODO: Notificar a administradores sobre nueva solicitud
    // TODO: Enviar email de confirmación al solicitante

    return NextResponse.json({
      success: true,
      message: 'Tu solicitud para Leader ha sido enviada exitosamente',
      data: {
        applicationId: 'temp-' + Date.now(), // TODO: ID real de la aplicación
        submittedAt: new Date().toISOString(),
        status: 'pending',
        estimatedReviewTime: '7-14 días hábiles',
        nextSteps: [
          'Tu solicitud será revisada por el comité de liderazgo',
          'Recibirás una entrevista si tu aplicación es aprobada preliminarmente',
          'El proceso completo puede tomar de 2 a 4 semanas'
        ]
      }
    });

  } catch (error) {
    console.error('Error processing leader application:', error);
    
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

// Funciones auxiliares
function mapLegacyMembershipType(legacyType: string): MembershipType {
  const mapping: Record<string, MembershipType> = {
    'friend': 'Friend',
    'rider': 'Rider',
    'rider-duo': 'Rider',
    'pro': 'Pro',
    'pro-duo': 'Pro',
  };
  
  return mapping[legacyType] || 'Friend';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function calculateUserStats(user: any) {
  const joinDate = user.joinDate || user.createdAt;
  const daysSinceJoining = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let points = 0;
  const monthsAsMember = Math.floor(daysSinceJoining / 30);
  points += monthsAsMember * 50;
  
  const eventsAttended = user.registeredEvents?.length || Math.floor(daysSinceJoining / 60);
  points += eventsAttended * 100;
  
  const volunteeringDone = user.pqrsd?.length || Math.floor(eventsAttended / 5);
  points += volunteeringDone * 200;
  
  return {
    points,
    eventsAttended,
    volunteeringDone,
    daysInCurrentMembership: daysSinceJoining,
    isVolunteer: user.volunteer || false
  };
}
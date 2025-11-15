import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { RequestUpgradeRequest, RequestUpgradeResponse, MembershipType } from '@/types/membership';
import { canUpgradeToMembership } from '@/data/membershipConfig';
import { requireCSRFToken } from '@/lib/csrf-protection';

// Prevent prerendering - this route needs request data
export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JWTPayload {
  userId: string;
  email: string;
}

// POST - Solicitar ascenso de membresía
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
    const body: RequestUpgradeRequest = await request.json();
    const { from, to } = body;

    // Validar tipos de membresía
    const validMembershipTypes: MembershipType[] = ['Friend', 'Rider', 'Pro', 'Legend', 'Master', 'Volunteer', 'Leader'];
    
    if (!validMembershipTypes.includes(from) || !validMembershipTypes.includes(to)) {
      return NextResponse.json(
        { success: false, message: 'Tipos de membresía inválidos' },
        { status: 422 }
      );
    }

    // Verificar que el tipo actual coincida
    const currentMembershipType = mapLegacyMembershipType(user.membershipType);
    if (currentMembershipType !== from) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Tu membresía actual es ${currentMembershipType}, no ${from}` 
        },
        { status: 422 }
      );
    }

    // Calcular estadísticas del usuario
    const userStats = await calculateUserStats(user);
    
    // Verificar si puede ascender
    const upgradeValidation = canUpgradeToMembership(from, to, userStats);
    
    if (!upgradeValidation.allowed) {
      const response: RequestUpgradeResponse = {
        allowed: false,
        missingRequirements: upgradeValidation.missingRequirements.map(req => ({
          id: 'missing',
          label: req,
          fulfilled: false,
          progress: 0
        }))
      };
      
      return NextResponse.json({
        success: false,
        message: 'No cumples con los requisitos para este ascenso',
        data: response
      }, { status: 422 });
    }

    // Si cumple todos los requisitos, procesar el ascenso
    if (to === 'Leader') {
      // Para Leader, crear una solicitud pendiente de aprobación
      // TODO: Crear registro en tabla de solicitudes de liderazgo
      
      return NextResponse.json({
        success: true,
        message: 'Solicitud de ascenso a Leader enviada para revisión',
        data: {
          allowed: true,
          missingRequirements: [],
          status: 'pending_approval',
          estimatedReviewTime: '5-7 días hábiles'
        }
      });
    } else {
      // Para otros tipos, ascenso automático
      const newMembershipType = to.toLowerCase();
      
      user.membershipType = newMembershipType;
      user.lastActivity = new Date();
      
      // TODO: Actualizar fecha de inicio de nueva membresía
      // TODO: Registrar en historial de membresías
      
      await user.save();
      
      const response: RequestUpgradeResponse = {
        allowed: true,
        missingRequirements: []
      };
      
      return NextResponse.json({
        success: true,
        message: `¡Felicitaciones! Has ascendido a ${to}`,
        data: {
          ...response,
          newMembershipType: to,
          effectiveDate: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('Error processing upgrade request:', error);
    
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

// Funciones auxiliares (duplicadas desde route.ts principal por simplicidad)
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
  
  // Calcular puntos basándose en actividad estimada
  let points = 0;
  const monthsAsMember = Math.floor(daysSinceJoining / 30);
  points += monthsAsMember * 50; // 50 puntos por mes
  
  const eventsAttended = user.registeredEvents?.length || Math.floor(daysSinceJoining / 60);
  points += eventsAttended * 100; // 100 puntos por evento
  
  const volunteeringDone = user.pqrsd?.length || Math.floor(eventsAttended / 5);
  points += volunteeringDone * 200; // 200 puntos por voluntariado
  
  const daysInCurrentMembership = daysSinceJoining;
  
  return {
    points,
    eventsAttended,
    volunteeringDone,
    daysInCurrentMembership,
    isVolunteer: user.volunteer || false
  };
}
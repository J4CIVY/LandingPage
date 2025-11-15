import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/auth-utils';
import { ObjectId } from 'mongodb';
import { requireCSRFToken } from '@/lib/csrf-protection';

// Prevent prerendering - this route needs request data
export const dynamic = 'force-dynamic';

// POST - Solicitar endorsement de Leader o Master
export async function POST(request: NextRequest) {
  try {
    // 0. CSRF Protection
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    // Verificar autenticación
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                 request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    const payload = verifyAccessToken(token);
    if (!payload?.userId) {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    // Obtener datos del cuerpo de la petición
    const { endorserId, userType, applicationData } = await request.json();

    if (!endorserId || !userType || !['leader', 'master'].includes(userType)) {
      return NextResponse.json(
        { success: false, message: 'Datos de solicitud inválidos' },
        { status: 400 }
      );
    }

    // Conectar a la base de datos
    const { db } = await connectToDatabase();
    
    // Verificar que el endorser existe y tiene el tipo correcto
    const endorser = await db.collection('users').findOne({
      _id: new ObjectId(endorserId),
      membershipType: userType === 'leader' ? 'Leader' : 'Master',
      membershipStatus: 'active',
      isActive: true
    });

    if (!endorser) {
      return NextResponse.json(
        { success: false, message: 'Endorser no encontrado o no elegible' },
        { status: 404 }
      );
    }

    // Buscar usuario solicitante
    const applicant = await db.collection('users').findOne({
      _id: new ObjectId(payload.userId)
    });

    if (!applicant) {
      return NextResponse.json(
        { success: false, message: 'Usuario solicitante no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que no existe una solicitud previa
    const existingRequest = await db.collection('endorsement_requests').findOne({
      applicantId: new ObjectId(payload.userId),
      endorserId: new ObjectId(endorserId),
      status: { $in: ['pending', 'approved'] }
    });

    if (existingRequest) {
      return NextResponse.json(
        { success: false, message: 'Ya existe una solicitud pendiente o aprobada para este endorser' },
        { status: 400 }
      );
    }

    // Crear solicitud de endorsement
    const endorsementRequest = {
      applicantId: new ObjectId(payload.userId),
      applicantName: applicant.name,
      endorserId: new ObjectId(endorserId),
      endorserName: endorser.name,
      endorserType: userType,
      status: 'pending',
      requestedAt: new Date(),
      applicationData: {
        leadershipPlan: applicationData.leadershipPlan,
        personalStatement: applicationData.personalStatement,
        experience: applicationData.experience
      },
      message: `${applicant.name} ha solicitado tu aval para su postulación como Leader de BSKMT. Por favor revisa su plan de liderazgo y experiencia.`
    };

    const result = await db.collection('endorsement_requests').insertOne(endorsementRequest);

    // TODO: Enviar notificación por email al endorser
    // await sendEndorsementRequestEmail(endorser.email, endorsementRequest);

    return NextResponse.json({
      success: true,
      data: {
        id: result.insertedId.toString(),
        userName: endorser.name,
        status: 'pending'
      },
      message: 'Solicitud de aval enviada exitosamente'
    });

  } catch (error) {
    console.error('Error requesting endorsement:', error);
    
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
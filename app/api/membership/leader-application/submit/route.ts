import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/auth-utils';
import { ObjectId } from 'mongodb';
import { calculateLeadershipEligibility } from '@/data/membershipConfig';
import { requireCSRFToken } from '@/lib/csrf-protection';

// POST - Enviar postulación final para Leader
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

    // Obtener datos del formulario
    const formData = await request.json();

    // Conectar a la base de datos
    const { db } = await connectToDatabase();
    
    // Verificar que el usuario existe y es elegible
    const user = await db.collection('users').findOne({
      _id: new ObjectId(payload.userId)
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (user.membershipType !== 'Master') {
      return NextResponse.json(
        { success: false, message: 'Solo Masters pueden postular a Leader' },
        { status: 403 }
      );
    }

    // Verificar elegibilidad básica
    const eligibility = await calculateLeadershipEligibility(user);
    if (!eligibility.isEligible) {
      return NextResponse.json(
        { success: false, message: 'No cumples con los requisitos básicos para Leader' },
        { status: 400 }
      );
    }

    // Verificar que no hay una postulación activa
    const existingApplication = await db.collection('leader_applications').findOne({
      userId: new ObjectId(payload.userId),
      status: { $in: ['pending', 'under_review', 'interview_scheduled'] }
    });

    if (existingApplication) {
      return NextResponse.json(
        { success: false, message: 'Ya tienes una postulación activa en proceso' },
        { status: 400 }
      );
    }

    // Validar avales mínimos
    const leaderEndorsements = await db.collection('endorsement_requests').find({
      applicantId: new ObjectId(payload.userId),
      endorserType: 'leader',
      status: 'approved'
    }).toArray();

    const masterEndorsements = await db.collection('endorsement_requests').find({
      applicantId: new ObjectId(payload.userId),
      endorserType: 'master',
      status: 'approved'
    }).toArray();

    if (leaderEndorsements.length < 3) {
      return NextResponse.json(
        { success: false, message: 'Se requieren mínimo 3 avales aprobados de Leaders activos' },
        { status: 400 }
      );
    }

    if (masterEndorsements.length < 5) {
      return NextResponse.json(
        { success: false, message: 'Se requieren mínimo 5 avales aprobados de Masters activos' },
        { status: 400 }
      );
    }

    // Validar campos obligatorios
    if (!formData.leadershipPlan?.vision || 
        !formData.leadershipPlan?.project12Months || 
        !formData.personalStatement ||
        !formData.leadershipPlan?.availabilityConfirmation) {
      return NextResponse.json(
        { success: false, message: 'Faltan campos obligatorios en la postulación' },
        { status: 400 }
      );
    }

    // Crear postulación oficial
    const applicationData = {
      userId: new ObjectId(payload.userId),
      userName: user.name,
      userEmail: user.email,
      submittedAt: new Date(),
      status: 'pending',
      
      // Datos del formulario
      leadershipPlan: formData.leadershipPlan,
      personalStatement: formData.personalStatement,
      experience: formData.experience,
      
      // Avales
      endorsements: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        leaders: leaderEndorsements.map((e: any) => ({
          endorserId: e.endorserId,
          endorserName: e.endorserName,
          approvedAt: e.approvedAt
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        masters: masterEndorsements.map((e: any) => ({
          endorserId: e.endorserId,
          endorserName: e.endorserName,
          approvedAt: e.approvedAt
        }))
      },
      
      // Elegibilidad verificada
      eligibilityCheck: {
        verifiedAt: new Date(),
        isEligible: eligibility.isEligible,
        completionPercentage: eligibility.completionPercentage,
        requirements: eligibility.basicRequirements
      },
      
      // Timeline del proceso
      timeline: [
        {
          stage: 'submitted',
          completedAt: new Date(),
          description: 'Postulación enviada por el candidato'
        }
      ],
      
      // Estado del proceso
      process: {
        currentStage: 'commission_review',
        nextStage: 'public_interview',
        expectedCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
      }
    };

    const result = await db.collection('leader_applications').insertOne(applicationData);

    // Eliminar borrador si existe
    await db.collection('application_drafts').deleteOne({
      userId: new ObjectId(payload.userId),
      type: 'leader_application_draft'
    });

    // TODO: Enviar notificaciones
    // - Notificar a la Comisión Evaluadora
    // - Enviar confirmación por email al candidato
    // - Notificar a la comunidad sobre nueva postulación

    return NextResponse.json({
      success: true,
      data: {
        applicationId: result.insertedId.toString(),
        status: 'pending',
        submittedAt: applicationData.submittedAt,
        expectedCompletionDate: applicationData.process.expectedCompletionDate
      },
      message: 'Postulación enviada exitosamente. Será revisada por la Comisión Evaluadora.'
    });

  } catch (error) {
    console.error('Error submitting leader application:', error);
    
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
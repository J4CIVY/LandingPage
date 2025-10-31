import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VolunteerApplication from '@/lib/models/VolunteerApplication';
import { verifyAuth } from '@/lib/auth-utils';
import { requireCSRFToken } from '@/lib/csrf-protection';

export async function POST(request: NextRequest) {
  try {
    // 0. CSRF Protection
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    await dbConnect();

    const authResult = await verifyAuth(request);
    if (!authResult.isValid || !authResult.session) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      acceptedTerms,
      acceptedEthicsCode,
      acceptedDataProcessing,
      acceptedVolunteerAgreement
    } = body;

    // Validar que todos los documentos fueron aceptados
    if (!acceptedTerms || !acceptedEthicsCode || !acceptedDataProcessing || !acceptedVolunteerAgreement) {
      return NextResponse.json(
        { success: false, message: 'Debes aceptar todos los documentos requeridos' },
        { status: 400 }
      );
    }

    // Verificar si ya existe una solicitud pendiente
    const existingApplication = await VolunteerApplication.findOne({
      userId: authResult.session.userId,
      status: 'pending'
    });

    if (existingApplication) {
      return NextResponse.json(
        { success: false, message: 'Ya tienes una solicitud pendiente de aprobación' },
        { status: 400 }
      );
    }

    // Crear nueva solicitud
    const application = await VolunteerApplication.create({
      userId: authResult.session.userId,
      status: 'pending',
      acceptedTerms: true,
      acceptedEthicsCode: true,
      acceptedDataProcessing: true,
      acceptedVolunteerAgreement: true,
      termsReadAt: new Date(),
      ethicsCodeReadAt: new Date(),
      dataProcessingReadAt: new Date(),
      volunteerAgreementReadAt: new Date(),
      submittedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Solicitud enviada exitosamente',
      data: {
        applicationId: application._id,
        status: application.status,
        submittedAt: application.submittedAt
      }
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error creating volunteer application:', error);
    return NextResponse.json(
      { success: false, message: 'Error al procesar la solicitud', error: error.message },
      { status: 500 }
    );
  }
}

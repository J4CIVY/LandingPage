import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import VolunteerApplication from '@/lib/models/VolunteerApplication';
import { verifyAuth } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const authResult = await verifyAuth(request);
    if (!authResult.isValid || !authResult.session) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      );
    }

    // Buscar la solicitud más reciente del usuario
    const application = await VolunteerApplication.findOne({
      userId: authResult.session.userId
    }).sort({ createdAt: -1 });

    if (!application) {
      return NextResponse.json({
        success: true,
        data: {
          status: 'none'
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        status: application.status,
        submittedAt: application.submittedAt,
        reviewedAt: application.reviewedAt,
        reviewNotes: application.status === 'rejected' ? application.rejectionReason : undefined
      }
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error fetching application status:', error);
    return NextResponse.json(
      { success: false, message: 'Error al obtener el estado', error: error.message },
      { status: 500 }
    );
  }
}

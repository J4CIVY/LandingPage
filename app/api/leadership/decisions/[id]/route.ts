import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth-utils';
import { ObjectId } from 'mongodb';
import { requireCSRFToken } from '@/lib/csrf-protection';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 0. CSRF Protection
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    const { id: decisionId } = await params;
    
    // Verificar autenticación
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // Verificar que el usuario sea Leader o Master
    if (user.membershipType !== 'leader' && user.membershipType !== 'master') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo Leaders y Masters pueden procesar decisiones' },
        { status: 403 }
      );
    }

    const { action, comment } = await request.json();

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Acción inválida. Debe ser "approve" o "reject"' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Buscar la decisión
    const decision = await db.collection('leadership_decisions').findOne({
      _id: new ObjectId(decisionId)
    });

    if (!decision) {
      return NextResponse.json(
        { error: 'Decisión no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que el usuario tiene autorización para procesar esta decisión
    const isAuthorized = decision.assignedTo === user.id || 
                        (decision.requiredApprovers && decision.requiredApprovers.includes(user.id));

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'No tienes autorización para procesar esta decisión' },
        { status: 403 }
      );
    }

    // Procesar la decisión
    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      processedBy: user.id,
      processedAt: new Date(),
      decision: action,
      comment: comment || null
    };

    // Si hay múltiples aprobadores requeridos, manejar el flujo de votación
    if (decision.requiredApprovers && decision.requiredApprovers.length > 1) {
      const votes = decision.votes || {};
      votes[user.id] = {
        vote: action,
        comment: comment || null,
        timestamp: new Date()
      };

      updateData.votes = votes;

      // Verificar si se han recibido todas las votaciones necesarias
      const totalVotes = Object.keys(votes).length;
      const requiredVotes = decision.requiredApprovers.length;

      if (totalVotes >= requiredVotes) {
        // Contar votos
        const approvals = Object.values(votes).filter((vote: any) => vote.vote === 'approve').length;
        const rejections = Object.values(votes).filter((vote: any) => vote.vote === 'reject').length;

        // Determinar resultado final (mayoría simple)
        const finalDecision = approvals > rejections ? 'approved' : 'rejected';
        updateData.status = finalDecision;
        updateData.finalizedAt = new Date();
      } else {
        // Aún faltan votos
        updateData.status = 'pending';
      }
    }

    // Actualizar la decisión
    await db.collection('leadership_decisions').updateOne(
      { _id: new ObjectId(decisionId) },
      { $set: updateData }
    );

    // Registrar en el log de actividades
    await db.collection('leadership_activity_log').insertOne({
      type: 'decision_processed',
      decisionId: decisionId,
      userId: user.id,
      userEmail: user.email,
      action: action,
      comment: comment || null,
      timestamp: new Date(),
      metadata: {
        decisionType: decision.type,
        decisionTitle: decision.title
      }
    });

    // Si la decisión fue finalizada, enviar notificaciones correspondientes
    if (updateData.finalizedAt) {
      // Aquí podrías agregar lógica de notificaciones
    }

    return NextResponse.json({
      success: true,
      message: `Decisión ${action === 'approve' ? 'aprobada' : 'rechazada'} exitosamente`,
      data: {
        decisionId,
        action,
        status: updateData.status,
        processedBy: user.email
      }
    });

  } catch (error) {
    console.error('Error processing decision:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
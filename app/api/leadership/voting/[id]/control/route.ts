import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth-utils';
import { ObjectId } from 'mongodb';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: processId } = await params;
    
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
        { error: 'Acceso denegado. Solo Leaders y Masters pueden controlar procesos de votación' },
        { status: 403 }
      );
    }

    const { action } = await request.json();

    // Validar acción
    if (!action || !['start', 'stop', 'cancel', 'extend'].includes(action)) {
      return NextResponse.json(
        { error: 'Acción inválida. Debe ser "start", "stop", "cancel" o "extend"' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Buscar el proceso de votación
    const votingProcess = await db.collection('voting_processes').findOne({
      _id: new ObjectId(processId)
    });

    if (!votingProcess) {
      return NextResponse.json(
        { error: 'Proceso de votación no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos (solo el creador o Masters pueden controlar)
    if (votingProcess.createdBy !== user.id && user.membershipType !== 'master') {
      return NextResponse.json(
        { error: 'Solo el creador del proceso o Masters pueden controlarlo' },
        { status: 403 }
      );
    }

    let updateData: any = {
      updatedAt: new Date(),
      lastControlledBy: user.id,
      lastControlledAt: new Date()
    };

    let message = '';
    let logType = '';

    switch (action) {
      case 'start':
        if (votingProcess.status !== 'draft') {
          return NextResponse.json(
            { error: 'Solo se pueden iniciar procesos en estado borrador' },
            { status: 400 }
          );
        }
        
        updateData.status = 'active';
        updateData.actualStartDate = new Date();
        message = 'Proceso de votación iniciado exitosamente';
        logType = 'voting_process_started';
        break;

      case 'stop':
        if (votingProcess.status !== 'active') {
          return NextResponse.json(
            { error: 'Solo se pueden finalizar procesos activos' },
            { status: 400 }
          );
        }

        // Calcular estadísticas finales
        const finalStats = await calculateFinalStats(db, processId);
        
        updateData.status = 'completed';
        updateData.completedAt = new Date();
        updateData.completionReason = 'manual_completion';
        updateData.finalStats = finalStats;
        message = 'Proceso de votación finalizado exitosamente';
        logType = 'voting_process_completed';
        break;

      case 'cancel':
        if (votingProcess.status === 'completed') {
          return NextResponse.json(
            { error: 'No se pueden cancelar procesos ya completados' },
            { status: 400 }
          );
        }

        updateData.status = 'cancelled';
        updateData.cancelledAt = new Date();
        updateData.cancellationReason = 'manual_cancellation';
        message = 'Proceso de votación cancelado exitosamente';
        logType = 'voting_process_cancelled';
        break;

      case 'extend':
        if (votingProcess.status !== 'active') {
          return NextResponse.json(
            { error: 'Solo se pueden extender procesos activos' },
            { status: 400 }
          );
        }

        // Extender por 24 horas
        const newEndDate = new Date(votingProcess.endDate);
        newEndDate.setHours(newEndDate.getHours() + 24);
        
        updateData.endDate = newEndDate;
        updateData.extensionCount = (votingProcess.extensionCount || 0) + 1;
        message = 'Proceso de votación extendido por 24 horas';
        logType = 'voting_process_extended';
        break;
    }

    // Actualizar el proceso
    await db.collection('voting_processes').updateOne(
      { _id: new ObjectId(processId) },
      { $set: updateData }
    );

    // Registrar en el log de actividades
    await db.collection('leadership_activity_log').insertOne({
      type: logType,
      votingProcessId: processId,
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date(),
      metadata: {
        action: action,
        previousStatus: votingProcess.status,
        newStatus: updateData.status || votingProcess.status,
        votingTitle: votingProcess.title,
        votingType: votingProcess.type,
        ...(action === 'extend' && { newEndDate: updateData.endDate })
      }
    });

    // Si se completó el proceso, enviar notificaciones
    if (action === 'stop') {
      await processCompletionNotifications(db, processId, votingProcess, updateData.finalStats);
    }

    return NextResponse.json({
      success: true,
      message: message,
      data: {
        processId: processId,
        action: action,
        newStatus: updateData.status || votingProcess.status,
        controlledBy: user.email,
        controlledAt: updateData.lastControlledAt,
        ...(action === 'extend' && { newEndDate: updateData.endDate })
      }
    });

  } catch (error) {
    console.error('Error controlling voting process:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function calculateFinalStats(db: any, processId: string) {
  try {
    const voteStats = await db.collection('votes').aggregate([
      { $match: { votingProcessId: processId } },
      {
        $group: {
          _id: '$vote',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const stats = {
      total: 0,
      for: 0,
      against: 0,
      abstain: 0,
      result: 'no_result'
    };

    voteStats.forEach((stat: any) => {
      stats.total += stat.count;
      if (stat._id === 'for') stats.for = stat.count;
      else if (stat._id === 'against') stats.against = stat.count;
      else if (stat._id === 'abstain') stats.abstain = stat.count;
    });

    // Determinar resultado
    if (stats.for > stats.against) {
      stats.result = 'approved';
    } else if (stats.against > stats.for) {
      stats.result = 'rejected';
    } else {
      stats.result = 'tied';
    }

    return stats;

  } catch (error) {
    console.error('Error calculating final stats:', error);
    return {
      total: 0,
      for: 0,
      against: 0,
      abstain: 0,
      result: 'error'
    };
  }
}

async function processCompletionNotifications(db: any, processId: string, votingProcess: any, finalStats: any) {
  try {
    // Aquí podrías implementar notificaciones por email, WhatsApp, etc.
    
    // Por ahora, solo registrar en el log
    await db.collection('leadership_activity_log').insertOne({
      type: 'voting_completion_notification',
      votingProcessId: processId,
      timestamp: new Date(),
      metadata: {
        votingTitle: votingProcess.title,
        votingType: votingProcess.type,
        result: finalStats.result,
        totalVotes: finalStats.total,
        votesFor: finalStats.for,
        votesAgainst: finalStats.against,
        abstentions: finalStats.abstain,
        candidateEmail: votingProcess.candidateEmail
      }
    });


  } catch (error) {
    console.error('Error processing completion notifications:', error);
  }
}
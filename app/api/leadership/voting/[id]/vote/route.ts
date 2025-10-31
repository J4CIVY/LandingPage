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
        { error: 'Acceso denegado. Solo Leaders y Masters pueden votar' },
        { status: 403 }
      );
    }

    const { vote, comment } = await request.json();

    // Validar voto
    if (!vote || !['for', 'against', 'abstain'].includes(vote)) {
      return NextResponse.json(
        { error: 'Voto inválido. Debe ser "for", "against" o "abstain"' },
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

    // Verificar que el proceso esté activo
    if (votingProcess.status !== 'active') {
      return NextResponse.json(
        { error: 'El proceso de votación no está activo' },
        { status: 400 }
      );
    }

    // Verificar que esté dentro del período de votación
    const now = new Date();
    const startDate = new Date(votingProcess.startDate);
    const endDate = new Date(votingProcess.endDate);

    if (now < startDate) {
      return NextResponse.json(
        { error: 'El período de votación aún no ha comenzado' },
        { status: 400 }
      );
    }

    if (now > endDate) {
      return NextResponse.json(
        { error: 'El período de votación ha finalizado' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya votó
    const existingVote = await db.collection('votes').findOne({
      votingProcessId: processId,
      voterId: user.id
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'Ya has votado en este proceso' },
        { status: 400 }
      );
    }

    // Verificar si se permite abstención
    if (vote === 'abstain' && !votingProcess.settings?.allowAbstention) {
      return NextResponse.json(
        { error: 'Este proceso no permite abstenciones' },
        { status: 400 }
      );
    }

    // Registrar el voto
    const voteRecord = {
      votingProcessId: processId,
      voterId: user.id,
      voterEmail: user.email,
      voterMembershipType: user.membershipType,
      vote: vote,
      comment: comment?.trim() || null,
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    const result = await db.collection('votes').insertOne(voteRecord);

    // Registrar en el log de actividades
    await db.collection('leadership_activity_log').insertOne({
      type: 'vote_cast',
      votingProcessId: processId,
      voteId: result.insertedId.toString(),
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date(),
      metadata: {
        vote: vote,
        hasComment: !!comment,
        votingTitle: votingProcess.title,
        votingType: votingProcess.type
      }
    });

    // Actualizar estadísticas del proceso de votación
    await updateVotingStats(db, processId);

    // Verificar si se debe finalizar automáticamente el proceso
    await checkAutoFinalization(db, processId, votingProcess);

    return NextResponse.json({
      success: true,
      message: 'Voto registrado exitosamente',
      data: {
        voteId: result.insertedId.toString(),
        vote: vote,
        timestamp: voteRecord.timestamp,
        processId: processId
      }
    });

  } catch (error) {
    console.error('Error casting vote:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateVotingStats(db: any, processId: string) {
  try {
    // Recalcular estadísticas de votos
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
      abstain: 0
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    voteStats.forEach((stat: any) => {
      stats.total += stat.count;
      if (stat._id === 'for') stats.for = stat.count;
      else if (stat._id === 'against') stats.against = stat.count;
      else if (stat._id === 'abstain') stats.abstain = stat.count;
    });

    // Actualizar el proceso con las nuevas estadísticas
    await db.collection('voting_processes').updateOne(
      { _id: new ObjectId(processId) },
      { 
        $set: { 
          voteStats: stats,
          lastVoteAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

  } catch (error) {
    console.error('Error updating voting stats:', error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkAutoFinalization(db: any, processId: string, votingProcess: any) {
  try {
    // Verificar si todos los votantes elegibles han votado
    const totalVotes = await db.collection('votes').countDocuments({
      votingProcessId: processId
    });

    const eligibleVoters = votingProcess.eligibleVoters?.total || 0;

    // Si todos votaron, finalizar automáticamente
    if (totalVotes >= eligibleVoters && eligibleVoters > 0) {
      await db.collection('voting_processes').updateOne(
        { _id: new ObjectId(processId) },
        { 
          $set: { 
            status: 'completed',
            completedAt: new Date(),
            completionReason: 'all_voters_participated',
            updatedAt: new Date()
          }
        }
      );

      // Registrar finalización automática
      await db.collection('leadership_activity_log').insertOne({
        type: 'voting_process_auto_completed',
        votingProcessId: processId,
        timestamp: new Date(),
        metadata: {
          reason: 'all_voters_participated',
          totalVotes: totalVotes,
          eligibleVoters: eligibleVoters,
          votingTitle: votingProcess.title
        }
      });
    }

  } catch (error) {
    console.error('Error checking auto finalization:', error);
  }
}
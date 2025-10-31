import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth-utils';
import { ObjectId } from 'mongodb';
import { requireCSRFToken } from '@/lib/csrf-protection';

export async function GET(request: NextRequest) {
  try {
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
        { error: 'Acceso denegado. Solo Leaders y Masters pueden acceder al sistema de votación' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    const { db } = await connectToDatabase();

    // Construir filtros
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filters: any = {};
    
    if (status !== 'all') {
      filters.status = status;
    }

    // Obtener procesos de votación con paginación
    const processes = await db.collection('voting_processes')
      .find(filters)
      .sort({ createdAt: -1, startDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Obtener votos del usuario actual
    const userVotes = await db.collection('votes').find({
      voterId: user.id
    }).toArray();

    // Formatear procesos de votación
    const formattedProcesses = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      processes.map(async (process: any) => {
        // Contar votos por proceso
        const voteStats = await db.collection('votes').aggregate([
          { $match: { votingProcessId: process._id.toString() } },
          {
            $group: {
              _id: '$vote',
              count: { $sum: 1 }
            }
          }
        ]).toArray();

        const votes = {
          total: 0,
          for: 0,
          against: 0,
          abstain: 0,
          participation: 0
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        voteStats.forEach((stat: any) => {
          votes.total += stat.count;
          if (stat._id === 'for') votes.for = stat.count;
          else if (stat._id === 'against') votes.against = stat.count;
          else if (stat._id === 'abstain') votes.abstain = stat.count;
        });

        // Calcular participación
        if (process.eligibleVoters?.total > 0) {
          votes.participation = (votes.total / process.eligibleVoters.total) * 100;
        }

        return {
          id: process._id.toString(),
          title: process.title,
          description: process.description,
          type: process.type,
          status: process.status,
          startDate: process.startDate,
          endDate: process.endDate,
          candidateId: process.candidateId,
          candidateName: process.candidateName,
          candidateEmail: process.candidateEmail,
          votes,
          eligibleVoters: process.eligibleVoters || { total: 0, leaders: 0, masters: 0 },
          settings: process.settings || {
            requiresQuorum: true,
            quorumPercentage: 50,
            allowAbstention: true,
            isSecret: false,
            resultsVisible: true
          },
          createdBy: process.createdBy,
          createdAt: process.createdAt
        };
      })
    );

    // Formatear votos del usuario
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedUserVotes = userVotes.map((vote: any) => ({
      id: vote._id.toString(),
      votingProcessId: vote.votingProcessId,
      voterId: vote.voterId,
      voterEmail: vote.voterEmail,
      voterMembershipType: vote.voterMembershipType,
      vote: vote.vote,
      timestamp: vote.timestamp,
      comment: vote.comment
    }));

    return NextResponse.json({
      success: true,
      data: {
        processes: formattedProcesses,
        userVotes: formattedUserVotes,
        pagination: {
          total: await db.collection('voting_processes').countDocuments(filters),
          page,
          limit,
          totalPages: Math.ceil(await db.collection('voting_processes').countDocuments(filters) / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching voting data:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 0. CSRF Protection
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;
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
        { error: 'Acceso denegado. Solo Leaders y Masters pueden crear votaciones' },
        { status: 403 }
      );
    }

    const {
      title,
      description,
      type,
      startDate,
      endDate,
      candidateId,
      settings
    } = await request.json();

    // Validaciones básicas
    if (!title || !description || !type || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Título, descripción, tipo, fecha de inicio y fin son requeridos' },
        { status: 400 }
      );
    }

    const validTypes = ['leader_application', 'general_proposal', 'disciplinary', 'policy_change'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de votación inválido' },
        { status: 400 }
      );
    }

    // Validar fechas
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start >= end) {
      return NextResponse.json(
        { error: 'La fecha de inicio debe ser anterior a la fecha de fin' },
        { status: 400 }
      );
    }

    if (end <= now) {
      return NextResponse.json(
        { error: 'La fecha de fin debe ser futura' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Si es una votación para candidato Leader, obtener información del candidato
    let candidateInfo = null;
    if (type === 'leader_application' && candidateId) {
      const candidate = await db.collection('users').findOne({
        _id: new ObjectId(candidateId)
      });

      if (!candidate) {
        return NextResponse.json(
          { error: 'Candidato no encontrado' },
          { status: 404 }
        );
      }

      candidateInfo = {
        candidateId: candidateId,
        candidateName: candidate.name || candidate.email,
        candidateEmail: candidate.email
      };
    }

    // Calcular votantes elegibles
    const eligibleVoters = await calculateEligibleVoters(db);

    // Configuración por defecto
    const defaultSettings = {
      requiresQuorum: true,
      quorumPercentage: 50,
      allowAbstention: true,
      isSecret: false,
      resultsVisible: true,
      ...settings
    };

    // Crear proceso de votación
    const votingProcess = {
      title: title.trim(),
      description: description.trim(),
      type,
      status: start <= now ? 'active' : 'draft',
      startDate: start,
      endDate: end,
      ...candidateInfo,
      eligibleVoters,
      settings: defaultSettings,
      createdBy: user.id,
      createdByEmail: user.email,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('voting_processes').insertOne(votingProcess);

    // Registrar en el log de actividades
    await db.collection('leadership_activity_log').insertOne({
      type: 'voting_process_created',
      votingProcessId: result.insertedId.toString(),
      userId: user.id,
      userEmail: user.email,
      timestamp: new Date(),
      metadata: {
        votingTitle: title,
        votingType: type,
        startDate: start,
        endDate: end,
        eligibleVoters: eligibleVoters.total
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Proceso de votación creado exitosamente',
      data: {
        votingProcessId: result.insertedId.toString(),
        title,
        status: votingProcess.status,
        createdAt: votingProcess.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating voting process:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function calculateEligibleVoters(db: any) {
  try {
    // Contar Leaders activos
    const leaders = await db.collection('users').countDocuments({
      membershipType: 'leader',
      isActive: true
    });

    // Contar Masters activos
    const masters = await db.collection('users').countDocuments({
      membershipType: 'master',
      isActive: true
    });

    return {
      total: leaders + masters,
      leaders,
      masters
    };

  } catch (error) {
    console.error('Error calculating eligible voters:', error);
    return {
      total: 0,
      leaders: 0,
      masters: 0
    };
  }
}
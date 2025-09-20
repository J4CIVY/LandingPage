import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth-utils';

interface LeaderStats {
  totalMembers: number;
  activeApplications: number;
  upcomingVotings: number;
  pendingDecisions: number;
  monthlyEvents: number;
  teamMembersManaged: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  membershipType: string;
  status: 'active' | 'inactive';
  assignedTasks: number;
  lastActivity: string;
}

interface PendingDecision {
  id: string;
  type: 'application' | 'vote' | 'proposal' | 'disciplinary';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline: string;
  votes?: {
    for: number;
    against: number;
    abstain: number;
    total: number;
  };
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  targetAudience: string[];
  scheduledFor?: string;
  status: 'draft' | 'scheduled' | 'sent';
}

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
        { error: 'Acceso denegado. Solo Leaders y Masters pueden acceder al dashboard' },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();

    // Calcular estadísticas
    const stats = await calculateLeaderStats(db, user);
    
    // Obtener miembros del equipo
    const teamMembers = await getTeamMembers(db, user);
    
    // Obtener decisiones pendientes
    const pendingDecisions = await getPendingDecisions(db, user);
    
    // Obtener anuncios
    const announcements = await getAnnouncements(db, user);

    return NextResponse.json({
      success: true,
      data: {
        stats,
        teamMembers,
        pendingDecisions,
        announcements
      }
    });

  } catch (error) {
    console.error('Error fetching leader dashboard data:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function calculateLeaderStats(db: any, user: any): Promise<LeaderStats> {
  try {
    // Total de miembros activos
    const totalMembers = await db.collection('users').countDocuments({
      isActive: true,
      membershipType: { $in: ['student', 'graduate', 'professional', 'volunteer', 'leader', 'master'] }
    });

    // Postulaciones activas para Leader
    const activeApplications = await db.collection('leader_applications').countDocuments({
      status: 'pending'
    });

    // Votaciones próximas
    const upcomingVotings = await db.collection('leadership_votes').countDocuments({
      status: 'active',
      endDate: { $gte: new Date() }
    });

    // Decisiones pendientes
    const pendingDecisions = await db.collection('leadership_decisions').countDocuments({
      status: 'pending',
      assignedTo: user.id
    });

    // Eventos este mes
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const monthlyEvents = await db.collection('events').countDocuments({
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth
      },
      status: { $ne: 'cancelled' }
    });

    // Miembros del equipo gestionados (si el Leader tiene asignaciones específicas)
    const teamMembersManaged = await db.collection('users').countDocuments({
      isActive: true,
      assignedLeader: user.id
    });

    return {
      totalMembers,
      activeApplications,
      upcomingVotings,
      pendingDecisions,
      monthlyEvents,
      teamMembersManaged
    };

  } catch (error) {
    console.error('Error calculating leader stats:', error);
    return {
      totalMembers: 0,
      activeApplications: 0,
      upcomingVotings: 0,
      pendingDecisions: 0,
      monthlyEvents: 0,
      teamMembersManaged: 0
    };
  }
}

async function getTeamMembers(db: any, user: any): Promise<TeamMember[]> {
  try {
    const members = await db.collection('users').find({
      isActive: true,
      assignedLeader: user.id
    }).limit(20).toArray();

    return members.map((member: any) => ({
      id: member._id.toString(),
      name: member.name || 'Sin nombre',
      role: member.role || 'Miembro',
      membershipType: member.membershipType || 'student',
      status: member.isActive ? 'active' : 'inactive',
      assignedTasks: member.assignedTasks || 0,
      lastActivity: member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Nunca'
    }));

  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
}

async function getPendingDecisions(db: any, user: any): Promise<PendingDecision[]> {
  try {
    const decisions = await db.collection('leadership_decisions').find({
      status: 'pending',
      $or: [
        { assignedTo: user.id },
        { requiredApprovers: user.id }
      ]
    }).sort({ priority: -1, deadline: 1 }).limit(10).toArray();

    return decisions.map((decision: any) => ({
      id: decision._id.toString(),
      type: decision.type || 'proposal',
      title: decision.title || 'Decisión sin título',
      description: decision.description || '',
      priority: decision.priority || 'medium',
      deadline: decision.deadline ? new Date(decision.deadline).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      votes: decision.votes ? {
        for: decision.votes.for || 0,
        against: decision.votes.against || 0,
        abstain: decision.votes.abstain || 0,
        total: decision.votes.total || 0
      } : undefined
    }));

  } catch (error) {
    console.error('Error fetching pending decisions:', error);
    return [];
  }
}

async function getAnnouncements(db: any, user: any): Promise<Announcement[]> {
  try {
    const announcements = await db.collection('leadership_announcements').find({
      $or: [
        { createdBy: user.id },
        { targetAudience: { $in: ['all', 'leaders', user.membershipType] } }
      ]
    }).sort({ createdAt: -1 }).limit(10).toArray();

    return announcements.map((announcement: any) => ({
      id: announcement._id.toString(),
      title: announcement.title || 'Anuncio sin título',
      content: announcement.content || '',
      type: announcement.type || 'info',
      targetAudience: announcement.targetAudience || ['all'],
      scheduledFor: announcement.scheduledFor ? new Date(announcement.scheduledFor).toISOString() : undefined,
      status: announcement.status || 'draft'
    }));

  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
}
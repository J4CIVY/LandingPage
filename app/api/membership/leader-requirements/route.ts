import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyJWT } from '@/lib/auth-utils';
import { 
  calculateLeadershipEligibility,
  validateLeaderRequirements,
  validateLeadershipHistory,
  validateDisciplinaryRecord,
  validateLeaderHighImpactVolunteering
} from '@/data/membershipConfig';

// GET - Obtener requisitos específicos para Leader
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                 request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    const payload = verifyJWT(token);
    if (!payload?.userId) {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 401 }
      );
    }

    // Conectar a la base de datos
    const { db } = await connectToDatabase();
    
    // Buscar el usuario
    const user = await db.collection('users').findOne({ 
      _id: payload.userId 
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Calcular elegibilidad completa para Leader
    const eligibilityData = await calculateLeadershipEligibility(user);
    
    // Obtener requisitos detallados
    const basicRequirements = await validateLeaderRequirements(user);
    const leadershipHistory = await validateLeadershipHistory(user);
    const disciplinaryRecord = await validateDisciplinaryRecord(user);
    const highImpactVolunteering = await validateLeaderHighImpactVolunteering(user);
    
    // Construir lista de requisitos con formato esperado por el componente
    const requirements = [
      {
        id: 'must_be_master',
        label: 'Membresía Master activa (requisito obligatorio)',
        fulfilled: basicRequirements.isMaster,
        progress: basicRequirements.isMaster ? 100 : 0,
        detail: basicRequirements.isMaster 
          ? 'Tienes membresía Master activa, cumpliendo el requisito básico para Leader'
          : 'Debes tener membresía Master activa para postular a Leader'
      },
      {
        id: 'must_be_active_volunteer',
        label: 'Membresía Volunteer activa (requisito obligatorio)',
        fulfilled: basicRequirements.isActiveVolunteer,
        progress: basicRequirements.isActiveVolunteer ? 100 : 0,
        detail: basicRequirements.isActiveVolunteer 
          ? 'Tienes membresía Volunteer activa, demostrando compromiso operativo'
          : 'Debes estar activo como Volunteer para demostrar experiencia operativa'
      },
      {
        id: 'minimum_points',
        label: '40,000 puntos acumulados mínimos',
        fulfilled: basicRequirements.hasMinimumPoints,
        progress: Math.min(100, ((user.points || 0) / 40000) * 100),
        detail: `Tienes ${(user.points || 0).toLocaleString()} puntos de 40,000 requeridos`
      },
      {
        id: 'years_as_master',
        label: '5 años mínimos como Master',
        fulfilled: basicRequirements.hasRequiredMasterTime,
        progress: Math.min(100, (basicRequirements.yearsAsMaster / 5) * 100),
        detail: `Tienes ${basicRequirements.yearsAsMaster} años como Master de 5 años requeridos`
      },
      {
        id: 'event_attendance_rate',
        label: '80% asistencia a eventos oficiales',
        fulfilled: leadershipHistory.meetsAttendanceRequirement,
        progress: Math.min(100, leadershipHistory.attendanceRate),
        detail: `Has asistido al ${leadershipHistory.attendanceRate}% de eventos oficiales (${leadershipHistory.totalEventsAttended} eventos)`
      },
      {
        id: 'leadership_events',
        label: '≥10% eventos donde demostró liderazgo/coorganización',
        fulfilled: leadershipHistory.meetsLeadershipRequirement,
        progress: Math.min(100, leadershipHistory.leadershipEventsRate * 10),
        detail: `Has liderado/coorganizado ${leadershipHistory.leadershipEventsRate}% de eventos (${leadershipHistory.totalLeadershipEvents} eventos con liderazgo)`
      },
      {
        id: 'leadership_success_rate',
        label: '100% éxito en eventos liderados (resultado positivo y feedback)',
        fulfilled: leadershipHistory.hasSuccessfulLeadership,
        progress: leadershipHistory.leadershipSuccessRate,
        detail: `${leadershipHistory.leadershipSuccessRate}% de éxito en eventos liderados (${leadershipHistory.successfulLeadershipEventsCount}/${leadershipHistory.totalLeadershipEvents})`
      },
      {
        id: 'high_impact_volunteering',
        label: '30 participaciones en roles de alto impacto',
        fulfilled: highImpactVolunteering.meetsHighImpactRequirement,
        progress: Math.min(100, (highImpactVolunteering.totalHighImpactActivities / 30) * 100),
        detail: `Has participado en ${highImpactVolunteering.totalHighImpactActivities} actividades de alto impacto de 30 requeridas`
      },
      {
        id: 'clean_disciplinary_record',
        label: 'Historial disciplinario limpio (sin sanciones relevantes)',
        fulfilled: disciplinaryRecord.cleanRecord,
        progress: disciplinaryRecord.cleanRecord ? 100 : 0,
        detail: disciplinaryRecord.cleanRecord 
          ? 'Tienes historial disciplinario limpio sin sanciones relevantes'
          : `Historial con sanciones: ${disciplinaryRecord.suspensionsCount} suspensiones, ${disciplinaryRecord.graveWarningsCount} amonestaciones graves, ${disciplinaryRecord.ruleViolationsCount} violaciones`
      },
      {
        id: 'formal_application_process',
        label: 'Proceso de postulación formal (Plan de Liderazgo + Avales)',
        fulfilled: false, // TODO: Implementar lógica real de postulación
        progress: 0,
        detail: 'Requiere: Plan de Liderazgo, formulario de postulación, avales de 3 Leaders + 5 Masters activos'
      },
      {
        id: 'evaluation_process',
        label: 'Proceso de evaluación y ratificación',
        fulfilled: false, // TODO: Implementar lógica real de evaluación
        progress: 0,
        detail: 'Requiere: revisión por Comisión Evaluadora, entrevista pública, votación consultiva (50%+1), ratificación presidencial'
      },
      {
        id: 'vacancy_available',
        label: 'Vacante disponible en roles administrativos',
        fulfilled: true, // TODO: Implementar lógica real de vacantes
        progress: 100,
        detail: 'Existe vacante disponible en roles administrativos del club'
      }
    ];

    // Respuesta estructurada
    const response = {
      requirements,
      eligibility: {
        isEligible: eligibilityData.isEligible,
        completionPercentage: eligibilityData.completionPercentage
      },
      detailedEligibility: eligibilityData
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error getting leader requirements:', error);
    
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
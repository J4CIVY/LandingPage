import { NextRequest, NextResponse } from 'next/server';
import { MembershipRequirement } from '@/types/membership';
import { MEMBERSHIP_RULES, MEMBERSHIP_CONFIG } from '@/data/membershipConfig';

// GET - Obtener lista canónica de requisitos para todas las membresías
export async function GET(request: NextRequest) {
  try {
    const requirements: MembershipRequirement[] = [];

    // Generar requisitos para cada tipo de membresía
    Object.entries(MEMBERSHIP_RULES).forEach(([membershipType, rules]) => {
      const config = MEMBERSHIP_CONFIG[membershipType as keyof typeof MEMBERSHIP_CONFIG];
      
      if (membershipType === 'Volunteer') {
        // Volunteer es un rol especial
        requirements.push({
          id: `${membershipType.toLowerCase()}-basic`,
          label: 'Compromiso de voluntariado',
          description: 'Compromiso activo con actividades de voluntariado en la comunidad',
          membershipType: membershipType as any,
          category: 'volunteering'
        });
        return;
      }

      if ('pointsRequired' in rules && rules.pointsRequired > 0) {
        requirements.push({
          id: `${membershipType.toLowerCase()}-points`,
          label: `${rules.pointsRequired.toLocaleString()} puntos`,
          description: `Acumular ${rules.pointsRequired.toLocaleString()} puntos a través de participación en eventos y actividades`,
          pointsRequired: rules.pointsRequired,
          membershipType: membershipType as any,
          category: 'points'
        });
      }

      if ('eventsRequired' in rules && rules.eventsRequired > 0) {
        requirements.push({
          id: `${membershipType.toLowerCase()}-events`,
          label: `${rules.eventsRequired} eventos`,
          description: `Asistir a ${rules.eventsRequired} eventos oficiales de BSK Motorcycle Team`,
          eventsRequired: rules.eventsRequired,
          membershipType: membershipType as any,
          category: 'events'
        });
      }

      if ('volunteeringRequired' in rules && rules.volunteeringRequired > 0) {
        requirements.push({
          id: `${membershipType.toLowerCase()}-volunteering`,
          label: `${rules.volunteeringRequired} voluntariados`,
          description: `Completar ${rules.volunteeringRequired} actividades de voluntariado`,
          volunteeringRequired: rules.volunteeringRequired,
          membershipType: membershipType as any,
          category: 'volunteering'
        });
      }

      if ('timeRequired' in rules && rules.timeRequired > 0) {
        const timeInMonths = Math.round(rules.timeRequired / 30);
        requirements.push({
          id: `${membershipType.toLowerCase()}-time`,
          label: `${timeInMonths} ${timeInMonths === 1 ? 'mes' : 'meses'} de experiencia`,
          description: `Mantener membresía activa por al menos ${rules.timeRequired} días`,
          membershipType: membershipType as any,
          category: 'time'
        });
      }

      // Requisitos especiales para Leader
      if (membershipType === 'Leader') {
        requirements.push({
          id: 'leader-master-status',
          label: 'Estado Master requerido',
          description: 'Debe tener membresía Master activa',
          membershipType: 'Leader',
          category: 'other'
        });

        requirements.push({
          id: 'leader-volunteer-status',
          label: 'Estado Volunteer requerido',
          description: 'Debe ser voluntario activo de la comunidad',
          membershipType: 'Leader',
          category: 'volunteering'
        });

        requirements.push({
          id: 'leader-application',
          label: 'Aplicación y aprobación',
          description: 'Solicitud formal con justificación y aprobación del comité',
          membershipType: 'Leader',
          category: 'other'
        });
      }
    });

    // Información adicional sobre el sistema de puntos
    const pointsSystem = {
      eventAttendance: 100,
      eventOrganization: 500,
      volunteering: 200,
      pqrsdResolution: 50,
      monthlyBonus: 50,
      referralBonus: 300,
      socialEngagement: 25
    };

    return NextResponse.json({
      success: true,
      data: {
        requirements,
        pointsSystem,
        membershipTypes: Object.keys(MEMBERSHIP_CONFIG),
        description: 'Sistema de requisitos para avance en membresías BSK Motorcycle Team'
      }
    });

  } catch (error) {
    console.error('Error fetching membership requirements:', error);

    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
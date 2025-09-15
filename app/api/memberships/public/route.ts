import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Membership from '@/lib/models/Membership';

// GET - Obtener membresías públicas para mostrar en la web
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Solo membresías activas y públicas
    const memberships = await Membership.find({
      status: 'active',
      'display.showInPublic': true
    })
    .select({
      name: 1,
      slug: 1,
      description: 1,
      shortDescription: 1,
      'pricing.initial': 1,
      'pricing.withDiscount': 1,
      'pricing.early_bird': 1,
      'pricing.student': 1,
      'level.tier': 1,
      'level.name': 1,
      benefits: 1,
      'information.targetAudience': 1,
      'information.requirements': 1,
      'enrollmentProcess.minimumAge': 1,
      'enrollmentProcess.requiresVehicle': 1,
      'capacity.maxMembers': 1,
      'capacity.currentMembers': 1,
      'capacity.waitingList': 1,
      'display.color': 1,
      'display.icon': 1,
      'display.featured': 1,
      'display.order': 1,
      renewalType: 1,
      isLifetime: 1,
      requiresRenewal: 1,
      testimonials: 1
    })
    .sort({ 
      'display.featured': -1, 
      'display.order': 1, 
      'level.tier': 1 
    })
    .lean();

    // Formatear datos para consumo público
    const formattedMemberships = memberships.map(membership => ({
      id: membership._id,
      name: membership.name,
      slug: membership.slug,
      description: membership.description,
      shortDescription: membership.shortDescription,
      pricing: {
        initial: membership.pricing.initial,
        withDiscount: membership.pricing.withDiscount,
        early_bird: membership.pricing.early_bird,
        student: membership.pricing.student,
      },
      level: membership.level,
      benefits: membership.benefits.filter((b: any) => b.isActive),
      information: {
        targetAudience: membership.information?.targetAudience,
        requirements: membership.information?.requirements || [],
      },
      enrollment: {
        minimumAge: membership.enrollmentProcess?.minimumAge,
        requiresVehicle: membership.enrollmentProcess?.requiresVehicle || false,
      },
      capacity: {
        maxMembers: membership.capacity?.maxMembers,
        currentMembers: membership.capacity?.currentMembers || 0,
        waitingList: membership.capacity?.waitingList || false,
        isAvailable: !membership.capacity?.maxMembers || 
                    (membership.capacity.currentMembers || 0) < membership.capacity.maxMembers
      },
      display: {
        color: membership.display.color,
        icon: membership.display.icon,
        featured: membership.display.featured,
      },
      renewal: {
        type: membership.renewalType,
        isLifetime: membership.isLifetime,
        requiresRenewal: membership.requiresRenewal,
      },
      testimonials: membership.testimonials || []
    }));

    return NextResponse.json({
      success: true,
      data: formattedMemberships,
      message: `${formattedMemberships.length} planes de membresía disponibles`
    });

  } catch (error) {
    console.error('Error fetching public memberships:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al obtener los planes de membresía',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}
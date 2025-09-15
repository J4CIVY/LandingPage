import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Membership, { IMembership } from '@/lib/models/Membership';
import { membershipSchema, membershipFiltersSchema } from '@/lib/validation-schemas';
import { verifyAuth } from '@/lib/auth-utils';

// GET - Obtener todas las membresías tipo producto/plan (con filtros para admins)
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const filters = membershipFiltersSchema.parse({
      status: searchParams.get('status') || 'all',
      requiresRenewal: searchParams.get('requiresRenewal') || 'all',
      renewalType: searchParams.get('renewalType') || 'all',
      featured: searchParams.get('featured') || 'all',
      search: searchParams.get('search') || undefined
    });

    // Verificar autenticación para filtros avanzados
    const authResult = await verifyAuth(request);
    const isAdmin = authResult.success && authResult.user?.role === 'admin';

    // Construir query de MongoDB
    let query: any = {};

    // Si no es admin, solo mostrar membresías públicas y activas
    if (!isAdmin) {
      query = {
        status: 'active',
        'display.showInPublic': true
      };
    } else {
      // Filtros para administradores
      if (filters.status !== 'all') {
        query.status = filters.status;
      }
      
      if (filters.requiresRenewal !== 'all') {
        query.requiresRenewal = filters.requiresRenewal === 'true';
      }
      
      if (filters.renewalType !== 'all') {
        query.renewalType = filters.renewalType;
      }
      
      if (filters.featured !== 'all') {
        query['display.featured'] = filters.featured === 'true';
      }
    }

    // Búsqueda por texto
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { 'level.name': { $regex: filters.search, $options: 'i' } }
      ];
    }

    const memberships = await Membership.find(query)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .sort({ 'display.featured': -1, 'display.order': 1, 'level.tier': 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: memberships,
      message: `${memberships.length} membresías encontradas`
    });

  } catch (error) {
    console.error('Error fetching memberships:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al obtener las membresías',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

// POST - Crear nueva membresía/plan (solo admins)
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación y permisos de admin
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({
        success: false,
        message: 'No autorizado'
      }, { status: 401 });
    }

    if (authResult.user?.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Se requieren permisos de administrador'
      }, { status: 403 });
    }

    await connectToDatabase();

    const body = await request.json();
    
    // Validar datos de entrada
    const validatedData = membershipSchema.parse(body);

    // Verificar que el slug sea único
    const existingMembership = await Membership.findOne({ slug: validatedData.slug });
    if (existingMembership) {
      return NextResponse.json({
        success: false,
        message: 'El slug ya existe. Por favor, elige uno diferente.'
      }, { status: 400 });
    }

    // Crear la membresía
    const membership = new Membership({
      ...validatedData,
      createdBy: authResult.user.id,
      lastModifiedBy: authResult.user.id
    });

    await membership.save();

    // Poblar datos para la respuesta
    await membership.populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      data: membership,
      message: 'Plan de membresía creado exitosamente'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating membership:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: error.errors
      }, { status: 400 });
    }

    if (error.code === 11000) {
      return NextResponse.json({
        success: false,
        message: 'El slug ya existe. Por favor, elige uno diferente.'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Error al crear el plan de membresía',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
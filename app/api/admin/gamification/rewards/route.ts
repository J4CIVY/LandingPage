import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AdminRequest } from '@/lib/auth-admin';
import { requireCSRFToken } from '@/lib/csrf-protection';
import connectDB from '@/lib/mongodb';
import { Recompensa } from '@/lib/models/Gamification';


// POST /api/admin/gamification/rewards - Crear una nueva recompensa
export async function POST(req: NextRequest) {
  const adminRequest = req as AdminRequest;
  
  // SECURITY: CSRF Protection
  const csrfError = requireCSRFToken(adminRequest);
  if (csrfError) return csrfError;
  
  // Verificar permisos de administrador
  const authCheck = await requireAdmin(adminRequest);
  if (authCheck) return authCheck;

  try {
    await connectDB();

    const body = await req.json();
    const { 
      nombre, 
      descripcion, 
      costoPuntos, 
      categoria,
      stock,
      imagen,
      condiciones,
      validoHasta 
    } = body;

    // Validar campos requeridos
    if (!nombre || !descripcion || !costoPuntos || !categoria) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Faltan campos requeridos: nombre, descripcion, costoPuntos, categoria' 
        },
        { status: 400 }
      );
    }

    // Validar categoría
    const categoriasValidas = ['merchandising', 'descuentos', 'eventos', 'digital', 'experiencias'];
    if (!categoriasValidas.includes(categoria)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Categoría inválida. Debe ser: ${categoriasValidas.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Crear la recompensa
    const nuevaRecompensa = new Recompensa({
      nombre,
      descripcion,
      costoPuntos,
      categoria,
      stock: stock || null,
      stockInicial: stock || null,
      imagen: imagen || null,
      condiciones: condiciones || null,
      validoHasta: validoHasta ? new Date(validoHasta) : null,
      disponible: true
    });

    await nuevaRecompensa.save();

    return NextResponse.json({
      success: true,
      message: `Recompensa "${nombre}" creada exitosamente`,
      data: {
        id: nuevaRecompensa._id,
        nombre: nuevaRecompensa.nombre,
        descripcion: nuevaRecompensa.descripcion,
        costoPuntos: nuevaRecompensa.costoPuntos,
        categoria: nuevaRecompensa.categoria,
        stock: nuevaRecompensa.stock,
        disponible: nuevaRecompensa.disponible
      }
    });

  } catch (error) {
    console.error('Error creando recompensa:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/gamification/rewards/:id - Actualizar recompensa
export async function PUT(req: NextRequest) {
  const adminRequest = req as AdminRequest;
  
  // SECURITY: CSRF Protection
  const csrfError = requireCSRFToken(adminRequest);
  if (csrfError) return csrfError;
  
  // Verificar permisos de administrador
  const authCheck = await requireAdmin(adminRequest);
  if (authCheck) return authCheck;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const recompensaId = searchParams.get('id');

    if (!recompensaId) {
      return NextResponse.json(
        { success: false, error: 'ID de recompensa requerido' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const updateData = {
      ...body,
      fechaActualizacion: new Date()
    };

    const recompensaActualizada = await Recompensa.findByIdAndUpdate(
      recompensaId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!recompensaActualizada) {
      return NextResponse.json(
        { success: false, error: 'Recompensa no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Recompensa "${recompensaActualizada.nombre}" actualizada`,
      data: recompensaActualizada
    });

  } catch (error) {
    console.error('Error actualizando recompensa:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

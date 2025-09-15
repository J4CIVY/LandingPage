import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth-utils';
import { GamificationService } from '@/lib/services/GamificationService';
import { Recompensa } from '@/lib/models/Gamification';

// POST /api/admin/seed-gamification - Poblar datos de ejemplo para gamificación (solo admin)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Autenticar usuario
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar permisos de admin
    if (authResult.user.role !== 'admin' && authResult.user.role !== 'super-admin') {
      return NextResponse.json(
        { error: 'Permisos insuficientes - solo administradores' },
        { status: 403 }
      );
    }

    // Crear recompensas de ejemplo
    const recompensasEjemplo = [
      {
        nombre: 'Sticker BSK MT',
        descripcion: 'Pack de stickers oficiales del BSK Motorcycle Team',
        costoPuntos: 50,
        categoria: 'merchandising',
        disponible: true,
        stock: 100,
        stockInicial: 100,
        validoDesde: new Date(),
        condiciones: 'Solo para miembros activos',
        metadata: {
          proveedor: 'BSK MT',
          valorReal: 10000
        }
      },
      {
        nombre: 'Camiseta BSK MT',
        descripcion: 'Camiseta oficial con logo del motoclub en diferentes tallas',
        costoPuntos: 200,
        categoria: 'merchandising',
        disponible: true,
        stock: 50,
        stockInicial: 50,
        validoDesde: new Date(),
        condiciones: 'Especificar talla al momento del canje',
        metadata: {
          proveedor: 'BSK MT',
          valorReal: 35000
        }
      },
      {
        nombre: 'Descuento 10% Mantenimiento',
        descripcion: '10% de descuento en servicios de mantenimiento de motocicletas',
        costoPuntos: 150,
        categoria: 'descuentos',
        disponible: true,
        validoDesde: new Date(),
        validoHasta: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días
        condiciones: 'Válido en talleres afiliados. No acumulable con otras promociones.',
        metadata: {
          proveedor: 'Talleres Afiliados',
          valorReal: 50000,
          restricciones: ['Una vez por usuario', 'Talleres afiliados únicamente']
        }
      },
      {
        nombre: 'Acceso VIP Evento Anual',
        descripcion: 'Acceso preferencial al evento anual del motoclub con zona VIP',
        costoPuntos: 500,
        categoria: 'eventos',
        disponible: true,
        stock: 20,
        stockInicial: 20,
        validoDesde: new Date(),
        validoHasta: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
        condiciones: 'Incluye acceso a zona VIP, comida y bebidas',
        metadata: {
          proveedor: 'BSK MT',
          valorReal: 150000
        }
      },
      {
        nombre: 'Wallpapers Exclusivos BSK',
        descripcion: 'Pack de wallpapers exclusivos para dispositivos móviles y PC',
        costoPuntos: 25,
        categoria: 'digital',
        disponible: true,
        validoDesde: new Date(),
        condiciones: 'Descarga digital inmediata',
        metadata: {
          proveedor: 'BSK MT Digital',
          valorReal: 5000
        }
      },
      {
        nombre: 'Experiencia de Conducción',
        descripcion: 'Día de conducción en pista con instructor profesional',
        costoPuntos: 1000,
        categoria: 'experiencias',
        disponible: true,
        stock: 5,
        stockInicial: 5,
        validoDesde: new Date(),
        validoHasta: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 meses
        condiciones: 'Requiere licencia vigente y equipo de protección completo',
        metadata: {
          proveedor: 'Pista de Entrenamiento',
          valorReal: 300000,
          restricciones: ['Licencia vigente requerida', 'Equipo de protección obligatorio']
        }
      }
    ];

    // Insertar recompensas (evitar duplicados)
    const recompensasCreadas = [];
    for (const recompensaData of recompensasEjemplo) {
      const existeRecompensa = await Recompensa.findOne({ nombre: recompensaData.nombre });
      
      if (!existeRecompensa) {
        const nuevaRecompensa = new Recompensa(recompensaData);
        const recompensaGuardada = await nuevaRecompensa.save();
        recompensasCreadas.push(recompensaGuardada);
      }
    }

    // Otorgar algunos puntos de ejemplo al usuario que ejecuta el seed
    const puntosIniciales = [
      { accion: 'bonificacion', metadata: { reason: 'Puntos de bienvenida al sistema', adminId: authResult.user.id, manualPoints: 100 } },
      { accion: 'bonificacion', metadata: { reason: 'Bonus por configurar el sistema', adminId: authResult.user.id, manualPoints: 50 } }
    ];

    const transacciones = [];
    for (const puntoData of puntosIniciales) {
      try {
        const transaccion = await GamificationService.otorgarPuntos(
          authResult.user.id,
          puntoData.accion,
          puntoData.metadata
        );
        transacciones.push(transaccion);
      } catch (error) {
        console.warn('Error otorgando puntos iniciales:', error);
      }
    }

    // Obtener estadísticas actualizadas
    const estadisticasAdmin = await GamificationService.obtenerEstadisticasUsuario(authResult.user.id);

    return NextResponse.json({
      success: true,
      message: 'Datos de gamificación creados exitosamente',
      data: {
        recompensasCreadas: recompensasCreadas.length,
        puntosOtorgados: transacciones.reduce((sum, t) => sum + t.cantidad, 0),
        estadisticasAdmin: {
          puntosTotal: estadisticasAdmin.estadisticas?.puntos?.total || 0,
          nivel: estadisticasAdmin.nivelInfo?.actual || 'Novato',
          ranking: estadisticasAdmin.ranking?.posicion || 0
        },
        recompensas: recompensasCreadas.map(r => ({
          id: r._id,
          nombre: r.nombre,
          puntos: r.costoPuntos,
          categoria: r.categoria
        }))
      }
    });

  } catch (error) {
    console.error('Error creando datos de gamificación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET /api/admin/seed-gamification - Verificar estado del sistema
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Autenticar usuario
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar permisos de admin
    if (authResult.user.role !== 'admin' && authResult.user.role !== 'super-admin') {
      return NextResponse.json(
        { error: 'Permisos insuficientes' },
        { status: 403 }
      );
    }

    // Obtener estadísticas del sistema
    const totalRecompensas = await Recompensa.countDocuments();
    const recompensasDisponibles = await Recompensa.countDocuments({ disponible: true });
    const leaderboard = await GamificationService.obtenerLeaderboard(5);

    return NextResponse.json({
      success: true,
      data: {
        sistema: {
          totalRecompensas,
          recompensasDisponibles,
          topUsuarios: leaderboard.length
        },
        estadoDelSistema: 'Sistema de gamificación activo',
        ultimaActualizacion: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error verificando sistema:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
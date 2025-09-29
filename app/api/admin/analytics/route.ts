import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse, 
  createErrorResponse,
  HTTP_STATUS 
} from '@/lib/api-utils';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Event from '@/lib/models/Event';
import Product from '@/lib/models/Product';
import MembershipApplication from '@/lib/models/MembershipApplication';
import Emergency from '@/lib/models/Emergency';

/**
 * GET /api/admin/analytics
 * Obtiene estadísticas completas de analytics para admin
 */
async function handleGet(request: NextRequest) {
  await connectDB();
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Parámetros de tiempo
  const period = searchParams.get('period') || '30';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
  // Calcular fechas (mantener si hay contexto útil)
    const now = new Date();
    const periodDays = parseInt(period);
    let fromDate: Date;
    let toDate: Date = now;
    
    if (startDate && endDate) {
      fromDate = new Date(startDate);
      toDate = new Date(endDate);
    } else {
      fromDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    }
    
  // Obtener datos de todas las colecciones (mantener si hay contexto útil)
    const [users, events, products, memberships, emergencies] = await Promise.all([
      User.find({}).sort({ createdAt: -1 }),
      Event.find({}).sort({ createdAt: -1 }),
      Product.find({}).sort({ createdAt: -1 }),
      MembershipApplication.find({}).sort({ createdAt: -1 }),
      Emergency.find({}).sort({ createdAt: -1 })
    ]);
    
  // Estadísticas generales (mantener si hay contexto útil)
    const totalStats = {
      users: {
        total: users.length,
        active: users.filter(u => u.isActive !== false).length,
        newInPeriod: users.filter(u => 
          new Date(u.createdAt) >= fromDate && new Date(u.createdAt) <= toDate
        ).length,
        byRole: {
          user: users.filter(u => u.role === 'user').length,
          admin: users.filter(u => u.role === 'admin').length,
          'super-admin': users.filter(u => u.role === 'super-admin').length
        },
        byMembershipType: users.reduce((acc: Record<string, number>, user) => {
          const type = user.membershipType || 'none';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {})
      },
      events: {
        total: events.length,
        upcoming: events.filter(e => new Date(e.startDate) > now).length,
        past: events.filter(e => new Date(e.startDate) <= now).length,
        newInPeriod: events.filter(e => 
          new Date(e.createdAt) >= fromDate && new Date(e.createdAt) <= toDate
        ).length,
        byType: events.reduce((acc: Record<string, number>, event) => {
          acc[event.eventType] = (acc[event.eventType] || 0) + 1;
          return acc;
        }, {}),
        byStatus: events.reduce((acc: Record<string, number>, event) => {
          acc[event.status] = (acc[event.status] || 0) + 1;
          return acc;
        }, {})
      },
      products: {
        total: products.length,
        inStock: products.filter(p => p.availability === 'in-stock').length,
        outOfStock: products.filter(p => p.availability === 'out-of-stock').length,
        newInPeriod: products.filter(p => 
          new Date(p.createdAt) >= fromDate && new Date(p.createdAt) <= toDate
        ).length,
        byCategory: products.reduce((acc: Record<string, number>, product) => {
          acc[product.category] = (acc[product.category] || 0) + 1;
          return acc;
        }, {}),
        averagePrice: products.length > 0 
          ? Math.round(products.reduce((sum, p) => sum + (p.finalPrice || 0), 0) / products.length)
          : 0,
        totalValue: products.reduce((sum, p) => sum + (p.finalPrice || 0), 0)
      },
      memberships: {
        total: memberships.length,
        pending: memberships.filter(m => m.status === 'pending').length,
        approved: memberships.filter(m => m.status === 'approved').length,
        rejected: memberships.filter(m => m.status === 'rejected').length,
        newInPeriod: memberships.filter(m => 
          new Date(m.createdAt) >= fromDate && new Date(m.createdAt) <= toDate
        ).length,
        byType: memberships.reduce((acc: Record<string, number>, membership) => {
          acc[membership.membershipType] = (acc[membership.membershipType] || 0) + 1;
          return acc;
        }, {}),
        approvalRate: memberships.length > 0 
          ? Math.round((memberships.filter(m => m.status === 'approved').length / memberships.length) * 100)
          : 0
      },
      emergencies: {
        total: emergencies.length,
        pending: emergencies.filter(e => e.status === 'pending').length,
        inProgress: emergencies.filter(e => e.status === 'in-progress').length,
        resolved: emergencies.filter(e => e.status === 'resolved').length,
        cancelled: emergencies.filter(e => e.status === 'cancelled').length,
        newInPeriod: emergencies.filter(e => 
          new Date(e.createdAt) >= fromDate && new Date(e.createdAt) <= toDate
        ).length,
        byPriority: {
          low: emergencies.filter(e => e.priority === 'low').length,
          medium: emergencies.filter(e => e.priority === 'medium').length,
          high: emergencies.filter(e => e.priority === 'high').length,
          critical: emergencies.filter(e => e.priority === 'critical').length
        },
        byType: emergencies.reduce((acc: Record<string, number>, emergency) => {
          acc[emergency.emergencyType] = (acc[emergency.emergencyType] || 0) + 1;
          return acc;
        }, {}),
        averageResponseTime: calculateAverageResponseTime(emergencies),
        resolutionRate: emergencies.length > 0 
          ? Math.round((emergencies.filter(e => e.status === 'resolved').length / emergencies.length) * 100)
          : 0
      }
    };
    
  // Tendencias temporales (mantener si hay contexto útil)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      return date;
    }).reverse();
    
    const trends = {
      users: last7Days.map(date => ({
        date: date.toISOString().split('T')[0],
        count: users.filter(u => {
          const userDate = new Date(u.createdAt);
          return userDate.toDateString() === date.toDateString();
        }).length
      })),
      events: last7Days.map(date => ({
        date: date.toISOString().split('T')[0],
        count: events.filter(e => {
          const eventDate = new Date(e.createdAt);
          return eventDate.toDateString() === date.toDateString();
        }).length
      })),
      memberships: last7Days.map(date => ({
        date: date.toISOString().split('T')[0],
        count: memberships.filter(m => {
          const membershipDate = new Date(m.createdAt);
          return membershipDate.toDateString() === date.toDateString();
        }).length
      })),
      emergencies: last7Days.map(date => ({
        date: date.toISOString().split('T')[0],
        count: emergencies.filter(e => {
          const emergencyDate = new Date(e.createdAt);
          return emergencyDate.toDateString() === date.toDateString();
        }).length
      }))
    };
    
  // Métricas de rendimiento (mantener si hay contexto útil)
    const performance = {
      systemHealth: calculateSystemHealth(totalStats),
      alerts: generateAlerts(totalStats),
      growthMetrics: calculateGrowthMetrics(users, events, memberships, fromDate, toDate),
      topMetrics: {
        mostActiveUsers: await getMostActiveUsers(),
        popularEvents: getPopularEvents(events),
        topProducts: getTopProducts(products),
        urgentEmergencies: emergencies.filter(e => 
          e.priority === 'critical' && e.status !== 'resolved' && e.status !== 'cancelled'
        ).length
      }
    };
    
    return createSuccessResponse({
      totalStats,
      trends,
      performance,
      period: {
        days: periodDays,
        from: fromDate.toISOString(),
        to: toDate.toISOString()
      }
    }, 'Analytics obtenidos exitosamente');
    
  } catch (error) {
    console.error('Error en GET /api/admin/analytics:', error);
    throw error;
  }
}

// Función para calcular tiempo promedio de respuesta de emergencias (mantener si hay contexto útil)
function calculateAverageResponseTime(emergencies: any[]) {
  const resolvedEmergencies = emergencies.filter(e => 
    e.status === 'resolved' && e.startTime && e.endTime
  );
  
  if (resolvedEmergencies.length === 0) return 0;
  
  const totalTime = resolvedEmergencies.reduce((sum, e) => {
    const start = new Date(e.startTime);
    const end = new Date(e.endTime);
    return sum + (end.getTime() - start.getTime());
  }, 0);
  
  return Math.round(totalTime / resolvedEmergencies.length / (1000 * 60));
}

// Función para calcular salud del sistema (mantener si hay contexto útil)
function calculateSystemHealth(stats: any) {
  let score = 100;
  
  // Penalizar por emergencias críticas (mantener si hay contexto útil)
  if (stats.emergencies.byPriority.critical > 0) score -= 20;
  if (stats.emergencies.byPriority.high > 2) score -= 10;
  
  // Penalizar por muchas membresías pendientes (mantener si hay contexto útil)
  if (stats.memberships.pending > 10) score -= 15;
  
  // Penalizar por productos sin stock (mantener si hay contexto útil)
  const outOfStockRatio = stats.products.total > 0 
    ? stats.products.outOfStock / stats.products.total 
    : 0;
  if (outOfStockRatio > 0.3) score -= 10;
  
  return Math.max(score, 0);
}

// Función para generar alertas (mantener si hay contexto útil)
function generateAlerts(stats: any) {
  const alerts = [];
  
  if (stats.emergencies.byPriority.critical > 0) {
    alerts.push({
      type: 'critical',
      message: `${stats.emergencies.byPriority.critical} emergencia(s) crítica(s) activa(s)`,
      action: 'Revisar panel de emergencias'
    });
  }
  
  if (stats.memberships.pending > 5) {
    alerts.push({
      type: 'warning',
      message: `${stats.memberships.pending} membresías pendientes de revisión`,
      action: 'Revisar solicitudes'
    });
  }
  
  if (stats.products.outOfStock > stats.products.total * 0.2) {
    alerts.push({
      type: 'info',
      message: `${stats.products.outOfStock} productos sin stock`,
      action: 'Actualizar inventario'
    });
  }
  
  return alerts;
}

// Función para calcular métricas de crecimiento (mantener si hay contexto útil)
function calculateGrowthMetrics(users: any[], events: any[], memberships: any[], fromDate: Date, toDate: Date) {
  const previousPeriodStart = new Date(fromDate.getTime() - (toDate.getTime() - fromDate.getTime()));
  const previousPeriodEnd = fromDate;
  
  const currentUsers = users.filter(u => 
    new Date(u.createdAt) >= fromDate && new Date(u.createdAt) <= toDate
  ).length;
  const previousUsers = users.filter(u => 
    new Date(u.createdAt) >= previousPeriodStart && new Date(u.createdAt) <= previousPeriodEnd
  ).length;
  
  const currentEvents = events.filter(e => 
    new Date(e.createdAt) >= fromDate && new Date(e.createdAt) <= toDate
  ).length;
  const previousEvents = events.filter(e => 
    new Date(e.createdAt) >= previousPeriodStart && new Date(e.createdAt) <= previousPeriodEnd
  ).length;
  
  const currentMemberships = memberships.filter(m => 
    new Date(m.createdAt) >= fromDate && new Date(m.createdAt) <= toDate
  ).length;
  const previousMemberships = memberships.filter(m => 
    new Date(m.createdAt) >= previousPeriodStart && new Date(m.createdAt) <= previousPeriodEnd
  ).length;
  
  return {
    userGrowth: previousUsers > 0 ? Math.round(((currentUsers - previousUsers) / previousUsers) * 100) : 0,
    eventGrowth: previousEvents > 0 ? Math.round(((currentEvents - previousEvents) / previousEvents) * 100) : 0,
    membershipGrowth: previousMemberships > 0 ? Math.round(((currentMemberships - previousMemberships) / previousMemberships) * 100) : 0
  };
}

// Función para obtener usuarios más activos (mantener si hay contexto útil)
async function getMostActiveUsers() {
  try {
    const activeUsers = await User.find({ isActive: { $ne: false } })
      .select('firstName lastName email lastLoginAt')
      .sort({ lastLoginAt: -1 })
      .limit(5);
    return activeUsers;
  } catch (error) {
    return [];
  }
}

// Función para obtener eventos populares (mantener si hay contexto útil)
function getPopularEvents(events: any[]) {
  return events
    .filter(e => e.participants && e.participants.length > 0)
    .sort((a, b) => (b.participants?.length || 0) - (a.participants?.length || 0))
    .slice(0, 5)
    .map(e => ({
      name: e.name,
      participants: e.participants?.length || 0,
      date: e.startDate
    }));
}

// Función para obtener productos más populares (mantener si hay contexto útil)
function getTopProducts(products: any[]) {
  return products
    .filter(p => p.views || p.purchases)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)
    .map(p => ({
      name: p.name,
      views: p.views || 0,
      price: p.finalPrice,
      category: p.category
    }));
}

// Handler principal (mantener si hay contexto útil)
export async function GET(request: NextRequest) {
  return withErrorHandling(handleGet)(request);
}
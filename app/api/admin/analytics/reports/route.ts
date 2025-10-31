import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse
} from '@/lib/api-utils';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Event from '@/lib/models/Event';
import Product from '@/lib/models/Product';
import MembershipApplication from '@/lib/models/MembershipApplication';
import Emergency from '@/lib/models/Emergency';

/**
 * GET /api/admin/analytics/reports
 * Genera reportes específicos para analytics
 */
async function handleGet(request: NextRequest) {
  await connectDB();
  
  try {
    const { searchParams } = new URL(request.url);
    
    const reportType = searchParams.get('type') || 'summary';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
  const format = searchParams.get('format') || 'json';
    
  // Fechas por defecto (último mes) (mantener si hay contexto útil)
    const now = new Date();
    const fromDate = startDate ? new Date(startDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const toDate = endDate ? new Date(endDate) : now;
    
    let reportData;
    
    switch (reportType) {
      case 'users':
        reportData = await generateUsersReport(fromDate, toDate);
        break;
      case 'events':
        reportData = await generateEventsReport(fromDate, toDate);
        break;
      case 'products':
        reportData = await generateProductsReport(fromDate, toDate);
        break;
      case 'memberships':
        reportData = await generateMembershipsReport(fromDate, toDate);
        break;
      case 'emergencies':
        reportData = await generateEmergenciesReport(fromDate, toDate);
        break;
      case 'financial':
        reportData = await generateFinancialReport(fromDate, toDate);
        break;
      case 'activity':
        reportData = await generateActivityReport(fromDate, toDate);
        break;
      case 'performance':
        reportData = await generatePerformanceReport(fromDate, toDate);
        break;
      default:
        reportData = await generateSummaryReport(fromDate, toDate);
    }
    
    const response = {
      reportType,
      period: {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
        days: Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
      },
      generatedAt: now.toISOString(),
      data: reportData,
      format
    };
    
    if (format === 'csv') {
  // Aquí podrías convertir a CSV si es necesario (mantener si hay contexto útil)
  // Por ahora devolvemos JSON con indicador de formato (mantener si hay contexto útil)
      response.format = 'csv-ready';
    }
    
    return createSuccessResponse(response, `Reporte ${reportType} generado exitosamente`);
    
  } catch (error) {
    console.error('Error en GET /api/admin/analytics/reports:', error);
    throw error;
  }
}

// Reporte de usuarios (mantener si hay contexto útil)
async function generateUsersReport(fromDate: Date, toDate: Date) {
  const users = await User.find({
    createdAt: { $gte: fromDate, $lte: toDate }
  }).sort({ createdAt: -1 });
  
  const allUsers = await User.find({});
  
  return {
    newUsers: users.length,
    totalUsers: allUsers.length,
    usersByRole: users.reduce((acc: Record<string, number>, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {}),
    usersByMembershipType: users.reduce((acc: Record<string, number>, user) => {
      const type = user.membershipType || 'none';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}),
    activeUsers: users.filter(u => u.isActive !== false).length,
    verifiedUsers: users.filter(u => u.isVerified).length,
    registrationTrend: generateDailyTrend(users, fromDate, toDate, 'createdAt'),
    topReferrers: generateTopReferrers(users),
    userDetails: users.map(u => ({
      id: u._id,
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
      role: u.role,
      membershipType: u.membershipType,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      isActive: u.isActive,
      isVerified: u.isVerified
    }))
  };
}

// Reporte de eventos (mantener si hay contexto útil)
async function generateEventsReport(fromDate: Date, toDate: Date) {
  const events = await Event.find({
    createdAt: { $gte: fromDate, $lte: toDate }
  }).sort({ createdAt: -1 });
  
  const allEvents = await Event.find({});
  
  return {
    newEvents: events.length,
    totalEvents: allEvents.length,
    eventsByType: events.reduce((acc: Record<string, number>, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {}),
    eventsByStatus: events.reduce((acc: Record<string, number>, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      return acc;
    }, {}),
    upcomingEvents: allEvents.filter(e => new Date(e.startDate) > new Date()).length,
    pastEvents: allEvents.filter(e => new Date(e.startDate) <= new Date()).length,
    totalParticipants: events.reduce((sum, e) => sum + (e.participants?.length || 0), 0),
    averageParticipants: events.length > 0 
      ? Math.round(events.reduce((sum, e) => sum + (e.participants?.length || 0), 0) / events.length)
      : 0,
    popularEvents: events
      .filter(e => e.participants && e.participants.length > 0)
      .sort((a, b) => (b.participants?.length || 0) - (a.participants?.length || 0))
      .slice(0, 10),
    eventTrend: generateDailyTrend(events, fromDate, toDate, 'createdAt'),
    eventDetails: events.map(e => ({
      id: e._id,
      name: e.name,
      type: e.eventType,
      status: e.status,
      startDate: e.startDate,
      endDate: e.endDate,
      participants: e.participants?.length || 0,
      location: e.location,
      createdAt: e.createdAt
    }))
  };
}

// Reporte de productos (mantener si hay contexto útil)
async function generateProductsReport(fromDate: Date, toDate: Date) {
  const products = await Product.find({
    createdAt: { $gte: fromDate, $lte: toDate }
  }).sort({ createdAt: -1 });
  
  const allProducts = await Product.find({});
  
  return {
    newProducts: products.length,
    totalProducts: allProducts.length,
    productsByCategory: allProducts.reduce((acc: Record<string, number>, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {}),
    productsByAvailability: allProducts.reduce((acc: Record<string, number>, product) => {
      acc[product.availability] = (acc[product.availability] || 0) + 1;
      return acc;
    }, {}),
    inStockProducts: allProducts.filter(p => p.availability === 'in-stock').length,
    outOfStockProducts: allProducts.filter(p => p.availability === 'out-of-stock').length,
    totalInventoryValue: allProducts.reduce((sum, p) => sum + (p.finalPrice || 0), 0),
    averagePrice: allProducts.length > 0 
      ? Math.round(allProducts.reduce((sum, p) => sum + (p.finalPrice || 0), 0) / allProducts.length)
      : 0,
    priceRanges: calculatePriceRanges(allProducts),
    topViewedProducts: allProducts
      .filter(p => p.views)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10),
    productTrend: generateDailyTrend(products, fromDate, toDate, 'createdAt'),
    productDetails: products.map(p => ({
      id: p._id,
      name: p.name,
      category: p.category,
      price: p.finalPrice,
      availability: p.availability,
      views: p.views || 0,
      createdAt: p.createdAt
    }))
  };
}

// Reporte de membresías (mantener si hay contexto útil)
async function generateMembershipsReport(fromDate: Date, toDate: Date) {
  const memberships = await MembershipApplication.find({
    createdAt: { $gte: fromDate, $lte: toDate }
  }).sort({ createdAt: -1 });
  
  const allMemberships = await MembershipApplication.find({});
  
  return {
    newApplications: memberships.length,
    totalApplications: allMemberships.length,
    applicationsByStatus: allMemberships.reduce((acc: Record<string, number>, membership) => {
      acc[membership.status] = (acc[membership.status] || 0) + 1;
      return acc;
    }, {}),
    applicationsByType: allMemberships.reduce((acc: Record<string, number>, membership) => {
      acc[membership.membershipType] = (acc[membership.membershipType] || 0) + 1;
      return acc;
    }, {}),
    approvalRate: allMemberships.length > 0 
      ? Math.round((allMemberships.filter(m => m.status === 'approved').length / allMemberships.length) * 100)
      : 0,
    rejectionRate: allMemberships.length > 0 
      ? Math.round((allMemberships.filter(m => m.status === 'rejected').length / allMemberships.length) * 100)
      : 0,
    pendingApplications: allMemberships.filter(m => m.status === 'pending').length,
    averageProcessingTime: calculateAverageProcessingTime(allMemberships),
    applicationTrend: generateDailyTrend(memberships, fromDate, toDate, 'createdAt'),
    membershipDetails: memberships.map(m => ({
      id: m._id,
      name: `${m.firstName} ${m.lastName}`,
      email: m.email,
      membershipType: m.membershipType,
      status: m.status,
      createdAt: m.createdAt,
      reviewedAt: m.reviewedAt,
      reviewedBy: m.reviewedBy
    }))
  };
}

// Reporte de emergencias (mantener si hay contexto útil)
async function generateEmergenciesReport(fromDate: Date, toDate: Date) {
  const emergencies = await Emergency.find({
    createdAt: { $gte: fromDate, $lte: toDate }
  }).sort({ createdAt: -1 });
  
  const allEmergencies = await Emergency.find({});
  
  return {
    newEmergencies: emergencies.length,
    totalEmergencies: allEmergencies.length,
    emergenciesByPriority: allEmergencies.reduce((acc: Record<string, number>, emergency) => {
      acc[emergency.priority] = (acc[emergency.priority] || 0) + 1;
      return acc;
    }, {}),
    emergenciesByStatus: allEmergencies.reduce((acc: Record<string, number>, emergency) => {
      acc[emergency.status] = (acc[emergency.status] || 0) + 1;
      return acc;
    }, {}),
    emergenciesByType: allEmergencies.reduce((acc: Record<string, number>, emergency) => {
      acc[emergency.emergencyType] = (acc[emergency.emergencyType] || 0) + 1;
      return acc;
    }, {}),
    activeEmergencies: allEmergencies.filter(e => 
      e.status === 'pending' || e.status === 'in-progress'
    ).length,
    resolvedEmergencies: allEmergencies.filter(e => e.status === 'resolved').length,
    averageResponseTime: calculateAverageResponseTime(allEmergencies),
    resolutionRate: allEmergencies.length > 0 
      ? Math.round((allEmergencies.filter(e => e.status === 'resolved').length / allEmergencies.length) * 100)
      : 0,
    criticalEmergencies: allEmergencies.filter(e => e.priority === 'critical').length,
    emergencyTrend: generateDailyTrend(emergencies, fromDate, toDate, 'createdAt'),
    emergencyDetails: emergencies.map(e => ({
      id: e._id,
      title: e.title,
      type: e.emergencyType,
      priority: e.priority,
      status: e.status,
      location: e.location,
      createdAt: e.createdAt,
      responseTime: e.startTime && e.endTime 
        ? Math.round((new Date(e.endTime).getTime() - new Date(e.startTime).getTime()) / (1000 * 60))
        : null
    }))
  };
}

// Reporte financiero (mantener si hay contexto útil)
async function generateFinancialReport(fromDate: Date, toDate: Date) {
  const products = await Product.find({});
  const emergencies = await Emergency.find({
    createdAt: { $gte: fromDate, $lte: toDate }
  });
  
  return {
    productInventoryValue: products.reduce((sum, p) => sum + (p.finalPrice || 0), 0),
    averageProductPrice: products.length > 0 
      ? Math.round(products.reduce((sum, p) => sum + (p.finalPrice || 0), 0) / products.length)
      : 0,
    emergencyCosts: emergencies.reduce((sum, e) => sum + (e.estimatedCost || 0), 0),
    averageEmergencyCost: emergencies.length > 0 
      ? Math.round(emergencies.reduce((sum, e) => sum + (e.estimatedCost || 0), 0) / emergencies.length)
      : 0,
    costByEmergencyType: emergencies.reduce((acc: Record<string, number>, emergency) => {
      const type = emergency.emergencyType;
      acc[type] = (acc[type] || 0) + (emergency.estimatedCost || 0);
      return acc;
    }, {}),
    monthlyTrend: generateMonthlyCostTrend(emergencies, fromDate, toDate)
  };
}

// Reporte de actividad (mantener si hay contexto útil)
async function generateActivityReport(fromDate: Date, toDate: Date) {
  const [users, events, products, memberships, emergencies] = await Promise.all([
    User.find({ createdAt: { $gte: fromDate, $lte: toDate } }),
    Event.find({ createdAt: { $gte: fromDate, $lte: toDate } }),
    Product.find({ createdAt: { $gte: fromDate, $lte: toDate } }),
    MembershipApplication.find({ createdAt: { $gte: fromDate, $lte: toDate } }),
    Emergency.find({ createdAt: { $gte: fromDate, $lte: toDate } })
  ]);
  
  return {
    totalActivity: users.length + events.length + products.length + memberships.length + emergencies.length,
    activityByType: {
      users: users.length,
      events: events.length,
      products: products.length,
      memberships: memberships.length,
      emergencies: emergencies.length
    },
    dailyActivity: generateDailyActivityTrend(
      { users, events, products, memberships, emergencies },
      fromDate,
      toDate
    ),
    peakActivity: calculatePeakActivityTimes(
      { users, events, products, memberships, emergencies }
    )
  };
}

// Reporte de rendimiento (mantener si hay contexto útil)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generatePerformanceReport(_fromDate: Date, _toDate: Date) {
  const [allUsers, allEvents, allProducts, allMemberships, allEmergencies] = await Promise.all([
    User.find({}),
    Event.find({}),
    Product.find({}),
    MembershipApplication.find({}),
    Emergency.find({})
  ]);
  
  return {
    systemHealth: calculateSystemHealth({
      users: { total: allUsers.length },
      events: { total: allEvents.length },
      products: { 
        total: allProducts.length,
        outOfStock: allProducts.filter(p => p.availability === 'out-of-stock').length
      },
      memberships: {
        total: allMemberships.length,
        pending: allMemberships.filter(m => m.status === 'pending').length
      },
      emergencies: {
        total: allEmergencies.length,
        byPriority: {
          critical: allEmergencies.filter(e => e.priority === 'critical').length,
          high: allEmergencies.filter(e => e.priority === 'high').length
        }
      }
    }),
    responseMetrics: {
      emergencyResponseTime: calculateAverageResponseTime(allEmergencies),
      membershipProcessingTime: calculateAverageProcessingTime(allMemberships)
    },
    efficiencyMetrics: {
      emergencyResolutionRate: allEmergencies.length > 0 
        ? Math.round((allEmergencies.filter(e => e.status === 'resolved').length / allEmergencies.length) * 100)
        : 0,
      membershipApprovalRate: allMemberships.length > 0 
        ? Math.round((allMemberships.filter(m => m.status === 'approved').length / allMemberships.length) * 100)
        : 0
    }
  };
}

// Reporte resumen (mantener si hay contexto útil)
async function generateSummaryReport(fromDate: Date, toDate: Date) {
  const [userReport, eventReport, productReport, membershipReport, emergencyReport] = await Promise.all([
    generateUsersReport(fromDate, toDate),
    generateEventsReport(fromDate, toDate),
    generateProductsReport(fromDate, toDate),
    generateMembershipsReport(fromDate, toDate),
    generateEmergenciesReport(fromDate, toDate)
  ]);
  
  return {
    overview: {
      newUsers: userReport.newUsers,
      newEvents: eventReport.newEvents,
      newProducts: productReport.newProducts,
      newMemberships: membershipReport.newApplications,
      newEmergencies: emergencyReport.newEmergencies
    },
    keyMetrics: {
      totalUsers: userReport.totalUsers,
      totalEvents: eventReport.totalEvents,
      totalProducts: productReport.totalProducts,
      totalMemberships: membershipReport.totalApplications,
      totalEmergencies: emergencyReport.totalEmergencies
    },
    alerts: generateSystemAlerts({
      criticalEmergencies: emergencyReport.emergencyDetails.filter(e => e.priority === 'critical').length,
      pendingMemberships: membershipReport.pendingApplications,
      outOfStockProducts: productReport.outOfStockProducts
    })
  };
}

// Funciones auxiliares (mantener si hay contexto útil)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateDailyTrend(items: any[], fromDate: Date, toDate: Date, dateField: string) {
  const days = [];
  const currentDate = new Date(fromDate);
  
  while (currentDate <= toDate) {
    const dayItems = items.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate.toDateString() === currentDate.toDateString();
    });
    
    days.push({
      date: currentDate.toISOString().split('T')[0],
      count: dayItems.length
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateDailyActivityTrend(data: any, fromDate: Date, toDate: Date) {
  const days = [];
  const currentDate = new Date(fromDate);
  
  while (currentDate <= toDate) {
    const dateStr = currentDate.toDateString();
    
    const dayActivity = {
      date: currentDate.toISOString().split('T')[0],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      users: data.users.filter((u: any) => new Date(u.createdAt).toDateString() === dateStr).length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      events: data.events.filter((e: any) => new Date(e.createdAt).toDateString() === dateStr).length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      products: data.products.filter((p: any) => new Date(p.createdAt).toDateString() === dateStr).length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      memberships: data.memberships.filter((m: any) => new Date(m.createdAt).toDateString() === dateStr).length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      emergencies: data.emergencies.filter((e: any) => new Date(e.createdAt).toDateString() === dateStr).length
    };
    
    days.push(dayActivity);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculatePeakActivityTimes(data: any) {
  const hourlyActivity = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    activity: 0
  }));
  
  const allItems = [
    ...data.users,
    ...data.events,
    ...data.products,
    ...data.memberships,
    ...data.emergencies
  ];
  
  allItems.forEach(item => {
    const hour = new Date(item.createdAt).getHours();
    hourlyActivity[hour].activity++;
  });
  
  return hourlyActivity.sort((a, b) => b.activity - a.activity).slice(0, 5);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateMonthlyCostTrend(emergencies: any[], fromDate: Date, toDate: Date) {
  const months = [];
  const currentDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
  const endDate = new Date(toDate.getFullYear(), toDate.getMonth(), 1);
  
  while (currentDate <= endDate) {
    const monthEmergencies = emergencies.filter(e => {
      const emergencyDate = new Date(e.createdAt);
      return emergencyDate.getFullYear() === currentDate.getFullYear() &&
             emergencyDate.getMonth() === currentDate.getMonth();
    });
    
    months.push({
      month: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`,
      cost: monthEmergencies.reduce((sum, e) => sum + (e.estimatedCost || 0), 0)
    });
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return months;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculatePriceRanges(products: any[]) {
  const ranges = {
    '0-50': 0,
    '51-100': 0,
    '101-200': 0,
    '201-500': 0,
    '500+': 0
  };
  
  products.forEach(p => {
    const price = p.finalPrice || 0;
    if (price <= 50) ranges['0-50']++;
    else if (price <= 100) ranges['51-100']++;
    else if (price <= 200) ranges['101-200']++;
    else if (price <= 500) ranges['201-500']++;
    else ranges['500+']++;
  });
  
  return ranges;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateTopReferrers(users: any[]) {
  const referrers = users.reduce((acc: Record<string, number>, user) => {
    const referrer = user.referrer || 'Direct';
    acc[referrer] = (acc[referrer] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(referrers)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateAverageProcessingTime(memberships: any[]) {
  const processedMemberships = memberships.filter(m => 
    m.reviewedAt && m.createdAt
  );
  
  if (processedMemberships.length === 0) return 0;
  
  const totalTime = processedMemberships.reduce((sum, m) => {
    const created = new Date(m.createdAt);
    const reviewed = new Date(m.reviewedAt);
    return sum + (reviewed.getTime() - created.getTime());
  }, 0);
  
  return Math.round(totalTime / processedMemberships.length / (1000 * 60 * 60 * 24));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateSystemHealth(stats: any) {
  let score = 100;
  
  if (stats.emergencies.byPriority.critical > 0) score -= 20;
  if (stats.emergencies.byPriority.high > 2) score -= 10;
  if (stats.memberships.pending > 10) score -= 15;
  
  const outOfStockRatio = stats.products.total > 0 
    ? stats.products.outOfStock / stats.products.total 
    : 0;
  if (outOfStockRatio > 0.3) score -= 10;
  
  return Math.max(score, 0);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateSystemAlerts(data: any) {
  const alerts = [];
  
  if (data.criticalEmergencies > 0) {
    alerts.push({
      type: 'critical',
      message: `${data.criticalEmergencies} emergencia(s) crítica(s)`,
      priority: 'high'
    });
  }
  
  if (data.pendingMemberships > 5) {
    alerts.push({
      type: 'warning',
      message: `${data.pendingMemberships} membresías pendientes`,
      priority: 'medium'
    });
  }
  
  if (data.outOfStockProducts > 0) {
    alerts.push({
      type: 'info',
      message: `${data.outOfStockProducts} productos sin stock`,
      priority: 'low'
    });
  }
  
  return alerts;
}

export async function GET(request: NextRequest) {
  return withErrorHandling(handleGet)(request);
}
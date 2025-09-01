import { NextRequest } from 'next/server';
import { 
  withErrorHandling, 
  createSuccessResponse 
} from '@/lib/api-utils';
import { db } from '@/lib/database';

/**
 * GET /api/stats
 * Obtiene estadísticas generales del sistema
 */
async function handleGet(request: NextRequest) {
  const users = db.getAllUsers();
  const products = db.getAllProducts();
  const events = db.getAllEvents();
  const emergencies = db.getAllEmergencies();
  const membershipApplications = db.getAllMembershipApplications();
  const contactMessages = db.getAllContactMessages();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const stats = {
    users: {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
      byMembership: {
        friend: users.filter(u => u.membershipType === 'friend').length,
        rider: users.filter(u => u.membershipType === 'rider').length,
        'rider-duo': users.filter(u => u.membershipType === 'rider-duo').length,
        pro: users.filter(u => u.membershipType === 'pro').length,
        'pro-duo': users.filter(u => u.membershipType === 'pro-duo').length,
      },
      recentRegistrations: users.filter(u => 
        new Date(u.createdAt) >= thirtyDaysAgo
      ).length
    },
    products: {
      total: products.length,
      inStock: products.filter(p => p.availability === 'in-stock').length,
      outOfStock: products.filter(p => p.availability === 'out-of-stock').length,
      newProducts: products.filter(p => p.newProduct).length,
      byCategory: products.reduce((acc: Record<string, number>, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {}),
      averagePrice: products.length > 0 
        ? Math.round(products.reduce((sum, p) => sum + p.finalPrice, 0) / products.length)
        : 0
    },
    events: {
      total: events.length,
      upcoming: db.getUpcomingEvents().length,
      past: events.filter(e => new Date(e.startDate) <= now).length,
      byType: events.reduce((acc: Record<string, number>, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      }, {}),
      recentEvents: events.filter(e => 
        new Date(e.startDate) >= thirtyDaysAgo
      ).length
    },
    emergencies: {
      total: emergencies.length,
      pending: emergencies.filter(e => e.status === 'pending').length,
      inProgress: emergencies.filter(e => e.status === 'in-progress').length,
      resolved: emergencies.filter(e => e.status === 'resolved').length,
      cancelled: emergencies.filter(e => e.status === 'cancelled').length,
      byPriority: {
        critical: emergencies.filter(e => e.priority === 'critical').length,
        high: emergencies.filter(e => e.priority === 'high').length,
        medium: emergencies.filter(e => e.priority === 'medium').length,
        low: emergencies.filter(e => e.priority === 'low').length,
      },
      byType: emergencies.reduce((acc: Record<string, number>, emergency) => {
        acc[emergency.emergencyType] = (acc[emergency.emergencyType] || 0) + 1;
        return acc;
      }, {}),
      recentEmergencies: emergencies.filter(e => 
        new Date(e.createdAt) >= thirtyDaysAgo
      ).length
    },
    memberships: {
      total: membershipApplications.length,
      pending: membershipApplications.filter(m => m.status === 'pending').length,
      approved: membershipApplications.filter(m => m.status === 'approved').length,
      rejected: membershipApplications.filter(m => m.status === 'rejected').length,
      byType: membershipApplications.reduce((acc: Record<string, number>, app) => {
        acc[app.membershipType] = (acc[app.membershipType] || 0) + 1;
        return acc;
      }, {}),
      recentApplications: membershipApplications.filter(m => 
        new Date(m.createdAt) >= thirtyDaysAgo
      ).length
    },
    contact: {
      total: contactMessages.length,
      new: contactMessages.filter(c => c.status === 'new').length,
      inProgress: contactMessages.filter(c => c.status === 'in-progress').length,
      resolved: contactMessages.filter(c => c.status === 'resolved').length,
      closed: contactMessages.filter(c => c.status === 'closed').length,
      byType: contactMessages.reduce((acc: Record<string, number>, msg) => {
        acc[msg.type] = (acc[msg.type] || 0) + 1;
        return acc;
      }, {}),
      recentMessages: contactMessages.filter(c => 
        new Date(c.createdAt) >= thirtyDaysAgo
      ).length
    },
    system: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    }
  };

  return createSuccessResponse(
    stats,
    'Estadísticas del sistema obtenidas exitosamente'
  );
}

export async function GET(request: NextRequest) {
  return withErrorHandling(handleGet)(request);
}

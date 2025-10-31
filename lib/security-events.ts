/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Security Events Logger v2.5.0
 * 
 * Tracks and logs security-related events for admin review
 * Events stored in Redis with 30-day TTL
 */

import { getRedisClient } from './redis-client';
import { safeJsonParse } from './json-utils';

export type SecurityEventType =
  | 'rate_limit_exceeded'
  | 'anomaly_detected'
  | 'ip_blocked'
  | 'recaptcha_failed'
  | 'captcha_fallback_triggered'
  | 'brute_force_attempt'
  | 'suspicious_login'
  | 'account_locked';

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  timestamp: number;
  ip: string;
  userAgent: string;
  userId?: string;
  email?: string;
  endpoint: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: number;
  notes?: string;
}

/**
 * Log a security event
 */
export async function logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>): Promise<string> {
  const redis = getRedisClient();
  
  if (!redis) {
    console.warn('[Security Events] Redis not available, cannot log event');
    return '';
  }
  
  const eventId = `security:event:${Date.now()}:${Math.random().toString(36).substring(7)}`;
  
  const fullEvent: SecurityEvent = {
    ...event,
    id: eventId,
    timestamp: Date.now(),
    resolved: false,
  };
  
  // Store event in Redis (30-day TTL)
  await redis.setex(eventId, 30 * 24 * 60 * 60, JSON.stringify(fullEvent));
  
  // Add to sorted set for chronological retrieval
  await redis.zadd('security:events:timeline', fullEvent.timestamp, eventId);
  
  // Add to type-specific sets
  await redis.sadd(`security:events:type:${event.type}`, eventId);
  
  // Add to IP-specific sets
  await redis.sadd(`security:events:ip:${event.ip}`, eventId);
  
  // Add to severity-specific sets
  await redis.sadd(`security:events:severity:${event.severity}`, eventId);
  
  console.log(`[Security Events] Logged ${event.type} event: ${eventId}`);
  
  return eventId;
}

/**
 * Get recent security events
 */
export async function getRecentSecurityEvents(
  limit: number = 50,
  offset: number = 0
): Promise<SecurityEvent[]> {
  const redis = getRedisClient();
  
  if (!redis) {
    return [];
  }
  
  // Get event IDs from timeline (most recent first)
  const eventIds = await redis.zrevrange('security:events:timeline', offset, offset + limit - 1);
  
  if (!eventIds || eventIds.length === 0) {
    return [];
  }
  
  // Retrieve full event data
  const events: SecurityEvent[] = [];
  for (const eventId of eventIds) {
    const eventData = await redis.get(eventId);
    if (eventData) {
      const event = safeJsonParse<SecurityEvent>(eventData, {
        id: '',
        type: 'rate_limit_exceeded',
        timestamp: 0,
        ip: '',
        userAgent: '',
        endpoint: '',
        details: {},
        severity: 'low',
        resolved: false,
      });
      if (event.id) events.push(event);
    }
  }
  
  return events;
}

/**
 * Get events by type
 */
export async function getEventsByType(type: SecurityEventType, limit: number = 50): Promise<SecurityEvent[]> {
  const redis = getRedisClient();
  
  if (!redis) {
    return [];
  }
  
  const eventIds = await redis.smembers(`security:events:type:${type}`);
  
  if (!eventIds || eventIds.length === 0) {
    return [];
  }
  
  // Retrieve and sort by timestamp
  const events: SecurityEvent[] = [];
  for (const eventId of eventIds.slice(0, limit)) {
    const eventData = await redis.get(eventId);
    if (eventData) {
      const event = safeJsonParse<SecurityEvent>(eventData, {
        id: '',
        type: 'rate_limit_exceeded',
        timestamp: 0,
        ip: '',
        userAgent: '',
        endpoint: '',
        details: {},
        severity: 'low',
        resolved: false,
      });
      if (event.id) events.push(event);
    }
  }
  
  return events.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Get events by IP address
 */
export async function getEventsByIP(ip: string, limit: number = 50): Promise<SecurityEvent[]> {
  const redis = getRedisClient();
  
  if (!redis) {
    return [];
  }
  
  const eventIds = await redis.smembers(`security:events:ip:${ip}`);
  
  if (!eventIds || eventIds.length === 0) {
    return [];
  }
  
  const events: SecurityEvent[] = [];
  for (const eventId of eventIds.slice(0, limit)) {
    const eventData = await redis.get(eventId);
    if (eventData) {
      const event = safeJsonParse<SecurityEvent>(eventData, {
        id: '',
        type: 'rate_limit_exceeded',
        timestamp: 0,
        ip: '',
        userAgent: '',
        endpoint: '',
        details: {},
        severity: 'low',
        resolved: false,
      });
      if (event.id) events.push(event);
    }
  }
  
  return events.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Get events by severity
 */
export async function getEventsBySeverity(severity: SecurityEvent['severity'], limit: number = 50): Promise<SecurityEvent[]> {
  const redis = getRedisClient();
  
  if (!redis) {
    return [];
  }
  
  const eventIds = await redis.smembers(`security:events:severity:${severity}`);
  
  if (!eventIds || eventIds.length === 0) {
    return [];
  }
  
  const events: SecurityEvent[] = [];
  for (const eventId of eventIds.slice(0, limit)) {
    const eventData = await redis.get(eventId);
    if (eventData) {
      const event = safeJsonParse<SecurityEvent>(eventData, {
        id: '',
        type: 'rate_limit_exceeded',
        timestamp: 0,
        ip: '',
        userAgent: '',
        endpoint: '',
        details: {},
        severity: 'low',
        resolved: false,
      });
      if (event.id) events.push(event);
    }
  }
  
  return events.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Mark event as resolved
 */
export async function resolveSecurityEvent(
  eventId: string,
  resolvedBy: string,
  notes?: string
): Promise<boolean> {
  const redis = getRedisClient();
  
  if (!redis) {
    return false;
  }
  
  const eventData = await redis.get(eventId);
  if (!eventData) {
    return false;
  }
  
  const event: SecurityEvent = safeJsonParse<SecurityEvent>(eventData, {
    id: '',
    type: 'rate_limit_exceeded',
    timestamp: 0,
    ip: '',
    userAgent: '',
    endpoint: '',
    details: {},
    severity: 'low',
    resolved: false,
  });
  
  if (!event.id) {
    return false;
  }
  
  event.resolved = true;
  event.resolvedBy = resolvedBy;
  event.resolvedAt = Date.now();
  if (notes) {
    event.notes = notes;
  }
  
  // Update event in Redis
  const ttl = await redis.ttl(eventId);
  await redis.setex(eventId, ttl > 0 ? ttl : 30 * 24 * 60 * 60, JSON.stringify(event));
  
  return true;
}

/**
 * Get security statistics
 */
export async function getSecurityStatistics(): Promise<{
  total: number;
  byType: Record<SecurityEventType, number>;
  bySeverity: Record<SecurityEvent['severity'], number>;
  resolved: number;
  unresolved: number;
}> {
  const redis = getRedisClient();
  
  if (!redis) {
    return {
      total: 0,
      byType: {} as any,
      bySeverity: {} as any,
      resolved: 0,
      unresolved: 0,
    };
  }
  
  const total = await redis.zcard('security:events:timeline');
  
  // Get counts by type
  const types: SecurityEventType[] = [
    'rate_limit_exceeded',
    'anomaly_detected',
    'ip_blocked',
    'recaptcha_failed',
    'captcha_fallback_triggered',
    'brute_force_attempt',
    'suspicious_login',
    'account_locked',
  ];
  
  const byType: Record<string, number> = {};
  for (const type of types) {
    byType[type] = await redis.scard(`security:events:type:${type}`);
  }
  
  // Get counts by severity
  const severities: Array<SecurityEvent['severity']> = ['low', 'medium', 'high', 'critical'];
  const bySeverity: Record<string, number> = {};
  for (const severity of severities) {
    bySeverity[severity] = await redis.scard(`security:events:severity:${severity}`);
  }
  
  // Get resolved/unresolved counts
  const recentEvents = await getRecentSecurityEvents(1000);
  const resolved = recentEvents.filter(e => e.resolved).length;
  const unresolved = recentEvents.filter(e => !e.resolved).length;
  
  return {
    total,
    byType: byType as any,
    bySeverity: bySeverity as any,
    resolved,
    unresolved,
  };
}

/**
 * Clear old security events (optional - Redis TTL handles this)
 */
export async function clearOldSecurityEvents(olderThanDays: number = 30): Promise<number> {
  const redis = getRedisClient();
  
  if (!redis) {
    return 0;
  }
  
  const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
  
  // Remove from timeline
  const removed = await redis.zremrangebyscore('security:events:timeline', 0, cutoffTime);
  
  return removed;
}

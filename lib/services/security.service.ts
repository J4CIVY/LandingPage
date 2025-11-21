/**
 * Security Events Service
 * Handles security monitoring and alerts
 */

import apiClient from '@/lib/api-client';

export type SecurityEventType = 
  | 'suspicious_login'
  | 'new_location'
  | 'new_ip'
  | 'new_device'
  | 'failed_2fa'
  | 'account_locked'
  | 'password_changed';

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface GeoLocation {
  city: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  timezone?: string;
  isp?: string;
}

export interface SecurityEvent {
  _id: string;
  userId: string;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  riskScore: number;
  ipAddress: string;
  userAgent?: string;
  location?: GeoLocation;
  metadata?: Record<string, any>;
  actionTaken?: string;
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

export interface SecurityStats {
  totalEvents: number;
  criticalEvents: number;
  accountsLocked: number;
  eventsByType: Record<SecurityEventType, number>;
}

class SecurityService {
  private readonly baseUrl = '/security';

  /**
   * Get security events for current user (last 30 days)
   * GET /security/events
   */
  async getEvents(): Promise<SecurityEvent[]> {
    return apiClient.get<SecurityEvent[]>(`${this.baseUrl}/events`);
  }

  /**
   * Get security statistics (Admin only)
   * GET /security/stats
   */
  async getStats(): Promise<SecurityStats> {
    return apiClient.get<SecurityStats>(`${this.baseUrl}/stats`);
  }
}

export const securityService = new SecurityService();
export default securityService;

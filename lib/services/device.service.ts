/**
 * Trusted Device Service
 * Manages trusted devices for bypassing 2FA
 */

import apiClient from '@/lib/api-client';

export interface TrustedDevice {
  _id: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  lastUsed: Date;
  ipAddress: string;
  city?: string;
  country?: string;
  expiresAt: Date;
}

export interface TrustDeviceResponse {
  deviceId: string;
  expiresAt: string;
  message: string;
}

export interface RevokeResponse {
  revoked: boolean;
}

export interface RevokeAllResponse {
  revokedCount: number;
}

class DeviceService {
  private readonly baseUrl = '/devices';

  /**
   * List all trusted devices for current user
   * GET /devices
   */
  async list(): Promise<TrustedDevice[]> {
    return apiClient.get<TrustedDevice[]>(this.baseUrl);
  }

  /**
   * Trust current device (sets remember_device cookie for 30 days)
   * POST /devices/trust
   */
  async trust(): Promise<TrustDeviceResponse> {
    return apiClient.post<TrustDeviceResponse>(`${this.baseUrl}/trust`, {});
  }

  /**
   * Revoke trust from a specific device
   * DELETE /devices/:deviceId
   */
  async revoke(deviceId: string): Promise<RevokeResponse> {
    return apiClient.delete<RevokeResponse>(`${this.baseUrl}/${deviceId}`);
  }

  /**
   * Revoke all trusted devices (except current)
   * DELETE /devices
   */
  async revokeAll(): Promise<RevokeAllResponse> {
    return apiClient.delete<RevokeAllResponse>(this.baseUrl);
  }
}

export const deviceService = new DeviceService();
export default deviceService;

/**
 * Two-Factor Authentication Service
 * Handles all 2FA operations with NestJS backend
 */

import apiClient from '@/lib/api-client';

export interface TwoFactorSecret {
  secret: string;
  qrCodeUrl: string;
  qrCodeImage: string;
}

export interface TwoFactorStatus {
  enabled: boolean;
  backupCodesRemaining: number;
}

export interface TwoFactorEnableResponse {
  enabled: boolean;
  backupCodes: string[];
}

export interface TwoFactorVerifyResponse {
  verified: boolean;
}

export interface BackupCodesResponse {
  backupCodes: string[];
}

class TwoFactorService {
  private readonly baseUrl = '/two-factor';

  /**
   * Generate a new TOTP secret and QR code
   * POST /two-factor/generate
   */
  async generate(): Promise<TwoFactorSecret> {
    return apiClient.post<TwoFactorSecret>(`${this.baseUrl}/generate`, {});
  }

  /**
   * Enable 2FA after verifying TOTP code
   * POST /two-factor/enable
   */
  async enable(token: string): Promise<TwoFactorEnableResponse> {
    return apiClient.post<TwoFactorEnableResponse>(`${this.baseUrl}/enable`, { token });
  }

  /**
   * Verify a TOTP or backup code
   * POST /two-factor/verify
   */
  async verify(code: string): Promise<TwoFactorVerifyResponse> {
    return apiClient.post<TwoFactorVerifyResponse>(`${this.baseUrl}/verify`, { code });
  }

  /**
   * Disable 2FA with verification
   * POST /two-factor/disable
   */
  async disable(token: string): Promise<{ disabled: boolean }> {
    return apiClient.post<{ disabled: boolean }>(`${this.baseUrl}/disable`, { token });
  }

  /**
   * Get 2FA status for current user
   * GET /two-factor/status
   */
  async getStatus(): Promise<TwoFactorStatus> {
    return apiClient.get<TwoFactorStatus>(`${this.baseUrl}/status`);
  }

  /**
   * Regenerate backup codes
   * POST /two-factor/backup-codes/regenerate
   */
  async regenerateBackupCodes(token: string): Promise<BackupCodesResponse> {
    return apiClient.post<BackupCodesResponse>(`${this.baseUrl}/backup-codes/regenerate`, { token });
  }
}

export const twoFactorService = new TwoFactorService();
export default twoFactorService;

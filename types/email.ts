/**
 * Tipos para el sistema de correo electrónico con Zoho Mail API
 */

export interface ZohoEmailConfig {
  fromAddress: string;
  toAddress: string;
  ccAddress?: string;
  bccAddress?: string;
  subject: string;
  content: string;
  mailFormat?: 'html' | 'plaintext';
  askReceipt?: 'yes' | 'no';
  encoding?: string;
}

export interface ZohoScheduledEmail extends ZohoEmailConfig {
  isSchedule: boolean;
  scheduleType?: 1 | 2 | 3 | 4 | 5 | 6;
  timeZone?: string;
  scheduleTime?: string;
}

export interface ZohoAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: 'Bearer';
  api_domain: string;
  scope?: string;
}

export interface ZohoAccount {
  accountId: string;
  accountName: string;
  emailAddress: string;
  accountDisplayName: string;
  isDefaultAccount: boolean;
  status: string;
}

export interface ZohoEmailResponse {
  status: {
    code: number;
    description: string;
  };
  data?: {
    messageId?: string;
    folder?: string;
    moreInfo?: string; // Para errores como "Account not exists"
    // Otros campos opcionales de respuesta
    askReceipt?: string;
    subject?: string;
    fromAddress?: string;
    toAddress?: string;
    mailFormat?: string;
    mailId?: string;
    content?: string;
  };
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  category: 'notification' | 'marketing' | 'transactional';
}

export interface EmailSendOptions {
  template?: string;
  variables?: Record<string, any>;
  attachments?: EmailAttachment[];
  priority?: 'low' | 'medium' | 'high';
  trackOpens?: boolean;
  trackClicks?: boolean;
}

export interface EmailAttachment {
  filename: string;
  content: string; // Base64 encoded
  contentType: string;
  size: number;
}

export interface EmailQueue {
  id: string;
  email: ZohoEmailConfig;
  options?: EmailSendOptions;
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'scheduled';
  attempts: number;
  lastAttempt?: Date;
  scheduledFor?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailStats {
  totalSent: number;
  totalFailed: number;
  totalPending: number;
  todaySent: number;
  lastWeekSent: number;
  averageResponseTime: number;
}

export interface ContactFormEmail {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: 'general' | 'support' | 'sales' | 'technical' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  phone?: string;
  company?: string;
  metadata?: Record<string, any>;
}

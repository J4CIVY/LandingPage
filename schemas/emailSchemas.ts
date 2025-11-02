import { z } from 'zod';

// Esquemas de validación para el sistema de correo electrónico

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailConfigSchema = z.object({
  fromAddress: z.string().regex(EMAIL_REGEX, 'Email de remitente inválido'),
  toAddress: z.string().regex(EMAIL_REGEX, 'Email de destinatario inválido'),
  ccAddress: z.string().regex(EMAIL_REGEX, 'Email CC inválido').optional(),
  bccAddress: z.string().regex(EMAIL_REGEX, 'Email BCC inválido').optional(),
  subject: z.string().min(1, 'El asunto es requerido').max(200, 'El asunto es muy largo'),
  content: z.string().min(1, 'El contenido es requerido'),
  mailFormat: z.enum(['html', 'plaintext']).default('html'),
  askReceipt: z.enum(['yes', 'no']).default('no'),
  encoding: z.enum([
    'Big5',
    'EUC-JP',
    'EUC-KR',
    'GB2312',
    'ISO-2022-JP',
    'ISO-8859-1',
    'KOI8-R',
    'Shift_JIS',
    'US-ASCII',
    'UTF-8',
    'WINDOWS-1251',
    'X-WINDOWS-ISO2022JP'
  ]).default('UTF-8')
});

export const scheduledEmailSchema = emailConfigSchema.extend({
  isSchedule: z.boolean().default(false),
  scheduleType: z.enum(['1', '2', '3', '4', '5', '6']).optional(),
  timeZone: z.string().optional(),
  scheduleTime: z.string().optional()
}).refine((data) => {
  if (data.isSchedule) {
    return data.scheduleType !== undefined;
  }
  return true;
}, {
  message: 'scheduleType es requerido cuando isSchedule es true'
}).refine((data) => {
  if (data.isSchedule && data.scheduleType === '6') {
    return data.timeZone && data.scheduleTime;
  }
  return true;
}, {
  message: 'timeZone y scheduleTime son requeridos cuando scheduleType es 6'
});

export const contactEmailSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().regex(EMAIL_REGEX, 'Email inválido'),
  subject: z.string().min(5, 'El asunto debe tener al menos 5 caracteres'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
  category: z.enum(['general', 'support', 'sales', 'technical', 'other']).default('general'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium')
});

export const notificationEmailSchema = z.object({
  type: z.enum(['welcome', 'password_reset', 'account_verification', 'event_reminder', 'membership_update']),
  recipientEmail: z.string().regex(EMAIL_REGEX, 'Email de destinatario inválido'),
  recipientName: z.string().min(1, 'Nombre del destinatario requerido'),
  templateData: z.record(z.string(), z.any()).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
});

export type EmailConfig = z.infer<typeof emailConfigSchema>;
export type ScheduledEmail = z.infer<typeof scheduledEmailSchema>;
export type ContactEmail = z.infer<typeof contactEmailSchema>;
export type NotificationEmail = z.infer<typeof notificationEmailSchema>;

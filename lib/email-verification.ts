/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Email Verification for High-Risk Actions v2.5.0
 * 
 * Requires email confirmation before executing critical actions:
 * - Email address changes
 * - Password changes
 * - 2FA disabling
 * - Account deletion
 * 
 * Flow:
 * 1. User initiates critical action
 * 2. System sends verification email with OTP
 * 3. User enters OTP to confirm action
 * 4. Action is executed if OTP is valid
 */

import { getRedisClient } from './redis-client';
import { getEmailService } from './email-service';
import { safeJsonParse } from './json-utils';
import crypto from 'crypto';

export interface VerificationRequest {
  id: string;
  userId: string;
  email: string;
  action: 'email_change' | 'password_change' | '2fa_disable' | 'account_deletion';
  otp: string;
  otpHash: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
  actionData?: Record<string, any>;
}

/**
 * Generate a 6-digit OTP
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash OTP for secure storage
 */
function hashOTP(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * Create a verification request and send OTP email
 */
export async function createVerificationRequest(
  userId: string,
  email: string,
  action: VerificationRequest['action'],
  actionData?: Record<string, any>
): Promise<{ success: boolean; verificationId: string; message: string }> {
  const redis = getRedisClient();
  
  if (!redis) {
    return {
      success: false,
      verificationId: '',
      message: 'Sistema de verificación no disponible',
    };
  }
  
  // Check if there's a recent pending verification
  const existingKey = `verification:${userId}:${action}`;
  const existing = await redis.get(existingKey);
  
  if (existing) {
    const existingReq: VerificationRequest = safeJsonParse<VerificationRequest>(
      existing, 
      { 
        id: '', 
        userId: '', 
        email: '', 
        action: 'email_change', 
        otp: '', 
        otpHash: '', 
        createdAt: 0, 
        expiresAt: 0, 
        attempts: 0, 
        maxAttempts: 3 
      }
    );
    if (Date.now() < existingReq.expiresAt) {
      return {
        success: false,
        verificationId: '',
        message: 'Ya existe una verificación pendiente. Revisa tu correo o espera a que expire.',
      };
    }
  }
  
  // Generate OTP
  const otp = generateOTP();
  const otpHash = hashOTP(otp);
  
  const verificationId = `verify:${Date.now()}:${Math.random().toString(36).substring(7)}`;
  
  const request: VerificationRequest = {
    id: verificationId,
    userId,
    email,
    action,
    otp, // Store plain OTP temporarily for email
    otpHash,
    createdAt: Date.now(),
    expiresAt: Date.now() + (15 * 60 * 1000), // 15 minutes
    attempts: 0,
    maxAttempts: 3,
    actionData,
  };
  
  // Store in Redis with 15-minute TTL
  await redis.setex(verificationId, 900, JSON.stringify(request));
  await redis.setex(existingKey, 900, JSON.stringify(request));
  
  // Send verification email
  const emailService = getEmailService();
  const actionNames = {
    email_change: 'cambio de correo electrónico',
    password_change: 'cambio de contraseña',
    '2fa_disable': 'desactivación de autenticación de dos factores',
    account_deletion: 'eliminación de cuenta',
  };
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #22c55e;">Verificación de seguridad</h2>
      <p>Has solicitado realizar la siguiente acción:</p>
      <p style="font-weight: bold; font-size: 18px;">${actionNames[action]}</p>
      <p>Para confirmar esta acción, ingresa el siguiente código de verificación:</p>
      <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #22c55e;">${otp}</span>
      </div>
      <p style="color: #6b7280; font-size: 14px;">
        Este código expira en 15 minutos.<br>
        Si no solicitaste esta acción, ignora este correo y tu cuenta permanecerá segura.
      </p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="color: #9ca3af; font-size: 12px;">
        Este es un correo automático. Por favor, no respondas a este mensaje.
      </p>
    </div>
  `;
  
  try {
    // Use Zoho client directly for custom email
    const zohoClient = (emailService as any).client;
    const fromEmail = process.env.ZOHO_FROM_EMAIL || '';
    
    await zohoClient.sendEmail({
      fromAddress: fromEmail,
      toAddress: email,
      subject: `Verificación de ${actionNames[action]}`,
      content: htmlContent,
      mailFormat: 'html',
      askReceipt: 'no'
    });
    
    // Remove plain OTP from stored request for security
    request.otp = '';
    await redis.setex(verificationId, 900, JSON.stringify(request));
    await redis.setex(existingKey, 900, JSON.stringify(request));
    
    return {
      success: true,
      verificationId,
      message: `Código de verificación enviado a ${email}. Revisa tu correo.`,
    };
  } catch (error) {
    console.error('[Email Verification] Error sending email:', error);
    // Clean up if email fails
    await redis.del(verificationId);
    await redis.del(existingKey);
    
    return {
      success: false,
      verificationId: '',
      message: 'Error al enviar el código de verificación. Intenta de nuevo.',
    };
  }
}

/**
 * Verify OTP and execute action
 */
export async function verifyOTP(
  verificationId: string,
  userId: string,
  otp: string
): Promise<{
  success: boolean;
  message: string;
  actionData?: Record<string, any>;
}> {
  const redis = getRedisClient();
  
  if (!redis) {
    return {
      success: false,
      message: 'Sistema de verificación no disponible',
    };
  }
  
  const requestData = await redis.get(verificationId);
  
  if (!requestData) {
    return {
      success: false,
      message: 'Código de verificación expirado o inválido',
    };
  }
  
  const request: VerificationRequest = safeJsonParse<VerificationRequest>(
    requestData, 
    { 
      id: '', 
      userId: '', 
      email: '', 
      action: 'email_change', 
      otp: '', 
      otpHash: '', 
      createdAt: 0, 
      expiresAt: 0, 
      attempts: 0, 
      maxAttempts: 3 
    }
  );
  
  // Verify user ID matches
  if (request.userId !== userId) {
    return {
      success: false,
      message: 'Código de verificación no válido',
    };
  }
  
  // Check expiration
  if (Date.now() > request.expiresAt) {
    await redis.del(verificationId);
    await redis.del(`verification:${userId}:${request.action}`);
    return {
      success: false,
      message: 'El código de verificación ha expirado. Solicita uno nuevo.',
    };
  }
  
  // Check attempts
  if (request.attempts >= request.maxAttempts) {
    await redis.del(verificationId);
    await redis.del(`verification:${userId}:${request.action}`);
    return {
      success: false,
      message: 'Demasiados intentos fallidos. Solicita un nuevo código.',
    };
  }
  
  // Verify OTP
  const otpHash = hashOTP(otp);
  
  if (otpHash !== request.otpHash) {
    // Increment attempts
    request.attempts++;
    await redis.setex(verificationId, Math.floor((request.expiresAt - Date.now()) / 1000), JSON.stringify(request));
    
    return {
      success: false,
      message: `Código incorrecto. Te quedan ${request.maxAttempts - request.attempts} intentos.`,
    };
  }
  
  // OTP verified successfully
  await redis.del(verificationId);
  await redis.del(`verification:${userId}:${request.action}`);
  
  return {
    success: true,
    message: 'Código verificado correctamente',
    actionData: request.actionData,
  };
}

/**
 * Check if verification is required for an action
 */
export function isVerificationRequired(action: string): boolean {
  const requiredActions: VerificationRequest['action'][] = [
    'email_change',
    'password_change',
    '2fa_disable',
    'account_deletion',
  ];
  
  return requiredActions.includes(action as VerificationRequest['action']);
}

/**
 * Cancel a pending verification
 */
export async function cancelVerification(
  verificationId: string,
  userId: string
): Promise<boolean> {
  const redis = getRedisClient();
  
  if (!redis) {
    return false;
  }
  
  const requestData = await redis.get(verificationId);
  
  if (!requestData) {
    return false;
  }
  
  const request: VerificationRequest = safeJsonParse<VerificationRequest>(
    requestData, 
    { 
      id: '', 
      userId: '', 
      email: '', 
      action: 'email_change', 
      otp: '', 
      otpHash: '', 
      createdAt: 0, 
      expiresAt: 0, 
      attempts: 0, 
      maxAttempts: 3 
    }
  );
  
  if (request.userId !== userId) {
    return false;
  }
  
  await redis.del(verificationId);
  await redis.del(`verification:${userId}:${request.action}`);
  
  return true;
}

/**
 * Get active verification for user and action
 */
export async function getActiveVerification(
  userId: string,
  action: VerificationRequest['action']
): Promise<VerificationRequest | null> {
  const redis = getRedisClient();
  
  if (!redis) {
    return null;
  }
  
  const key = `verification:${userId}:${action}`;
  const data = await redis.get(key);
  
  if (!data) {
    return null;
  }
  
  const request: VerificationRequest = safeJsonParse<VerificationRequest>(
    data, 
    { 
      id: '', 
      userId: '', 
      email: '', 
      action: 'email_change', 
      otp: '', 
      otpHash: '', 
      createdAt: 0, 
      expiresAt: 0, 
      attempts: 0, 
      maxAttempts: 3 
    }
  );
  
  // Check if expired
  if (Date.now() > request.expiresAt) {
    await redis.del(request.id);
    await redis.del(key);
    return null;
  }
  
  // Don't return OTP or hash
  return {
    ...request,
    otp: '',
    otpHash: '',
  };
}

/**
 * Security utilities for input sanitization and validation
 */

// HTML entities para prevenir XSS (mantener si hay contexto útil)
const htmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[&<>"'/]/g, (s) => htmlEntities[s] || s)
    .trim()
  .substring(0, 10000);
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj: any): any { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  
  if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
    const sanitized: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
    for (const [key, value] of Object.entries(obj)) {
  // Sanitiza nombres de claves también
      const cleanKey = sanitizeInput(key);
      sanitized[cleanKey] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  if (obj !== null && Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  return obj;
}

/**
 * Validate email format with enhanced security
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Chequeos de seguridad adicionales (mantener si hay contexto útil)
  if (email.length > 254) return false;
  if (email.includes('..')) return false;
  if (email.startsWith('.') || email.endsWith('.')) return false;
  
  return emailRegex.test(email);
}

/**
 * Validate phone number (Colombian format)
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+57|57)?[1-9]\d{8,9}$/;
  const cleanPhone = phone.replace(/\s|-|\(|\)/g, '');
  return phoneRegex.test(cleanPhone);
}

/**
 * Validate document number (Colombian ID)
 */
export function validateDocumentNumber(document: string): boolean {
  const cleanDoc = document.replace(/\D/g, '');
  return cleanDoc.length >= 6 && cleanDoc.length <= 12;
}

/**
 * Password strength validation
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Chequeo de longitud
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Debe tener al menos 8 caracteres');
  }

  // Chequeo de mayúsculas
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Debe incluir al menos una letra mayúscula');
  }

  // Chequeo de minúsculas
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Debe incluir al menos una letra minúscula');
  }

  // Chequeo de números
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Debe incluir al menos un número');
  }

  // Chequeo de caracteres especiales
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Debe incluir al menos un carácter especial');
  }

  // Chequeo de patrones comunes
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /letmein/i,
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      score -= 1;
      feedback.push('No debe contener patrones comunes');
      break;
    }
  }

  return {
    isValid: score >= 4,
    score: Math.max(0, Math.min(5, score)),
    feedback,
  };
}

/**
 * Generate CSRF-safe form token
 */
export function generateFormToken(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  return btoa(`${timestamp}-${random}`);
}

/**
 * Validate form token age (max 1 hour)
 */
export function validateFormToken(token: string): boolean {
  try {
    const decoded = atob(token);
    const [timestamp] = decoded.split('-');
    const tokenAge = Date.now() - parseInt(timestamp);
  return tokenAge < 3600000;
  } catch {
    return false;
  }
}

/**
 * Rate limiting helper for form submissions
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts = 5, windowMs = 300000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
  // Limpia intentos antiguos
    const recentAttempts = attempts.filter(attempt => now - attempt < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

  // Registra este intento
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true;
  }

  getRemainingTime(key: string): number {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const timeLeft = this.windowMs - (Date.now() - oldestAttempt);
    
    return Math.max(0, timeLeft);
  }
}

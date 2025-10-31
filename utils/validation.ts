/**
 * Form Validation Utilities
 * Provides reusable validation patterns and helper functions
 */

import {
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl,
  sanitizeHtml,
  sanitizeText,
} from '@/lib/input-sanitization';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Validate email with detailed error messages
 */
export function validateEmail(email: string, required: boolean = false): ValidationResult {
  if (!email.trim()) {
    return {
      isValid: !required,
      error: required ? 'El correo electrónico es obligatorio' : undefined,
    };
  }

  const sanitized = sanitizeEmail(email);
  
  if (!sanitized) {
    return {
      isValid: false,
      error: 'Formato de correo electrónico inválido',
    };
  }

  return {
    isValid: true,
    sanitized,
  };
}

/**
 * Validate phone number with Colombian format support
 */
export function validatePhone(phone: string, required: boolean = false): ValidationResult {
  if (!phone.trim()) {
    return {
      isValid: !required,
      error: required ? 'El número de teléfono es obligatorio' : undefined,
    };
  }

  const sanitized = sanitizePhone(phone);
  
  if (!sanitized) {
    return {
      isValid: false,
      error: 'Formato de teléfono inválido (10-15 dígitos)',
    };
  }

  return {
    isValid: true,
    sanitized,
  };
}

/**
 * Validate URL with protocol checking
 */
export function validateUrl(
  url: string, 
  required: boolean = false,
  allowedProtocols: string[] = ['https:', 'http:', 'mailto:', 'tel:']
): ValidationResult {
  if (!url.trim()) {
    return {
      isValid: !required,
      error: required ? 'La URL es obligatoria' : undefined,
    };
  }

  const sanitized = sanitizeUrl(url);
  
  if (!sanitized) {
    return {
      isValid: false,
      error: 'URL no válida o protocolo peligroso detectado',
    };
  }

  // Check protocol if it's an absolute URL
  if (url.includes(':') && !url.startsWith('/')) {
    try {
      const parsed = new URL(url);
      if (!allowedProtocols.includes(parsed.protocol)) {
        return {
          isValid: false,
          error: `Protocolo no permitido. Solo: ${allowedProtocols.join(', ')}`,
        };
      }
    } catch {
      // Relative URL or invalid, but sanitized is OK
    }
  }

  return {
    isValid: true,
    sanitized,
  };
}

/**
 * Validate text length
 */
export function validateLength(
  text: string,
  minLength: number = 0,
  maxLength: number = 10000
): ValidationResult {
  const trimmed = text.trim();
  
  if (trimmed.length < minLength) {
    return {
      isValid: false,
      error: `Mínimo ${minLength} caracteres requeridos`,
    };
  }
  
  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      error: `Máximo ${maxLength} caracteres permitidos`,
    };
  }
  
  return {
    isValid: true,
    sanitized: sanitizeText(trimmed, maxLength),
  };
}

/**
 * Validate required field
 */
export function validateRequired(value: string | number | boolean, fieldName: string = 'Campo'): ValidationResult {
  if (value === '' || value === null || value === undefined) {
    return {
      isValid: false,
      error: `${fieldName} es obligatorio`,
    };
  }
  
  return {
    isValid: true,
  };
}

/**
 * Validate number range
 */
export function validateNumberRange(
  value: number,
  min: number = -Infinity,
  max: number = Infinity,
  fieldName: string = 'Valor'
): ValidationResult {
  if (isNaN(value)) {
    return {
      isValid: false,
      error: `${fieldName} debe ser un número válido`,
    };
  }
  
  if (value < min) {
    return {
      isValid: false,
      error: `${fieldName} debe ser al menos ${min}`,
    };
  }
  
  if (value > max) {
    return {
      isValid: false,
      error: `${fieldName} no puede ser mayor que ${max}`,
    };
  }
  
  return {
    isValid: true,
  };
}

/**
 * Validate date
 */
export function validateDate(
  dateString: string,
  minDate?: Date,
  maxDate?: Date
): ValidationResult {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: 'Fecha inválida',
    };
  }
  
  if (minDate && date < minDate) {
    return {
      isValid: false,
      error: `La fecha no puede ser anterior a ${minDate.toLocaleDateString()}`,
    };
  }
  
  if (maxDate && date > maxDate) {
    return {
      isValid: false,
      error: `La fecha no puede ser posterior a ${maxDate.toLocaleDateString()}`,
    };
  }
  
  return {
    isValid: true,
    sanitized: dateString,
  };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (password.length < 8) {
    return {
      isValid: false,
      error: 'La contraseña debe tener al menos 8 caracteres',
    };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'La contraseña debe contener al menos una letra mayúscula',
    };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'La contraseña debe contener al menos una letra minúscula',
    };
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      error: 'La contraseña debe contener al menos un número',
    };
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return {
      isValid: false,
      error: 'La contraseña debe contener al menos un carácter especial',
    };
  }
  
  return {
    isValid: true,
  };
}

/**
 * Validate Colombian ID number (Cédula)
 */
export function validateColombianId(id: string): ValidationResult {
  const sanitized = id.replace(/[^\d]/g, '');
  
  if (sanitized.length < 6 || sanitized.length > 10) {
    return {
      isValid: false,
      error: 'Número de cédula inválido (6-10 dígitos)',
    };
  }
  
  return {
    isValid: true,
    sanitized,
  };
}

/**
 * Batch validation helper
 * Validates multiple fields at once and returns all errors
 */
export function validateFields(validations: Record<string, () => ValidationResult>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  let isValid = true;
  
  for (const [field, validator] of Object.entries(validations)) {
    const result = validator();
    if (!result.isValid && result.error) {
      errors[field] = result.error;
      isValid = false;
    }
  }
  
  return { isValid, errors };
}

/**
 * Sanitize HTML content for display
 * Use this for user-generated content that needs to be displayed
 */
export function sanitizeForDisplay(html: string): string {
  return sanitizeHtml(html);
}

/**
 * Common regex patterns
 */
export const PATTERNS = {
  EMAIL: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
  PHONE_COLOMBIAN: /^(\+?57)?3\d{9}$/,
  // Fixed: Removed nested quantifier to prevent ReDoS - changed ([\/\w \.-]*)* to [\/\w \.-]*
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)\/?$/,
  NUMERIC: /^\d+$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHA: /^[a-zA-Z]+$/,
};

/**
 * Error messages in Spanish
 */
export const ERROR_MESSAGES = {
  REQUIRED: 'Este campo es obligatorio',
  INVALID_EMAIL: 'Correo electrónico inválido',
  INVALID_PHONE: 'Número de teléfono inválido',
  INVALID_URL: 'URL inválida',
  TOO_SHORT: 'El valor es demasiado corto',
  TOO_LONG: 'El valor es demasiado largo',
  INVALID_FORMAT: 'Formato inválido',
  PASSWORDS_DONT_MATCH: 'Las contraseñas no coinciden',
  WEAK_PASSWORD: 'La contraseña es demasiado débil',
};

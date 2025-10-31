/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * API Input Sanitization Middleware
 * Automatically sanitizes request bodies before processing
 * 
 * SECURITY: Use this on ALL API routes that accept user input
 */

import { sanitizeHtml, sanitizeText, sanitizeEmail, sanitizePhone, sanitizeUrl } from './input-sanitization';

export interface SanitizationRules {
  [key: string]: 'html' | 'text' | 'email' | 'phone' | 'url' | 'none' | SanitizationRules;
}

/**
 * Sanitize request body based on provided rules
 * 
 * @param body - Request body to sanitize
 * @param rules - Sanitization rules for each field
 * @returns Sanitized body
 * 
 * @example
 * ```typescript
 * const rules = {
 *   title: 'text',
 *   description: 'html',
 *   email: 'email',
 *   phone: 'phone',
 *   website: 'url',
 *   metadata: {
 *     author: 'text',
 *     tags: 'text'
 *   }
 * };
 * 
 * const sanitized = sanitizeRequestBody(body, rules);
 * ```
 */
export function sanitizeRequestBody<T extends Record<string, any>>(
  body: T,
  rules: SanitizationRules
): T {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(body)) {
    const rule = rules[key];

    if (!rule || rule === 'none') {
      // No sanitization rule, keep as is
      sanitized[key] = value;
      continue;
    }

    if (typeof rule === 'object') {
      // Nested object, sanitize recursively
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeRequestBody(value, rule);
      } else {
        sanitized[key] = value;
      }
      continue;
    }

    // Apply sanitization based on rule type
    if (typeof value === 'string') {
      switch (rule) {
        case 'html':
          sanitized[key] = sanitizeHtml(value, false); // Escape all HTML
          break;
        case 'text':
          sanitized[key] = sanitizeText(value);
          break;
        case 'email':
          sanitized[key] = sanitizeEmail(value);
          break;
        case 'phone':
          sanitized[key] = sanitizePhone(value);
          break;
        case 'url':
          sanitized[key] = sanitizeUrl(value);
          break;
        default:
          sanitized[key] = value;
      }
    } else if (Array.isArray(value)) {
      // Sanitize arrays
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeText(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Middleware wrapper for API routes
 * Automatically sanitizes request body
 * 
 * @example
 * ```typescript
 * async function handler(request: NextRequest) {
 *   const body = await request.json();
 *   const sanitized = sanitizeApiInput(body, {
 *     title: 'text',
 *     description: 'html',
 *     email: 'email'
 *   });
 *   // Use sanitized data...
 * }
 * ```
 */
export function sanitizeApiInput<T extends Record<string, any>>(
  body: T,
  rules: SanitizationRules
): T {
  console.log('[Security] Sanitizing API input...');
  
  try {
    const sanitized = sanitizeRequestBody(body, rules);
    console.log('[Security] ✓ Input sanitized successfully');
    return sanitized;
  } catch (error) {
    console.error('[Security] ✗ Error sanitizing input:', error);
    // Return original body if sanitization fails (logged for investigation)
    return body;
  }
}

/**
 * Common sanitization rules for typical API endpoints
 */
export const CommonSanitizationRules = {
  // User profile
  userProfile: {
    firstName: 'text',
    lastName: 'text',
    email: 'email',
    phone: 'phone',
    bio: 'html',
    website: 'url',
  },

  // Event/Post creation
  content: {
    title: 'text',
    description: 'html',
    content: 'html',
    author: 'text',
    tags: 'text',
  },

  // Communication/Messages
  communication: {
    type: 'text',
    message: 'html',
    notes: 'html',
    subject: 'text',
  },

  // Membership application
  membershipApplication: {
    firstName: 'text',
    lastName: 'text',
    email: 'email',
    phone: 'phone',
    address: 'text',
    city: 'text',
    state: 'text',
    zipCode: 'text',
    motorcycleInfo: {
      brand: 'text',
      model: 'text',
      year: 'text',
    },
    experience: 'html',
    reason: 'html',
  },
} as const;

/**
 * Validate that sanitization didn't remove critical data
 * Useful for catching injection attempts
 */
export function validateSanitization(
  original: string,
  sanitized: string,
  maxDifference: number = 0.3
): { valid: boolean; suspiciousActivity: boolean } {
  // If sanitization removed more than 30% of content, might be injection attempt
  const originalLength = original.length;
  const sanitizedLength = sanitized.length;
  
  if (originalLength === 0) {
    return { valid: true, suspiciousActivity: false };
  }

  const difference = (originalLength - sanitizedLength) / originalLength;
  
  return {
    valid: sanitizedLength > 0,
    suspiciousActivity: difference > maxDifference,
  };
}

/**
 * Log suspicious sanitization activity
 * Helps detect injection attempts
 */
export function logSuspiciousActivity(
  endpoint: string,
  field: string,
  original: string,
  sanitized: string
): void {
  console.warn('[Security Alert] Suspicious activity detected:', {
    endpoint,
    field,
    originalLength: original.length,
    sanitizedLength: sanitized.length,
    removed: original.length - sanitized.length,
    sample: original.substring(0, 100), // First 100 chars for investigation
    timestamp: new Date().toISOString(),
  });

  // TODO: Send to security monitoring service (e.g., Sentry, LogRocket)
}

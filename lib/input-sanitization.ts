/**
 * Input Sanitization Utilities
 * Prevents XSS attacks by sanitizing user input
 * 
 * SECURITY: Use these functions on ALL user-generated content before:
 * - Displaying in the UI
 * - Storing in the database
 * - Sending to APIs
 */

/**
 * Sanitize HTML string to prevent XSS attacks
 * Removes or encodes dangerous HTML/JavaScript
 * 
 * @param dirty - Potentially unsafe HTML string
 * @param allowBasicFormatting - If true, allows safe HTML tags (b, i, p, br, etc.)
 * @returns Sanitized string safe for display
 */
export function sanitizeHtml(dirty: string, allowBasicFormatting: boolean = false): string {
  if (typeof dirty !== 'string') return '';

  // If no formatting allowed, escape everything
  if (!allowBasicFormatting) {
    return dirty
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // If basic formatting is allowed, use whitelist approach
  // Remove dangerous tags and attributes but keep safe ones
  let sanitized = dirty;
  let previous: string;
  let iterations = 0;
  const MAX_ITERATIONS = 10;

  // Apply replacements repeatedly to handle nested tags and malformed closing tags
  do {
    previous = sanitized;
    
    // 1. Remove script tags and their content (handles malformed closing tags like </script foo="bar">)
    sanitized = sanitized
      .replace(/<script[\s\S]*?<\/script[^>]*>/gi, '') // Full script blocks
      .replace(/<script[^>]*>/gi, '') // Opening tags
      .replace(/<\/script[^>]*>/gi, ''); // Closing tags with attributes

    // 2. Remove style tags and their content (handles malformed closing tags)
    sanitized = sanitized
      .replace(/<style[\s\S]*?<\/style[^>]*>/gi, '') // Full style blocks
      .replace(/<style[^>]*>/gi, '') // Opening tags
      .replace(/<\/style[^>]*>/gi, ''); // Closing tags with attributes

    // 3. Remove iframe, object, embed tags (with malformed closing tags)
    sanitized = sanitized
      .replace(/<iframe[\s\S]*?<\/iframe[^>]*>/gi, '')
      .replace(/<iframe[^>]*>/gi, '')
      .replace(/<\/iframe[^>]*>/gi, '')
      .replace(/<(object|embed|applet|link|meta|base)[^>]*>/gi, '');
    
    iterations++;
  } while (sanitized !== previous && iterations < MAX_ITERATIONS);

  // 4. Remove all event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  // 5. Remove javascript: and data: protocols
  sanitized = sanitized.replace(/href\s*=\s*["']?javascript:[^"'>]*/gi, 'href="#"');
  sanitized = sanitized.replace(/src\s*=\s*["']?javascript:[^"'>]*/gi, 'src=""');
  sanitized = sanitized.replace(/href\s*=\s*["']?data:[^"'>]*/gi, 'href="#"');
  sanitized = sanitized.replace(/src\s*=\s*["']?data:[^"'>]*/gi, 'src=""');

  // 6. Remove dangerous attributes
  sanitized = sanitized.replace(/\s*(formaction|action)\s*=\s*["'][^"']*["']/gi, '');

  return sanitized;
}

/**
 * Sanitize string for use in URLs
 * Prevents URL-based attacks
 * 
 * @param url - URL to sanitize
 * @returns Safe URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') return '';

  // Allow only http(s) and mailto protocols
  const allowedProtocols = /^(https?:|mailto:|tel:)/i;

  try {
    const parsed = new URL(url, window.location.origin);
    
    if (!allowedProtocols.test(parsed.protocol)) {
      console.warn('Blocked dangerous URL protocol:', parsed.protocol);
      return '';
    }

    return parsed.toString();
  } catch {
    // Relative URL or invalid format
    // Allow if it doesn't start with javascript: or data:
    if (/^(javascript|data|vbscript):/i.test(url)) {
      console.warn('Blocked dangerous URL:', url);
      return '';
    }

    return url;
  }
}

/**
 * Sanitize filename for safe storage/download
 * Prevents directory traversal attacks
 * 
 * @param filename - Filename to sanitize
 * @returns Safe filename
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') return 'file';

  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Remove special chars
    .replace(/\.\.+/g, '.') // Remove directory traversal
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length
}

/**
 * Sanitize JSON string before parsing
 * Prevents JSON injection attacks
 * 
 * @param jsonString - JSON string to sanitize
 * @returns Parsed object or null if invalid
 */
export function sanitizeJson<T>(jsonString: string): T | null {
  if (typeof jsonString !== 'string') return null;

  try {
    // Use JSON.parse with reviver to block dangerous constructors
    return JSON.parse(jsonString, (key, value) => {
      // Block known dangerous patterns
      if (typeof value === 'string') {
        // Block potential code execution
        if (value.includes('__proto__') || value.includes('constructor')) {
          return undefined;
        }
      }
      return value;
    });
  } catch {
    console.error('Invalid JSON string');
    return null;
  }
}

/**
 * Sanitize SQL-like input (for search queries, etc.)
 * Prevents SQL injection if accidentally passed to backend
 * 
 * @param input - User input
 * @returns Sanitized input
 */
export function sanitizeSql(input: string): string {
  if (typeof input !== 'string') return '';

  // Remove or escape SQL special characters
  return input
    .replace(/['";]/g, '') // Remove quotes and semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove multi-line comment start
    .replace(/\*\//g, '') // Remove multi-line comment end
    .replace(/xp_/gi, '') // Remove extended stored procedures
    .replace(/exec\s/gi, '') // Remove EXEC commands
    .replace(/union\s/gi, '') // Remove UNION commands
    .replace(/select\s/gi, '') // Remove SELECT commands
    .replace(/insert\s/gi, '') // Remove INSERT commands
    .replace(/update\s/gi, '') // Remove UPDATE commands
    .replace(/delete\s/gi, '') // Remove DELETE commands
    .replace(/drop\s/gi, '') // Remove DROP commands
    .trim();
}

/**
 * Validate and sanitize email address
 * 
 * @param email - Email address to validate
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';

  const trimmed = email.trim().toLowerCase();
  
  // Basic email regex (RFC 5322 simplified)
  const emailRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

  if (!emailRegex.test(trimmed)) {
    return '';
  }

  return trimmed;
}

/**
 * Validate and sanitize phone number
 * 
 * @param phone - Phone number to validate
 * @returns Sanitized phone number or empty string if invalid
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') return '';

  // Remove all non-numeric characters except + at start
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Must be 10-15 digits (international phone numbers)
  if (cleaned.length < 10 || cleaned.length > 15) {
    return '';
  }

  // Must start with + or digit
  if (!cleaned.match(/^[\d+]/)) {
    return '';
  }

  return cleaned;
}

/**
 * Sanitize user-generated text content
 * Allows basic formatting but removes dangerous content
 * 
 * @param text - Text to sanitize
 * @param maxLength - Maximum allowed length
 * @returns Sanitized text
 */
export function sanitizeText(text: string, maxLength: number = 10000): string {
  if (typeof text !== 'string') return '';

  let sanitized = text.trim().substring(0, maxLength);
  
  // Apply replacements repeatedly until no more matches to prevent nested tag bypass
  // This prevents attacks like: <scrip<script>t>alert()</script>
  let previous: string;
  let iterations = 0;
  const MAX_ITERATIONS = 10; // Prevent infinite loops
  
  do {
    previous = sanitized;
    // Remove dangerous tags - handles malformed closing tags that browsers accept
    // e.g., </script foo="bar"> is valid to browsers even though it's malformed
    sanitized = sanitized
      .replace(/<script[\s\S]*?<\/script[^>]*>/gi, '') // Remove script blocks (handles </script foo="bar">)
      .replace(/<script[^>]*>/gi, '') // Remove opening script tags
      .replace(/<\/script[^>]*>/gi, '') // Remove closing script tags with attributes
      .replace(/<iframe[\s\S]*?<\/iframe[^>]*>/gi, '') // Remove iframe blocks (handles </iframe foo="bar">)
      .replace(/<iframe[^>]*>/gi, '') // Remove opening iframe tags
      .replace(/<\/iframe[^>]*>/gi, '') // Remove closing iframe tags with attributes
      .replace(/javascript\s*:/gi, '') // Remove javascript: protocol (with optional whitespace)
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
    iterations++;
  } while (sanitized !== previous && iterations < MAX_ITERATIONS);
  
  return sanitized;
}

/**
 * Deep sanitize object recursively
 * Applies sanitization to all string values in an object
 * 
 * @param obj - Object to sanitize
 * @param depth - Maximum recursion depth (prevent circular refs)
 * @returns Sanitized object
 */
export function deepSanitize<T>(obj: T, depth: number = 5): T {
  if (depth <= 0) return obj;
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitize(item, depth - 1)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key name
      const safeKey = sanitizeText(key, 100);
      
      if (typeof value === 'string') {
        sanitized[safeKey] = sanitizeText(value);
      } else if (typeof value === 'object') {
        sanitized[safeKey] = deepSanitize(value, depth - 1);
      } else {
        sanitized[safeKey] = value;
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Validate and sanitize form data
 * Common validations for typical form fields
 * 
 * @param data - Form data object
 * @returns Validation result with sanitized data or errors
 */
export function validateFormData<T extends Record<string, any>>(
  data: T,
  rules: Partial<Record<keyof T, (value: any) => { valid: boolean; message?: string; sanitized?: any }>>
): { valid: boolean; data?: T; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const sanitized: any = {};

  for (const [key, value] of Object.entries(data)) {
    const rule = rules[key as keyof T];
    
    if (rule) {
      const result = rule(value);
      if (!result.valid) {
        errors[key] = result.message || 'Invalid value';
      } else {
        sanitized[key] = result.sanitized !== undefined ? result.sanitized : value;
      }
    } else {
      // No rule, just sanitize if string
      sanitized[key] = typeof value === 'string' ? sanitizeText(value) : value;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    data: Object.keys(errors).length === 0 ? sanitized : undefined,
    errors,
  };
}

/**
 * USAGE EXAMPLES:
 * 
 * // 1. Sanitize HTML before rendering
 * const userComment = sanitizeHtml(input);
 * 
 * // 2. Sanitize URL before navigation
 * const safeUrl = sanitizeUrl(userProvidedUrl);
 * if (safeUrl) window.location.href = safeUrl;
 * 
 * // 3. Sanitize filename before download
 * const safeFilename = sanitizeFilename(userFilename);
 * 
 * // 4. Deep sanitize form data
 * const sanitizedFormData = deepSanitize(formData);
 * 
 * // 5. Validate form with rules
 * const validation = validateFormData(formData, {
 *   email: (v) => ({
 *     valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
 *     message: 'Invalid email',
 *     sanitized: sanitizeEmail(v)
 *   }),
 * });
 */

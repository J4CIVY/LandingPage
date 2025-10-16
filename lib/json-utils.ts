/**
 * JSON Utilities with Security
 * Safe JSON parsing that prevents prototype pollution
 */

import { sanitizeJson } from '@/lib/input-sanitization';

/**
 * Safely parse JSON string with fallback
 * Prevents prototype pollution attacks
 * 
 * @param jsonString - JSON string to parse
 * @param fallback - Default value if parsing fails
 * @returns Parsed object or fallback value
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  if (!jsonString || typeof jsonString !== 'string') {
    return fallback;
  }

  try {
    const parsed = sanitizeJson<T>(jsonString);
    return parsed !== null ? parsed : fallback;
  } catch (error) {
    console.warn('Failed to parse JSON safely:', error);
    return fallback;
  }
}

/**
 * Safely parse JSON with type validation
 * 
 * @param jsonString - JSON string to parse
 * @param validator - Type guard function
 * @param fallback - Default value if parsing/validation fails
 * @returns Parsed and validated object or fallback
 */
export function safeJsonParseWithValidation<T>(
  jsonString: string,
  validator: (value: unknown) => value is T,
  fallback: T
): T {
  const parsed = safeJsonParse<unknown>(jsonString, null);
  
  if (parsed === null) {
    return fallback;
  }

  if (validator(parsed)) {
    return parsed;
  }

  console.warn('JSON parsing succeeded but validation failed');
  return fallback;
}

/**
 * Safe JSON stringify (opposite of parse)
 * Handles circular references and errors gracefully
 * 
 * @param value - Value to stringify
 * @param fallback - Fallback string if stringify fails
 * @returns JSON string or fallback
 */
export function safeJsonStringify(value: unknown, fallback: string = '{}'): string {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.warn('Failed to stringify JSON:', error);
    return fallback;
  }
}

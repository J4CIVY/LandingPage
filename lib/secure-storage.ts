/**
 * Secure Storage Utility
 * Provides secure client-side storage with encryption and automatic cleanup
 * 
 * SECURITY PRINCIPLES:
 * 1. Never store sensitive data (passwords, tokens) in localStorage
 * 2. Encrypt sensitive data if absolutely necessary
 * 3. Set expiration times for all stored data
 * 4. Use httpOnly cookies for authentication tokens
 */

import { safeJsonParse } from '@/lib/json-utils';

interface StorageOptions {
  encrypt?: boolean;
  expiresIn?: number; // milliseconds
}

interface StorageItem<T> {
  value: T;
  timestamp: number;
  expiresAt?: number;
}

/**
 * Simple XOR encryption for localStorage (NOT for sensitive data)
 * This is just obfuscation, not real encryption
 * Use only for non-sensitive preferences
 */
function simpleEncrypt(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result);
}

function simpleDecrypt(encrypted: string, key: string): string {
  try {
    const decoded = atob(encrypted);
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch {
    return '';
  }
}

/**
 * Get a simple encryption key based on browser fingerprint
 */
function getEncryptionKey(): string {
  if (typeof window === 'undefined') return 'default-key';
  
  // Simple browser fingerprint (not for real security, just obfuscation)
  const fingerprint = `${navigator.userAgent}${navigator.language}`;
  return fingerprint.slice(0, 16);
}

/**
 * Secure localStorage wrapper with expiration and optional encryption
 */
export class SecureStorage {
  private static KEY_PREFIX = 'bskmt_';

  /**
   * Store data securely in localStorage
   * 
   * @param key - Storage key
   * @param value - Value to store
   * @param options - Storage options (encryption, expiration)
   */
  static set<T>(key: string, value: T, options: StorageOptions = {}): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        expiresAt: options.expiresIn ? Date.now() + options.expiresIn : undefined,
      };

      let serialized = JSON.stringify(item);

      if (options.encrypt) {
        serialized = simpleEncrypt(serialized, getEncryptionKey());
      }

      localStorage.setItem(this.KEY_PREFIX + key, serialized);
      return true;
    } catch (error) {
      console.error('SecureStorage.set error:', error);
      return false;
    }
  }

  /**
   * Retrieve data from localStorage
   * 
   * @param key - Storage key
   * @param encrypted - Whether the data was encrypted
   * @returns Stored value or null if not found/expired
   */
  static get<T>(key: string, encrypted: boolean = false): T | null {
    if (typeof window === 'undefined') return null;

    try {
      let serialized = localStorage.getItem(this.KEY_PREFIX + key);
      if (!serialized) return null;

      if (encrypted) {
        serialized = simpleDecrypt(serialized, getEncryptionKey());
        if (!serialized) return null;
      }

      // SECURITY: Use safeJsonParse to prevent prototype pollution
      const item: StorageItem<T> = safeJsonParse<StorageItem<T>>(serialized, { value: null as any, timestamp: Date.now() });

      // Check expiration
      if (item.expiresAt && Date.now() > item.expiresAt) {
        this.remove(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('SecureStorage.get error:', error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  static remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.KEY_PREFIX + key);
  }

  /**
   * Clear all BSKMT items from localStorage
   */
  static clear(): void {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Clean up expired items
   */
  static cleanupExpired(): void {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.KEY_PREFIX)) {
        try {
          const serialized = localStorage.getItem(key);
          if (!serialized) return;

          // SECURITY: Use safeJsonParse to prevent prototype pollution
          const item: StorageItem<any> = safeJsonParse<StorageItem<any>>(serialized, { value: null, timestamp: Date.now() });
          if (item.expiresAt && Date.now() > item.expiresAt) {
            localStorage.removeItem(key);
          }
        } catch {
          // Invalid format, remove it
          localStorage.removeItem(key);
        }
      }
    });
  }
}

/**
 * Session storage wrapper (cleared when tab closes)
 * Use for temporary data within a session
 */
export class SecureSessionStorage {
  private static KEY_PREFIX = 'bskmt_session_';

  static set<T>(key: string, value: T): boolean {
    if (typeof window === 'undefined') return false;

    try {
      sessionStorage.setItem(this.KEY_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('SecureSessionStorage.set error:', error);
      return false;
    }
  }

  static get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = sessionStorage.getItem(this.KEY_PREFIX + key);
      // SECURITY: Use safeJsonParse to prevent prototype pollution
      return item ? safeJsonParse<T>(item, null as any) : null;
    } catch (error) {
      console.error('SecureSessionStorage.get error:', error);
      return null;
    }
  }

  static remove(key: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(this.KEY_PREFIX + key);
  }

  static clear(): void {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith(this.KEY_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  }
}

/**
 * SECURITY GUIDELINES FOR DATA STORAGE:
 * 
 * ❌ NEVER STORE IN LOCALSTORAGE:
 * - Passwords (even hashed)
 * - Authentication tokens (use httpOnly cookies)
 * - Credit card information
 * - Personal identification numbers
 * - Social security numbers
 * - Any PII (Personally Identifiable Information)
 * 
 * ✅ SAFE TO STORE IN LOCALSTORAGE:
 * - User preferences (theme, language)
 * - UI state (collapsed panels, selected tabs)
 * - Draft form data (non-sensitive fields only)
 * - Cache for non-sensitive API responses
 * - Analytics/tracking IDs (non-personal)
 * 
 * 💡 BEST PRACTICES:
 * - Set expiration times for all stored data
 * - Regularly clean up expired data
 * - Validate data before using it
 * - Handle storage quota exceeded errors
 * - Use sessionStorage for temporary data
 */

// Auto-cleanup on page load
if (typeof window !== 'undefined') {
  SecureStorage.cleanupExpired();
}

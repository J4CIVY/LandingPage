/**
 * Environment Variables Validation
 * Ensures all required environment variables are present and valid
 * 
 * SECURITY: This prevents the application from starting with missing or invalid
 * configuration that could lead to security vulnerabilities.
 */

import { z } from 'zod';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/.+$/;

/**
 * Schema for required environment variables
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required').regex(URL_REGEX, 'MONGODB_URI must be a valid URL'),
  
  // Redis (for rate limiting and caching)
  REDIS_URL: z.string().regex(URL_REGEX, 'REDIS_URL must be a valid URL').optional(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().regex(/^\d+$/, 'REDIS_PORT must be a number').optional(),
  REDIS_PASSWORD: z.string().optional(),

  // JWT Secrets (CRITICAL for authentication)
  JWT_SECRET: z.string()
    .min(32, 'JWT_SECRET must be at least 32 characters for security')
    .refine(
      (val) => val !== 'your-super-secret-jwt-key-here',
      'JWT_SECRET must be changed from default value'
    ),
  JWT_REFRESH_SECRET: z.string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters for security')
    .refine(
      (val) => val !== 'your-super-secret-refresh-key-here',
      'JWT_REFRESH_SECRET must be changed from default value'
    ),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Email Service
  MESSAGEBIRD_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().regex(EMAIL_REGEX, 'EMAIL_FROM must be a valid email').optional(),
  EMAIL_FROM_NAME: z.string().optional(),

  // Cloud Storage
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),

  // reCAPTCHA (Bot protection)
  RECAPTCHA_SECRET_KEY: z.string().min(1, 'RECAPTCHA_SECRET_KEY is required'),
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().min(1, 'NEXT_PUBLIC_RECAPTCHA_SITE_KEY is required'),

  // Payment Gateway (Bold)
  BOLD_API_KEY: z.string().optional(),
  BOLD_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_BOLD_API_KEY: z.string().optional(),
  BOLD_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),

  // Analytics (Optional)
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),

  // Application URL
  NEXT_PUBLIC_APP_URL: z.string()
    .regex(URL_REGEX, 'NEXT_PUBLIC_APP_URL must be a valid URL')
    .default('http://localhost:3000'),

  // API URL
  NEXT_PUBLIC_API_URL: z.string()
    .regex(URL_REGEX, 'NEXT_PUBLIC_API_URL must be a valid URL')
    .optional(),

  // Feature Flags
  ENABLE_ANALYTICS: z.string().transform(val => val === 'true').optional(),
  ENABLE_RATE_LIMITING: z.string().default('true').transform(val => val === 'true'),
  ENABLE_CSRF_PROTECTION: z.string().default('true').transform(val => val === 'true'),

  // Security
  ENCRYPTION_KEY: z.string()
    .min(32, 'ENCRYPTION_KEY must be at least 32 characters')
    .optional(),
});

/**
 * Type for validated environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 * Throws error if validation fails (prevents app from starting with invalid config)
 * 
 * @throws {Error} If environment variables are invalid
 */
export function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(parsed.error.flatten(), null, 2));
    
    throw new Error(
      'Invalid environment variables. Check the logs above for details.'
    );
  }

  return parsed.data;
}

/**
 * Get validated environment variables
 * Call this once at app startup
 */
let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in test environment
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Get safe environment info for client-side display
 * SECURITY: Only returns non-sensitive info
 */
export function getSafeEnvInfo() {
  return {
    nodeEnv: process.env.NODE_ENV,
    isProduction: isProduction(),
    isDevelopment: isDevelopment(),
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    hasCloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
    hasRecaptcha: !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    hasAnalytics: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    hasBold: !!process.env.NEXT_PUBLIC_BOLD_API_KEY,
  };
}

/**
 * Security checklist for production deployment
 * Returns warnings for any security concerns
 */
export function getSecurityChecklist(): {
  passed: boolean;
  warnings: string[];
  critical: string[];
} {
  const warnings: string[] = [];
  const critical: string[] = [];

  // Check if in production mode
  if (!isProduction()) {
    warnings.push('Not running in production mode');
  }

  // Check JWT secrets
  if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-here') {
    critical.push('JWT_SECRET is using default value - CHANGE THIS!');
  }

  if (process.env.JWT_REFRESH_SECRET === 'your-super-secret-refresh-key-here') {
    critical.push('JWT_REFRESH_SECRET is using default value - CHANGE THIS!');
  }

  // Check if secrets are long enough
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    critical.push('JWT_SECRET is too short (minimum 32 characters recommended)');
  }

  // Check HTTPS in production
  if (isProduction() && process.env.NEXT_PUBLIC_APP_URL?.startsWith('http://')) {
    critical.push('Application URL uses HTTP instead of HTTPS in production');
  }

  // Check if reCAPTCHA is configured
  if (!process.env.RECAPTCHA_SECRET_KEY) {
    warnings.push('reCAPTCHA not configured - bot protection disabled');
  }

  // Check if rate limiting is enabled
  if (process.env.ENABLE_RATE_LIMITING === 'false') {
    warnings.push('Rate limiting is disabled');
  }

  // Check if CSRF protection is enabled
  if (process.env.ENABLE_CSRF_PROTECTION === 'false') {
    warnings.push('CSRF protection is disabled');
  }

  // Check if Redis is configured for distributed rate limiting
  if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
    warnings.push('Redis not configured - using in-memory rate limiting (not suitable for multi-instance deployments)');
  }

  return {
    passed: critical.length === 0,
    warnings,
    critical,
  };
}

/**
 * Log security checklist on startup (development only)
 */
export function logSecurityChecklist(): void {
  if (isProduction()) return; // Don't log in production

  const checklist = getSecurityChecklist();

  console.log('\n🔒 Security Checklist:');
  
  if (checklist.critical.length > 0) {
    console.error('\n❌ CRITICAL SECURITY ISSUES:');
    checklist.critical.forEach(issue => console.error(`  - ${issue}`));
  }

  if (checklist.warnings.length > 0) {
    console.warn('\n⚠️  Security Warnings:');
    checklist.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  if (checklist.passed && checklist.warnings.length === 0) {
    console.log('\n✅ All security checks passed!\n');
  } else {
    console.log('');
  }
}

// NOTE: Manual initialization required
// Call validateEnv() or getEnv() at app startup to validate environment variables

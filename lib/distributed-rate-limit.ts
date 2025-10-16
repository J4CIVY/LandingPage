/**
 * Enhanced Distributed Rate Limiting with Redis
 * Implements multi-factor rate limiting: IP + User ID + Device Fingerprint
 * Falls back to in-memory rate limiting in development
 */

import { NextRequest } from 'next/server';
import { getRateLimiter } from './redis-client';
import crypto from 'crypto';

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
  keyPrefix: string;
  skipSuccessfulAuth?: boolean; // Reset counter after successful auth
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Generate device fingerprint from request headers
 */
function getDeviceFingerprint(request: NextRequest): string {
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  
  const fingerprint = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;
  return crypto.createHash('sha256').update(fingerprint).digest('hex').substring(0, 16);
}

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Multi-factor rate limiting key generator
 * Combines IP, user ID, and device fingerprint for robust protection
 */
function generateRateLimitKey(
  request: NextRequest,
  keyPrefix: string,
  userId?: string
): string {
  const ip = getClientIP(request);
  const fingerprint = getDeviceFingerprint(request);
  
  // Primary key: IP + fingerprint (prevents simple IP rotation)
  const primaryKey = `${keyPrefix}:${ip}:${fingerprint}`;
  
  // If user authenticated, add user-specific key
  if (userId) {
    return `${primaryKey}:user:${userId}`;
  }
  
  return primaryKey;
}

/**
 * Check and enforce rate limit
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  userId?: string
): Promise<RateLimitResult> {
  const limiter = getRateLimiter();
  const key = generateRateLimitKey(request, config.keyPrefix, userId);

  try {
    // Get current count
    const currentCount = await limiter.incr(key);

    // Set expiry on first request
    if (currentCount === 1) {
      await limiter.expire(key, config.windowSeconds);
    }

    // Get TTL for reset time
    const ttl = await limiter.ttl(key);
    const resetTime = Date.now() + (ttl * 1000);

    // Check if limit exceeded
    if (currentCount > config.maxRequests) {
      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        reset: resetTime,
        retryAfter: ttl,
      };
    }

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - currentCount,
      reset: resetTime,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open for availability (allow request on error)
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: Date.now() + (config.windowSeconds * 1000),
    };
  }
}

/**
 * Reset rate limit for a specific key (after successful auth)
 */
export async function resetRateLimit(
  request: NextRequest,
  keyPrefix: string,
  userId?: string
): Promise<void> {
  const limiter = getRateLimiter();
  const key = generateRateLimitKey(request, keyPrefix, userId);
  
  try {
    await limiter.del(key);
  } catch (error) {
    console.error('Error resetting rate limit:', error);
  }
}

/**
 * Predefined rate limit configurations
 */
export const RateLimitPresets = {
  LOGIN: {
    maxRequests: 5,
    windowSeconds: 900, // 15 minutes
    keyPrefix: 'ratelimit:login',
    skipSuccessfulAuth: true,
  },
  REGISTER: {
    maxRequests: 3,
    windowSeconds: 3600, // 1 hour
    keyPrefix: 'ratelimit:register',
  },
  API: {
    maxRequests: 100,
    windowSeconds: 60, // 1 minute
    keyPrefix: 'ratelimit:api',
  },
  UPLOAD: {
    maxRequests: 10,
    windowSeconds: 300, // 5 minutes
    keyPrefix: 'ratelimit:upload',
  },
  PASSWORD_RESET: {
    maxRequests: 3,
    windowSeconds: 3600, // 1 hour
    keyPrefix: 'ratelimit:password-reset',
  },
  EMAIL_VERIFICATION: {
    maxRequests: 5,
    windowSeconds: 3600, // 1 hour
    keyPrefix: 'ratelimit:email-verify',
  },
} as const;

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult
): void {
  headers.set('X-RateLimit-Limit', String(result.limit));
  headers.set('X-RateLimit-Remaining', String(result.remaining));
  headers.set('X-RateLimit-Reset', String(result.reset));
  
  if (result.retryAfter !== undefined) {
    headers.set('Retry-After', String(result.retryAfter));
  }
}

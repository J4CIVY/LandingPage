/**
 * IP Reputation Service v2.5.0
 * 
 * Integrates with AbuseIPDB to check IP reputation and block malicious traffic.
 * 
 * Features:
 * - IP reputation scoring (0-100, higher = more malicious)
 * - Caching to reduce API calls (24h TTL)
 * - Configurable abuse thresholds
 * - Whitelist support for trusted IPs
 * - Rate limit protection (max 1000 requests/day free tier)
 * 
 * Setup:
 * 1. Sign up at https://www.abuseipdb.com/
 * 2. Get API key from https://www.abuseipdb.com/account/api
 * 3. Add to .env.local: ABUSEIPDB_API_KEY=your_key_here
 */

import { getRedisClient } from './redis-client';
import { safeJsonParse } from './json-utils';

export interface IPReputationResult {
  ip: string;
  abuseConfidenceScore: number;
  isWhitelisted: boolean;
  totalReports: number;
  lastReportedAt: string | null;
  isBlocked: boolean;
  blockReason?: string;
  usageType?: string;
  countryCode?: string;
  isp?: string;
}

export interface AbuseIPDBResponse {
  data: {
    ipAddress: string;
    isPublic: boolean;
    ipVersion: number;
    isWhitelisted: boolean;
    abuseConfidenceScore: number;
    countryCode: string;
    usageType: string;
    isp: string;
    domain: string;
    hostnames: string[];
    totalReports: number;
    numDistinctUsers: number;
    lastReportedAt: string | null;
  };
}

/**
 * Check IP reputation using AbuseIPDB API
 * @param ip - IP address to check
 * @param maxAgeInDays - Maximum age of reports to consider (default: 90 days)
 * @returns IP reputation result
 */
export async function checkIPReputation(
  ip: string,
  maxAgeInDays: number = 90
): Promise<IPReputationResult> {
  const redis = getRedisClient();
  const apiKey = process.env.ABUSEIPDB_API_KEY;

  // Skip check if API key not configured
  if (!apiKey) {
    console.warn('[IP Reputation] AbuseIPDB API key not configured, skipping check');
    return {
      ip,
      abuseConfidenceScore: 0,
      isWhitelisted: false,
      totalReports: 0,
      lastReportedAt: null,
      isBlocked: false,
    };
  }

  // Check if IP is in trusted whitelist
  if (isTrustedIP(ip)) {
    return {
      ip,
      abuseConfidenceScore: 0,
      isWhitelisted: true,
      totalReports: 0,
      lastReportedAt: null,
      isBlocked: false,
    };
  }

  // Check Redis cache first (24h TTL)
  const cacheKey = `ip:reputation:${ip}`;
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`[IP Reputation] Cache hit for ${ip}`);
      return safeJsonParse<IPReputationResult>(cached, {
        ip,
        abuseConfidenceScore: 0,
        isWhitelisted: false,
        totalReports: 0,
        lastReportedAt: null,
        isBlocked: false,
      });
    }
  }

  try {
    // Call AbuseIPDB API
    const response = await fetch(
      `https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=${maxAgeInDays}&verbose`,
      {
        headers: {
          'Key': apiKey,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[IP Reputation] AbuseIPDB API error:', response.status, errorText);
      
      // Return safe default on API error
      return {
        ip,
        abuseConfidenceScore: 0,
        isWhitelisted: false,
        totalReports: 0,
        lastReportedAt: null,
        isBlocked: false,
      };
    }

    const data: AbuseIPDBResponse = await response.json();
    const ipData = data.data;

    // Determine if IP should be blocked
    const isBlocked = shouldBlockIP(ipData.abuseConfidenceScore, ipData.totalReports);

    const result: IPReputationResult = {
      ip: ipData.ipAddress,
      abuseConfidenceScore: ipData.abuseConfidenceScore,
      isWhitelisted: ipData.isWhitelisted,
      totalReports: ipData.totalReports,
      lastReportedAt: ipData.lastReportedAt,
      usageType: ipData.usageType,
      countryCode: ipData.countryCode,
      isp: ipData.isp,
      isBlocked,
      blockReason: isBlocked ? `IP tiene ${ipData.abuseConfidenceScore}% de confianza de abuso con ${ipData.totalReports} reportes` : undefined,
    };

    // Cache result for 24 hours
    if (redis) {
      await redis.setex(cacheKey, 86400, JSON.stringify(result));
    }

    console.log(`[IP Reputation] ${ip}: Score=${ipData.abuseConfidenceScore}, Reports=${ipData.totalReports}, Blocked=${isBlocked}`);

    return result;
  } catch (error) {
    console.error('[IP Reputation] Error checking IP:', error);
    
    // Return safe default on error
    return {
      ip,
      abuseConfidenceScore: 0,
      isWhitelisted: false,
      totalReports: 0,
      lastReportedAt: null,
      isBlocked: false,
    };
  }
}

/**
 * Determine if IP should be blocked based on abuse score and reports
 * @param abuseScore - Abuse confidence score (0-100)
 * @param totalReports - Total number of abuse reports
 * @returns Whether to block the IP
 */
function shouldBlockIP(abuseScore: number, totalReports: number): boolean {
  // Block if abuse score is high
  if (abuseScore >= 75) return true;
  
  // Block if moderate score with many reports
  if (abuseScore >= 50 && totalReports >= 10) return true;
  
  // Block if low score but massive reports
  if (abuseScore >= 25 && totalReports >= 50) return true;
  
  return false;
}

/**
 * Check if IP is in trusted whitelist
 * @param ip - IP address to check
 * @returns Whether IP is trusted
 */
function isTrustedIP(ip: string): boolean {
  const trustedIPs = [
    '127.0.0.1',
    '::1',
    'localhost',
  ];
  
  // Add custom trusted IPs from environment
  const customTrusted = process.env.TRUSTED_IPS?.split(',') || [];
  
  return trustedIPs.concat(customTrusted).includes(ip);
}

/**
 * Report an IP to AbuseIPDB (optional - use sparingly)
 * @param ip - IP address to report
 * @param categories - Abuse categories (see AbuseIPDB docs)
 * @param comment - Description of the abuse
 */
export async function reportIPAbuse(
  ip: string,
  categories: number[],
  comment: string
): Promise<boolean> {
  const apiKey = process.env.ABUSEIPDB_API_KEY;

  if (!apiKey) {
    console.warn('[IP Reputation] AbuseIPDB API key not configured, cannot report');
    return false;
  }

  try {
    const response = await fetch('https://api.abuseipdb.com/api/v2/report', {
      method: 'POST',
      headers: {
        'Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ip,
        categories,
        comment,
      }),
    });

    if (response.ok) {
      console.log(`[IP Reputation] Successfully reported ${ip}`);
      return true;
    } else {
      const errorText = await response.text();
      console.error('[IP Reputation] Error reporting IP:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('[IP Reputation] Error reporting IP:', error);
    return false;
  }
}

/**
 * Get client IP from NextRequest
 * @param request - NextRequest object
 * @returns Client IP address
 */
export function getClientIP(request: Request): string {
  const headers = request.headers;
  
  // Try various headers (in order of preference)
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  const cfConnectingIP = headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'unknown';
}

/**
 * Middleware-friendly IP reputation check
 * Returns blocking information for easy integration
 */
export async function checkAndBlockMaliciousIP(request: Request): Promise<{
  shouldBlock: boolean;
  reputation: IPReputationResult;
}> {
  const clientIP = getClientIP(request);
  
  if (clientIP === 'unknown') {
    return {
      shouldBlock: false,
      reputation: {
        ip: clientIP,
        abuseConfidenceScore: 0,
        isWhitelisted: false,
        totalReports: 0,
        lastReportedAt: null,
        isBlocked: false,
      },
    };
  }
  
  const reputation = await checkIPReputation(clientIP);
  
  return {
    shouldBlock: reputation.isBlocked,
    reputation,
  };
}

/**
 * AbuseIPDB Category Codes
 * Use these when reporting IPs
 */
export const AbuseCategories = {
  DNS_COMPROMISE: 1,
  DNS_POISONING: 2,
  FRAUD_ORDERS: 3,
  DDOS_ATTACK: 4,
  FTP_BRUTE_FORCE: 5,
  PING_OF_DEATH: 6,
  PHISHING: 7,
  FRAUD_VOIP: 8,
  OPEN_PROXY: 9,
  WEB_SPAM: 10,
  EMAIL_SPAM: 11,
  BLOG_SPAM: 12,
  VPN_IP: 13,
  PORT_SCAN: 14,
  HACKING: 15,
  SQL_INJECTION: 16,
  SPOOFING: 17,
  BRUTE_FORCE: 18,
  BAD_WEB_BOT: 19,
  EXPLOITED_HOST: 20,
  WEB_APP_ATTACK: 21,
  SSH: 22,
  IOT_TARGETED: 23,
} as const;

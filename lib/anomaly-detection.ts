/**
 * Behavioral Anomaly Detection System
 * Detects suspicious user behavior patterns for enhanced security
 * Tracks: login patterns, location changes, device switches, velocity attacks
 */

import { getRateLimiter } from './redis-client';
import { safeJsonParse } from './json-utils';
import crypto from 'crypto';

export interface UserBehaviorEvent {
  userId: string;
  eventType: 'login' | 'failed_login' | 'password_reset' | 'email_change' | 'profile_update' | 'purchase';
  ip: string;
  userAgent: string;
  location?: {
    country?: string;
    city?: string;
  };
  timestamp: number;
}

export interface AnomalyDetectionResult {
  isAnomalous: boolean;
  riskScore: number; // 0-100
  reasons: string[];
  requiresVerification: boolean; // 2FA, email verification, etc.
  shouldBlock: boolean;
}

/**
 * Hash IP for privacy while maintaining uniqueness
 */
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + (process.env.IP_SALT || 'bsk-security-salt')).digest('hex').substring(0, 12);
}

/**
 * Get recent user behavior events from Redis
 */
async function getUserBehaviorHistory(
  userId: string,
  limitEvents: number = 10
): Promise<UserBehaviorEvent[]> {
  const limiter = getRateLimiter();
  const key = `behavior:${userId}`;
  
  try {
    const eventsJson = await limiter.get(key);
    if (!eventsJson) return [];
    
    const events = safeJsonParse<UserBehaviorEvent[]>(eventsJson, []);
    return events.slice(-limitEvents);
  } catch (error) {
    console.error('Error fetching behavior history:', error);
    return [];
  }
}

/**
 * Store user behavior event
 */
async function storeBehaviorEvent(event: UserBehaviorEvent): Promise<void> {
  const limiter = getRateLimiter();
  const key = `behavior:${event.userId}`;
  
  try {
    const history = await getUserBehaviorHistory(event.userId, 50);
    history.push(event);
    
    // Keep only last 50 events
    const trimmedHistory = history.slice(-50);
    
    await limiter.set(key, JSON.stringify(trimmedHistory));
    await limiter.expire(key, 2592000); // 30 days
  } catch (error) {
    console.error('Error storing behavior event:', error);
  }
}

/**
 * Detect impossible travel (login from distant locations in short time)
 */
function detectImpossibleTravel(
  events: UserBehaviorEvent[],
  currentEvent: UserBehaviorEvent
): { detected: boolean; reason?: string } {
  const recentLogins = events
    .filter(e => e.eventType === 'login')
    .filter(e => currentEvent.timestamp - e.timestamp < 3600000); // Last hour

  if (recentLogins.length === 0) return { detected: false };

  const lastLogin = recentLogins[recentLogins.length - 1];
  const ipChanged = hashIP(lastLogin.ip) !== hashIP(currentEvent.ip);
  const timeDiffMinutes = (currentEvent.timestamp - lastLogin.timestamp) / 60000;

  // If IP changed within 5 minutes, likely anomalous
  if (ipChanged && timeDiffMinutes < 5) {
    return {
      detected: true,
      reason: `IP change from ${lastLogin.location?.city || 'unknown'} to ${currentEvent.location?.city || 'unknown'} in ${Math.round(timeDiffMinutes)} minutes`,
    };
  }

  return { detected: false };
}

/**
 * Detect velocity attack (rapid repeated actions)
 */
function detectVelocityAttack(
  events: UserBehaviorEvent[],
  currentEvent: UserBehaviorEvent
): { detected: boolean; reason?: string } {
  const recentEvents = events.filter(
    e => currentEvent.timestamp - e.timestamp < 300000 // Last 5 minutes
  );

  const failedLogins = recentEvents.filter(e => e.eventType === 'failed_login').length;

  if (failedLogins >= 5) {
    return {
      detected: true,
      reason: `${failedLogins} failed login attempts in 5 minutes`,
    };
  }

  // Check for rapid profile changes (account takeover indicator)
  const profileChanges = recentEvents.filter(
    e => e.eventType === 'email_change' || e.eventType === 'password_reset'
  ).length;

  if (profileChanges >= 3) {
    return {
      detected: true,
      reason: `Multiple critical profile changes in 5 minutes`,
    };
  }

  return { detected: false };
}

/**
 * Detect device/browser fingerprint changes
 */
function detectDeviceAnomaly(
  events: UserBehaviorEvent[],
  currentEvent: UserBehaviorEvent
): { detected: boolean; reason?: string } {
  const recentLogins = events
    .filter(e => e.eventType === 'login')
    .slice(-5); // Last 5 logins

  if (recentLogins.length < 3) return { detected: false };

  const userAgents = recentLogins.map(e => e.userAgent);
  const currentUA = currentEvent.userAgent;

  // If current UA is completely different from recent patterns
  const knownUA = userAgents.some(ua => 
    ua.includes(currentUA.split('/')[0]) || currentUA.includes(ua.split('/')[0])
  );

  if (!knownUA) {
    return {
      detected: true,
      reason: 'Login from unrecognized device/browser',
    };
  }

  return { detected: false };
}

/**
 * Calculate risk score based on anomalies
 */
function calculateRiskScore(anomalies: Array<{ detected: boolean; reason?: string }>): {
  score: number;
  reasons: string[];
} {
  let score = 0;
  const reasons: string[] = [];

  anomalies.forEach((anomaly, index) => {
    if (anomaly.detected) {
      // Impossible travel = 40 points
      // Velocity attack = 50 points
      // Device anomaly = 30 points
      const weights = [40, 50, 30];
      score += weights[index] || 20;
      if (anomaly.reason) reasons.push(anomaly.reason);
    }
  });

  return { score: Math.min(score, 100), reasons };
}

/**
 * Main anomaly detection function
 */
export async function detectBehaviorAnomaly(
  event: UserBehaviorEvent
): Promise<AnomalyDetectionResult> {
  // Store the event first
  await storeBehaviorEvent(event);

  // Get recent behavior history
  const history = await getUserBehaviorHistory(event.userId, 20);

  // Run detection algorithms
  const impossibleTravel = detectImpossibleTravel(history, event);
  const velocityAttack = detectVelocityAttack(history, event);
  const deviceAnomaly = detectDeviceAnomaly(history, event);

  // Calculate risk
  const { score, reasons } = calculateRiskScore([
    impossibleTravel,
    velocityAttack,
    deviceAnomaly,
  ]);

  // Determine response level
  const isAnomalous = score > 0;
  const requiresVerification = score >= 40; // Medium risk
  const shouldBlock = score >= 70; // High risk

  return {
    isAnomalous,
    riskScore: score,
    reasons,
    requiresVerification,
    shouldBlock,
  };
}

/**
 * Track failed login attempt
 */
export async function trackFailedLogin(
  userId: string,
  ip: string,
  userAgent: string
): Promise<void> {
  await storeBehaviorEvent({
    userId,
    eventType: 'failed_login',
    ip,
    userAgent,
    timestamp: Date.now(),
  });
}

/**
 * Track successful login with anomaly detection
 */
export async function trackSuccessfulLogin(
  userId: string,
  ip: string,
  userAgent: string,
  location?: { country?: string; city?: string }
): Promise<AnomalyDetectionResult> {
  return await detectBehaviorAnomaly({
    userId,
    eventType: 'login',
    ip,
    userAgent,
    location,
    timestamp: Date.now(),
  });
}

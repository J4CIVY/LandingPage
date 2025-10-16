/**
 * CAPTCHA Fallback System v2.5.0
 * 
 * Provides visual CAPTCHA challenge as a fallback when reCAPTCHA v3 scores are low (<0.3).
 * This prevents false positives from blocking legitimate users with low scores.
 * 
 * Features:
 * - Simple math challenges (e.g., "What is 5 + 3?")
 * - Time-limited challenges (5 minutes expiration)
 * - Redis-backed storage for distributed systems
 * - Difficulty scaling based on consecutive failures
 */

import { getRedisClient } from './redis-client';
import { safeJsonParse } from './json-utils';

export interface CaptchaChallenge {
  id: string;
  question: string;
  answer: string;
  createdAt: number;
  expiresAt: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface CaptchaChallengePublic {
  id: string;
  question: string;
  expiresAt: number;
}

/**
 * Generate a random math challenge based on difficulty
 */
function generateMathChallenge(difficulty: 'easy' | 'medium' | 'hard'): { question: string; answer: string } {
  const num1 = Math.floor(Math.random() * (difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 50)) + 1;
  const num2 = Math.floor(Math.random() * (difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 50)) + 1;
  
  const operations = difficulty === 'easy' ? ['+', '-'] : difficulty === 'medium' ? ['+', '-', '*'] : ['+', '-', '*', '/'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let question: string;
  let answer: number;
  
  switch (operation) {
    case '+':
      question = `¿Cuánto es ${num1} + ${num2}?`;
      answer = num1 + num2;
      break;
    case '-':
      const larger = Math.max(num1, num2);
      const smaller = Math.min(num1, num2);
      question = `¿Cuánto es ${larger} - ${smaller}?`;
      answer = larger - smaller;
      break;
    case '*':
      const smallNum1 = Math.floor(Math.random() * 10) + 1;
      const smallNum2 = Math.floor(Math.random() * 10) + 1;
      question = `¿Cuánto es ${smallNum1} × ${smallNum2}?`;
      answer = smallNum1 * smallNum2;
      break;
    case '/':
      const divisor = Math.floor(Math.random() * 9) + 2;
      const result = Math.floor(Math.random() * 10) + 1;
      const dividend = divisor * result;
      question = `¿Cuánto es ${dividend} ÷ ${divisor}?`;
      answer = result;
      break;
    default:
      question = `¿Cuánto es ${num1} + ${num2}?`;
      answer = num1 + num2;
  }
  
  return { question, answer: answer.toString() };
}

/**
 * Create a new CAPTCHA challenge
 * @param difficulty - Challenge difficulty level
 * @returns Public challenge (without answer) and challenge ID
 */
export async function createCaptchaChallenge(
  difficulty: 'easy' | 'medium' | 'hard' = 'easy'
): Promise<CaptchaChallengePublic> {
  const redis = getRedisClient();
  
  if (!redis) {
    throw new Error('Redis client not available');
  }
  
  const challengeId = `captcha:${Date.now()}:${Math.random().toString(36).substring(7)}`;
  const { question, answer } = generateMathChallenge(difficulty);
  
  const challenge: CaptchaChallenge = {
    id: challengeId,
    question,
    answer,
    createdAt: Date.now(),
    expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes
    difficulty,
  };
  
  // Store in Redis with 5-minute TTL
  await redis.setex(challengeId, 300, JSON.stringify(challenge));
  
  // Return public challenge (without answer)
  return {
    id: challenge.id,
    question: challenge.question,
    expiresAt: challenge.expiresAt,
  };
}

/**
 * Verify a CAPTCHA challenge answer
 * @param challengeId - Challenge ID
 * @param userAnswer - User's answer
 * @returns Verification result
 */
export async function verifyCaptchaChallenge(
  challengeId: string,
  userAnswer: string
): Promise<{ success: boolean; message: string }> {
  const redis = getRedisClient();
  
  if (!redis) {
    throw new Error('Redis client not available');
  }
  
  // Retrieve challenge from Redis
  const challengeData = await redis.get(challengeId);
  
  if (!challengeData) {
    return {
      success: false,
      message: 'Challenge expirado o no válido. Por favor, solicita uno nuevo.',
    };
  }
  
  const challenge: CaptchaChallenge = safeJsonParse<CaptchaChallenge>(challengeData, {
    id: '',
    question: '',
    answer: '',
    createdAt: 0,
    expiresAt: 0,
    difficulty: 'easy',
  });
  
  if (!challenge.id) {
    return {
      success: false,
      message: 'Challenge corrupto. Por favor, solicita uno nuevo.',
    };
  }
  
  // Check if expired
  if (Date.now() > challenge.expiresAt) {
    await redis.del(challengeId);
    return {
      success: false,
      message: 'Challenge expirado. Por favor, solicita uno nuevo.',
    };
  }
  
  // Verify answer (case-insensitive, trimmed)
  const normalizedUserAnswer = userAnswer.trim().toLowerCase();
  const normalizedCorrectAnswer = challenge.answer.trim().toLowerCase();
  
  if (normalizedUserAnswer === normalizedCorrectAnswer) {
    // Delete challenge after successful verification (one-time use)
    await redis.del(challengeId);
    
    return {
      success: true,
      message: 'CAPTCHA verificado correctamente.',
    };
  } else {
    // Track failed attempts
    const failKey = `${challengeId}:fails`;
    const fails = await redis.incr(failKey);
    await redis.expire(failKey, 300); // 5 minutes
    
    // Delete challenge after 3 failed attempts
    if (fails >= 3) {
      await redis.del(challengeId);
      await redis.del(failKey);
      return {
        success: false,
        message: 'Demasiados intentos fallidos. Por favor, solicita un nuevo challenge.',
      };
    }
    
    return {
      success: false,
      message: `Respuesta incorrecta. Te quedan ${3 - fails} intentos.`,
    };
  }
}

/**
 * Check if user needs CAPTCHA fallback based on reCAPTCHA score
 * @param recaptchaScore - reCAPTCHA v3 score (0.0 - 1.0)
 * @param threshold - Score threshold below which to trigger fallback
 * @returns Whether CAPTCHA fallback is needed
 */
export function needsCaptchaFallback(
  recaptchaScore: number,
  threshold: number = 0.3
): boolean {
  return recaptchaScore < threshold;
}

/**
 * Get difficulty level based on failure count
 * @param failureCount - Number of consecutive failures
 * @returns Appropriate difficulty level
 */
export function getDifficultyLevel(failureCount: number): 'easy' | 'medium' | 'hard' {
  if (failureCount >= 5) return 'hard';
  if (failureCount >= 3) return 'medium';
  return 'easy';
}

/**
 * Track consecutive failures for an IP/user
 */
export async function trackCaptchaFailure(identifier: string): Promise<number> {
  const redis = getRedisClient();
  
  if (!redis) {
    throw new Error('Redis client not available');
  }
  
  const key = `captcha:failures:${identifier}`;
  
  const failures = await redis.incr(key);
  await redis.expire(key, 3600); // Reset after 1 hour
  
  return failures;
}

/**
 * Reset failure count after successful verification
 */
export async function resetCaptchaFailures(identifier: string): Promise<void> {
  const redis = getRedisClient();
  
  if (!redis) {
    throw new Error('Redis client not available');
  }
  
  const key = `captcha:failures:${identifier}`;
  await redis.del(key);
}

/**
 * Get current failure count
 */
export async function getCaptchaFailures(identifier: string): Promise<number> {
  const redis = getRedisClient();
  
  if (!redis) {
    return 0;
  }
  
  const key = `captcha:failures:${identifier}`;
  const failures = await redis.get(key);
  return failures ? parseInt(failures, 10) : 0;
}

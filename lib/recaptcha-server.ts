/**
 * Server-Side reCAPTCHA v3 Verification
 * Verifies reCAPTCHA tokens and returns risk scores
 */

export interface RecaptchaVerifyResult {
  success: boolean;
  score: number; // 0.0 (bot) to 1.0 (human)
  action: string;
  challengeTs: string;
  hostname: string;
  errorCodes?: string[];
}

/**
 * Verify reCAPTCHA token on server side
 * @param token - reCAPTCHA token from client
 * @param expectedAction - Expected action name for security
 * @returns Verification result with bot score
 */
export async function verifyRecaptcha(
  token: string,
  expectedAction?: string
): Promise<RecaptchaVerifyResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.error('reCAPTCHA secret key not configured');
    return {
      success: false,
      score: 0,
      action: '',
      challengeTs: '',
      hostname: '',
      errorCodes: ['missing-secret-key'],
    };
  }

  if (!token) {
    return {
      success: false,
      score: 0,
      action: '',
      challengeTs: '',
      hostname: '',
      errorCodes: ['missing-input-response'],
    };
  }

  try {
    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();

    // Validate action if provided
    if (expectedAction && data.action !== expectedAction) {
      return {
        success: false,
        score: 0,
        action: data.action || '',
        challengeTs: data.challenge_ts || '',
        hostname: data.hostname || '',
        errorCodes: ['action-mismatch'],
      };
    }

    return {
      success: data.success,
      score: data.score || 0,
      action: data.action || '',
      challengeTs: data.challenge_ts || '',
      hostname: data.hostname || '',
      errorCodes: data['error-codes'],
    };
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return {
      success: false,
      score: 0,
      action: '',
      challengeTs: '',
      hostname: '',
      errorCodes: ['network-error'],
    };
  }
}

/**
 * Check if reCAPTCHA score indicates likely human
 * @param score - Score from 0.0 (bot) to 1.0 (human)
 * @param threshold - Minimum acceptable score (default 0.5)
 * @returns Whether user is likely human
 */
export function isLikelyHuman(score: number, threshold: number = 0.5): boolean {
  return score >= threshold;
}

/**
 * Get risk level based on reCAPTCHA score
 */
export function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 0.7) return 'low';
  if (score >= 0.5) return 'medium';
  if (score >= 0.3) return 'high';
  return 'critical';
}

/**
 * reCAPTCHA score thresholds for different actions
 */
export const RecaptchaThresholds = {
  LOGIN: 0.5, // Moderate - allow some flexibility for legitimate users
  REGISTER: 0.6, // Higher - prevent fake account creation
  PASSWORD_RESET: 0.4, // Lower - don't block legitimate password recovery
  CONTACT_FORM: 0.5, // Moderate
  COMMENT_SUBMIT: 0.6, // Higher - prevent spam
  PROFILE_UPDATE: 0.4, // Lower - legitimate users may have lower scores on complex forms
} as const;

import { NextRequest, NextResponse } from 'next/server';
import {
  createCaptchaChallenge,
  verifyCaptchaChallenge,
  getDifficultyLevel,
  getCaptchaFailures,
  resetCaptchaFailures,
} from '@/lib/captcha-fallback';

/**
 * POST /api/captcha/challenge
 * Create a new CAPTCHA fallback challenge
 */
export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') || 'unknown';
    
    // Get current failure count to determine difficulty
    const failures = await getCaptchaFailures(clientIP);
    const difficulty = getDifficultyLevel(failures);
    
    // Create challenge
    const challenge = await createCaptchaChallenge(difficulty);
    
    return NextResponse.json({
      success: true,
      challenge,
      difficulty,
    });
  } catch (error) {
    console.error('[CAPTCHA] Error creating challenge:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear el challenge' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/captcha/challenge
 * Verify a CAPTCHA challenge answer
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { challengeId, answer } = body;
    
    if (!challengeId || !answer) {
      return NextResponse.json(
        { success: false, error: 'Challenge ID y respuesta son requeridos' },
        { status: 400 }
      );
    }
    
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') || 'unknown';
    
    // Verify challenge
    const result = await verifyCaptchaChallenge(challengeId, answer);
    
    if (result.success) {
      // Reset failure count on success
      await resetCaptchaFailures(clientIP);
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('[CAPTCHA] Error verifying challenge:', error);
    return NextResponse.json(
      { success: false, error: 'Error al verificar el challenge' },
      { status: 500 }
    );
  }
}

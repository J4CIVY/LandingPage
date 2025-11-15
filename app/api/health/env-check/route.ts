import { NextResponse } from 'next/server';

/**
 * Health check endpoint for environment variables
 * Returns status of environment configuration
 * 
 * GET /api/health/env-check
 */
export async function GET() {
  try {
    // Check basic environment variables
    const hasCloudinary = !!process.env.CLOUDINARY_CLOUD_NAME;
    const hasRecaptcha = !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    const hasAnalytics = !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    const hasBold = !!process.env.NEXT_PUBLIC_BOLD_API_KEY;
    const hasJWT = !!process.env.JWT_SECRET;
    
    const valid = hasJWT && hasCloudinary && hasRecaptcha;
    
    return NextResponse.json({
      success: true,
      valid,
      environment: process.env.NODE_ENV,
      services: {
        cloudinary: hasCloudinary,
        recaptcha: hasRecaptcha,
        analytics: hasAnalytics,
        payment: hasBold,
        jwt: hasJWT,
      },
      message: valid 
        ? 'All environment variables configured correctly' 
        : 'Some configuration issues detected'
    });
    
  } catch (error) {
    console.error('Environment check failed:', error);
    
    return NextResponse.json({
      success: false,
      valid: false,
      message: 'Failed to validate environment configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

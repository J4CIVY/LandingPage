import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/env-validation';

/**
 * Health check endpoint for Cloudinary configuration
 * Returns Cloudinary service status
 * 
 * GET /api/health/cloudinary
 */
export async function GET() {
  try {
    const env = getEnv();
    
    const configured = !!(
      env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET
    );
    
    return NextResponse.json({
      success: true,
      configured,
      cloudName: env.CLOUDINARY_CLOUD_NAME || 'not-set',
      message: configured 
        ? 'Cloudinary is configured and ready' 
        : 'Cloudinary credentials missing'
    });
    
  } catch (error) {
    console.error('Cloudinary health check failed:', error);
    
    return NextResponse.json({
      success: false,
      configured: false,
      message: 'Failed to check Cloudinary configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

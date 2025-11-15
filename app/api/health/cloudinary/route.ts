import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Cloudinary configuration
 * Returns Cloudinary service status
 * 
 * GET /api/health/cloudinary
 */
export async function GET() {
  try {
    const configured = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );
    
    return NextResponse.json({
      success: true,
      configured,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'not-set',
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

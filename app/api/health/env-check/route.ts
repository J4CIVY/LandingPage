import { NextRequest, NextResponse } from 'next/server';
import { getSafeEnvInfo, getSecurityChecklist } from '@/lib/env-validation';

/**
 * Health check endpoint for environment variables
 * Returns status of environment configuration
 * 
 * GET /api/health/env-check
 */
export async function GET(request: NextRequest) {
  try {
    // Get safe environment info
    const envInfo = getSafeEnvInfo();
    
    // Get security checklist
    const securityCheck = getSecurityChecklist();
    
    // Determine overall status
    const valid = securityCheck.passed && securityCheck.warnings.length === 0;
    
    return NextResponse.json({
      success: true,
      valid,
      environment: envInfo.nodeEnv,
      services: {
        cloudinary: envInfo.hasCloudinary,
        recaptcha: envInfo.hasRecaptcha,
        analytics: envInfo.hasAnalytics,
        payment: envInfo.hasBold,
      },
      security: {
        passed: securityCheck.passed,
        warnings: securityCheck.warnings.length,
        critical: securityCheck.critical.length,
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

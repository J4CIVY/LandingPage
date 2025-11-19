/**
 * Server Initialization Script
 * Validates environment variables before the server starts
 * 
 * This runs during the build process and on server startup
 */

import { validateEnv, logSecurityChecklist, isDevelopment } from './env-validation';

/**
 * Initialize and validate server environment
 * Throws error if validation fails
 */
export function initializeServer(): void {
  console.log('🚀 Initializing server...');

  try {
    // Validate all required environment variables
    const env = validateEnv();
    console.log('✅ Environment variables validated successfully');

    // Log security checklist in development
    if (isDevelopment()) {
      logSecurityChecklist();
    }

    // Additional server initialization can go here
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
    console.log(`🔗 App URL: ${env.NEXT_PUBLIC_APP_URL}`);
    
  } catch (error) {
    console.error('❌ Server initialization failed:', error);
    
    // In production, we want to fail fast
    // In development, we log the error but allow the server to start
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
}

// Auto-initialize when imported (except in test environment)
if (process.env.NODE_ENV !== 'test') {
  initializeServer();
}

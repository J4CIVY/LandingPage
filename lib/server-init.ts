/**
 * Server Initialization Script
 * Basic environment check before the server starts
 * 
 * This runs during the build process and on server startup
 */

/**
 * Initialize and validate server environment
 */
export function initializeServer(): void {
  console.log('🚀 Initializing server...');

  try {
    // Check critical environment variables
    const requiredVars = ['JWT_SECRET', 'MONGODB_URI'];
    const missing = requiredVars.filter(v => !process.env[v]);
    
    if (missing.length > 0) {
      console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`);
    } else {
      console.log('✅ Critical environment variables present');
    }

    // Additional server initialization can go here
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 App URL: ${process.env.NEXT_PUBLIC_APP_URL || 'not-set'}`);
    
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

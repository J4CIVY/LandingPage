import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

/**
 * Health check endpoint for database connection
 * Returns MongoDB connection status
 * 
 * GET /api/health/database
 */
export async function GET() {
  try {
    // Attempt to connect to database
    await connectDB();
    
    // Check connection state
    const connected = mongoose.connection.readyState === 1;
    
    if (!connected) {
      return NextResponse.json({
        success: false,
        connected: false,
        message: 'Database not connected',
        state: mongoose.connection.readyState
      }, { status: 503 });
    }
    
    // Get database info
    let collectionCount = 0;
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      collectionCount = collections.length;
    }
    
    return NextResponse.json({
      success: true,
      connected: true,
      database: mongoose.connection.name,
      collections: collectionCount,
      host: mongoose.connection.host,
      message: 'Database connection healthy'
    });
    
  } catch (error) {
    console.error('Database health check failed:', error);
    
    return NextResponse.json({
      success: false,
      connected: false,
      message: 'Database health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}

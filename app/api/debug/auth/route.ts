import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/lib/models/User';
import connectDB from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('bsk-access-token')?.value;
    
    console.log('=== DEBUG AUTH ===');
    console.log('Token presente:', !!token);
    console.log('Token valor:', token ? token.substring(0, 20) + '...' : 'No token');
    
    if (!token) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        error: 'No token found'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      console.log('Token decodificado:', decoded);
      
      await connectDB();
      const user = await User.findById(decoded.userId).select('+role');
      
      console.log('Usuario encontrado:', user ? {
        id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        firstName: user.firstName,
        lastName: user.lastName
      } : 'No user found');
      
      return NextResponse.json({
        success: true,
        authenticated: true,
        user: user ? {
          id: user._id,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.role === 'admin' || user.role === 'super-admin'
        } : null
      });
      
    } catch (jwtError) {
      console.log('Error JWT:', jwtError);
      return NextResponse.json({
        success: false,
        authenticated: false,
        error: 'Invalid token'
      });
    }

  } catch (error) {
    console.error('Error en debug de auth:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

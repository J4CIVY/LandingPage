import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Server-side API key (not exposed to client)
const PRIVATE_API_KEY = process.env.API_KEY || '';
const API_BASE_URL = 'https://api.bskmt.com/api/v1';

// CSRF token validation
const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_SECRET = process.env.CSRF_SECRET || 'default-secret-change-in-production';

function generateCSRFToken(): string {
  return Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64');
}

function validateCSRFToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [timestamp] = decoded.split('-');
    const tokenAge = Date.now() - parseInt(timestamp);
    // Token valid for 1 hour
    return tokenAge < 3600000;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const headersList = await headers();
  const csrfToken = headersList.get(CSRF_TOKEN_HEADER);
  
  // Validate CSRF token for sensitive operations
  if (!csrfToken || !validateCSRFToken(csrfToken)) {
    return NextResponse.json(
      { error: 'Invalid or missing CSRF token' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  
  if (!endpoint) {
    return NextResponse.json(
      { error: 'Endpoint parameter required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${PRIVATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('API Proxy Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 API Proxy POST llamado');
  
  const headersList = await headers();
  const csrfToken = headersList.get(CSRF_TOKEN_HEADER);
  
  console.log('🔐 CSRF Token recibido:', csrfToken ? 'Presente' : 'Ausente');
  console.log('🔑 API Key configurada:', PRIVATE_API_KEY ? 'Presente' : 'Ausente');
  
  if (!csrfToken || !validateCSRFToken(csrfToken)) {
    console.log('❌ Token CSRF inválido o ausente');
    return NextResponse.json(
      { error: 'Invalid or missing CSRF token' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  
  console.log('📍 Endpoint solicitado:', endpoint);
  
  if (!endpoint) {
    return NextResponse.json(
      { error: 'Endpoint parameter required' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    console.log('📤 Enviando petición a:', `${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PRIVATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('📥 Respuesta del API:', response.status, response.statusText);
    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('💥 API Proxy Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Generate CSRF token endpoint
export async function PUT() {
  const token = generateCSRFToken();
  
  return NextResponse.json(
    { csrfToken: token },
    {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}

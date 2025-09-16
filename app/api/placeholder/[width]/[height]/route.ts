import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{ width: string; height: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { width, height } = await params;
  
  // Validar parámetros
  const w = parseInt(width);
  const h = parseInt(height);
  
  if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0 || w > 2000 || h > 2000) {
    return NextResponse.json(
      { error: 'Parámetros de dimensiones inválidos' },
      { status: 400 }
    );
  }

  // Crear SVG placeholder
  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <rect width="100%" height="100%" fill="url(#grad)" opacity="0.1"/>
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
        </linearGradient>
      </defs>
      <g transform="translate(${w/2}, ${h/2})">
        <text 
          text-anchor="middle" 
          dominant-baseline="middle" 
          fill="#6b7280" 
          font-family="Arial, sans-serif" 
          font-size="${Math.min(w, h) / 8}"
          font-weight="300"
        >
          ${w} × ${h}
        </text>
      </g>
    </svg>
  `.trim();

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'CDN-Cache-Control': 'public, max-age=31536000, immutable',
      'Vercel-CDN-Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
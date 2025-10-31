import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, validateImageFile } from '@/lib/cloudinary-service';
import { checkRateLimit, RateLimitPresets, addRateLimitHeaders } from '@/lib/distributed-rate-limit';
import { verifyAuth } from '@/lib/auth-utils';
import { detectBehaviorAnomaly } from '@/lib/anomaly-detection';
import { requireCSRFToken } from '@/lib/csrf-protection';
import { sanitizeFilename } from '@/lib/input-sanitization';

export async function POST(request: NextRequest) {
  try {
    // 0. CSRF Protection
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    // 1. Verificar autenticación primero
    const authResult = await verifyAuth(request);
    if (!authResult.success || !authResult.isValid) {
      return NextResponse.json(
        { error: 'No autorizado. Debes iniciar sesión para subir imágenes.' },
        { status: 401 }
      );
    }

    // 2. Enhanced Rate Limiting con device fingerprint
    const rateLimitResult = await checkRateLimit(
      request, 
      RateLimitPresets.UPLOAD,
      authResult.user?.id // Include user ID in rate limit key
    );
    
    if (!rateLimitResult.success) {
      const response = NextResponse.json(
        { error: `Demasiadas subidas. Espera ${Math.ceil((rateLimitResult.retryAfter || 0) / 60)} minutos.` },
        { status: 429 }
      );
      addRateLimitHeaders(response.headers, rateLimitResult);
      return response;
    }

    // 3. Anomaly Detection for mass upload attempts
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    const anomalyResult = await detectBehaviorAnomaly({
      userId: authResult.user!.id,
      eventType: 'profile_update', // Track uploads as profile updates for anomaly detection
      ip: clientIP,
      userAgent,
      timestamp: Date.now()
    });

    if (anomalyResult.shouldBlock) {
      return NextResponse.json(
        { 
          error: 'Actividad sospechosa detectada. Por seguridad, esta acción ha sido bloqueada.',
          details: anomalyResult.reasons 
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'user-profiles';
    const rawPublicId = formData.get('publicId') as string || undefined;
    const preserveOriginalSize = formData.get('preserveOriginalSize') === 'true';

    // SECURITY: Sanitize publicId to prevent directory traversal attacks
    const publicId = rawPublicId ? sanitizeFilename(rawPublicId) : undefined;

    // SECURITY FIX: Sanitize and validate folder path to prevent path traversal
    // Apply repeatedly to prevent nested patterns like "...." becoming ".."
    let sanitizedFolder = folder;
    let previous: string;
    let iterations = 0;
    const MAX_ITERATIONS = 10;
    
    do {
      previous = sanitizedFolder;
      sanitizedFolder = sanitizedFolder
        .replace(/\.\./g, '') // Remove directory traversal patterns
        .replace(/[^a-zA-Z0-9_\-/]/g, ''); // Only allow safe characters
      iterations++;
    } while (sanitizedFolder !== previous && iterations < MAX_ITERATIONS);
    
    sanitizedFolder = sanitizedFolder.substring(0, 100);
    
    const allowedFolders = ['user-profiles', 'events', 'products', 'documents', 'gallery'];
    const isValidFolder = allowedFolders.some(allowed => sanitizedFolder.startsWith(allowed));
    
    if (!isValidFolder) {
      return NextResponse.json(
        { error: 'Carpeta de destino no válida' },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: 'No se ha proporcionado ningún archivo' },
        { status: 400 }
      );
    }

    // SECURITY: Sanitize the original filename to prevent path traversal
    const sanitizedFilename = sanitizeFilename(file.name);
    
    // Validar el archivo (now async with magic byte checking)
    const validation = await validateImageFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // SECURITY: Additional file extension validation
    const fileExtension = sanitizedFilename.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Extensión de archivo no válida. Solo se permiten: JPG, PNG, WebP' },
        { status: 400 }
      );
    }

    // Convertir archivo a base64
    const base64File = await fileToBase64(file);

    // Subir a Cloudinary
    const result = await uploadToCloudinary(base64File, sanitizedFolder, publicId, preserveOriginalSize);

    const response = NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      }
    });

    // Add rate limit headers to response
    addRateLimitHeaders(response.headers, rateLimitResult);
    
    return response;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error uploading image:', error);

    // Error de rate limiting
    if (error.message && error.message.includes('Rate limit exceeded')) {
      return NextResponse.json(
        { error: 'Demasiadas subidas. Espera un momento antes de intentar de nuevo.' },
        { status: 429 }
      );
    }

    // Error de Cloudinary
    if (error.message && error.message.includes('Cloudinary')) {
      return NextResponse.json(
        { error: 'Error al procesar la imagen. Inténtalo de nuevo.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función auxiliar para convertir File a base64 (versión servidor)
async function fileToBase64(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString('base64');
  return `data:${file.type};base64,${base64}`;
}
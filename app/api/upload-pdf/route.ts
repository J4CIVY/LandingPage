import { NextRequest, NextResponse } from 'next/server';
import { uploadPdfToCloudinary, validatePdfFile } from '@/lib/cloudinary-service';
import { rateLimit } from '@/utils/rateLimit';
import { requireCSRFToken } from '@/lib/csrf-protection';
import { sanitizeFilename } from '@/lib/input-sanitization';

// Configurar rate limiting para subida de PDFs
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 500, // Máximo 500 IPs únicas por minuto
});

export async function POST(request: NextRequest) {
  try {
    // 0. CSRF Protection
    const csrfError = requireCSRFToken(request);
    if (csrfError) return csrfError;

    // Obtener IP del cliente
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'anonymous';

    // Aplicar rate limiting - máximo 2 subidas por minuto por IP (más restrictivo que imágenes)
    await limiter.check(clientIP, 2);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'documents';
    const rawPublicId = formData.get('publicId') as string || undefined;

    // SECURITY: Sanitize publicId to prevent directory traversal attacks
    const publicId = rawPublicId ? sanitizeFilename(rawPublicId) : undefined;

    if (!file) {
      return NextResponse.json(
        { error: 'No se ha proporcionado ningún archivo' },
        { status: 400 }
      );
    }

    // SECURITY: Sanitize the original filename to prevent path traversal
    const sanitizedFilename = sanitizeFilename(file.name);

    // Validar el archivo PDF (now async with magic byte checking)
    const validation = await validatePdfFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // SECURITY: Additional file extension validation
    const fileExtension = sanitizedFilename.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'pdf') {
      return NextResponse.json(
        { error: 'Extensión de archivo no válida. Solo se permiten archivos PDF' },
        { status: 400 }
      );
    }

    // Convertir archivo a base64
    const base64File = await fileToBase64(file);

    // Subir a Cloudinary
    const result = await uploadPdfToCloudinary(base64File, folder, publicId);

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
        pages: result.pages
      }
    });

  } catch (error: any) {
    console.error('Error uploading PDF:', error);

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
        { error: 'Error al procesar el archivo. Inténtalo de nuevo.' },
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
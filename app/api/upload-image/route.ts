import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, validateImageFile } from '@/lib/cloudinary-service';
import { rateLimit } from '@/utils/rateLimit';

// Configurar rate limiting para subida de imágenes
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 500, // Máximo 500 IPs únicas por minuto
});

export async function POST(request: NextRequest) {
  try {
    // Obtener IP del cliente
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'anonymous';

    // Aplicar rate limiting - máximo 3 subidas por minuto por IP
    await limiter.check(clientIP, 3);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'user-profiles';
    const publicId = formData.get('publicId') as string || undefined;
    const preserveOriginalSize = formData.get('preserveOriginalSize') === 'true';

    if (!file) {
      return NextResponse.json(
        { error: 'No se ha proporcionado ningún archivo' },
        { status: 400 }
      );
    }

    // Validar el archivo
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Convertir archivo a base64
    const base64File = await fileToBase64(file);

    // Subir a Cloudinary
    const result = await uploadToCloudinary(base64File, folder, publicId, preserveOriginalSize);

    return NextResponse.json({
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
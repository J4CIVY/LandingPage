/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { v2 as cloudinary } from 'cloudinary';
import { getEnv } from './env-validation';

// Get validated environment variables
const env = getEnv();

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  pages?: number; // Para PDFs
}

/**
 * Sube una imagen a Cloudinary
 * @param file - Archivo a subir como string base64
 * @param folder - Carpeta donde almacenar la imagen
 * @param publicId - ID público personalizado (opcional)
 * @param preserveOriginalSize - Si es true, mantiene las dimensiones originales
 * @returns Resultado de la subida con URL y metadatos
 */
export async function uploadToCloudinary(
  file: string,
  folder: string = 'user-profiles',
  publicId?: string,
  preserveOriginalSize: boolean = false
): Promise<CloudinaryUploadResult> {
  try {
    const uploadOptions: any = {
      folder,
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
    };

    // Solo aplicar transformaciones si no se quiere preservar el tamaño original
    if (!preserveOriginalSize) {
      // Configurar transformaciones específicas según la carpeta
      if (folder.includes('events')) {
        // Para eventos: mejor para paisajes y imágenes de eventos
        uploadOptions.transformation = [
          { width: 1200, height: 800, crop: 'fill', gravity: 'center' },
          { quality: 'auto:good' },
          { format: 'webp' }
        ];
      } else {
        // Para perfiles de usuario: optimizado para fotos de personas
        uploadOptions.transformation = [
          { width: 500, height: 500, crop: 'fill', gravity: 'face' },
          { quality: 'auto:good' },
          { format: 'webp' }
        ];
      }
    } else {
      // Solo optimizar calidad y formato, mantener dimensiones originales
      uploadOptions.transformation = [
        { quality: 'auto:good' },
        { format: 'webp' }
      ];
    }

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const result = await cloudinary.uploader.upload(file, uploadOptions);
    
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
}

/**
 * Sube un PDF a Cloudinary
 * @param file - Archivo PDF a subir como string base64
 * @param folder - Carpeta donde almacenar el PDF
 * @param publicId - ID público personalizado (opcional)
 * @returns Resultado de la subida con URL y metadatos
 */
export async function uploadPdfToCloudinary(
  file: string,
  folder: string = 'documents',
  publicId?: string
): Promise<CloudinaryUploadResult> {
  try {
    const uploadOptions: any = {
      folder,
      resource_type: 'raw', // Para archivos que no son imágenes/videos
      allowed_formats: ['pdf'],
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const result = await cloudinary.uploader.upload(file, uploadOptions);
    
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      format: result.format,
      bytes: result.bytes,
      pages: result.pages || undefined,
    };
  } catch (error) {
    console.error('Error uploading PDF to Cloudinary:', error);
    throw new Error('Failed to upload PDF to Cloudinary');
  }
}

/**
 * Elimina una imagen de Cloudinary
 * @param publicId - ID público de la imagen a eliminar
 * @returns Resultado de la eliminación
 */
export async function deleteFromCloudinary(publicId: string): Promise<any> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
}

/**
 * Genera una URL transformada de Cloudinary
 * @param publicId - ID público de la imagen
 * @param transformations - Transformaciones a aplicar
 * @returns URL transformada
 */
export function getCloudinaryUrl(
  publicId: string, 
  transformations?: string
): string {
  const baseUrl = `https://res.cloudinary.com/dz0peilmu/image/upload/`;
  const transforms = transformations || 'q_auto,f_auto,w_300,h_300,c_fill,g_face';
  return `${baseUrl}${transforms}/${publicId}`;
}

/**
 * Valida que el archivo sea un PDF válido
 * @param file - Archivo a validar
 * @returns true si es válido, false si no
 */
export async function validatePdfFile(file: File): Promise<{ isValid: boolean; error?: string }> {
  const allowedTypes = ['application/pdf'];
  const maxSize = 10 * 1024 * 1024; // 10MB para PDFs

  // Validate MIME type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Tipo de archivo no permitido. Solo se aceptan archivos PDF.'
    };
  }

  // Validate file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'El archivo es demasiado grande. Máximo 10MB.'
    };
  }

  // SECURITY: Validate file extension
  const filename = file.name.toLowerCase();
  if (!filename.endsWith('.pdf')) {
    return {
      isValid: false,
      error: 'El archivo debe tener extensión .pdf'
    };
  }

  // SECURITY: Check magic bytes (PDF signature)
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // PDF files start with "%PDF-" (25 50 44 46 2D in hex)
    const pdfSignature = [0x25, 0x50, 0x44, 0x46, 0x2D];
    const isPdf = pdfSignature.every((byte, index) => bytes[index] === byte);
    
    if (!isPdf) {
      return {
        isValid: false,
        error: 'El archivo no es un PDF válido (firma de archivo incorrecta).'
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: 'Error al validar el archivo PDF.'
    };
  }

  return { isValid: true };
}

/**
 * Valida que el archivo sea una imagen válida
 * @param file - Archivo a validar
 * @returns true si es válido, false si no
 */
export async function validateImageFile(file: File): Promise<{ isValid: boolean; error?: string }> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  // Validate MIME type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y WebP.'
    };
  }

  // Validate file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'El archivo es demasiado grande. Máximo 5MB.'
    };
  }

  // SECURITY: Validate file extension
  const filename = file.name.toLowerCase();
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const hasValidExtension = validExtensions.some(ext => filename.endsWith(ext));
  
  if (!hasValidExtension) {
    return {
      isValid: false,
      error: 'Extensión de archivo no válida. Solo se permiten: .jpg, .jpeg, .png, .webp'
    };
  }

  // SECURITY: Check magic bytes (file signatures)
  try {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // Check for valid image signatures
    const isJPEG = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;
    const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
    const isWebP = bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
    
    if (!isJPEG && !isPNG && !isWebP) {
      return {
        isValid: false,
        error: 'El archivo no es una imagen válida (firma de archivo incorrecta).'
      };
    }
  } catch (error) {
    return {
      isValid: false,
      error: 'Error al validar el archivo de imagen.'
    };
  }

  return { isValid: true };
}

/**
 * Convierte un archivo a base64
 * @param file - Archivo a convertir
 * @returns Promise con el string base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
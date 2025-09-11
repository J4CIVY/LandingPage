import { v2 as cloudinary } from 'cloudinary';

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dz0peilmu',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Sube una imagen a Cloudinary
 * @param file - Archivo a subir como string base64
 * @param folder - Carpeta donde almacenar la imagen
 * @param publicId - ID público personalizado (opcional)
 * @returns Resultado de la subida con URL y metadatos
 */
export async function uploadToCloudinary(
  file: string,
  folder: string = 'user-profiles',
  publicId?: string
): Promise<CloudinaryUploadResult> {
  try {
    const uploadOptions: any = {
      folder,
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' }, // Optimiza para fotos de perfil
        { quality: 'auto:good' },
        { format: 'webp' }
      ]
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
 * Valida que el archivo sea una imagen válida
 * @param file - Archivo a validar
 * @returns true si es válido, false si no
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y WebP.'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'El archivo es demasiado grande. Máximo 5MB.'
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
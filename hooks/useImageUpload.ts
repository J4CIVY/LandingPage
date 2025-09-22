import { useState } from 'react';

export interface ImageUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface UseImageUploadReturn {
  uploading: boolean;
  uploadImage: (file: File, folder?: string, publicId?: string, preserveOriginalSize?: boolean) => Promise<ImageUploadResult>;
  uploadError: string | null;
  clearError: () => void;
}

export const useImageUpload = (): UseImageUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadImage = async (
    file: File, 
    folder: string = 'user-profiles', 
    publicId?: string,
    preserveOriginalSize: boolean = false
  ): Promise<ImageUploadResult> => {
    setUploading(true);
    setUploadError(null);

    try {
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('preserveOriginalSize', preserveOriginalSize.toString());
      if (publicId) {
        formData.append('publicId', publicId);
      }

      // Hacer la petición a la API
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al subir la imagen');
      }

      if (!result.success) {
        throw new Error(result.error || 'Error al procesar la imagen');
      }

      return result.data;
    } catch (error: any) {
      const errorMessage = error.message || 'Error desconocido al subir la imagen';
      setUploadError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const clearError = () => {
    setUploadError(null);
  };

  return {
    uploading,
    uploadImage,
    uploadError,
    clearError,
  };
};
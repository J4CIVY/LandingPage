import { useState } from 'react';
import apiClient from '@/lib/api-client';

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
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('preserveOriginalSize', preserveOriginalSize.toString());
      if (publicId) {
        formData.append('publicId', publicId);
      }

      // Use NestJS endpoint: POST /uploads/image
      const result = await apiClient.upload<ImageUploadResult>('/uploads/image', formData);
      
      return result;
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al subir la imagen';
      setUploadError(errorMessage);
      return { url: '', publicId: '', width: 0, height: 0, format: '', bytes: 0 };
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
import { useState } from 'react';
import apiClient from '@/lib/api-client';

export interface PdfUploadResult {
  url: string;
  publicId: string;
  format: string;
  bytes: number;
  pages?: number;
}

export interface UsePdfUploadReturn {
  uploading: boolean;
  uploadPdf: (file: File, folder?: string, publicId?: string) => Promise<PdfUploadResult>;
  uploadError: string | null;
  clearError: () => void;
}

export const usePdfUpload = (): UsePdfUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadPdf = async (
    file: File, 
    folder: string = 'documents', 
    publicId?: string
  ): Promise<PdfUploadResult> => {
    setUploading(true);
    setUploadError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('fileType', 'pdf');
      if (publicId) {
        formData.append('publicId', publicId);
      }

      // NestJS endpoint: POST /uploads/pdf
      const result = await apiClient.upload<PdfUploadResult>('/uploads/pdf', formData);
      return result;
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al subir el PDF';
      setUploadError(errorMessage);
      return { url: '', publicId: '', format: '', bytes: 0 };
    } finally {
      setUploading(false);
    }
  };

  const clearError = () => {
    setUploadError(null);
  };

  return {
    uploading,
    uploadPdf,
    uploadError,
    clearError,
  };
};
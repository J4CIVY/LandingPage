import { useState } from 'react';

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
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('fileType', 'pdf'); // Indicar que es PDF
      if (publicId) {
        formData.append('publicId', publicId);
      }

      // Hacer la petición a la API
      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al subir el PDF');
      }

      if (!result.success) {
        throw new Error(result.error || 'Error al procesar el PDF');
      }

      return result.data;
    } catch (error: any) {
      const errorMessage = error.message || 'Error desconocido al subir el PDF';
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
    uploadPdf,
    uploadError,
    clearError,
  };
};
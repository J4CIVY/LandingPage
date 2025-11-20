import { useState, useRef, useMemo, type FC, type ChangeEvent, type MouseEvent, type DragEvent } from 'react';
import { FaCamera, FaSpinner, FaUser, FaTimes } from 'react-icons/fa';
import { useImageUpload } from '@/hooks/useImageUpload';

/**
 * Sanitize image URL to prevent XSS attacks
 * Only allows safe protocols: https, http, and data URLs
 * Validates data URLs to ensure they are legitimate base64-encoded images
 * Blocks any URLs containing dangerous HTML characters
 */
const sanitizeImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  
  try {
    // Block any URLs containing dangerous HTML characters
    const dangerousChars = /[<>"'`]/;
    if (dangerousChars.test(url)) {
      console.error('Blocked URL containing dangerous HTML characters');
      return null;
    }
    
    // Validate and sanitize data URLs (from FileReader)
    if (url.startsWith('data:image/')) {
      // Validate data URL format: data:image/<type>;base64,<data>
      const dataUrlPattern = /^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/;
      if (!dataUrlPattern.test(url)) {
        console.warn('Invalid or potentially malicious data URL format');
        return null;
      }
      // Data URLs are safe - they're base64 encoded and can't execute scripts
      return url;
    }
    
    // Parse and validate regular URLs
    const parsedUrl = new URL(url, window.location.origin);
    
    // Only allow http and https protocols
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      console.warn('Blocked unsafe URL protocol:', parsedUrl.protocol);
      return null;
    }
    
    // Return the reconstructed URL (not the original) to break taint chain
    return parsedUrl.href;
  } catch {
    console.warn('Invalid URL:', url);
    return null;
  }
};

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImageUrl?: string;
  disabled?: boolean;
  className?: string;
  folder?: string;
  publicIdPrefix?: string;
  preserveOriginalSize?: boolean;
  isPublic?: boolean;
}

const ImageUpload: FC<ImageUploadProps> = ({
  onImageUploaded,
  currentImageUrl,
  disabled = false,
  className = '',
  folder = 'user-profiles',
  publicIdPrefix,
  preserveOriginalSize = false,
  isPublic = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, uploadImage, uploadError, clearError } = useImageUpload(isPublic);

  // Sanitize preview URL to prevent XSS
  const safePreviewUrl = useMemo(() => sanitizeImageUrl(previewUrl), [previewUrl]);

  const handleFileSelect = async (file: File) => {
    if (disabled || uploading) return;

    clearError();

    // Validaciones básicas
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y WebP.');
      return;
    }

    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. Máximo 5MB.');
      return;
    }

    // Mostrar preview inmediato
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // Generar publicId único si se proporciona prefijo
      const publicId = publicIdPrefix ? `${publicIdPrefix}_${Date.now()}` : undefined;
      
      // Subir a Cloudinary
      const result = await uploadImage(file, folder, publicId, preserveOriginalSize);
      
      // Notificar al componente padre
      onImageUploaded(result.url);
    } catch (error) {
      // Revertir preview en caso de error
      setPreviewUrl(currentImageUrl || null);
      console.error('Error uploading image:', error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFileSelect(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      void handleFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveImage = (e: MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Área de drop/click */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative group cursor-pointer
          w-32 h-32 mx-auto rounded-full border-4 overflow-hidden
          ${dragOver ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-slate-900' : 'border-gray-300 dark:border-gray-600 dark:bg-slate-950'}
          ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-blue-400 dark:hover:border-blue-400 hover:shadow-lg'}
          ${uploading ? 'pointer-events-none' : ''}
        `}
      >
        {/* Contenido del círculo */}
        {safePreviewUrl ? (
          <>
            {/* Imagen preview con URL sanitizada para prevenir XSS */}
            <img
              src={safePreviewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            
            {/* Overlay con botones */}
            <div className="absolute inset-0 bg-black/60 dark:bg-slate-900/80 opacity-0 group-hover:opacity-100 flex items-center justify-center">
              <div className="flex space-x-2">
                <button
                  onClick={handleClick}
                  className="p-2 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                  disabled={disabled || uploading}
                >
                  <FaCamera className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRemoveImage}
                  className="p-2 bg-red-500 dark:bg-red-700 text-white rounded-full hover:bg-red-600 dark:hover:bg-red-800"
                  disabled={disabled || uploading}
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Placeholder cuando no hay imagen */
          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            {uploading ? (
              <>
                <FaSpinner className="w-8 h-8 animate-spin mb-2" />
                <span className="text-xs">Subiendo...</span>
              </>
            ) : (
              <>
                <FaUser className="w-8 h-8 mb-2" />
                <FaCamera className="w-4 h-4" />
              </>
            )}
          </div>
        )}

        {/* Spinner de carga overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 dark:bg-slate-900/80 flex items-center justify-center">
            <div className="text-center text-white">
              <FaSpinner className="w-6 h-6 animate-spin mx-auto mb-1" />
              <span className="text-xs">Subiendo...</span>
            </div>
          </div>
        )}
      </div>

      {/* Texto de instrucciones */}
      <div className="text-center mt-3">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {uploading ? 'Subiendo imagen...' : 'Haz clic o arrastra una imagen'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          JPEG, PNG, WebP • Máx. 5MB
        </p>
      </div>

      {/* Error */}
      {uploadError && (
        <div className="mt-2 text-center">
          <p className="text-sm text-red-500 dark:text-red-400">{uploadError}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
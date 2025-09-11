import React, { useState } from 'react';
import { FaCamera, FaSpinner, FaTimes, FaPlus } from 'react-icons/fa';
import { useImageUpload } from '@/hooks/useImageUpload';

interface ImageGalleryUploadProps {
  images: string[];
  onImagesChanged: (images: string[]) => void;
  folder?: string;
  publicIdPrefix?: string;
  maxImages?: number;
  className?: string;
}

const ImageGalleryUpload: React.FC<ImageGalleryUploadProps> = ({
  images,
  onImagesChanged,
  folder = 'gallery',
  publicIdPrefix,
  maxImages = 10,
  className = '',
}) => {
  const [dragOver, setDragOver] = useState(false);
  const { uploading, uploadImage, uploadError, clearError } = useImageUpload();

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || uploading) return;

    clearError();
    const remainingSlots = maxImages - images.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      
      // Validaciones básicas
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        alert(`Archivo ${file.name}: Tipo no permitido. Solo JPEG, PNG, WebP.`);
        continue;
      }

      if (file.size > maxSize) {
        alert(`Archivo ${file.name}: Demasiado grande. Máximo 5MB.`);
        continue;
      }

      try {
        // Generar publicId único
        const timestamp = Date.now();
        const publicId = publicIdPrefix ? `${publicIdPrefix}_gallery_${timestamp}_${i}` : undefined;
        
        // Subir imagen
        const result = await uploadImage(file, folder, publicId);
        
        // Agregar a la lista
        const newImages = [...images, result.url];
        onImagesChanged(newImages);
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        alert(`Error al subir ${file.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChanged(newImages);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Input oculto */}
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleInputChange}
        className="hidden"
        id="gallery-upload"
        disabled={uploading || !canAddMore}
      />

      {/* Área de subida */}
      {canAddMore && (
        <div
          onClick={() => !uploading && document.getElementById('gallery-upload')?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300
            ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <FaSpinner className="w-8 h-8 text-blue-500 animate-spin mb-2" />
              <span className="text-gray-600">Subiendo imagen...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <FaPlus className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-gray-600 font-medium">
                Haz clic o arrastra imágenes aquí
              </span>
              <span className="text-sm text-gray-500 mt-1">
                JPEG, PNG, WebP • Máx. 5MB • {maxImages - images.length} restantes
              </span>
            </div>
          )}
        </div>
      )}

      {/* Preview de imágenes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
            >
              <img
                src={imageUrl}
                alt={`Imagen ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Botón eliminar */}
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                disabled={uploading}
              >
                <FaTimes className="w-3 h-3" />
              </button>

              {/* Número de imagen */}
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Información */}
      <div className="text-sm text-gray-600">
        <p>{images.length} de {maxImages} imágenes</p>
        {!canAddMore && (
          <p className="text-orange-600">Has alcanzado el límite máximo de imágenes</p>
        )}
      </div>

      {/* Error */}
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}
    </div>
  );
};

export default ImageGalleryUpload;
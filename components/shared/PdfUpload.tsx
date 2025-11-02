import React, { useState, useRef } from 'react';
import { FaFilePdf, FaSpinner, FaTimes, FaUpload, FaEye } from 'react-icons/fa';
import { usePdfUpload } from '@/hooks/usePdfUpload';

interface PdfUploadProps {
  onPdfUploaded: (pdfUrl: string) => void;
  currentPdfUrl?: string;
  disabled?: boolean;
  className?: string;
  folder?: string;
  publicIdPrefix?: string;
}

const PdfUpload: React.FC<PdfUploadProps> = ({
  onPdfUploaded,
  currentPdfUrl,
  disabled = false,
  className = '',
  folder = 'documents',
  publicIdPrefix,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(currentPdfUrl || null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploading, uploadPdf, uploadError, clearError } = usePdfUpload();

  const handleFileSelect = async (file: File) => {
    if (disabled || uploading) return;

    clearError();

    // Validaciones básicas
    const allowedTypes = ['application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no permitido. Solo se aceptan archivos PDF.');
      return;
    }

    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. Máximo 10MB.');
      return;
    }

    try {
      // Generar publicId único si se proporciona prefijo
      const publicId = publicIdPrefix ? `${publicIdPrefix}_${Date.now()}` : undefined;
      
      // Subir a Cloudinary
      const result = await uploadPdf(file, folder, publicId);
      
      // Actualizar estado y notificar al componente padre
      setPdfUrl(result.url);
      onPdfUploaded(result.url);
    } catch (error) {
      console.error('Error uploading PDF:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      void handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemovePdf = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPdfUrl(null);
    onPdfUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openPdf = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
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
          border-2 border-dashed rounded-lg p-6
          ${dragOver ? 'border-red-500 bg-red-50 dark:border-red-400 dark:bg-slate-900' : 'border-gray-300 dark:border-gray-600 dark:bg-slate-950'}
          ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-red-400 dark:hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/10'}
          ${uploading ? 'pointer-events-none' : ''}
          ${pdfUrl ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700' : 'bg-gray-50 dark:bg-gray-800'}
        `}
      >
        {/* Contenido del área */}
        {pdfUrl ? (
          <>
            {/* PDF cargado */}
            <div className="flex flex-col items-center">
              <FaFilePdf className="w-12 h-12 text-red-500 dark:text-red-400 mb-3" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                PDF del Evento
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={openPdf}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-500 dark:bg-blue-700 text-white rounded text-xs hover:bg-blue-600 dark:hover:bg-blue-800"
                  disabled={disabled || uploading}
                >
                  <FaEye className="w-3 h-3" />
                  <span>Ver</span>
                </button>
                <button
                  onClick={handleRemovePdf}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-500 dark:bg-red-700 text-white rounded text-xs hover:bg-red-600 dark:hover:bg-red-800"
                  disabled={disabled || uploading}
                >
                  <FaTimes className="w-3 h-3" />
                  <span>Quitar</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Estado de carga o vacío */}
            {uploading ? (
              <div className="flex flex-col items-center">
                <FaSpinner className="w-8 h-8 text-red-500 dark:text-red-400 animate-spin mb-2" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Subiendo PDF...
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <FaUpload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subir PDF del Evento
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Haz clic o arrastra un archivo PDF
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Máximo 10MB
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Error */}
      {uploadError && (
        <div className="mt-2">
          <p className="text-sm text-red-500 dark:text-red-400">{uploadError}</p>
        </div>
      )}
    </div>
  );
};

export default PdfUpload;
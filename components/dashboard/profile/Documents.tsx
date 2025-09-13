'use client';

import { useState, useEffect } from 'react';
import { FaFileAlt, FaUpload, FaDownload, FaTrash, FaEye, FaCheck, FaTimes, FaExclamationTriangle, FaFilePdf, FaFileImage, FaFile, FaCalendarAlt, FaPlus, FaSpinner } from 'react-icons/fa';

interface DocumentsProps {
  userId: string;
  onDocumentUpload?: (file: File, type: string, description?: string) => Promise<DocumentInfo>;
  onDocumentDelete?: (documentId: string) => Promise<void>;
  onDocumentView?: (documentId: string) => Promise<string>;
  isEditing?: boolean;
  onEditToggle?: () => void;
}

interface DocumentInfo {
  id: string;
  name: string;
  type: string;
  description?: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  expirationDate?: Date;
  status: 'valid' | 'expiring' | 'expired' | 'pending';
  url?: string;
  category: 'identification' | 'medical' | 'motorcycle' | 'insurance' | 'other';
}

const documentTypes = [
  { value: 'cedula', label: 'Cédula de Ciudadanía', category: 'identification' },
  { value: 'license', label: 'Licencia de Conducción', category: 'motorcycle' },
  { value: 'soat', label: 'SOAT', category: 'insurance' },
  { value: 'technical-review', label: 'Revisión Técnico-mecánica', category: 'motorcycle' },
  { value: 'registration', label: 'Tarjeta de Propiedad', category: 'motorcycle' },
  { value: 'medical-certificate', label: 'Certificado Médico', category: 'medical' },
  { value: 'insurance', label: 'Póliza de Seguros', category: 'insurance' },
  { value: 'membership-form', label: 'Formulario de Membresía', category: 'other' },
  { value: 'other', label: 'Otro Documento', category: 'other' }
];

const categoryColors = {
  identification: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  medical: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
  motorcycle: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
  insurance: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  other: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' }
};

export default function Documents({ userId, onDocumentUpload, onDocumentDelete, onDocumentView, isEditing = false, onEditToggle }: DocumentsProps) {
  const [documents, setDocuments] = useState<DocumentInfo[]>([
    // Mock data - En producción esto vendría de la API
    {
      id: '1',
      name: 'cedula_ciudadania.pdf',
      type: 'cedula',
      description: 'Cédula de Ciudadanía',
      fileType: 'pdf',
      fileSize: 1024000,
      uploadDate: new Date('2024-01-15'),
      status: 'valid',
      category: 'identification'
    },
    {
      id: '2',
      name: 'licencia_conduccion.jpg',
      type: 'license',
      description: 'Licencia de Conducción A2',
      fileType: 'image',
      fileSize: 2048000,
      uploadDate: new Date('2024-02-10'),
      expirationDate: new Date('2025-02-10'),
      status: 'valid',
      category: 'motorcycle'
    },
    {
      id: '3',
      name: 'soat_2024.pdf',
      type: 'soat',
      description: 'SOAT vigente',
      fileType: 'pdf',
      fileSize: 512000,
      uploadDate: new Date('2024-03-01'),
      expirationDate: new Date('2024-12-31'),
      status: 'expiring',
      category: 'insurance'
    }
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [localIsEditing, setLocalIsEditing] = useState(isEditing);

  useEffect(() => {
    setLocalIsEditing(isEditing);
  }, [isEditing]);

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return FaFilePdf;
      case 'image':
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return FaFileImage;
      default:
        return FaFile;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'expiring':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'expired':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'pending':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      default:
        return 'text-slate-600 bg-slate-100 dark:bg-slate-700';
    }
  };

  const getStatusText = (doc: DocumentInfo) => {
    if (!doc.expirationDate) {
      return doc.status === 'pending' ? 'Pendiente' : 'Sin vencimiento';
    }

    const today = new Date();
    const expDate = new Date(doc.expirationDate);
    const daysDiff = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      return `Vencido hace ${Math.abs(daysDiff)} días`;
    } else if (daysDiff <= 30) {
      return `Vence en ${daysDiff} días`;
    } else {
      return 'Vigente';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onDocumentUpload && uploadType) {
      setIsUploading(true);
      try {
        const newDocument = await onDocumentUpload(file, uploadType, uploadDescription);
        setDocuments(prev => [...prev, newDocument]);
        setShowUploadForm(false);
        setUploadType('');
        setUploadDescription('');
      } catch (error) {
        console.error('Error uploading document:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (onDocumentDelete) {
      try {
        await onDocumentDelete(documentId);
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const handleViewDocument = async (documentId: string) => {
    if (onDocumentView) {
      try {
        const url = await onDocumentView(documentId);
        window.open(url, '_blank');
      } catch (error) {
        console.error('Error viewing document:', error);
      }
    }
  };

  const handleEditToggle = () => {
    setLocalIsEditing(!localIsEditing);
    if (onEditToggle) onEditToggle();
  };

  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : documents.filter(doc => doc.category === selectedCategory);

  const categories = [
    { value: 'all', label: 'Todos los documentos' },
    { value: 'identification', label: 'Identificación' },
    { value: 'motorcycle', label: 'Motocicleta' },
    { value: 'insurance', label: 'Seguros' },
    { value: 'medical', label: 'Médicos' },
    { value: 'other', label: 'Otros' }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
            <FaFileAlt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Documentos Digitales
              </h3>
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                {documents.length} archivo{documents.length !== 1 ? 's' : ''}
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Gestiona tus documentos personales y de motocicleta
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {localIsEditing && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
            >
              <FaPlus className="w-4 h-4" />
              Subir Documento
            </button>
          )}
          
          <button
            onClick={handleEditToggle}
            className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            {localIsEditing ? (
              <>
                <FaCheck className="w-4 h-4" />
                Terminar Edición
              </>
            ) : (
              <>
                <FaUpload className="w-4 h-4" />
                Gestionar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Subir Nuevo Documento
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tipo de Documento *
                </label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  <option value="">Seleccionar tipo...</option>
                  {documentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Descripción (Opcional)
                </label>
                <input
                  type="text"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Descripción adicional del documento"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Archivo *
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileUpload}
                  disabled={!uploadType || isUploading}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Formatos permitidos: PDF, JPG, PNG, GIF. Máximo 10MB.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <button
                onClick={() => setShowUploadForm(false)}
                disabled={isUploading}
                className="flex-1 px-4 py-2 bg-slate-500 hover:bg-slate-600 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Cancelar
              </button>
              {isUploading && (
                <div className="flex-1 px-4 py-2 bg-indigo-400 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  Subiendo...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                selectedCategory === category.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocuments.map((document) => {
            const FileIcon = getFileIcon(document.fileType);
            const categoryStyle = categoryColors[document.category];
            
            return (
              <div
                key={document.id}
                className={`p-4 border-2 rounded-lg ${categoryStyle.border} ${categoryStyle.bg} transition-all duration-200 hover:shadow-md`}
              >
                {/* Document Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <FileIcon className={`w-8 h-8 ${categoryStyle.text}`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 dark:text-white truncate">
                        {documentTypes.find(type => type.value === document.type)?.label || document.type}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {document.name}
                      </p>
                      {document.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                          {document.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                    {getStatusText(document)}
                  </div>
                </div>

                {/* Document Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Tamaño:</span>
                    <span className="text-slate-900 dark:text-white font-medium">
                      {formatFileSize(document.fileSize)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Subido:</span>
                    <span className="text-slate-900 dark:text-white font-medium">
                      {document.uploadDate.toLocaleDateString('es-CO')}
                    </span>
                  </div>
                  
                  {document.expirationDate && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Vence:</span>
                      <span className={`font-medium ${document.status === 'expired' ? 'text-red-600' : document.status === 'expiring' ? 'text-yellow-600' : 'text-green-600'}`}>
                        {document.expirationDate.toLocaleDateString('es-CO')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Document Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewDocument(document.id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    <FaEye className="w-4 h-4" />
                    Ver
                  </button>
                  
                  <button
                    onClick={() => handleViewDocument(document.id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    <FaDownload className="w-4 h-4" />
                    Descargar
                  </button>
                  
                  {localIsEditing && (
                    <button
                      onClick={() => handleDeleteDocument(document.id)}
                      className="px-3 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Expiration Warning */}
                {document.expirationDate && document.status === 'expiring' && (
                  <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FaExclamationTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">
                        ¡Atención! Este documento vence pronto. Considera renovarlo.
                      </p>
                    </div>
                  </div>
                )}
                
                {document.expirationDate && document.status === 'expired' && (
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FaTimes className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <p className="text-xs text-red-700 dark:text-red-300">
                        ¡Documento vencido! Es necesario renovarlo.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <FaFileAlt className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            {selectedCategory === 'all' ? 'No hay documentos cargados' : 'No hay documentos en esta categoría'}
          </h4>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {localIsEditing ? 'Comienza subiendo tu primer documento' : 'Activa el modo de gestión para subir documentos'}
          </p>
          {localIsEditing && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              <FaPlus className="w-4 h-4" />
              Subir Primer Documento
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <FaExclamationTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-slate-600 dark:text-slate-400">
              <p className="font-medium mb-1">Recomendaciones de Seguridad:</p>
              <ul className="space-y-1">
                <li>• Mantén copias físicas de documentos importantes</li>
                <li>• Actualiza documentos vencidos regularmente</li>
                <li>• Verifica que las imágenes sean legibles y de buena calidad</li>
                <li>• No compartas documentos personales con terceros no autorizados</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
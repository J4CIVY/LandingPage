'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaArrowLeft, 
  FaPaperclip, 
  FaTimes, 
  FaCheck, 
  FaSpinner,
  FaExclamationCircle
} from 'react-icons/fa';

// Importar componentes
import DashboardHeader from '@/components/dashboard/DashboardHeader';

// Importar tipos y servicios
import { 
  CrearSolicitudDto, 
  CATEGORIAS_SOLICITUD, 
  SolicitudCategoria,
  ICONOS_CATEGORIA 
} from '@/types/pqrsdf';
import { PQRSDFService } from '@/lib/services/pqrsdf-service';

export default function NuevaSolicitudPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Estados del formulario
  const [formulario, setFormulario] = useState<CrearSolicitudDto>({
    categoria: 'peticion',
    asunto: '',
    descripcion: '',
    adjuntos: []
  });
  
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<File[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [exito, setExito] = useState(false);

  // Validación del formulario
  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!formulario.categoria) {
      nuevosErrores.categoria = 'La categoría es obligatoria';
    }

    if (!formulario.asunto.trim()) {
      nuevosErrores.asunto = 'El asunto es obligatorio';
    } else if (formulario.asunto.trim().length < 5) {
      nuevosErrores.asunto = 'El asunto debe tener al menos 5 caracteres';
    } else if (formulario.asunto.trim().length > 200) {
      nuevosErrores.asunto = 'El asunto no puede exceder 200 caracteres';
    }

    if (!formulario.descripcion.trim()) {
      nuevosErrores.descripcion = 'La descripción es obligatoria';
    } else if (formulario.descripcion.trim().length < 20) {
      nuevosErrores.descripcion = 'La descripción debe tener al menos 20 caracteres';
    } else if (formulario.descripcion.trim().length > 2000) {
      nuevosErrores.descripcion = 'La descripción no puede exceder 2000 caracteres';
    }

    // Validar archivos
    if (archivosSeleccionados.length > 5) {
      nuevosErrores.adjuntos = 'No puedes subir más de 5 archivos';
    }

    const tamañoTotal = archivosSeleccionados.reduce((total, archivo) => total + archivo.size, 0);
    const tamañoLimite = 10 * 1024 * 1024; // 10MB
    if (tamañoTotal > tamañoLimite) {
      nuevosErrores.adjuntos = 'El tamaño total de los archivos no puede exceder 10MB';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (campo: keyof CrearSolicitudDto, valor: any) => {
    setFormulario(prev => ({
      ...prev,
      [campo]: valor
    }));

    // Limpiar error del campo
    if (errores[campo]) {
      setErrores(prev => {
        const nuevos = { ...prev };
        delete nuevos[campo];
        return nuevos;
      });
    }
  };

  // Manejar selección de archivos
  const handleArchivos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(e.target.files || []);
    setArchivosSeleccionados(prev => [...prev, ...archivos]);
    
    // Limpiar error de adjuntos
    if (errores.adjuntos) {
      setErrores(prev => {
        const nuevos = { ...prev };
        delete nuevos.adjuntos;
        return nuevos;
      });
    }
  };

  // Remover archivo
  const removerArchivo = (index: number) => {
    setArchivosSeleccionados(prev => prev.filter((_, i) => i !== index));
  };

  // Formatear tamaño de archivo
  const formatearTamaño = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const tamaños = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamaños[i];
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario() || !user) return;

    setEnviando(true);
    try {
      const datosEnvio: CrearSolicitudDto = {
        ...formulario,
        adjuntos: archivosSeleccionados
      };

      const solicitudCreada = await PQRSDFService.crearSolicitud(user._id as string, datosEnvio);
      
      setExito(true);
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        router.push(`/dashboard/pqrsdf/${solicitudCreada.id}`);
      }, 2000);

    } catch (error) {
      console.error('Error al crear solicitud:', error);
      setErrores({
        general: 'Error al crear la solicitud. Por favor, intenta nuevamente.'
      });
    } finally {
      setEnviando(false);
    }
  };

  if (exito) {
    return (
      <>
        <DashboardHeader />
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-8 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
                ¡Solicitud Creada!
              </h2>
              <p className="text-gray-600 dark:text-slate-400 mb-4">
                Tu solicitud ha sido enviada exitosamente. Te redirigiremos a los detalles en un momento.
              </p>
              <div className="flex items-center justify-center">
                <FaSpinner className="w-5 h-5 animate-spin text-blue-600 mr-2" />
                <span className="text-sm text-gray-500 dark:text-slate-400">Redirigiendo...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader />
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard/pqrsdf"
              className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 mb-4"
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Volver a Solicitudes
            </Link>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">
              Nueva Solicitud PQRSDF
            </h1>
            <p className="text-gray-600 dark:text-slate-400 mt-1">
              Completa el formulario para enviar tu solicitud
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              {/* Error general */}
              {errores.general && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center">
                    <FaExclamationCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                    <span className="text-red-700 dark:text-red-300">{errores.general}</span>
                  </div>
                </div>
              )}

              {/* Categoría */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(CATEGORIAS_SOLICITUD).map(([key, label]) => (
                    <div
                      key={key}
                      onClick={() => handleChange('categoria', key as SolicitudCategoria)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        formulario.categoria === key
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {ICONOS_CATEGORIA[key as SolicitudCategoria]}
                        </span>
                        <span className={`font-medium ${
                          formulario.categoria === key
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-gray-900 dark:text-slate-100'
                        }`}>
                          {label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {errores.categoria && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errores.categoria}</p>
                )}
              </div>

              {/* Asunto */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Asunto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formulario.asunto}
                  onChange={(e) => handleChange('asunto', e.target.value)}
                  placeholder="Describe brevemente tu solicitud"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 ${
                    errores.asunto
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-slate-600'
                  }`}
                  maxLength={200}
                />
                <div className="mt-1 flex justify-between">
                  {errores.asunto ? (
                    <p className="text-sm text-red-600 dark:text-red-400">{errores.asunto}</p>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      Mínimo 5 caracteres
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {formulario.asunto.length}/200
                  </p>
                </div>
              </div>

              {/* Descripción */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formulario.descripcion}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  placeholder="Proporciona todos los detalles relevantes de tu solicitud"
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 resize-none ${
                    errores.descripcion
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-slate-600'
                  }`}
                  maxLength={2000}
                />
                <div className="mt-1 flex justify-between">
                  {errores.descripcion ? (
                    <p className="text-sm text-red-600 dark:text-red-400">{errores.descripcion}</p>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      Mínimo 20 caracteres
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {formulario.descripcion.length}/2000
                  </p>
                </div>
              </div>

              {/* Adjuntos */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Adjuntos (Opcional)
                </label>
                
                {/* Input para archivos */}
                <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    onChange={handleArchivos}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FaPaperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      Haz clic aquí para seleccionar archivos
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                      PDF, DOC, TXT, JPG, PNG (máx. 10MB total)
                    </p>
                  </label>
                </div>

                {/* Archivos seleccionados */}
                {archivosSeleccionados.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {archivosSeleccionados.map((archivo, index) => (
                      <div key={index} className="flex items-center justify-between text-sm text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FaPaperclip className="w-4 h-4" />
                          <span>{archivo.name}</span>
                          <span className="text-gray-500">({formatearTamaño(archivo.size)})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removerArchivo(index)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {errores.adjuntos && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errores.adjuntos}</p>
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <Link
                href="/dashboard/pqrsdf"
                className="px-6 py-2 text-gray-700 dark:text-slate-300 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200 text-center"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={enviando}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
              >
                {enviando ? (
                  <>
                    <FaSpinner className="w-4 h-4 animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <FaCheck className="w-4 h-4 mr-2" />
                    Enviar Solicitud
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
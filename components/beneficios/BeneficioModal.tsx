'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { FaTimes, FaMapMarkerAlt, FaExternalLinkAlt, FaDownload, FaShare, FaQrcode, FaCopy, FaCheckCircle, FaClock } from 'react-icons/fa';
import { BeneficioModalProps } from '@/types/beneficios';

const BeneficioModal: React.FC<BeneficioModalProps> = ({
  beneficio,
  isOpen,
  onClose,
  onCompartir
}) => {
  // Cerrar modal con ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !beneficio) return null;

  // Función para copiar código promocional
  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(beneficio.codigoPromocional);
      // Aquí podrías mostrar un toast de confirmación
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  // Función para descargar QR
  const descargarQR = () => {
    // Simulación de descarga de QR
    const link = document.createElement('a');
    link.href = beneficio.qrCode || '/images/sample-qr.png';
    link.download = `qr-${beneficio.nombre.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.click();
  };

  const getEstadoStyle = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'proximamente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'expirado':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <FaCheckCircle className="w-4 h-4" />;
      case 'proximamente':
      case 'expirado':
        return <FaClock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 
                       text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          
          {/* Header con imagen */}
          <div className="relative h-64 sm:h-80">
            <Image
              src={beneficio.imagen}
              alt={beneficio.nombre}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
            />
            
            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white 
                       rounded-full hover:bg-opacity-75 transition-all duration-200 z-10"
            >
              <FaTimes className="w-5 h-5" />
            </button>

            {/* Estado del beneficio */}
            <div className="absolute top-4 left-4">
              <span className={`
                inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
                backdrop-blur-sm ${getEstadoStyle(beneficio.estado)}
              `}>
                {getEstadoIcon(beneficio.estado)}
                {beneficio.estado.charAt(0).toUpperCase() + beneficio.estado.slice(1)}
              </span>
            </div>

            {/* Descuento */}
            {beneficio.descuento && (
              <div className="absolute bottom-4 right-4 bg-red-500 text-white px-4 py-2 
                            rounded-full text-lg font-bold shadow-lg">
                {beneficio.descuento}
              </div>
            )}
          </div>

          {/* Contenido del modal */}
          <div className="px-6 py-6">
            {/* Título y empresa */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {beneficio.nombre}
              </h2>
              <p className="text-lg text-blue-600 dark:text-blue-400 font-medium">
                {beneficio.empresa}
              </p>
            </div>

            {/* Descripción completa */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Descripción
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {beneficio.descripcionCompleta}
              </p>
            </div>

            {/* Ubicación o enlace */}
            {(beneficio.ubicacion || beneficio.enlaceWeb) && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Ubicación
                </h3>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  {beneficio.ubicacion ? (
                    <>
                      <FaMapMarkerAlt className="w-4 h-4 text-red-500" />
                      <span>{beneficio.ubicacion}</span>
                    </>
                  ) : (
                    <>
                      <FaExternalLinkAlt className="w-4 h-4 text-blue-500" />
                      <a 
                        href={beneficio.enlaceWeb} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Visitar sitio web
                      </a>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Requisitos */}
            {beneficio.requisitos.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Requisitos
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                  {beneficio.requisitos.map((requisito, index) => (
                    <li key={index}>{requisito}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Código promocional y QR */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Código Promocional
              </h3>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
                    {beneficio.codigoPromocional}
                  </span>
                  <button
                    onClick={copiarCodigo}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white 
                             rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
                  >
                    <FaCopy className="w-4 h-4" />
                    Copiar
                  </button>
                </div>
                
                {/* QR Code */}
                <div className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="w-32 h-32 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                    <FaQrcode className="w-16 h-16 text-gray-400" />
                  </div>
                </div>
                
                <button
                  onClick={descargarQR}
                  className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 
                           border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                           rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <FaDownload className="w-4 h-4" />
                  Descargar QR
                </button>
              </div>
            </div>

            {/* Vigencia */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Vigencia
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Desde {new Date(beneficio.fechaInicio).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })} hasta {new Date(beneficio.fechaFin).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              <button
                onClick={() => onCompartir(beneficio)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 
                         bg-green-600 text-white rounded-lg hover:bg-green-700 
                         transition-colors duration-200 font-medium"
              >
                <FaShare className="w-4 h-4" />
                Compartir con la comunidad
              </button>
              
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 
                         dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeneficioModal;
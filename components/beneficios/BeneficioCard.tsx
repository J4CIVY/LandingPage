'use client';

import Image from 'next/image';
import { FaMapMarkerAlt, FaExternalLinkAlt, FaEye, FaTicketAlt, FaClock, FaCheckCircle } from 'react-icons/fa';
import { BeneficioCardProps } from '@/types/beneficios';

const BeneficioCard: React.FC<BeneficioCardProps> = ({
  beneficio,
  onVerDetalles,
  onObtenerBeneficio
}) => {
  // Función para obtener el estilo del estado
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

  // Función para obtener el icono del estado
  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <FaCheckCircle className="w-3 h-3" />;
      case 'proximamente':
        return <FaClock className="w-3 h-3" />;
      case 'expirado':
        return <FaClock className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // Función para capitalizar texto
  const capitalize = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const isExpired = beneficio.estado === 'expirado';
  const isProximamente = beneficio.estado === 'proximamente';

  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg 
      transition-all duration-300 border border-gray-200 dark:border-gray-700
      ${isExpired ? 'opacity-75' : 'hover:-translate-y-1'}
      overflow-hidden group
    `}>
      {/* Imagen del beneficio */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={beneficio.imagen}
          alt={beneficio.nombre}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Overlay con estado */}
        <div className="absolute top-4 left-4">
          <span className={`
            inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
            backdrop-blur-sm ${getEstadoStyle(beneficio.estado)}
          `}>
            {getEstadoIcon(beneficio.estado)}
            {capitalize(beneficio.estado)}
          </span>
        </div>

        {/* Descuento destacado */}
        {beneficio.descuento && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            {beneficio.descuento}
          </div>
        )}

        {/* Logo de la empresa */}
        {beneficio.logo && (
          <div className="absolute bottom-4 right-4 w-12 h-12 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-md">
            <Image
              src={beneficio.logo}
              alt={`Logo ${beneficio.empresa}`}
              fill
              className="object-contain rounded"
              sizes="48px"
            />
          </div>
        )}
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-6">
        {/* Nombre y empresa */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
            {beneficio.nombre}
          </h3>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            {beneficio.empresa}
          </p>
        </div>

        {/* Descripción */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {beneficio.descripcionBreve}
        </p>

        {/* Ubicación o enlace web */}
        {(beneficio.ubicacion || beneficio.enlaceWeb) && (
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mb-4">
            {beneficio.ubicacion ? (
              <>
                <FaMapMarkerAlt className="w-3 h-3" />
                <span className="truncate">{beneficio.ubicacion}</span>
              </>
            ) : (
              <>
                <FaExternalLinkAlt className="w-3 h-3" />
                <span className="truncate">Sitio web disponible</span>
              </>
            )}
          </div>
        )}

        {/* Fecha de vigencia */}
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Vigente hasta: {new Date(beneficio.fechaFin).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          <button
            onClick={() => onVerDetalles(beneficio)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 
                     border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                     rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 
                     transition-colors duration-200 text-sm font-medium"
          >
            <FaEye className="w-4 h-4" />
            Ver detalles
          </button>
          
          <button
            onClick={() => onObtenerBeneficio(beneficio)}
            disabled={isExpired || isProximamente}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg 
              text-sm font-medium transition-colors duration-200
              ${isExpired || isProximamente
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
              }
            `}
          >
            <FaTicketAlt className="w-4 h-4" />
            {isProximamente ? 'Próximamente' : isExpired ? 'Expirado' : 'Obtener'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BeneficioCard;
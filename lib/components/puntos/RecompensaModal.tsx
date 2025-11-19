'use client';

import { useState } from 'react';
import { Recompensa, Usuario } from '@/types/puntos';
import { 
  FaBoxOpen, 
  FaWrench, 
  FaMagic, 
  FaMoneyBillWave, 
  FaMotorcycle,
  FaGift,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';
// El canje se maneja por props (mantener si hay contexto útil)

interface RecompensaModalProps {
  recompensa: Recompensa;
  usuario: Usuario;
  onClose: () => void;
  onConfirmarCanje: (recompensaId: string, costoPuntos: number) => Promise<boolean>;
}

export default function RecompensaModal({ 
  recompensa, 
  usuario, 
  onClose, 
  onConfirmarCanje 
}: RecompensaModalProps) {
  const [canjeando, setCanjeando] = useState(false);
  const [canjeExitoso, setCanjeExitoso] = useState(false);

  const puedeCanjar = () => {
    const tienePuntos = usuario.puntosTotales >= recompensa.costoPuntos;
    const tieneNivel = !recompensa.nivelMinimo || usuario.nivel.id >= recompensa.nivelMinimo;
    const hayStock = !recompensa.stock || recompensa.stock > 0;
    
    return tienePuntos && tieneNivel && hayStock && recompensa.disponible;
  };

  const handleCanje = async () => {
    if (!puedeCanjar()) return;

    setCanjeando(true);
    try {
      const exito = await onConfirmarCanje(recompensa.id, recompensa.costoPuntos);
      if (exito) {
        setCanjeExitoso(true);
        
  // Cierra modal tras mostrar confirmación
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error en el canje:', error);
    } finally {
      setCanjeando(false);
    }
  };

  const getIconoCategoria = (categoria: Recompensa['categoria']) => {
    const iconos = {
      Producto: <FaBoxOpen className="inline text-blue-800 dark:text-blue-400" />, 
      Servicio: <FaWrench className="inline text-green-800 dark:text-green-400" />, 
      Experiencia: <FaMagic className="inline text-purple-800 dark:text-purple-400" />, 
      Descuento: <FaMoneyBillWave className="inline text-yellow-800 dark:text-yellow-400" />
    };
    return iconos[categoria];
  };

  const getColorCategoria = (categoria: Recompensa['categoria']) => {
    const colores = {
      Producto: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300',
      Servicio: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
      Experiencia: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300',
      Descuento: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
    };
    return colores[categoria];
  };

  if (canjeExitoso) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-8 text-center">
          <FaGift className="text-6xl mb-4 text-green-500 dark:text-green-400 mx-auto" />
          <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
            ¡Canje exitoso!
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Has canjeado <strong>{recompensa.nombre}</strong> por {recompensa.costoPuntos} puntos.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Recibirás más información por correo electrónico.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    {/* Header (mantener si hay contexto útil) */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            Detalles de la recompensa
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white focus:outline-none"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

    {/* Contenido (mantener si hay contexto útil) */}
        <div className="px-6 py-6">
          {/* Imagen e información básica (mantener si hay contexto útil) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="relative">
              <img
                src={recompensa.imagen}
                alt={recompensa.nombre}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI2NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI2NCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+SW1hZ2VuIG5vIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+';
                }}
              />
              
              {/* Badge de categoría (mantener si hay contexto útil) */}
              <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-medium ${getColorCategoria(recompensa.categoria)} dark:bg-opacity-80 dark:text-opacity-90`}>
                {getIconoCategoria(recompensa.categoria)} {recompensa.categoria}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  {recompensa.nombre}
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {recompensa.descripcion}
                </p>
              </div>

              {/* Información de canje (mantener si hay contexto útil) */}
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Costo:</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <FaMotorcycle />
                    {recompensa.costoPuntos.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Tus puntos:</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    usuario.puntosTotales >= recompensa.costoPuntos 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    <FaMotorcycle />
                    {usuario.puntosTotales.toLocaleString()}
                  </span>
                </div>

                {usuario.puntosTotales >= recompensa.costoPuntos && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Puntos restantes:</span>
                    <span className="font-bold text-gray-800 dark:text-white flex items-center gap-1">
                      <FaMotorcycle />
                      {(usuario.puntosTotales - recompensa.costoPuntos).toLocaleString()}
                    </span>
                  </div>
                )}

                {recompensa.nivelMinimo && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Nivel requerido:</span>
                    <span className={`font-medium ${
                      usuario.nivel.id >= recompensa.nivelMinimo
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      Nivel {recompensa.nivelMinimo}
                    </span>
                  </div>
                )}

                {recompensa.stock && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Stock disponible:</span>
                    <span className={`font-medium ${
                      recompensa.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {recompensa.stock} unidades
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Restricciones o advertencias (mantener si hay contexto útil) */}
          {!puedeCanjar() && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="text-red-500 dark:text-red-400" />
                <span className="font-medium text-red-800 dark:text-red-300">No puedes canjear esta recompensa</span>
              </div>
              <ul className="mt-2 text-sm text-red-700 dark:text-red-300 space-y-1">
                {usuario.puntosTotales < recompensa.costoPuntos && (
                  <li>• Te faltan {recompensa.costoPuntos - usuario.puntosTotales} puntos</li>
                )}
                {recompensa.nivelMinimo && usuario.nivel.id < recompensa.nivelMinimo && (
                  <li>• Necesitas alcanzar el nivel {recompensa.nivelMinimo}</li>
                )}
                {recompensa.stock === 0 && (
                  <li>• No hay stock disponible</li>
                )}
                {!recompensa.disponible && (
                  <li>• Esta recompensa no está disponible actualmente</li>
                )}
              </ul>
            </div>
          )}

          {/* Información adicional (mantener si hay contexto útil) */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
              <FaInfoCircle />
              Información importante:
            </h5>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Una vez canjeada, la recompensa no puede ser reembolsada</li>
              <li>• Recibirás instrucciones por correo electrónico</li>
              <li>• El canje puede tardar hasta 24 horas en procesarse</li>
              {recompensa.categoria === 'Experiencia' && (
                <li>• Las experiencias tienen fechas específicas de disponibilidad</li>
              )}
            </ul>
          </div>
        </div>

  {/* Footer con botones (mantener si hay contexto útil) */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-800 focus:outline-none"
            type="button"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleCanje}
            disabled={!puedeCanjar() || canjeando}
            className={`flex-1 py-3 px-4 rounded-lg font-medium focus:outline-none ${
              puedeCanjar() && !canjeando
                ? 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800'
                : 'bg-gray-300 dark:bg-slate-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
            type="button"
          >
            {canjeando ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-blue-400"></div>
                Canjeando...
              </span>
            ) : puedeCanjar() ? (
              `Confirmar canje por ${recompensa.costoPuntos} puntos`
            ) : (
              'No disponible'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
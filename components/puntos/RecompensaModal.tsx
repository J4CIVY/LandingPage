'use client';

import { useState } from 'react';
import { Recompensa, Usuario } from '@/types/puntos';
import { canjearRecompensa } from '@/data/puntos/mockData';

interface RecompensaModalProps {
  recompensa: Recompensa;
  usuario: Usuario;
  onClose: () => void;
  onConfirmarCanje: () => void;
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
      const exito = await canjearRecompensa(recompensa.id, usuario.id);
      if (exito) {
        setCanjeExitoso(true);
        onConfirmarCanje();
        
        // Cerrar modal después de mostrar confirmación
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
      Producto: '📦',
      Servicio: '🔧',
      Experiencia: '✨',
      Descuento: '💰'
    };
    return iconos[categoria];
  };

  const getColorCategoria = (categoria: Recompensa['categoria']) => {
    const colores = {
      Producto: 'bg-blue-100 text-blue-800',
      Servicio: 'bg-green-100 text-green-800',
      Experiencia: 'bg-purple-100 text-purple-800',
      Descuento: 'bg-yellow-100 text-yellow-800'
    };
    return colores[categoria];
  };

  if (canjeExitoso) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">
            ¡Canje exitoso!
          </h3>
          <p className="text-gray-600 mb-4">
            Has canjeado <strong>{recompensa.nombre}</strong> por {recompensa.costoPuntos} puntos.
          </p>
          <p className="text-sm text-gray-500">
            Recibirás más información por correo electrónico.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            Detalles de la recompensa
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="px-6 py-6">
          {/* Imagen y información básica */}
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
              
              {/* Badge de categoría */}
              <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-medium ${getColorCategoria(recompensa.categoria)}`}>
                {getIconoCategoria(recompensa.categoria)} {recompensa.categoria}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-2xl font-bold text-gray-800 mb-2">
                  {recompensa.nombre}
                </h4>
                <p className="text-gray-600">
                  {recompensa.descripcion}
                </p>
              </div>

              {/* Información de canje */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Costo:</span>
                  <span className="text-xl font-bold text-blue-600">
                    🏍️ {recompensa.costoPuntos.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tus puntos:</span>
                  <span className={`font-bold ${
                    usuario.puntosTotales >= recompensa.costoPuntos 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    🏍️ {usuario.puntosTotales.toLocaleString()}
                  </span>
                </div>

                {usuario.puntosTotales >= recompensa.costoPuntos && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Puntos restantes:</span>
                    <span className="font-bold text-gray-800">
                      🏍️ {(usuario.puntosTotales - recompensa.costoPuntos).toLocaleString()}
                    </span>
                  </div>
                )}

                {recompensa.nivelMinimo && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Nivel requerido:</span>
                    <span className={`font-medium ${
                      usuario.nivel.id >= recompensa.nivelMinimo
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      Nivel {recompensa.nivelMinimo}
                    </span>
                  </div>
                )}

                {recompensa.stock && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Stock disponible:</span>
                    <span className={`font-medium ${
                      recompensa.stock > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {recompensa.stock} unidades
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Restricciones o advertencias */}
          {!puedeCanjar() && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                <span className="font-medium text-red-800">No puedes canjear esta recompensa</span>
              </div>
              <ul className="mt-2 text-sm text-red-700 space-y-1">
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

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h5 className="font-medium text-blue-800 mb-2">ℹ️ Información importante:</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Una vez canjeada, la recompensa no puede ser reembolsada</li>
              <li>• Recibirás instrucciones por correo electrónico</li>
              <li>• El canje puede tardar hasta 24 horas en procesarse</li>
              {recompensa.categoria === 'Experiencia' && (
                <li>• Las experiencias tienen fechas específicas de disponibilidad</li>
              )}
            </ul>
          </div>
        </div>

        {/* Footer con botones */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleCanje}
            disabled={!puedeCanjar() || canjeando}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              puedeCanjar() && !canjeando
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canjeando ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
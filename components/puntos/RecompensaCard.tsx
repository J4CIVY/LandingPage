'use client';

import { useState } from 'react';
import { Recompensa, Usuario } from '@/types/puntos';
import RecompensaModal from './RecompensaModal';

interface RecompensaCardProps {
  recompensa: Recompensa;
  usuario: Usuario;
  onCanje: (recompensaId: string, costoPuntos: number) => Promise<boolean>;
}

export default function RecompensaCard({ recompensa, usuario, onCanje }: RecompensaCardProps) {
  const [modalAbierto, setModalAbierto] = useState(false);

  const puedeCanjar = () => {
    const tienePuntos = usuario.puntosTotales >= recompensa.costoPuntos;
    const tieneNivel = !recompensa.nivelMinimo || usuario.nivel.id >= recompensa.nivelMinimo;
    const hayStock = !recompensa.stock || recompensa.stock > 0;
    
    return tienePuntos && tieneNivel && hayStock && recompensa.disponible;
  };

  const getMensajeRestriccion = () => {
    if (!recompensa.disponible) return "No disponible";
    if (recompensa.stock === 0) return "Sin stock";
    if (usuario.puntosTotales < recompensa.costoPuntos) {
      const faltantes = recompensa.costoPuntos - usuario.puntosTotales;
      return `Te faltan ${faltantes} puntos`;
    }
    if (recompensa.nivelMinimo && usuario.nivel.id < recompensa.nivelMinimo) {
      return `Requiere nivel ${recompensa.nivelMinimo}`;
    }
    return "";
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

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Imagen */}
        <div className="relative">
          <img
            src={recompensa.imagen}
            alt={recompensa.nombre}
            className="w-full h-48 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+SW1hZ2VuIG5vIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+';
            }}
          />
          
          {/* Badge de categoría */}
          <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getColorCategoria(recompensa.categoria)}`}>
            {getIconoCategoria(recompensa.categoria)} {recompensa.categoria}
          </div>

          {/* Badge de stock limitado */}
          {recompensa.stock && recompensa.stock <= 5 && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Solo {recompensa.stock} disponibles
            </div>
          )}

          {/* Overlay si no se puede canjear */}
          {!puedeCanjar() && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg px-3 py-2 text-sm font-medium text-center">
                {getMensajeRestriccion()}
              </div>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Título */}
          <h4 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
            {recompensa.nombre}
          </h4>

          {/* Descripción corta */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {recompensa.descripcion}
          </p>

          {/* Costo y nivel mínimo */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Costo:</span>
              <span className="text-lg font-bold text-blue-600">
                🏍️ {recompensa.costoPuntos.toLocaleString()}
              </span>
            </div>
            
            {recompensa.nivelMinimo && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Nivel mínimo:</span>
                <span className="text-sm font-medium">
                  Nivel {recompensa.nivelMinimo}
                </span>
              </div>
            )}

            {recompensa.stock && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Disponibles:</span>
                <span className="text-sm font-medium">
                  {recompensa.stock} unidades
                </span>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-2">
            <button
              onClick={() => setModalAbierto(true)}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Ver detalles
            </button>
            
            <button
              onClick={() => setModalAbierto(true)}
              disabled={!puedeCanjar()}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                puedeCanjar()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {puedeCanjar() ? 'Canjear' : 'No disponible'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalAbierto && (
        <RecompensaModal
          recompensa={recompensa}
          usuario={usuario}
          onClose={() => setModalAbierto(false)}
          onConfirmarCanje={onCanje}
        />
      )}
    </>
  );
}
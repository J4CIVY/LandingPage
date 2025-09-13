'use client';

import { Usuario, Nivel } from '@/types/puntos';
import { obtenerNiveles } from '@/data/puntos/mockData';
import { useState, useEffect } from 'react';

interface ProgresoNivelProps {
  usuario: Usuario;
}

export default function ProgresoNivel({ usuario }: ProgresoNivelProps) {
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [siguienteNivel, setSiguienteNivel] = useState<Nivel | null>(null);

  useEffect(() => {
    const cargarNiveles = async () => {
      const nivelesData = await obtenerNiveles();
      setNiveles(nivelesData);
      
      // Encontrar el siguiente nivel
      const nivelActualIndex = nivelesData.findIndex((n: Nivel) => n.id === usuario.nivel.id);
      if (nivelActualIndex < nivelesData.length - 1) {
        setSiguienteNivel(nivelesData[nivelActualIndex + 1]);
      }
    };

    cargarNiveles();
  }, [usuario.nivel.id]);

  const calcularProgreso = () => {
    if (!siguienteNivel) return 100; // Nivel máximo alcanzado
    
    const puntosEnNivelActual = usuario.puntosTotales - usuario.nivel.puntosMinimos;
    const puntosNecesariosParaSiguiente = siguienteNivel.puntosMinimos - usuario.nivel.puntosMinimos;
    
    return Math.min((puntosEnNivelActual / puntosNecesariosParaSiguiente) * 100, 100);
  };

  const puntosRestantes = siguienteNivel 
    ? Math.max(siguienteNivel.puntosMinimos - usuario.puntosTotales, 0)
    : 0;

  const progreso = calcularProgreso();

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Progreso hacia el siguiente nivel
      </h3>

      {siguienteNivel ? (
        <>
          {/* Niveles actuales y siguiente */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mb-2 border-2"
                style={{ 
                  backgroundColor: usuario.nivel.color + '20',
                  borderColor: usuario.nivel.color
                }}
              >
                <span className="text-lg">{usuario.nivel.icono}</span>
              </div>
              <p className="text-sm font-medium" style={{ color: usuario.nivel.color }}>
                {usuario.nivel.nombre}
              </p>
            </div>

            <div className="flex-1 mx-4">
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progreso}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-600 mt-1">
                {progreso.toFixed(1)}%
              </p>
            </div>

            <div className="text-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mb-2 border-2 border-dashed"
                style={{ 
                  backgroundColor: siguienteNivel.color + '10',
                  borderColor: siguienteNivel.color
                }}
              >
                <span className="text-lg">{siguienteNivel.icono}</span>
              </div>
              <p className="text-sm font-medium" style={{ color: siguienteNivel.color }}>
                {siguienteNivel.nombre}
              </p>
            </div>
          </div>

          {/* Información de puntos */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {puntosRestantes.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Puntos restantes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {siguienteNivel.puntosMinimos.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Puntos necesarios</p>
              </div>
            </div>
          </div>

          {/* Beneficios del siguiente nivel */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">
              Beneficios del nivel {siguienteNivel.nombre}:
            </h4>
            <ul className="space-y-1">
              {siguienteNivel.beneficios.map((beneficio, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span>
                  {beneficio}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        /* Nivel máximo alcanzado */
        <div className="text-center py-8">
          <div className="text-6xl mb-4">👑</div>
          <h4 className="text-xl font-bold text-gray-800 mb-2">
            ¡Felicitaciones!
          </h4>
          <p className="text-gray-600 mb-4">
            Has alcanzado el nivel máximo: {usuario.nivel.nombre}
          </p>
          
          {/* Beneficios del nivel actual */}
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4">
            <h5 className="font-semibold text-gray-800 mb-2">
              Tus beneficios actuales:
            </h5>
            <ul className="space-y-1">
              {usuario.nivel.beneficios.map((beneficio, index) => (
                <li key={index} className="flex items-center justify-center gap-2 text-sm text-gray-700">
                  <span className="text-yellow-500">⭐</span>
                  {beneficio}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
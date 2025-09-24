'use client';

import { Usuario } from '@/types/puntos';
import { FaCrown, FaStar } from 'react-icons/fa';

interface ProgresoNivelProps {
  usuario: Usuario;
}

export default function ProgresoNivel({ usuario }: ProgresoNivelProps) {
  // Usar datos reales del usuario - estos vienen de la API de gamificación
  const puntosActuales = usuario.puntosTotales;
  const puntosParaSiguiente = usuario.nivel.puntosMaximos;
  const puntosMinimosNivel = usuario.nivel.puntosMinimos;
  
  const calcularProgreso = () => {
    if (puntosParaSiguiente <= puntosMinimosNivel) return 100; // Nivel máximo
    
    const puntosEnNivelActual = puntosActuales - puntosMinimosNivel;
    const puntosNecesariosParaSiguiente = puntosParaSiguiente - puntosMinimosNivel;
    
    return Math.min((puntosEnNivelActual / puntosNecesariosParaSiguiente) * 100, 100);
  };

  const puntosRestantes = Math.max(puntosParaSiguiente - puntosActuales, 0);
  const progreso = calcularProgreso();
  const esNivelMaximo = puntosRestantes === 0 && progreso === 100;

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        {esNivelMaximo ? 'Nivel Máximo Alcanzado' : 'Progreso en tu Nivel'}
      </h3>

      {!esNivelMaximo ? (
        <>
          {/* Nivel actual */}
          <div className="text-center mb-6">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mb-3 border-3 mx-auto"
              style={{ 
                backgroundColor: usuario.nivel.color + '20',
                borderColor: usuario.nivel.color
              }}
            >
              <span className="text-2xl">{usuario.nivel.icono}</span>
            </div>
            <p className="text-lg font-semibold" style={{ color: usuario.nivel.color }}>
              {usuario.nivel.nombre}
            </p>
            <p className="text-sm text-gray-600">
              {usuario.puntosTotales.toLocaleString()} puntos
            </p>
          </div>

          {/* Barra de progreso */}
          <div className="mb-6">
            <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progreso}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>{puntosMinimosNivel.toLocaleString()}</span>
              <span className="font-medium">{progreso.toFixed(1)}%</span>
              <span>{puntosParaSiguiente.toLocaleString()}</span>
            </div>
          </div>

          {/* Información de puntos */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-blue-600">
                  {puntosRestantes.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Puntos restantes</p>
              </div>
              <div>
                <p className="text-xl font-bold text-green-600">
                  {puntosParaSiguiente.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Objetivo siguiente nivel</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Nivel máximo alcanzado */
        <div className="text-center py-8">
          <FaCrown className="text-6xl mb-4 text-yellow-500 mx-auto" />
          <h4 className="text-xl font-bold text-gray-800 mb-2">
            ¡Felicitaciones!
          </h4>
          <p className="text-gray-600 mb-4">
            Has alcanzado el nivel: {usuario.nivel.nombre}
          </p>
          <p className="text-2xl font-bold text-yellow-600">
            {usuario.puntosTotales.toLocaleString()} puntos
          </p>
          {/* Beneficios del nivel actual */}
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 mt-4">
            <h5 className="font-semibold text-gray-800 mb-2">
              Beneficios de tu nivel:
            </h5>
            <ul className="space-y-1">
              {usuario.nivel.beneficios.map((beneficio: string, index: number) => (
                <li key={index} className="flex items-center justify-center gap-2 text-sm text-gray-700">
                  <FaStar className="text-yellow-500" />
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
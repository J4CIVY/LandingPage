'use client';

import { Usuario } from '@/types/puntos';
import { FaMotorcycle, FaUser } from 'react-icons/fa';
import { PiHandWavingLight } from "react-icons/pi";

interface PuntosHeaderProps {
  usuario: Usuario;
}

export default function PuntosHeader({ usuario }: PuntosHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            Hola, {usuario.nombre}!
            <PiHandWavingLight className="inline text-yellow-200" />
          </h2>
          <p className="text-blue-100 mb-4">
            Bienvenido a tu panel de puntos BSK MT
          </p>
          
          {/* Puntos actuales */}
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-3">
              <FaMotorcycle className="text-2xl text-white" />
            </div>
            <div>
              <p className="text-blue-100 text-sm">Puntos totales</p>
              <p className="text-3xl font-bold">
                {usuario.puntosTotales.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Avatar y nivel */}
        <div className="text-center">
          <div className="bg-white/20 rounded-full p-4 mb-3 mx-auto w-16 h-16 flex items-center justify-center">
            {usuario.avatar ? (
              <img 
                src={usuario.avatar} 
                alt={usuario.nombre}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <FaUser className="text-2xl text-white" />
            )}
          </div>
          <div 
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{ backgroundColor: usuario.nivel.color + '20', color: usuario.nivel.color }}
          >
            {usuario.nivel.icono} {usuario.nivel.nombre}
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/20">
        <div className="text-center">
          <p className="text-blue-100 text-sm">Ranking</p>
          <p className="text-xl font-bold">#{usuario.posicionRanking}</p>
        </div>
        <div className="text-center">
          <p className="text-blue-100 text-sm">Nivel actual</p>
          <p className="text-xl font-bold">{usuario.nivel.nombre}</p>
        </div>
      </div>
    </div>
  );
}
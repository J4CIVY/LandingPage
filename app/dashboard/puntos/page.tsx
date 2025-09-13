'use client';

import { useState, useEffect } from 'react';
import { Usuario } from '@/types/puntos';
import PuntosHeader from '@/components/puntos/PuntosHeader';
import ProgresoNivel from '@/components/puntos/ProgresoNivel';
import HistorialPuntos from '@/components/puntos/HistorialPuntos';
import RecompensaCard from '@/components/puntos/RecompensaCard';
import Leaderboard from '@/components/puntos/Leaderboard';
import AdminPanel from '@/components/puntos/AdminPanel';
import { obtenerUsuarioActual, obtenerRecompensas } from '@/data/puntos/mockData';
import { Recompensa } from '@/types/puntos';

export default function PuntosPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [recompensas, setRecompensas] = useState<Recompensa[]>([]);
  const [tabActiva, setTabActiva] = useState<'recompensas' | 'historial' | 'ranking' | 'admin'>('recompensas');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    const cargarDatos = async () => {
      try {
        const usuarioData = await obtenerUsuarioActual();
        const recompensasData = await obtenerRecompensas();
        
        setUsuario(usuarioData);
        setRecompensas(recompensasData);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar datos</h2>
          <p className="text-gray-600">No se pudo cargar la información del usuario</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'recompensas', label: 'Recompensas', icon: '🎁' },
    { id: 'historial', label: 'Historial', icon: '📊' },
    { id: 'ranking', label: 'Ranking', icon: '🏆' },
    ...(usuario.esAdmin ? [{ id: 'admin', label: 'Admin', icon: '⚙️' }] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏍️ Puntos y Recompensas
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Acumula puntos con tus actividades y canjéalos por recompensas exclusivas del BSK Motorcycle Team
          </p>
        </div>

        {/* Puntos Header y Progreso */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PuntosHeader usuario={usuario} />
          <ProgresoNivel usuario={usuario} />
        </div>

        {/* Navegación por pestañas */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-2 mb-6 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTabActiva(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium transition-all duration-200 ${
                  tabActiva === tab.id
                    ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Contenido de las pestañas */}
          <div className="min-h-[400px]">
            {tabActiva === 'recompensas' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Recompensas Disponibles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recompensas.map((recompensa) => (
                    <RecompensaCard
                      key={recompensa.id}
                      recompensa={recompensa}
                      usuario={usuario}
                      onCanje={() => {
                        // Actualizar puntos del usuario después del canje
                        setUsuario(prev => prev ? {
                          ...prev,
                          puntosTotales: prev.puntosTotales - recompensa.costoPuntos
                        } : null);
                      }}
                    />
                  ))}
                </div>
                {recompensas.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎁</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      No hay recompensas disponibles
                    </h3>
                    <p className="text-gray-500">
                      Pronto tendremos nuevas recompensas para ti
                    </p>
                  </div>
                )}
              </div>
            )}

            {tabActiva === 'historial' && <HistorialPuntos usuarioId={usuario.id} />}

            {tabActiva === 'ranking' && <Leaderboard />}

            {tabActiva === 'admin' && usuario.esAdmin && <AdminPanel />}
          </div>
        </div>
      </div>
    </div>
  );
}
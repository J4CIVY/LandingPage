'use client';

import { useState, useEffect } from 'react';
import { EstadisticasAdmin, Recompensa, Usuario } from '@/types/puntos';
import { 
  FaCog, 
  FaChartBar, 
  FaGift, 
  FaStar, 
  FaMotorcycle,
  FaTrophy,
  FaMedal
} from 'react-icons/fa';
// Panel administrativo - usar APIs reales en lugar de mocks

export default function AdminPanel() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasAdmin | null>(null);
  const [recompensas, setRecompensas] = useState<Recompensa[]>([]);
  const [tabActiva, setTabActiva] = useState<'estadisticas' | 'recompensas' | 'puntos'>('estadisticas');
  const [loading, setLoading] = useState(true);
  
  // Estados para formularios
  const [nuevaRecompensa, setNuevaRecompensa] = useState({
    nombre: '',
    descripcion: '',
    costoPuntos: 0,
    categoria: 'Producto' as Recompensa['categoria'],
    stock: undefined as number | undefined,
    nivelMinimo: undefined as number | undefined
  });

  const [asignacionPuntos, setAsignacionPuntos] = useState({
    usuarioEmail: '',
    puntos: 0,
    descripcion: ''
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Usar APIs reales para estadísticas administrativas
        const [recompensasResponse] = await Promise.all([
          fetch('/api/rewards', {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
          })
        ]);

        if (recompensasResponse.ok) {
          const recompensasResult = await recompensasResponse.json();
          if (recompensasResult.success) {
            setRecompensas(recompensasResult.data || []);
          }
        }

        // Estadísticas básicas (pueden expandirse con APIs administrativas reales)
        setEstadisticas({
          puntosGeneradosMes: 0,
          recompensasMasCanjeadas: [],
          topMiembrosActivos: [],
          totalCanjes: 0,
          totalPuntosCirculacion: 0
        });
        
      } catch (error) {
        console.error('Error cargando datos administrativos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleCrearRecompensa = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simular creación de recompensa
    const nuevaRecompensaCompleta: Recompensa = {
      id: `recompensa-${Date.now()}`,
      imagen: '/images/rewards/default.jpg',
      disponible: true,
      ...nuevaRecompensa
    };

    setRecompensas(prev => [...prev, nuevaRecompensaCompleta]);
    
    // Limpiar formulario
    setNuevaRecompensa({
      nombre: '',
      descripcion: '',
      costoPuntos: 0,
      categoria: 'Producto',
      stock: undefined,
      nivelMinimo: undefined
    });

    alert('Recompensa creada exitosamente');
  };

  const handleAsignarPuntos = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simular asignación de puntos
    console.log('Asignando puntos:', asignacionPuntos);
    
    // Limpiar formulario
    setAsignacionPuntos({
      usuarioEmail: '',
      puntos: 0,
      descripcion: ''
    });

    alert('Puntos asignados exitosamente');
  };

  const toggleDisponibilidadRecompensa = (id: string) => {
    setRecompensas(prev => 
      prev.map(r => 
        r.id === id 
          ? { ...r, disponible: !r.disponible }
          : r
      )
    );
  };

  const tabs = [
    { id: 'estadisticas', label: 'Estadísticas', icon: <FaChartBar className="text-blue-500" /> },
    { id: 'recompensas', label: 'Recompensas', icon: <FaGift className="text-pink-500" /> },
    { id: 'puntos', label: 'Asignar Puntos', icon: <FaStar className="text-yellow-500" /> }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
  <div className="dark:bg-slate-950">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FaCog className="text-blue-600 dark:text-blue-400" /> Panel de Administración
        </h3>
        <div className="px-3 py-1 bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 rounded-full text-sm font-medium">
          Solo administradores
        </div>
      </div>

      {/* Navegación de tabs */}
  <div className="flex flex-wrap gap-2 mb-6 border-b dark:border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTabActiva(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium ${
              tabActiva === tab.id
                ? 'bg-blue-600 dark:bg-blue-700 text-white border-b-2 border-blue-600 dark:border-blue-700'
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenido de tabs */}
      {tabActiva === 'estadisticas' && estadisticas && (
  <div className="space-y-6">
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-blue-800 dark:text-blue-300 font-medium mb-2">Puntos Generados (Mes)</h4>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <FaMotorcycle /> {estadisticas.puntosGeneradosMes.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="text-green-800 dark:text-green-300 font-medium mb-2">Total Canjes</h4>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {estadisticas.totalCanjes}
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h4 className="text-purple-800 dark:text-purple-300 font-medium mb-2">Puntos en Circulación</h4>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                <FaMotorcycle /> {estadisticas.totalPuntosCirculacion.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="text-yellow-800 dark:text-yellow-300 font-medium mb-2">Miembros Activos</h4>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {estadisticas.topMiembrosActivos.length}
              </p>
            </div>
          </div>

          {/* Recompensas más canjeadas */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-800 p-6">
            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              Recompensas Más Canjeadas
            </h4>
            <div className="space-y-3">
              {estadisticas.recompensasMasCanjeadas.map((item, index) => (
                <div key={item.recompensa.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {index === 0 ? <FaTrophy className="text-yellow-500 dark:text-yellow-400" /> : 
                       index === 1 ? <FaMedal className="text-gray-400 dark:text-gray-300" /> : 
                       index === 2 ? <FaMedal className="text-orange-600 dark:text-orange-400" /> : 
                       `#${index + 1}`}
                    </span>
                    <div>
                      <p className="font-medium dark:text-white">{item.recompensa.nombre}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {item.recompensa.costoPuntos} puntos
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{item.cantidad}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-300">canjes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top miembros activos */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-800 p-6">
            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              Top Miembros Activos
            </h4>
            <div className="space-y-3">
              {estadisticas.topMiembrosActivos.slice(0, 5).map((usuario: Usuario) => (
                <div key={usuario.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg dark:text-white">#{usuario.posicionRanking}</span>
                    <div>
                      <p className="font-medium dark:text-white">{usuario.nombre}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{usuario.nivel.nombre}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                      <FaMotorcycle className="text-blue-600 dark:text-blue-400" /> {usuario.puntosTotales.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tabActiva === 'recompensas' && (
        <div className="space-y-6">
          {/* Formulario para crear nueva recompensa */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-800 p-6">
            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              Crear Nueva Recompensa
            </h4>
            <form onSubmit={handleCrearRecompensa} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevaRecompensa.nombre}
                    onChange={(e) => setNuevaRecompensa(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Costo en Puntos
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={nuevaRecompensa.costoPuntos}
                    onChange={(e) => setNuevaRecompensa(prev => ({ ...prev, costoPuntos: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={nuevaRecompensa.categoria}
                    onChange={(e) => setNuevaRecompensa(prev => ({ ...prev, categoria: e.target.value as Recompensa['categoria'] }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
                  >
                    <option value="Producto">Producto</option>
                    <option value="Servicio">Servicio</option>
                    <option value="Experiencia">Experiencia</option>
                    <option value="Descuento">Descuento</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stock (opcional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={nuevaRecompensa.stock || ''}
                    onChange={(e) => setNuevaRecompensa(prev => ({ ...prev, stock: e.target.value ? parseInt(e.target.value) : undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  required
                  rows={3}
                  value={nuevaRecompensa.descripcion}
                  onChange={(e) => setNuevaRecompensa(prev => ({ ...prev, descripcion: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
                />
              </div>
              
              <button
                type="submit"
                className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800"
              >
                Crear Recompensa
              </button>
            </form>
          </div>

          {/* Lista de recompensas existentes */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-800 p-6">
            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              Gestionar Recompensas
            </h4>
            <div className="space-y-3">
              {recompensas.map((recompensa) => (
                <div key={recompensa.id} className="flex items-center justify-between p-4 border dark:border-slate-700 rounded-lg">
                  <div className="flex-1">
                    <h5 className="font-medium dark:text-white">{recompensa.nombre}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {recompensa.costoPuntos} puntos • {recompensa.categoria}
                      {recompensa.stock && ` • Stock: ${recompensa.stock}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      recompensa.disponible 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {recompensa.disponible ? 'Activa' : 'Inactiva'}
                    </span>
                    <button
                      onClick={() => toggleDisponibilidadRecompensa(recompensa.id)}
                      className="px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-sm"
                    >
                      {recompensa.disponible ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tabActiva === 'puntos' && (
  <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-800 p-6">
          <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
            Asignar Puntos a Miembro
          </h4>
            <form onSubmit={handleAsignarPuntos} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email del Usuario
              </label>
              <input
                type="email"
                required
                value={asignacionPuntos.usuarioEmail}
                onChange={(e) => setAsignacionPuntos(prev => ({ ...prev, usuarioEmail: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
                placeholder="usuario@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Puntos (puede ser negativo para quitar)
              </label>
              <input
                type="number"
                required
                value={asignacionPuntos.puntos}
                onChange={(e) => setAsignacionPuntos(prev => ({ ...prev, puntos: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
                placeholder="100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción
              </label>
              <input
                type="text"
                required
                value={asignacionPuntos.descripcion}
                onChange={(e) => setAsignacionPuntos(prev => ({ ...prev, descripcion: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
                placeholder="Motivo de la asignación"
              />
            </div>
            
              <button
                type="submit"
                className="w-full bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800"
              >
                Asignar Puntos
              </button>
          </form>
        </div>
      )}
    </div>
  );
}
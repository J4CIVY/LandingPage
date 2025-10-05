'use client';

import { useState, useEffect } from 'react';
import { 
  FaCog, 
  FaChartBar, 
  FaGift, 
  FaStar, 
  FaMotorcycle,
  FaTrophy,
  FaMedal,
  FaUsers,
  FaSync,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';

interface EstadisticasGamificacionAdmin {
  puntosGeneradosMes: number;
  totalCanjes: number;
  canjesEsteMes: number;
  totalPuntosCirculacion: number;
  recompensasMasCanjeadas: Array<{
    recompensaId: string;
    cantidad: number;
    puntosTotal: number;
    nombre: string;
  }>;
  topMiembrosActivos: Array<{
    id: string;
    nombre: string;
    email: string;
    puntosTotales: number;
    nivel: string;
    eventosAsistidos: number;
  }>;
  usuariosActivosEsteMes: number;
  totalRecompensas: number;
  stockRecompensas: number;
}

export default function AdminPanel() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasGamificacionAdmin | null>(null);
  const [recompensas, setRecompensas] = useState<any[]>([]);
  const [tabActiva, setTabActiva] = useState<'estadisticas' | 'recompensas' | 'puntos'>('estadisticas');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Estados para formularios
  const [nuevaRecompensa, setNuevaRecompensa] = useState({
    nombre: '',
    descripcion: '',
    costoPuntos: 0,
    categoria: 'merchandising',
    stock: undefined as number | undefined,
    imagen: '',
    condiciones: ''
  });

  const [asignacionPuntos, setAsignacionPuntos] = useState({
    usuarioEmail: '',
    puntos: 0,
    descripcion: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar estadísticas de gamificación
      const statsResponse = await fetch('/api/admin/gamification/stats', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (statsResponse.ok) {
        const statsResult = await statsResponse.json();
        if (statsResult.success) {
          setEstadisticas(statsResult.data);
        }
      } else if (statsResponse.status === 403) {
        setError('No tienes permisos de administrador');
      }

      // Cargar recompensas
      const recompensasResponse = await fetch('/api/rewards', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (recompensasResponse.ok) {
        const recompensasResult = await recompensasResponse.json();
        if (recompensasResult.success) {
          setRecompensas(recompensasResult.data || []);
        }
      }
    } catch (error) {
      console.error('Error cargando datos administrativos:', error);
      setError('Error al cargar datos administrativos');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearRecompensa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/admin/gamification/rewards', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaRecompensa)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccessMessage(`✅ Recompensa "${nuevaRecompensa.nombre}" creada exitosamente`);
        
        // Limpiar formulario
        setNuevaRecompensa({
          nombre: '',
          descripcion: '',
          costoPuntos: 0,
          categoria: 'merchandising',
          stock: undefined,
          imagen: '',
          condiciones: ''
        });

        // Recargar recompensas
        await cargarDatos();
      } else {
        setError(`❌ ${result.error || 'Error al crear recompensa'}`);
      }
    } catch (error) {
      console.error('Error creando recompensa:', error);
      setError('❌ Error al crear recompensa');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAsignarPuntos = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/admin/gamification/assign-points', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asignacionPuntos)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccessMessage(`✅ ${result.message}`);
        
        // Limpiar formulario
        setAsignacionPuntos({
          usuarioEmail: '',
          puntos: 0,
          descripcion: ''
        });

        // Recargar estadísticas
        await cargarDatos();
      } else {
        setError(`❌ ${result.error || 'Error al asignar puntos'}`);
      }
    } catch (error) {
      console.error('Error asignando puntos:', error);
      setError('❌ Error al asignar puntos');
    } finally {
      setSubmitting(false);
    }
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
        <span className="ml-3 text-gray-600 dark:text-gray-300">Cargando panel administrativo...</span>
      </div>
    );
  }

  return (
    <div className="dark:bg-slate-950">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FaCog className="text-blue-600 dark:text-blue-400" /> Panel de Administración
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={cargarDatos}
            disabled={loading}
            className="px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900 flex items-center gap-2 disabled:opacity-50"
          >
            <FaSync className={`text-xs ${loading ? 'animate-spin' : ''}`} /> Actualizar
          </button>
          <div className="px-3 py-1 bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 rounded-full text-sm font-medium">
            Solo administradores
          </div>
        </div>
      </div>

      {/* Mensajes de éxito/error */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 rounded-lg flex items-center gap-2">
          <FaCheckCircle /> {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 rounded-lg flex items-center gap-2">
          <FaTimesCircle /> {error}
        </div>
      )}

      {/* Navegación de tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b dark:border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setTabActiva(tab.id as any);
              setError(null);
              setSuccessMessage(null);
            }}
            className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium transition-colors ${
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
              <h4 className="text-blue-800 dark:text-blue-300 font-medium mb-2 text-sm">Puntos Generados (Mes)</h4>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <FaMotorcycle /> {estadisticas.puntosGeneradosMes.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="text-green-800 dark:text-green-300 font-medium mb-2 text-sm">Canjes este Mes</h4>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {estadisticas.canjesEsteMes} / {estadisticas.totalCanjes}
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h4 className="text-purple-800 dark:text-purple-300 font-medium mb-2 text-sm">Puntos en Circulación</h4>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                <FaMotorcycle /> {estadisticas.totalPuntosCirculacion.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="text-yellow-800 dark:text-yellow-300 font-medium mb-2 text-sm">Usuarios Activos (Mes)</h4>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                <FaUsers /> {estadisticas.usuariosActivosEsteMes}
              </p>
            </div>
          </div>

          {/* Recompensas más canjeadas */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-800 p-6">
            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              Recompensas Más Canjeadas
            </h4>
            {estadisticas.recompensasMasCanjeadas.length > 0 ? (
              <div className="space-y-3">
                {estadisticas.recompensasMasCanjeadas.map((item, index) => (
                  <div key={item.recompensaId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {index === 0 ? <FaTrophy className="text-yellow-500 dark:text-yellow-400" /> : 
                         index === 1 ? <FaMedal className="text-gray-400 dark:text-gray-300" /> : 
                         index === 2 ? <FaMedal className="text-orange-600 dark:text-orange-400" /> : 
                         <span className="text-gray-500">#{index + 1}</span>}
                      </span>
                      <div>
                        <p className="font-medium dark:text-white">{item.nombre}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {item.puntosTotal.toLocaleString()} puntos totales
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
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay canjes registrados aún</p>
            )}
          </div>

          {/* Top miembros activos */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-800 p-6">
            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              Top Miembros Activos
            </h4>
            {estadisticas.topMiembrosActivos.length > 0 ? (
              <div className="space-y-3">
                {estadisticas.topMiembrosActivos.slice(0, 10).map((usuario, index) => (
                  <div key={usuario.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-lg font-bold text-gray-500 dark:text-gray-400 w-8">#{index + 1}</span>
                      <div className="flex-1">
                        <p className="font-medium dark:text-white">{usuario.nombre}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{usuario.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Nivel: {usuario.nivel} • {usuario.eventosAsistidos} eventos asistidos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <FaMotorcycle className="text-blue-600 dark:text-blue-400" /> 
                        {usuario.puntosTotales.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay usuarios activos aún</p>
            )}
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
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={nuevaRecompensa.nombre}
                    onChange={(e) => setNuevaRecompensa(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
                    placeholder="Ej: Camiseta BSK MT"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Costo en Puntos *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={nuevaRecompensa.costoPuntos}
                    onChange={(e) => setNuevaRecompensa(prev => ({ ...prev, costoPuntos: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
                    placeholder="500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categoría *
                  </label>
                  <select
                    value={nuevaRecompensa.categoria}
                    onChange={(e) => setNuevaRecompensa(prev => ({ ...prev, categoria: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
                  >
                    <option value="merchandising">Merchandising</option>
                    <option value="descuentos">Descuentos</option>
                    <option value="eventos">Eventos</option>
                    <option value="digital">Digital</option>
                    <option value="experiencias">Experiencias</option>
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
                    placeholder="Dejar vacío para ilimitado"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL de Imagen (opcional)
                  </label>
                  <input
                    type="text"
                    value={nuevaRecompensa.imagen}
                    onChange={(e) => setNuevaRecompensa(prev => ({ ...prev, imagen: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción *
                </label>
                <textarea
                  required
                  rows={3}
                  value={nuevaRecompensa.descripcion}
                  onChange={(e) => setNuevaRecompensa(prev => ({ ...prev, descripcion: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
                  placeholder="Describe la recompensa..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Condiciones (opcional)
                </label>
                <textarea
                  rows={2}
                  value={nuevaRecompensa.condiciones}
                  onChange={(e) => setNuevaRecompensa(prev => ({ ...prev, condiciones: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
                  placeholder="Términos y condiciones..."
                />
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? 'Creando...' : 'Crear Recompensa'}
              </button>
            </form>
          </div>

          {/* Lista de recompensas existentes */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-800 p-6">
            <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              Recompensas Actuales ({recompensas.length})
            </h4>
            {recompensas.length > 0 ? (
              <div className="space-y-3">
                {recompensas.map((recompensa: any) => (
                  <div key={recompensa._id} className="flex items-center justify-between p-4 border dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex-1">
                      <h5 className="font-medium dark:text-white">{recompensa.nombre}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {recompensa.costoPuntos.toLocaleString()} puntos • {recompensa.categoria}
                        {recompensa.stock !== null && ` • Stock: ${recompensa.stock}`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {recompensa.descripcion}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        recompensa.disponible 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {recompensa.disponible ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay recompensas creadas aún</p>
            )}
          </div>
        </div>
      )}

      {tabActiva === 'puntos' && (
        <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-800 p-6">
          <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
            Asignar Puntos a Usuario
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Asigna puntos manualmente a un usuario por email. Puedes usar números positivos para dar puntos o negativos para quitarlos.
          </p>
          <form onSubmit={handleAsignarPuntos} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email del Usuario *
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
                Puntos * <span className="text-xs text-gray-500">(positivo para dar, negativo para quitar)</span>
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
                Descripción *
              </label>
              <input
                type="text"
                required
                value={asignacionPuntos.descripcion}
                onChange={(e) => setAsignacionPuntos(prev => ({ ...prev, descripcion: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200"
                placeholder="Motivo de la asignación"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Esta descripción aparecerá en el historial del usuario
              </p>
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 dark:bg-blue-700 text-white px-4 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <FaSync className="animate-spin" /> Asignando...
                </>
              ) : (
                <>
                  <FaStar /> Asignar Puntos
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

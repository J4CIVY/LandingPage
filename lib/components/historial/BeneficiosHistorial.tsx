'use client';

import { useState, useEffect } from 'react';
import { 
  FaGift,
  FaWrench,
  FaCalendarAlt,
  FaQrcode,
  FaTicketAlt,
  FaSearch,
  FaEye,
  FaDownload,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaTags,
  FaPercent,
  FaMapMarkerAlt
} from 'react-icons/fa';
import type { BeneficioHistorial } from '@/types/historial';

export default function BeneficiosHistorial() {
  const [beneficios, setBeneficios] = useState<BeneficioHistorial[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<'todos' | 'descuento' | 'producto_gratis' | 'servicio' | 'evento_especial'>('todos');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'usado' | 'activo' | 'vencido'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulación de carga de datos
    const beneficiosData: BeneficioHistorial[] = [
      {
        id: '1',
        nombre: 'Descuento 20% en mantenimiento',
        categoria: 'descuento',
        fechaUso: '2024-08-20T14:30:00Z',
        codigoAplicado: 'BSK20MANT',
        valorOriginal: 250000,
        valorDescuento: 50000,
        valorFinal: 200000,
        establecimiento: 'Taller MotoTech',
        estado: 'usado'
      },
      {
        id: '2',
        nombre: 'Almuerzo gratis en evento',
        categoria: 'producto_gratis',
        fechaUso: '2024-07-15T12:00:00Z',
        valorOriginal: 25000,
        valorDescuento: 25000,
        valorFinal: 0,
        establecimiento: 'Restaurante La Ruta',
        estado: 'usado'
      },
      {
        id: '3',
        nombre: 'Descuento 15% en llantas',
        categoria: 'descuento',
        fechaUso: '2024-06-10T16:45:00Z',
        codigoAplicado: 'BSK15LLANTAS',
        qrCode: 'QR_BSK_2024_003',
        valorOriginal: 400000,
        valorDescuento: 60000,
        valorFinal: 340000,
        establecimiento: 'Llantería Speed',
        estado: 'usado'
      },
      {
        id: '4',
        nombre: 'Lavado de moto premium gratis',
        categoria: 'servicio',
        fechaUso: '2024-05-25T10:15:00Z',
        valorOriginal: 35000,
        valorDescuento: 35000,
        valorFinal: 0,
        establecimiento: 'Lavadero BSK Premium',
        estado: 'usado'
      },
      {
        id: '5',
        nombre: 'Entrada gratis a track day',
        categoria: 'evento_especial',
        fechaUso: '2024-04-30T08:00:00Z',
        valorOriginal: 150000,
        valorDescuento: 150000,
        valorFinal: 0,
        establecimiento: 'Autódromo de Tocancipá',
        estado: 'usado'
      },
      {
        id: '6',
        nombre: 'Descuento 25% en accesorios',
        categoria: 'descuento',
        fechaUso: '2024-12-31T23:59:59Z',
        codigoAplicado: 'BSK25ACC',
        valorOriginal: 0,
        valorDescuento: 0,
        valorFinal: 0,
        establecimiento: 'Tienda Moto Accessories',
        estado: 'activo'
      }
    ];

    setTimeout(() => {
      setBeneficios(beneficiosData);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case 'descuento': return FaPercent;
      case 'producto_gratis': return FaGift;
      case 'servicio': return FaWrench;
      case 'evento_especial': return FaCalendarAlt;
      default: return FaTags;
    }
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'descuento': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'producto_gratis': return 'text-green-600 bg-green-50 border-green-200';
      case 'servicio': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'evento_especial': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'usado': return FaCheckCircle;
      case 'activo': return FaClock;
      case 'vencido': return FaTimesCircle;
      default: return FaClock;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'usado': return 'text-green-600 bg-green-50';
      case 'activo': return 'text-blue-600 bg-blue-50';
      case 'vencido': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels = {
      descuento: 'Descuento',
      producto_gratis: 'Producto Gratis',
      servicio: 'Servicio',
      evento_especial: 'Evento Especial'
    };
    return labels[categoria as keyof typeof labels] || categoria;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (date > new Date()) {
      return `Válido hasta ${date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })}`;
    }
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calcularPorcentajeDescuento = (original: number, descuento: number) => {
    if (original === 0) return 0;
    return Math.round((descuento / original) * 100);
  };

  // Filtrar beneficios
  const beneficiosFiltrados = beneficios.filter(beneficio => {
    const matchBusqueda = beneficio.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                         beneficio.establecimiento.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = filtroCategoria === 'todos' || beneficio.categoria === filtroCategoria;
    const matchEstado = filtroEstado === 'todos' || beneficio.estado === filtroEstado;
    
    return matchBusqueda && matchCategoria && matchEstado;
  });

  const calcularEstadisticas = () => {
    const total = beneficios.length;
    const usados = beneficios.filter(b => b.estado === 'usado').length;
    const activos = beneficios.filter(b => b.estado === 'activo').length;
    const ahorroTotal = beneficios
      .filter(b => b.estado === 'usado')
      .reduce((sum, b) => sum + b.valorDescuento, 0);

    return { total, usados, activos, ahorroTotal };
  };

  const stats = calcularEstadisticas();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-950 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Historial de Beneficios</h2>
          <p className="text-gray-600 dark:text-gray-300">Beneficios utilizados y disponibles para tu membresía</p>
        </div>
        
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 lg:mt-0">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.usados}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Usados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.activos}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Activos</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{formatCurrency(stats.ahorroTotal)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Ahorrado</div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
  <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4 mb-6">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Buscar beneficios o establecimientos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* Filtro por categoría */}
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
          className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
        >
          <option value="todos">Todas las categorías</option>
          <option value="descuento">Descuentos</option>
          <option value="producto_gratis">Productos Gratis</option>
          <option value="servicio">Servicios</option>
          <option value="evento_especial">Eventos Especiales</option>
        </select>

        {/* Filtro por estado */}
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as any)} // eslint-disable-line @typescript-eslint/no-explicit-any
          className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
        >
          <option value="todos">Todos los estados</option>
          <option value="usado">Usados</option>
          <option value="activo">Activos</option>
          <option value="vencido">Vencidos</option>
        </select>
      </div>

      {/* Lista de beneficios */}
      <div className="space-y-4">
        {beneficiosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <FaGift className="text-gray-300 text-6xl mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay beneficios</h3>
            <p className="text-gray-500">No se encontraron beneficios con los filtros seleccionados.</p>
          </div>
        ) : (
          beneficiosFiltrados.map((beneficio) => {
            const CategoriaIcon = getCategoriaIcon(beneficio.categoria);
            const EstadoIcon = getEstadoIcon(beneficio.estado);
            const porcentajeDescuento = calcularPorcentajeDescuento(beneficio.valorOriginal, beneficio.valorDescuento);
            
            return (
              <div
                key={beneficio.id}
                className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3 mb-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${getCategoriaColor(beneficio.categoria)}`}>
                        <CategoriaIcon className="text-lg" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{beneficio.nombre}</h3>
                        
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoriaColor(beneficio.categoria)}`}>
                            <CategoriaIcon className="mr-1 text-xs" />
                            {getCategoriaLabel(beneficio.categoria)}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(beneficio.estado)}`}>
                            <EstadoIcon className="mr-1 text-xs" />
                            {beneficio.estado.charAt(0).toUpperCase() + beneficio.estado.slice(1)}
                          </span>
                          {beneficio.valorDescuento > 0 && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              {porcentajeDescuento}% descuento
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="mr-2 text-gray-400 dark:text-gray-500" />
                            {beneficio.establecimiento}
                          </div>
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-2 text-gray-400 dark:text-gray-500" />
                            {beneficio.estado === 'usado' ? 'Usado el ' : ''}{formatDate(beneficio.fechaUso)}
                          </div>
                          {beneficio.codigoAplicado && (
                            <div className="flex items-center">
                              <FaTicketAlt className="mr-2 text-gray-400 dark:text-gray-500" />
                              Código: {beneficio.codigoAplicado}
                            </div>
                          )}
                          {beneficio.qrCode && (
                            <div className="flex items-center">
                              <FaQrcode className="mr-2 text-gray-400 dark:text-gray-500" />
                              QR: {beneficio.qrCode}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col lg:items-end space-y-2 mt-3 lg:mt-0 lg:ml-4">
                    {/* Valores */}
                    <div className="text-right">
                      {beneficio.valorDescuento > 0 && (
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          Ahorro: {formatCurrency(beneficio.valorDescuento)}
                        </div>
                      )}
                      {beneficio.valorOriginal > 0 && beneficio.estado === 'usado' && (
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="line-through">{formatCurrency(beneficio.valorOriginal)}</span>
                          {beneficio.valorFinal > 0 && (
                            <span className="ml-2 font-medium">{formatCurrency(beneficio.valorFinal)}</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Acciones */}
                    <div className="flex items-center space-x-2">
                      <button className="flex items-center space-x-1 px-3 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg">
                        <FaEye />
                        <span className="text-sm">Ver</span>
                      </button>
                      {(beneficio.codigoAplicado || beneficio.qrCode) && beneficio.estado === 'usado' && (
                        <button className="flex items-center space-x-1 px-3 py-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-slate-800 rounded-lg">
                          <FaDownload />
                          <span className="text-sm">Comprobante</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
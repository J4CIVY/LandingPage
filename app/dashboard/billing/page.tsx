'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  FaFileInvoiceDollar, 
  FaSpinner, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaCalendarAlt,
  FaCreditCard,
  FaDownload,
  FaEye,
  FaFilter,
  FaSearch,
  FaInfoCircle,
  FaFileAlt,
  FaCircle,
  FaSync,
  FaBan
} from 'react-icons/fa';

interface Transaction {
  _id: string;
  userId: string;
  eventId?: string;
  eventName?: string | null;
  eventNotFound?: boolean;
  eventError?: boolean;
  orderId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'APPROVED' | 'DECLINED' | 'REJECTED' | 'FAILED' | 'ERROR' | 'CANCELLED' | 'VOIDED';
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

interface BillingStats {
  totalPagos: number;
  totalAprobados: number;
  totalPendientes: number;
  totalRechazados: number;
  montoTotal: number;
}

export default function BillingPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    dateFrom: '',
    dateTo: ''
  });

  // Verificar autenticación
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/login?redirect=/dashboard/billing';
    }
  }, [isAuthenticated, authLoading]);

  // Cargar transacciones
  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  // Aplicar filtros
  useEffect(() => {
    applyFilters();
  }, [filters, transactions]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/bold/transactions/user', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.data?.transactions || []);
      } else {
        throw new Error('No se pudieron cargar las transacciones');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Filtro por búsqueda (nombre de evento o ID de orden)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t => {
        // Buscar en ID de orden
        const matchesOrderId = t.orderId.toLowerCase().includes(searchLower);
        
        // Buscar en nombre de evento (si existe)
        const matchesEventName = t.eventName 
          ? t.eventName.toLowerCase().includes(searchLower)
          : false;
        
        // Buscar en estados de evento
        const matchesEventStatus = 
          (t.eventNotFound && 'eliminado'.includes(searchLower)) ||
          (t.eventError && 'error'.includes(searchLower)) ||
          (!t.eventName && !t.eventId && 'sin evento'.includes(searchLower));
        
        return matchesOrderId || matchesEventName || matchesEventStatus;
      });
    }

    // Filtro por estado
    if (filters.status !== 'all') {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    // Filtro por fecha desde
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(t => new Date(t.createdAt) >= fromDate);
    }

    // Filtro por fecha hasta
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => new Date(t.createdAt) <= toDate);
    }

    setFilteredTransactions(filtered);
  };

  // Calcular estadísticas con useMemo para optimización
  const stats = useMemo((): BillingStats => {
    return {
      totalPagos: transactions.length,
      totalAprobados: transactions.filter(t => t.status === 'APPROVED').length,
      totalPendientes: transactions.filter(t => t.status === 'PENDING' || t.status === 'PROCESSING').length,
      totalRechazados: transactions.filter(t => 
        t.status === 'DECLINED' || 
        t.status === 'REJECTED' || 
        t.status === 'FAILED' || 
        t.status === 'ERROR' || 
        t.status === 'CANCELLED' || 
        t.status === 'VOIDED'
      ).length,
      montoTotal: transactions
        .filter(t => t.status === 'APPROVED')
        .reduce((sum, t) => sum + t.amount, 0)
    };
  }, [transactions]); // Se recalcula solo cuando cambian las transacciones

  const getStatusBadge = (status: string) => {
    const badges = {
      APPROVED: {
        icon: <FaCheckCircle className="mr-1" />,
        text: 'Aprobado',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      },
      PENDING: {
        icon: <FaClock className="mr-1" />,
        text: 'Pendiente',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      },
      PROCESSING: {
        icon: <FaClock className="mr-1" />,
        text: 'En Proceso',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      },
      DECLINED: {
        icon: <FaTimesCircle className="mr-1" />,
        text: 'Rechazado',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      },
      REJECTED: {
        icon: <FaTimesCircle className="mr-1" />,
        text: 'Rechazado',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      },
      FAILED: {
        icon: <FaExclamationTriangle className="mr-1" />,
        text: 'Fallido',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      },
      ERROR: {
        icon: <FaExclamationTriangle className="mr-1" />,
        text: 'Error',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      },
      CANCELLED: {
        icon: <FaTimesCircle className="mr-1" />,
        text: 'Cancelado',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      },
      VOIDED: {
        icon: <FaTimesCircle className="mr-1" />,
        text: 'Anulado',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      }
    };

    const badge = badges[status as keyof typeof badges] || {
      icon: <FaExclamationTriangle className="mr-1" />,
      text: status || 'Desconocido',
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  const handleViewDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleViewInvoice = (transaction: Transaction) => {
    // Abrir factura en nueva ventana (desde dashboard tiene cookies de sesión)
    const invoiceUrl = `/api/bold/transactions/${transaction._id}/invoice`;
    window.open(invoiceUrl, '_blank');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">Error</h1>
          <p className="text-gray-600 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchTransactions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 flex items-center">
            <FaFileInvoiceDollar className="mr-3 text-purple-600 dark:text-purple-400" />
            Facturación y Pagos
          </h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">
            Administra tu historial de pagos, transacciones y genera facturas
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Total Pagos */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Pagos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stats.totalPagos}</p>
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">Todas las transacciones</p>
              </div>
              <FaFileInvoiceDollar className="text-3xl text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          {/* Aprobados */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Aprobados</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalAprobados}</p>
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                  {stats.totalPagos > 0 ? `${Math.round((stats.totalAprobados / stats.totalPagos) * 100)}% del total` : '0%'}
                </p>
              </div>
              <FaCheckCircle className="text-3xl text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* Pendientes */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.totalPendientes}</p>
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                  {stats.totalPagos > 0 ? `${Math.round((stats.totalPendientes / stats.totalPagos) * 100)}% del total` : '0%'}
                </p>
              </div>
              <FaClock className="text-3xl text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          {/* Rechazados */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Rechazados</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.totalRechazados}</p>
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                  {stats.totalPagos > 0 ? `${Math.round((stats.totalRechazados / stats.totalPagos) * 100)}% del total` : '0%'}
                </p>
              </div>
              <FaTimesCircle className="text-3xl text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Monto Total */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Monto Total</p>
                <p className="text-2xl font-bold text-white">
                  ${stats.montoTotal.toLocaleString('es-CO')}
                </p>
                <p className="text-xs text-blue-100 mt-1">
                  {stats.totalAprobados} {stats.totalAprobados === 1 ? 'pago aprobado' : 'pagos aprobados'}
                </p>
              </div>
              <FaCreditCard className="text-3xl text-blue-100" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-8">
          <div className="flex items-center mb-4">
            <FaFilter className="mr-2 text-gray-600 dark:text-slate-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                <FaSearch className="inline mr-1" />
                Buscar
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                placeholder="Buscar por evento, orden o estado..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Estado
              </label>
              <div className="relative">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
                >
                  <option value="all">Todos los estados</option>
                  <option value="APPROVED">Aprobados</option>
                  <option value="PENDING">Pendientes</option>
                  <option value="PROCESSING">En Proceso</option>
                  <option value="DECLINED">Rechazados</option>
                  <option value="REJECTED">Rechazados (Bold)</option>
                  <option value="FAILED">Fallidos</option>
                  <option value="CANCELLED">Cancelados</option>
                  <option value="VOIDED">Anulados</option>
                </select>
                {/* Icono indicador basado en el estado seleccionado */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {filters.status === 'all' && <FaFilter className="text-gray-400" />}
                  {filters.status === 'APPROVED' && <FaCheckCircle className="text-green-600" />}
                  {filters.status === 'PENDING' && <FaClock className="text-yellow-600" />}
                  {filters.status === 'PROCESSING' && <FaSync className="text-blue-600" />}
                  {filters.status === 'DECLINED' && <FaTimesCircle className="text-red-600" />}
                  {filters.status === 'REJECTED' && <FaTimesCircle className="text-red-600" />}
                  {filters.status === 'FAILED' && <FaExclamationTriangle className="text-red-600" />}
                  {filters.status === 'CANCELLED' && <FaBan className="text-gray-600" />}
                  {filters.status === 'VOIDED' && <FaCircle className="text-gray-600" />}
                </div>
                {/* Flecha dropdown */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Fecha Desde
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setFilters({ search: '', status: 'all', dateFrom: '', dateTo: '' })}
              className="px-4 py-2 text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Tabla de transacciones */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              Historial de Transacciones ({filteredTransactions.length})
            </h2>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <FaFileInvoiceDollar className="text-5xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-slate-400">No hay transacciones para mostrar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Evento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      ID Orden
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-2 text-gray-400" />
                          {new Date(transaction.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-100">
                        {transaction.eventName ? (
                          transaction.eventName
                        ) : transaction.eventNotFound ? (
                          <span className="text-amber-600 dark:text-amber-400 italic">Evento eliminado</span>
                        ) : transaction.eventError ? (
                          <span className="text-red-600 dark:text-red-400 italic">Error al cargar</span>
                        ) : transaction.eventId ? (
                          <span className="text-gray-500 dark:text-slate-500 italic">Cargando...</span>
                        ) : (
                          <span className="text-gray-500 dark:text-slate-500 italic">Sin evento asociado</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 font-mono">
                        {transaction.orderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-slate-100">
                        ${transaction.amount.toLocaleString('es-CO')} {transaction.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleViewDetail(transaction)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            title="Ver detalles"
                          >
                            <FaInfoCircle className="text-lg" />
                          </button>
                          {transaction.status === 'APPROVED' && (
                            <button
                              onClick={() => handleViewInvoice(transaction)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                              title="Ver factura"
                            >
                              <FaFileAlt className="text-lg" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      {showDetailModal && selectedTransaction && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Fondo oscuro con overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={() => setShowDetailModal(false)}
              aria-hidden="true"
            ></div>

            {/* Centrado del modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="relative inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center mb-4">
                  <FaInfoCircle className="text-blue-600 dark:text-blue-400 text-2xl mr-3" />
                  <h3 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    Detalles de la Transacción
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">ID de Orden</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-slate-100 font-mono">{selectedTransaction.orderId}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Evento</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-slate-100">
                      {selectedTransaction.eventName ? (
                        selectedTransaction.eventName
                      ) : selectedTransaction.eventNotFound ? (
                        <span className="text-amber-600 dark:text-amber-400 italic">Evento eliminado o no disponible</span>
                      ) : selectedTransaction.eventError ? (
                        <span className="text-red-600 dark:text-red-400 italic">Error al cargar evento</span>
                      ) : selectedTransaction.eventId ? (
                        <span className="text-gray-500 dark:text-slate-500 italic">Evento no disponible</span>
                      ) : (
                        <span className="text-gray-500 dark:text-slate-500 italic">Sin evento asociado</span>
                      )}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Monto</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-slate-100 font-semibold">
                      ${selectedTransaction.amount.toLocaleString('es-CO')} {selectedTransaction.currency}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Estado</label>
                    <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                  </div>

                  {selectedTransaction.paymentMethod && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Método de Pago</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-slate-100">{selectedTransaction.paymentMethod}</p>
                    </div>
                  )}

                  {selectedTransaction.transactionId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">ID de Transacción</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-slate-100 font-mono">{selectedTransaction.transactionId}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Fecha de Creación</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-slate-100">
                      {new Date(selectedTransaction.createdAt).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                {selectedTransaction.status === 'APPROVED' && (
                  <button
                    onClick={() => {
                      handleViewInvoice(selectedTransaction);
                      setShowDetailModal(false);
                    }}
                    className="w-full inline-flex items-center justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm transition-colors"
                  >
                    <FaFileAlt className="mr-2" />
                    Ver Factura
                  </button>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:w-auto sm:text-sm transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { FaDownload, FaEye, FaCalendarAlt, FaCreditCard, FaCheck, FaTimes, FaExclamationTriangle, FaHistory, FaSync } from 'react-icons/fa';

interface MembershipHistoryItem {
  id: string;
  membershipType: string;
  startDate: string;
  endDate: string;
  status: string;
  amount: number;
  paymentMethod: string;
  renewalNumber?: number;
  isAutoRenewal?: boolean;
  description?: string;
}

interface MembershipHistoryProps {
  history: MembershipHistoryItem[];
}

const membershipTypeNames: Record<string, string> = {
  friend: 'Amigo',
  rider: 'Rider',
  'rider-duo': 'Rider Dúo',
  pro: 'Profesional',
  'pro-duo': 'Profesional Dúo'
};

const statusConfig: Record<string, { color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  active: {
    color: 'text-green-800 dark:text-green-200',
    bgColor: 'bg-green-100 dark:bg-green-900',
    icon: FaCheck
  },
  expired: {
    color: 'text-red-800 dark:text-red-200',
    bgColor: 'bg-red-100 dark:bg-red-900',
    icon: FaTimes
  },
  cancelled: {
    color: 'text-gray-800 dark:text-gray-200',
    bgColor: 'bg-gray-100 dark:bg-slate-800',
    icon: FaTimes
  },
  pending: {
    color: 'text-yellow-800 dark:text-yellow-200',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900',
    icon: FaExclamationTriangle
  }
};

export default function MembershipHistory({ history }: MembershipHistoryProps) {
  // Calcular estadísticas del historial
  const stats = {
    totalRenewals: history.filter(item => item.renewalNumber && item.renewalNumber > 1).length,
    totalSpent: history.reduce((total, item) => total + item.amount, 0),
    activeCount: history.filter(item => item.status === 'active').length,
    autoRenewals: history.filter(item => item.isAutoRenewal).length
  };
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha no disponible';
      }
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha no disponible';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusDisplay = (status: string) => {
    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
    const StatusIcon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
        <StatusIcon className="w-3 h-3 mr-1" />
        {status === 'active' && 'Activa'}
        {status === 'expired' && 'Vencida'}
        {status === 'cancelled' && 'Cancelada'}
        {status === 'pending' && 'Pendiente'}
      </span>
    );
  };

  const handleDownloadReceipt = (historyItem: MembershipHistoryItem) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    // Aquí implementar la lógica para descargar el recibo
  };

  const handleViewDetails = (historyItem: MembershipHistoryItem) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    // Aquí implementar la lógica para ver detalles
  };

  return (
  <div className="bg-white dark:bg-slate-950 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FaHistory className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          Historial de Membresías
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-300">
          {history.length} {history.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      {history.length > 0 ? (
        <>
          {/* Resumen estadístico */}
          {history.length > 1 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.totalRenewals}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Renovaciones</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(stats.totalSpent)}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Total invertido</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.activeCount}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Activas</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{stats.autoRenewals}</div>
                <div className="text-xs text-gray-600 dark:text-gray-300">Auto-renovaciones</div>
              </div>
            </div>
          )}

          {/* Vista móvil - Cards */}
          <div className="block md:hidden space-y-4">
            {history.map((item) => (
              <div key={item.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {membershipTypeNames[item.membershipType] || item.membershipType}
                    </h3>
                    {item.renewalNumber && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <FaSync className="w-3 h-3" />
                        {item.renewalNumber === 1 ? 'Membresía inicial' : `Renovación #${item.renewalNumber - 1}`}
                        {item.isAutoRenewal && ' (Auto-renovación)'}
                      </p>
                    )}
                  </div>
                  {getStatusDisplay(item.status)}
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span>{formatDate(item.startDate)} - {formatDate(item.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCreditCard className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span>{item.paymentMethod}</span>
                  </div>
                  {item.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {item.description}
                    </div>
                  )}
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(item.amount)}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleViewDetails(item)}
                    className="flex-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 font-medium py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2"
                  >
                    <FaEye className="w-4 h-4" />
                    Ver Detalles
                  </button>
                  <button
                    onClick={() => handleDownloadReceipt(item)}
                    className="flex-1 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800 text-white font-medium py-2 px-3 rounded-lg text-sm flex items-center justify-center gap-2"
                  >
                    <FaDownload className="w-4 h-4" />
                    Recibo
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Vista desktop - Tabla */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Tipo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Vigencia</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Estado</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Monto</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Pago</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-900">
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {membershipTypeNames[item.membershipType] || item.membershipType}
                        </span>
                        {item.renewalNumber && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                            <FaSync className="w-3 h-3" />
                            {item.renewalNumber === 1 ? 'Inicial' : `Renovación #${item.renewalNumber - 1}`}
                            {item.isAutoRenewal && ' (Auto)'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <div>
                          <div>{formatDate(item.startDate)}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">a {formatDate(item.endDate)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusDisplay(item.status)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(item.amount)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <FaCreditCard className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span>{item.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
                          title="Ver detalles"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadReceipt(item)}
                          className="p-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg"
                          title="Descargar recibo"
                        >
                          <FaDownload className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <FaHistory className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Sin historial de membresías
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Tu historial de membresías y renovaciones aparecerá aquí.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Las membresías se renuevan automáticamente cada año.
          </p>
        </div>
      )}
    </div>
  );
}
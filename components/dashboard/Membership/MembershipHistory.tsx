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
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    icon: FaCheck
  },
  expired: {
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    icon: FaTimes
  },
  cancelled: {
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    icon: FaTimes
  },
  pending: {
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
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

  const handleDownloadReceipt = (historyItem: MembershipHistoryItem) => {
    // Aquí implementar la lógica para descargar el recibo
    console.log('Downloading receipt for:', historyItem.id);
  };

  const handleViewDetails = (historyItem: MembershipHistoryItem) => {
    // Aquí implementar la lógica para ver detalles
    console.log('Viewing details for:', historyItem.id);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FaHistory className="w-5 h-5 text-blue-500" />
          Historial de Membresías
        </h2>
        <span className="text-sm text-gray-500">
          {history.length} {history.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      {history.length > 0 ? (
        <>
          {/* Resumen estadístico */}
          {history.length > 1 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{stats.totalRenewals}</div>
                <div className="text-xs text-gray-600">Renovaciones</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{formatCurrency(stats.totalSpent)}</div>
                <div className="text-xs text-gray-600">Total invertido</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{stats.activeCount}</div>
                <div className="text-xs text-gray-600">Activas</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-indigo-600">{stats.autoRenewals}</div>
                <div className="text-xs text-gray-600">Auto-renovaciones</div>
              </div>
            </div>
          )}

          {/* Vista móvil - Cards */}
          <div className="block md:hidden space-y-4">
            {history.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {membershipTypeNames[item.membershipType] || item.membershipType}
                    </h3>
                    {item.renewalNumber && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <FaSync className="w-3 h-3" />
                        {item.renewalNumber === 1 ? 'Membresía inicial' : `Renovación #${item.renewalNumber - 1}`}
                        {item.isAutoRenewal && ' (Auto-renovación)'}
                      </p>
                    )}
                  </div>
                  {getStatusDisplay(item.status)}
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                    <span>{formatDate(item.startDate)} - {formatDate(item.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaCreditCard className="w-4 h-4 text-gray-400" />
                    <span>{item.paymentMethod}</span>
                  </div>
                  {item.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {item.description}
                    </div>
                  )}
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(item.amount)}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleViewDetails(item)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <FaEye className="w-4 h-4" />
                    Ver Detalles
                  </button>
                  <button
                    onClick={() => handleDownloadReceipt(item)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-2"
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
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Tipo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Vigencia</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Estado</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Monto</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Pago</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-medium text-gray-900">
                          {membershipTypeNames[item.membershipType] || item.membershipType}
                        </span>
                        {item.renewalNumber && (
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <FaSync className="w-3 h-3" />
                            {item.renewalNumber === 1 ? 'Inicial' : `Renovación #${item.renewalNumber - 1}`}
                            {item.isAutoRenewal && ' (Auto)'}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                        <div>
                          <div>{formatDate(item.startDate)}</div>
                          <div className="text-sm text-gray-500">a {formatDate(item.endDate)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusDisplay(item.status)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(item.amount)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaCreditCard className="w-4 h-4 text-gray-400" />
                        <span>{item.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                          title="Ver detalles"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadReceipt(item)}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors duration-200"
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
          <FaHistory className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sin historial de membresías
          </h3>
          <p className="text-gray-500 mb-4">
            Tu historial de membresías y renovaciones aparecerá aquí.
          </p>
          <p className="text-sm text-gray-400">
            Las membresías se renuevan automáticamente cada año.
          </p>
        </div>
      )}
    </div>
  );
}
'use client';

import { FaCheckCircle, FaClock, FaTicketAlt, FaCalendarAlt } from 'react-icons/fa';
import { UsageHistoryProps } from '@/types/benefits';

const UsageHistory: React.FC<UsageHistoryProps> = ({ 
  history, 
  isLoading = false 
}) => {
  // Function to get status style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'used':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <FaCheckCircle className="w-4 h-4" />;
      case 'used':
        return <FaTicketAlt className="w-4 h-4" />;
      case 'expired':
        return <FaClock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const capitalize = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Usage History
        </h3>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/5"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/6"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Usage History
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Benefits you have used recently
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        {history.length === 0 ? (
          // Empty state
          <div className="text-center py-8">
            <FaTicketAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              You haven't used any benefits yet
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Explore our available benefits and start saving
            </p>
          </div>
        ) : (
          <>
            {/* Desktop View - Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Benefit
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Usage Date
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Code Used
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.benefitName}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-300">
                        {new Date(item.usageDate).toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-4">
                        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
                          {item.codeUsed}
                        </code>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`
                          inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                          ${getStatusStyle(item.status)}
                        `}>
                          {getStatusIcon(item.status)}
                          {capitalize(item.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-4">
              {history.map((item) => (
                <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      {item.benefitName}
                    </h4>
                    <span className={`
                      inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                      ${getStatusStyle(item.status)}
                    `}>
                      {getStatusIcon(item.status)}
                      {capitalize(item.status)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <FaCalendarAlt className="w-4 h-4" />
                      <span>
                        {new Date(item.usageDate).toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">Code:</span>
                      <code className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs font-mono">
                        {item.codeUsed}
                      </code>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Simple pagination */}
            {history.length >= 10 && (
              <div className="mt-6 flex justify-center">
                <button className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                  View More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UsageHistory;
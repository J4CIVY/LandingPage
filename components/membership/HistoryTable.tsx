'use client';

import React from 'react';
import { MembershipHistoryEntry } from '@/types/membership';
import { FaCalendarAlt, FaUser, FaHistory } from 'react-icons/fa';

interface HistoryTableProps {
  history: MembershipHistoryEntry[];
  className?: string;
}

export default function HistoryTable({ history, className = '' }: HistoryTableProps) {
  if (history.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Historial de Membresía</h3>
        <div className="text-center py-8">
          <FaHistory className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No hay historial disponible</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Los eventos y cambios de membresía aparecerán aquí
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getActionIcon = (action: string) => {
    if (action.toLowerCase().includes('unió') || action.toLowerCase().includes('registro')) {
      return 'bg-green-100 dark:bg-green-900 dark:text-green-200 text-green-600';
    }
    if (action.toLowerCase().includes('ascenso') || action.toLowerCase().includes('ascendido')) {
      return 'bg-blue-100 dark:bg-blue-900 dark:text-blue-200 text-blue-600';
    }
    if (action.toLowerCase().includes('renovó') || action.toLowerCase().includes('renovación')) {
      return 'bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200 text-yellow-600';
    }
    if (action.toLowerCase().includes('canceló') || action.toLowerCase().includes('cancelación')) {
      return 'bg-red-100 dark:bg-red-900 dark:text-red-200 text-red-600';
    }
    return 'bg-gray-100 dark:bg-gray-800 dark:text-gray-200 text-gray-600';
  };

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Historial de Membresía</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {history.length} evento{history.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-4">
        {history.map((entry, index) => {
          const { date, time } = formatDate(entry.date);
          const iconClass = getActionIcon(entry.action);
          
          return (
            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className={`flex-shrink-0 p-2 rounded-lg ${iconClass}`}>
                <FaCalendarAlt className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {entry.action}
                    </p>
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <FaCalendarAlt className="h-3 w-3" />
                        <span>{date}</span>
                      </div>
                      <span>{time}</span>
                      {entry.by && (
                        <div className="flex items-center space-x-1">
                          <FaUser className="h-3 w-3" />
                          <span>por {entry.by}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginación o botón para cargar más (si es necesario) */}
      {history.length >= 10 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
            Cargar más historial →
          </button>
        </div>
      )}
    </div>
  );
}
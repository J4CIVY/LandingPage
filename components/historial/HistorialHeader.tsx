'use client';

import { useState } from 'react';
import { 
  FaDownload, 
  FaCalendarAlt, 
  FaTrophy, 
  FaGift, 
  FaFileAlt, 
  FaUsers,
  FaSpinner 
} from 'react-icons/fa';
import type { EstadisticasHistorial } from '@/types/historial';

interface HistorialHeaderProps {
  estadisticas: EstadisticasHistorial | null;
  onExportPDF: () => void;
  historialItems?: any[]; // Para pasar los items del historial
  userName?: string; // Para personalizar el PDF
}

export default function HistorialHeader({ estadisticas, onExportPDF, historialItems = [], userName }: HistorialHeaderProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await onExportPDF();
    } catch (error) {
      console.error('Error al exportar PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const estadisticasCards = [
    {
      icon: FaCalendarAlt,
      titulo: 'Eventos',
      valor: estadisticas?.eventosAsistidos || 0,
      total: estadisticas?.totalEventos || 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      descripcion: 'Eventos asistidos'
    },
    {
      icon: FaTrophy,
      titulo: 'Logros',
      valor: estadisticas?.logrosObtenidos || 0,
      total: null,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      descripcion: 'Reconocimientos'
    },
    {
      icon: FaGift,
      titulo: 'Beneficios',
      valor: estadisticas?.beneficiosUsados || 0,
      total: null,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      descripcion: 'Beneficios usados'
    },
    {
      icon: FaFileAlt,
      titulo: 'PQRSDF',
      valor: estadisticas?.pqrsdfAbiertas || 0,
      total: null,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      descripcion: 'Solicitudes abiertas'
    },
    {
      icon: FaUsers,
      titulo: 'Membresía',
      valor: estadisticas?.añosMembresia || 0,
      total: null,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      descripcion: 'Años como miembro'
    }
  ];

  return (
    <div className="mb-8">
      {/* Encabezado principal */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg text-white p-8 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">
              Historial del Miembro
            </h1>
            <p className="text-blue-100 text-lg">
              Consulta toda tu trayectoria en el motoclub BSK Motorcycle Team
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isExporting ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaDownload />
              )}
              <span>{isExporting ? 'Generando...' : 'Descargar PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {estadisticasCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                    <IconComponent className={`text-xl ${card.color}`} />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">
                    {card.titulo}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {card.valor}
                    {card.total && (
                      <span className="text-sm font-normal text-gray-500">
                        /{card.total}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {card.descripcion}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Información adicional */}
      {estadisticas && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {estadisticas.puntosAcumulados}
              </div>
              <div className="text-sm text-gray-600">Puntos Acumulados</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {Math.round((estadisticas.eventosAsistidos / estadisticas.totalEventos) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Participación en Eventos</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {estadisticas.añosMembresia}
              </div>
              <div className="text-sm text-gray-600">Años en el Motoclub</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
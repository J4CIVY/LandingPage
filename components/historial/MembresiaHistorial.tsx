'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaCreditCard, 
  FaCheckCircle, 
  FaTimesCircle,
  FaExclamationTriangle,
  FaCrown,
  FaStar,
  FaGem,
  FaHistory,
  FaDownload
} from 'react-icons/fa';
import type { MembresiaHistorial } from '@/types/historial';

export default function MembresiaHistorial() {
  const [membresia, setMembresia] = useState<MembresiaHistorial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRenovaciones, setShowRenovaciones] = useState(false);

  useEffect(() => {
    // Simulación de carga de datos
    const membresiaData: MembresiaHistorial = {
      id: '1',
      fechaAfiliacion: '2022-03-15T10:00:00Z',
      tipoMembresia: 'premium',
      estado: 'activa',
      fechaVencimiento: '2025-03-15T23:59:59Z',
      renovaciones: [
        {
          fecha: '2024-03-15T10:00:00Z',
          tipo: 'premium',
          monto: 250000
        },
        {
          fecha: '2023-03-15T10:00:00Z',
          tipo: 'premium',
          monto: 200000
        },
        {
          fecha: '2022-03-15T10:00:00Z',
          tipo: 'basica',
          monto: 150000
        }
      ],
      beneficiosActivos: [
        'Descuentos en eventos especiales',
        'Acceso prioritario a rutas',
        'Kit de bienvenida premium',
        'Asesoría técnica gratuita',
        'Descuentos en aliados comerciales'
      ]
    };

    setTimeout(() => {
      setMembresia(membresiaData);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'vip': return FaGem;
      case 'premium': return FaCrown;
      default: return FaStar;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'vip': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'premium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'activa': return FaCheckCircle;
      case 'vencida': return FaTimesCircle;
      case 'suspendida': return FaExclamationTriangle;
      default: return FaTimesCircle;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calcularAnosMembresia = () => {
    if (!membresia) return 0;
    const fechaAfiliacion = new Date(membresia.fechaAfiliacion);
    const fechaActual = new Date();
    const diferencia = fechaActual.getTime() - fechaAfiliacion.getTime();
    return Math.floor(diferencia / (1000 * 60 * 60 * 24 * 365));
  };

  const calcularDiasRestantes = () => {
    if (!membresia) return 0;
    const fechaVencimiento = new Date(membresia.fechaVencimiento);
    const fechaActual = new Date();
    const diferencia = fechaVencimiento.getTime() - fechaActual.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  };

  const calcularTotalInvertido = () => {
    if (!membresia) return 0;
    return membresia.renovaciones.reduce((total, renovacion) => total + renovacion.monto, 0);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!membresia) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Historial de Membresía</h2>
        <div className="text-center py-12">
          <FaCreditCard className="text-gray-300 text-6xl mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay información de membresía</h3>
          <p className="text-gray-500">No se encontró información sobre tu membresía.</p>
        </div>
      </div>
    );
  }

  const TipoIcon = getTipoIcon(membresia.tipoMembresia);
  const EstadoIcon = getEstadoIcon(membresia.estado);
  const anosMembresia = calcularAnosMembresia();
  const diasRestantes = calcularDiasRestantes();
  const totalInvertido = calcularTotalInvertido();

  return (
  <div className="bg-white dark:bg-slate-950 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Historial de Membresía</h2>
          <p className="text-gray-600 dark:text-gray-300">Información sobre tu membresía en BSK Motorcycle Team</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600">
          <FaDownload />
          <span>Certificado</span>
        </button>
      </div>

      {/* Estado actual de la membresía */}
  <div className="bg-linear-to-r from-blue-600 to-blue-700 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 dark:bg-slate-800 rounded-lg flex items-center justify-center">
              <TipoIcon className="text-2xl text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                Membresía {membresia.tipoMembresia.charAt(0).toUpperCase() + membresia.tipoMembresia.slice(1)}
              </h3>
              <div className="flex items-center space-x-2">
                <EstadoIcon className="text-sm text-green-400 dark:text-green-300" />
                <span className="text-blue-100 dark:text-blue-300">
                  {membresia.estado.charAt(0).toUpperCase() + membresia.estado.slice(1)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold">{anosMembresia}</div>
            <div className="text-blue-100 dark:text-blue-300 text-sm">Años como miembro</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-blue-100 dark:text-blue-300">Miembro desde</div>
            <div className="font-semibold">{formatDate(membresia.fechaAfiliacion)}</div>
          </div>
          <div>
            <div className="text-sm text-blue-100 dark:text-blue-300">Vence el</div>
            <div className="font-semibold">{formatDate(membresia.fechaVencimiento)}</div>
          </div>
          <div>
            <div className="text-sm text-blue-100 dark:text-blue-300">Días restantes</div>
            <div className="font-semibold">{diasRestantes} días</div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-slate-800 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{membresia.renovaciones.length}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Renovaciones</div>
            </div>
            <FaHistory className="text-green-600 dark:text-green-400 text-xl" />
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalInvertido)}</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Total invertido</div>
            </div>
            <FaCreditCard className="text-blue-600 dark:text-blue-400 text-xl" />
          </div>
        </div>
        
        <div className="bg-purple-50 dark:bg-slate-800 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{membresia.beneficiosActivos.length}</div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Beneficios activos</div>
            </div>
            <FaGem className="text-purple-600 dark:text-purple-400 text-xl" />
          </div>
        </div>
      </div>

      {/* Beneficios activos */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Beneficios Activos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {membresia.beneficiosActivos.map((beneficio, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <FaCheckCircle className="text-green-600 dark:text-green-400 shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">{beneficio}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Historial de renovaciones */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Historial de Renovaciones</h3>
          <button
            onClick={() => setShowRenovaciones(!showRenovaciones)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {showRenovaciones ? 'Ocultar' : 'Ver todo'}
          </button>
        </div>
        
        <div className="space-y-3">
          {(showRenovaciones ? membresia.renovaciones : membresia.renovaciones.slice(0, 2)).map((renovacion, index) => (
            <div key={index} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTipoColor(renovacion.tipo)} dark:bg-slate-800 dark:border-slate-700`}>
                    {React.createElement(getTipoIcon(renovacion.tipo), { className: 'text-lg' })}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Renovación {renovacion.tipo.charAt(0).toUpperCase() + renovacion.tipo.slice(1)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{formatDate(renovacion.fecha)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900 dark:text-white">{formatCurrency(renovacion.monto)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Pagado</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
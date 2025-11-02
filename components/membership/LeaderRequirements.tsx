'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaCrown, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaUsers, 
  FaHandshake, 
  FaShieldAlt,
  FaClipboardList,
  FaVoteYea,
  FaUserTie,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';

interface RequirementStatus {
  id: string;
  label: string;
  fulfilled: boolean;
  progress: number;
  detail: string;
}

interface LeaderRequirementsData {
  requirements: RequirementStatus[];
  eligibility: {
    isEligible: boolean;
    completionPercentage: number;
  };
}

interface LeaderRequirementsProps {
  userId?: string;
  className?: string;
}

const LeaderRequirements: React.FC<LeaderRequirementsProps> = ({ 
  userId, 
  className = '' 
}) => {
  const [data, setData] = useState<LeaderRequirementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchLeaderRequirements();
  }, [userId]);

  const fetchLeaderRequirements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/membership/leader-requirements', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        setError('Error al cargar requisitos de Leader');
        return;
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || 'Error desconocido');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getRequirementIcon = (requirementId: string) => {
    const iconMap: Record<string, React.ReactElement> = {
      must_be_master: <FaCrown className="text-yellow-500" />,
      must_be_active_volunteer: <FaHandshake className="text-blue-500" />,
      minimum_points: <FaUsers className="text-green-500" />,
      years_as_master: <FaClock className="text-purple-500" />,
      event_attendance_rate: <FaUsers className="text-indigo-500" />,
      leadership_events: <FaUserTie className="text-orange-500" />,
      leadership_success_rate: <FaCheckCircle className="text-emerald-500" />,
      high_impact_volunteering: <FaShieldAlt className="text-red-500" />,
      clean_disciplinary_record: <FaShieldAlt className="text-gray-500" />,
      formal_application_process: <FaClipboardList className="text-cyan-500" />,
      evaluation_process: <FaVoteYea className="text-pink-500" />,
      vacancy_available: <FaInfoCircle className="text-teal-500" />
    };
    return iconMap[requirementId] || <FaInfoCircle className="text-gray-400" />;
  };

  const getProgressColor = (progress: number, fulfilled: boolean) => {
    if (fulfilled) return 'bg-green-500';
    if (progress >= 75) return 'bg-yellow-500';
    if (progress >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getRequirementCategory = (requirementId: string) => {
    const categories: Record<string, string> = {
      must_be_master: 'Requisitos Básicos',
      must_be_active_volunteer: 'Requisitos Básicos',
      minimum_points: 'Métricas Numéricas',
      years_as_master: 'Tiempo de Servicio',
      event_attendance_rate: 'Historial de Eventos',
      leadership_events: 'Liderazgo Demostrado',
      leadership_success_rate: 'Liderazgo Demostrado',
      high_impact_volunteering: 'Voluntariado de Alto Impacto',
      clean_disciplinary_record: 'Historial Disciplinario',
      formal_application_process: 'Proceso de Postulación',
      evaluation_process: 'Proceso de Evaluación',
      vacancy_available: 'Disponibilidad'
    };
    return categories[requirementId] || 'General';
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center text-red-600 dark:text-red-400">
          <FaExclamationTriangle className="mr-2" />
          <span>{error}</span>
        </div>
        <button 
          onClick={fetchLeaderRequirements}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
        <p className="text-gray-600 dark:text-gray-400">No hay datos disponibles</p>
      </div>
    );
  }

  // Agrupar requisitos por categoría
  const groupedRequirements = data.requirements.reduce((groups, req) => {
    const category = getRequirementCategory(req.id);
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(req);
    return groups;
  }, {} as Record<string, RequirementStatus[]>);

  return (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
  <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaCrown className="text-3xl text-purple-600 dark:text-purple-400 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Requisitos para Membresía Leader
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Membresía de liderazgo/cargo con responsabilidades formales
              </p>
            </div>
          </div>
          
          {/* Badge de elegibilidad */}
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
            data.eligibility.isEligible 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {data.eligibility.isEligible ? 'Elegible' : 'No Elegible'}
          </div>
        </div>

        {/* Barra de progreso general */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progreso General
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {data.eligibility.completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full ${getProgressColor(data.eligibility.completionPercentage, data.eligibility.isEligible)}`}
              style={{ width: `${data.eligibility.completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
  <div className="p-6 bg-white dark:bg-gray-800">
        {Object.entries(groupedRequirements).map(([category, requirements]) => (
          <div key={category} className="mb-8 last:mb-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-purple-500 pl-3">
              {category}
            </h3>
            
            <div className="space-y-4">
              {requirements.map((requirement) => (
                <div 
                  key={requirement.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-l-4 border-gray-300 dark:border-gray-600"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      <div className="mr-3 mt-1">
                        {getRequirementIcon(requirement.id)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white mr-2">
                            {requirement.label}
                          </h4>
                          {requirement.fulfilled ? (
                            <FaCheckCircle className="text-green-500 dark:text-green-400 text-sm" />
                          ) : (
                            <FaTimesCircle className="text-red-500 dark:text-red-400 text-sm" />
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {requirement.detail}
                        </p>
                        
                        {/* Barra de progreso individual */}
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(requirement.progress, requirement.fulfilled)}`}
                            style={{ width: `${Math.min(100, requirement.progress)}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Progreso: {Math.round(requirement.progress)}%
                          </span>
                          <span className={`text-xs font-medium ${
                            requirement.fulfilled 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {requirement.fulfilled ? 'Completo' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Nota informativa */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start">
            <FaInfoCircle className="text-blue-500 dark:text-blue-300 mt-1 mr-3" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Información Importante
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                La membresía Leader es un cargo de responsabilidad con duración de 12 meses renovables. 
                Requiere disponibilidad operativa de 8-12 horas mensuales y debe existir una vacante 
                disponible en roles administrativos del club.
              </p>
            </div>
          </div>
        </div>

        {/* Botón de acción */}
        {data.eligibility.isEligible && (
          <div className="mt-6 text-center">
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 font-medium">
              Iniciar Proceso de Postulación
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderRequirements;
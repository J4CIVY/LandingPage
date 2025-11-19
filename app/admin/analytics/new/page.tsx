'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { FiPlus, FiSave, FiX, FiCalendar } from 'react-icons/fi';

interface ReportConfig {
  name: string;
  type: 'users' | 'events' | 'products' | 'memberships' | 'emergencies' | 'financial' | 'activity' | 'performance' | 'summary';
  description: string;
  startDate: string;
  endDate: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  format: 'json' | 'csv';
  recipients: string[];
  isActive: boolean;
}

export default function NewAnalyticsReportPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<ReportConfig>({
    name: '',
    type: 'summary',
    description: '',
    startDate: '',
    endDate: '',
    frequency: 'once',
    format: 'json',
    recipients: [],
    isActive: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newRecipient, setNewRecipient] = useState('');

  const reportTypes = [
    { value: 'summary', label: 'Resumen General', description: 'Vista general de todas las métricas' },
    { value: 'users', label: 'Usuarios', description: 'Análisis detallado de usuarios' },
    { value: 'events', label: 'Eventos', description: 'Estadísticas de eventos' },
    { value: 'products', label: 'Productos', description: 'Inventario y ventas' },
    { value: 'memberships', label: 'Membresías', description: 'Solicitudes y aprobaciones' },
    { value: 'emergencies', label: 'Emergencias', description: 'Respuesta y resolución' },
    { value: 'financial', label: 'Financiero', description: 'Costos y valores' },
    { value: 'activity', label: 'Actividad', description: 'Tendencias de actividad' },
    { value: 'performance', label: 'Rendimiento', description: 'Métricas de eficiencia' }
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('El nombre del reporte es requerido');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Simular creación de configuración de reporte
      // En una implementación real, esto se guardaría en la base de datos
      // const reportConfig = {
      //   ...formData,
      //   id: Date.now().toString(),
      //   createdAt: new Date().toISOString(),
      //   createdBy: user?.email
      // };

      
      // Generar reporte inmediatamente si es de tipo "once"
      if (formData.frequency === 'once') {
        await generateReport();
      }

      router.push('/admin/analytics');
    } catch (err) {
      console.error('Error creating report:', err);
      setError(err instanceof Error ? err.message : 'Error al crear el reporte');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const { apiClient } = await import('@/lib/api-client');
      const queryParams: Record<string, string> = {
        type: formData.type,
        format: formData.format
      };
      if (formData.startDate) queryParams.startDate = formData.startDate;
      if (formData.endDate) queryParams.endDate = formData.endDate;

      const response = await apiClient.get<{ data: any }>('/analytics/reports', { params: queryParams });
      
      // Crear y descargar archivo
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { 
        type: formData.format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.${formData.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err instanceof Error ? err.message : 'Error al generar reporte');
    }
  };

  const addRecipient = () => {
    if (newRecipient.trim() && !formData.recipients.includes(newRecipient.trim())) {
      setFormData(prev => ({
        ...prev,
        recipients: [...prev.recipients, newRecipient.trim()]
      }));
      setNewRecipient('');
    }
  };

  const removeRecipient = (email: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email)
    }));
  };

  if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Acceso Denegado
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            No tienes permisos para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <FiPlus className="mr-3 text-blue-600 dark:text-blue-400" />
                Nuevo Reporte de Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Configura un nuevo reporte personalizado de analytics
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <FiX className="h-5 w-5" />
              <span>Cancelar</span>
            </button>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Información básica */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Reporte *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ej: Reporte Mensual de Usuarios"
                  required
                />
              </div>

              <div>
                <label htmlFor="report-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Reporte *
                </label>
                <select
                  id="report-type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ReportConfig['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {reportTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Describe el propósito de este reporte..."
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {reportTypes.find(t => t.value === formData.type)?.description}
              </p>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Inicio
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="start-date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Fin
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="end-date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Configuración */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Frecuencia
                </label>
                <select
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as ReportConfig['frequency'] }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="once">Una vez</option>
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>

              <div>
                <label htmlFor="format" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Formato
                </label>
                <select
                  id="format"
                  value={formData.format}
                  onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value as ReportConfig['format'] }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Reporte activo
                  </span>
                </label>
              </div>
            </div>

            {/* Destinatarios de email */}
            {formData.frequency !== 'once' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Destinatarios de Email
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="email"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    placeholder="email@ejemplo.com"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addRecipient();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addRecipient}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    aria-label="Agregar destinatario"
                  >
                    <FiPlus className="h-4 w-4" />
                  </button>
                </div>
                
                {formData.recipients.length > 0 && (
                  <div className="space-y-1">
                    {formData.recipients.map((email, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{email}</span>
                        <button
                          type="button"
                          onClick={() => removeRecipient(email)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          aria-label={`Eliminar ${email}`}
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Vista previa de reporte */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Vista Previa
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p><strong>Tipo:</strong> {reportTypes.find(t => t.value === formData.type)?.label}</p>
                <p><strong>Frecuencia:</strong> {
                  formData.frequency === 'once' ? 'Una vez' :
                  formData.frequency === 'daily' ? 'Diario' :
                  formData.frequency === 'weekly' ? 'Semanal' : 'Mensual'
                }</p>
                <p><strong>Formato:</strong> {formData.format.toUpperCase()}</p>
                {formData.startDate && <p><strong>Desde:</strong> {formData.startDate}</p>}
                {formData.endDate && <p><strong>Hasta:</strong> {formData.endDate}</p>}
                {formData.recipients.length > 0 && (
                  <p><strong>Destinatarios:</strong> {formData.recipients.length} email(s)</p>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creando...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="h-4 w-4" />
                    <span>
                      {formData.frequency === 'once' ? 'Crear y Generar' : 'Crear Reporte'}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 flex items-center justify-center space-x-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg transition-colors"
              >
                <FiX className="h-4 w-4" />
                <span>Cancelar</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

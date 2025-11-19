'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useSecureForm } from '@/hooks/useSecureForm';
import { getCSRFToken } from '@/lib/csrf-client';

const EMERGENCY_TYPES = [
  { value: 'mechanical', label: 'Mecánica' },
  { value: 'medical', label: 'Médica' },
  { value: 'accident', label: 'Accidente' },
  { value: 'breakdown', label: 'Avería' },
  { value: 'other', label: 'Otra' }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja', color: 'text-gray-600 bg-gray-100' },
  { value: 'medium', label: 'Media', color: 'text-blue-600 bg-blue-100' },
  { value: 'high', label: 'Alta', color: 'text-orange-600 bg-orange-100' },
  { value: 'critical', label: 'Crítica', color: 'text-red-600 bg-red-100' }
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente', color: 'text-yellow-600 bg-yellow-100' },
  { value: 'in-progress', label: 'En Progreso', color: 'text-blue-600 bg-blue-100' },
  { value: 'resolved', label: 'Resuelta', color: 'text-green-600 bg-green-100' },
  { value: 'cancelled', label: 'Cancelada', color: 'text-red-600 bg-red-100' }
];

interface Emergency {
  _id: string;
  name: string;
  memberId: string;
  emergencyType: string;
  description: string;
  location: string;
  contactPhone: string;
  priority: string;
  status: string;
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  memberRef?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  notes?: string;
  estimatedCost?: number;
  finalCost?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
  startTime?: string;
  endTime?: string;
  isActive: boolean;
}

export default function ViewEmergencyPage({ params }: PageProps<'/admin/emergencies/view/[id]'>) {
  const { user, isLoading } = useAuth();
  const { isSubmitting, submit } = useSecureForm(async (data: Record<string, unknown>) => {
    const { id } = await params;
    const { apiClient } = await import('@/lib/api-client');
    await apiClient.put(`/emergencies/${id}`, data);
    // Recargar la emergencia
    await fetchEmergency();
  });
  
  const [emergency, setEmergency] = useState<Emergency | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener la emergencia
  const fetchEmergency = async () => {
    try {
      setLoading(true);
      const { id } = await params;
      const { apiClient } = await import('@/lib/api-client');
      const data = await apiClient.get<{ data: { emergency: Emergency } }>(`/emergencies/${id}`);
      setEmergency(data.data.emergency);
    } catch (error) {
      console.error('Error fetching emergency:', error);
      alert('Error al cargar la emergencia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && user?.role === 'admin') {
      void fetchEmergency();
    }
  }, [user, isLoading]);

  // Función para cambiar estado rápido
  const handleQuickStatusChange = async (newStatus: string) => {
    if (!emergency) return;
    
    const confirmMessage = `¿Estás seguro de que quieres cambiar el estado a "${STATUS_OPTIONS.find(s => s.value === newStatus)?.label}"?`;
    if (!confirm(confirmMessage)) return;

    await submit({ status: newStatus });
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para calcular duración
  const calculateDuration = (startTime?: string, endTime?: string) => {
    if (!startTime) return 'No iniciada';
    
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = end.getTime() - start.getTime();
    
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Función para obtener el nombre del tipo de emergencia
  const getEmergencyTypeName = (type: string) => {
    const typeOption = EMERGENCY_TYPES.find(option => option.value === type);
    return typeOption?.label || type;
  };

  // Función para obtener el color de estado
  const getStatusColor = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(option => option.value === status);
    return statusOption?.color || 'text-gray-600 bg-gray-100';
  };

  // Función para obtener el color de prioridad
  const getPriorityColor = (priority: string) => {
    const priorityOption = PRIORITY_OPTIONS.find(option => option.value === priority);
    return priorityOption?.color || 'text-gray-600 bg-gray-100';
  };

  // Función para abrir Google Maps
  const openInGoogleMaps = () => {
    if (emergency?.coordinates) {
      const { latitude, longitude } = emergency.coordinates;
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      window.open(url, '_blank');
    } else if (emergency?.location) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(emergency.location)}`;
      window.open(url, '_blank');
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
          <Link 
            href="/login" 
            className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  if (!emergency) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Emergencia no encontrada</h1>
          <p className="text-gray-600">La emergencia que buscas no existe o no tienes permisos para verla.</p>
          <Link 
            href="/admin/emergencies" 
            className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Volver a Emergencias
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Link
                href="/admin/emergencies"
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{emergency.name}</h1>
                <p className="text-gray-600 mt-2">Detalles completos de la emergencia</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link
                href={`/admin/emergencies/${emergency._id}`}
                className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 font-medium"
              >
                Editar
              </Link>
            </div>
          </div>

          {/* Estado y acciones rápidas */}
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(emergency.status)}`}>
                  {STATUS_OPTIONS.find(s => s.value === emergency.status)?.label}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(emergency.priority)}`}>
                  Prioridad: {PRIORITY_OPTIONS.find(p => p.value === emergency.priority)?.label}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {getEmergencyTypeName(emergency.emergencyType)}
                </span>
              </div>
              <div className="flex space-x-2">
                {emergency.status === 'pending' && (
                  <button
                    onClick={() => handleQuickStatusChange('in-progress')}
                    disabled={isSubmitting}
                    className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                  >
                    Iniciar
                  </button>
                )}
                {emergency.status === 'in-progress' && (
                  <button
                    onClick={() => handleQuickStatusChange('resolved')}
                    disabled={isSubmitting}
                    className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
                  >
                    Resolver
                  </button>
                )}
                {(emergency.status === 'pending' || emergency.status === 'in-progress') && (
                  <button
                    onClick={() => handleQuickStatusChange('cancelled')}
                    disabled={isSubmitting}
                    className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información básica */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID de Emergencia</label>
                  <p className="text-gray-900 font-mono text-sm">{emergency._id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID del Miembro</label>
                  <p className="text-gray-900">{emergency.memberId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de Contacto</label>
                  <p className="text-gray-900">
                    <a href={`tel:${emergency.contactPhone}`} className="text-blue-600 hover:text-blue-800">
                      {emergency.contactPhone}
                    </a>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Creación</label>
                  <p className="text-gray-900">{formatDate(emergency.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Descripción de la Emergencia</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{emergency.description}</p>
            </div>

            {/* Ubicación */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ubicación</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <p className="text-gray-900">{emergency.location}</p>
                </div>
                {emergency.coordinates && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coordenadas GPS</label>
                    <p className="text-gray-900 font-mono text-sm">
                      {emergency.coordinates.latitude}, {emergency.coordinates.longitude}
                    </p>
                  </div>
                )}
                <button
                  onClick={openInGoogleMaps}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Ver en Google Maps
                </button>
              </div>
            </div>

            {/* Notas adicionales */}
            {emergency.notes && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notas Adicionales</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{emergency.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Asignación */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Asignación</h3>
              {emergency.assignedTo ? (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Asignado a</label>
                    <p className="text-gray-900 font-medium">
                      {emergency.assignedTo.firstName} {emergency.assignedTo.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">
                      <a href={`mailto:${emergency.assignedTo.email}`} className="text-blue-600 hover:text-blue-800">
                        {emergency.assignedTo.email}
                      </a>
                    </p>
                  </div>
                  {emergency.assignedTo.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <p className="text-gray-900">
                        <a href={`tel:${emergency.assignedTo.phone}`} className="text-blue-600 hover:text-blue-800">
                          {emergency.assignedTo.phone}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 italic">Sin asignar</p>
              )}
            </div>

            {/* Información del miembro */}
            {emergency.memberRef && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Miembro</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                    <p className="text-gray-900 font-medium">
                      {emergency.memberRef.firstName} {emergency.memberRef.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">
                      <a href={`mailto:${emergency.memberRef.email}`} className="text-blue-600 hover:text-blue-800">
                        {emergency.memberRef.email}
                      </a>
                    </p>
                  </div>
                  {emergency.memberRef.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <p className="text-gray-900">
                        <a href={`tel:${emergency.memberRef.phone}`} className="text-blue-600 hover:text-blue-800">
                          {emergency.memberRef.phone}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tiempos */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Seguimiento de Tiempos</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duración</label>
                  <p className="text-gray-900 font-medium">
                    {calculateDuration(emergency.startTime, emergency.endTime)}
                    {emergency.status === 'in-progress' && ' (en curso)'}
                  </p>
                </div>
                {emergency.startTime && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Iniciada</label>
                    <p className="text-gray-900 text-sm">{formatDate(emergency.startTime)}</p>
                  </div>
                )}
                {emergency.endTime && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Finalizada</label>
                    <p className="text-gray-900 text-sm">{formatDate(emergency.endTime)}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Última actualización</label>
                  <p className="text-gray-900 text-sm">{formatDate(emergency.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Costos */}
            {(emergency.estimatedCost || emergency.finalCost) && (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Costos</h3>
                <div className="space-y-3">
                  {emergency.estimatedCost && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Costo Estimado</label>
                      <p className="text-gray-900 font-medium">€{emergency.estimatedCost.toFixed(2)}</p>
                    </div>
                  )}
                  {emergency.finalCost && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Costo Final</label>
                      <p className="text-gray-900 font-medium">€{emergency.finalCost.toFixed(2)}</p>
                    </div>
                  )}
                  {emergency.estimatedCost && emergency.finalCost && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Diferencia</label>
                      <p className={`font-medium ${emergency.finalCost > emergency.estimatedCost ? 'text-red-600' : 'text-green-600'}`}>
                        €{(emergency.finalCost - emergency.estimatedCost).toFixed(2)}
                        {emergency.finalCost > emergency.estimatedCost ? ' (sobrecosto)' : ' (ahorro)'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

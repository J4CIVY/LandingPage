'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'critical', label: 'Crítica' }
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in-progress', label: 'En Progreso' },
  { value: 'resolved', label: 'Resuelta' },
  { value: 'cancelled', label: 'Cancelada' }
];

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

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
  assignedTo?: string;
  notes?: string;
  estimatedCost?: number;
  finalCost?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  startTime?: string;
  endTime?: string;
}

export default function EditEmergencyPage({ params }: PageProps<'/admin/emergencies/[id]'>) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { isSubmitting, submit } = useSecureForm(async (data: Record<string, unknown>) => {
    const { id } = await params;
    const csrfToken = getCSRFToken();
    const response = await fetch(`/api/admin/emergencies/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken || '',
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar la emergencia');
    }

    router.push('/admin/emergencies?updated=true');
  });
  
  const [emergency, setEmergency] = useState<Emergency | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    memberId: '',
    emergencyType: 'mechanical',
    description: '',
    location: '',
    contactPhone: '',
    priority: 'medium',
    status: 'pending',
    assignedTo: '',
    notes: '',
    estimatedCost: '',
    finalCost: '',
    coordinates: {
      latitude: '',
      longitude: ''
    }
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Función para obtener la emergencia
  const fetchEmergency = async () => {
    try {
      setLoading(true);
      const { id } = await params;
      const response = await fetch(`/api/admin/emergencies/${id}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        alert('Error al cargar la emergencia');
        setLoading(false);
        return;
      }

      const data = await response.json();
      const emergencyData = data.data.emergency;
      setEmergency(emergencyData);
      
      // Llenar el formulario con los datos existentes
      setFormData({
        name: emergencyData.name || '',
        memberId: emergencyData.memberId || '',
        emergencyType: emergencyData.emergencyType || 'mechanical',
        description: emergencyData.description || '',
        location: emergencyData.location || '',
        contactPhone: emergencyData.contactPhone || '',
        priority: emergencyData.priority || 'medium',
        status: emergencyData.status || 'pending',
        assignedTo: emergencyData.assignedTo?._id || '',
        notes: emergencyData.notes || '',
        estimatedCost: emergencyData.estimatedCost?.toString() || '',
        finalCost: emergencyData.finalCost?.toString() || '',
        coordinates: {
          latitude: emergencyData.coordinates?.latitude?.toString() || '',
          longitude: emergencyData.coordinates?.longitude?.toString() || ''
        }
      });
    } catch (error) {
      console.error('Error fetching emergency:', error);
      alert('Error al cargar la emergencia');
      router.push('/admin/emergencies');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener usuarios disponibles para asignación
  const fetchAvailableUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch('/api/admin/users?role=admin&status=active', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (!isLoading && user?.role === 'admin') {
      fetchEmergency();
      fetchAvailableUsers();
    }
  }, [user, isLoading]);

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, string>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Función para validar el formulario
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Campos requeridos
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.memberId.trim()) {
      newErrors.memberId = 'El ID del miembro es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es requerida';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'El teléfono de contacto es requerido';
    }

    // Validar teléfono
    const phoneRegex = /^[+]?[\d\s\-()]{9,}$/;
    if (formData.contactPhone && !phoneRegex.test(formData.contactPhone)) {
      newErrors.contactPhone = 'Formato de teléfono inválido';
    }

    // Validar coordenadas si se proporcionan
    if (formData.coordinates.latitude && (isNaN(Number(formData.coordinates.latitude)) || Math.abs(Number(formData.coordinates.latitude)) > 90)) {
      newErrors['coordinates.latitude'] = 'Latitud inválida (debe estar entre -90 y 90)';
    }

    if (formData.coordinates.longitude && (isNaN(Number(formData.coordinates.longitude)) || Math.abs(Number(formData.coordinates.longitude)) > 180)) {
      newErrors['coordinates.longitude'] = 'Longitud inválida (debe estar entre -180 y 180)';
    }

    // Validar costos
    if (formData.estimatedCost && (isNaN(Number(formData.estimatedCost)) || Number(formData.estimatedCost) < 0)) {
      newErrors.estimatedCost = 'El costo estimado debe ser un número válido mayor o igual a 0';
    }

    if (formData.finalCost && (isNaN(Number(formData.finalCost)) || Number(formData.finalCost) < 0)) {
      newErrors.finalCost = 'El costo final debe ser un número válido mayor o igual a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Preparar datos para envío
    const submitData = {
      ...formData,
      estimatedCost: formData.estimatedCost ? Number(formData.estimatedCost) : undefined,
      finalCost: formData.finalCost ? Number(formData.finalCost) : undefined,
      assignedTo: formData.assignedTo || undefined,
      coordinates: (formData.coordinates.latitude && formData.coordinates.longitude) ? {
        latitude: Number(formData.coordinates.latitude),
        longitude: Number(formData.coordinates.longitude)
      } : undefined
    };

    await submit(submitData);
  };

  // Función para obtener ubicación actual
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            coordinates: {
              latitude: position.coords.latitude.toString(),
              longitude: position.coords.longitude.toString()
            }
          }));
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          alert('No se pudo obtener la ubicación actual');
        }
      );
    } else {
      alert('La geolocalización no está soportada en este navegador');
    }
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Link
              href="/admin/emergencies"
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Emergencia</h1>
              <p className="text-gray-600 mt-2">Modifica los detalles de la emergencia</p>
            </div>
          </div>

          {/* Información de la emergencia */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-900">ID:</span>
                <span className="ml-2 text-blue-700">{emergency._id}</span>
              </div>
              <div>
                <span className="font-medium text-blue-900">Creada:</span>
                <span className="ml-2 text-blue-700">{formatDate(emergency.createdAt)}</span>
              </div>
              <div>
                <span className="font-medium text-blue-900">Estado actual:</span>
                <span className="ml-2 text-blue-700 capitalize">{emergency.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white shadow-sm rounded-lg border">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Información básica */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Emergencia *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Accidente en carretera"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="memberId" className="block text-sm font-medium text-gray-700 mb-2">
                    ID del Miembro *
                  </label>
                  <input
                    type="text"
                    id="memberId"
                    name="memberId"
                    value={formData.memberId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.memberId ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="BSK001"
                  />
                  {errors.memberId && <p className="mt-1 text-sm text-red-600">{errors.memberId}</p>}
                </div>

                <div>
                  <label htmlFor="emergencyType" className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Emergencia *
                  </label>
                  <select
                    id="emergencyType"
                    name="emergencyType"
                    value={formData.emergencyType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {EMERGENCY_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono de Contacto *
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.contactPhone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+34 123 456 789"
                  />
                  {errors.contactPhone && <p className="mt-1 text-sm text-red-600">{errors.contactPhone}</p>}
                </div>
              </div>
            </div>

            {/* Descripción y ubicación */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detalles de la Emergencia</h3>
              <div className="space-y-6">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Describe detalladamente la situación de emergencia..."
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.location ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Dirección o descripción del lugar"
                  />
                  {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                </div>

                {/* Coordenadas GPS */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Coordenadas GPS (Opcional)
                    </label>
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      📍 Obtener ubicación actual
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        name="coordinates.latitude"
                        value={formData.coordinates.latitude}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors['coordinates.latitude'] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Latitud"
                      />
                      {errors['coordinates.latitude'] && (
                        <p className="mt-1 text-sm text-red-600">{errors['coordinates.latitude']}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        name="coordinates.longitude"
                        value={formData.coordinates.longitude}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors['coordinates.longitude'] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Longitud"
                      />
                      {errors['coordinates.longitude'] && (
                        <p className="mt-1 text-sm text-red-600">{errors['coordinates.longitude']}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clasificación y asignación */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Clasificación y Asignación</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridad
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PRIORITY_OPTIONS.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-2">
                    Asignar a
                  </label>
                  <select
                    id="assignedTo"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loadingUsers}
                  >
                    <option value="">Sin asignar</option>
                    {availableUsers.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Adicional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="estimatedCost" className="block text-sm font-medium text-gray-700 mb-2">
                    Costo Estimado (€)
                  </label>
                  <input
                    type="number"
                    id="estimatedCost"
                    name="estimatedCost"
                    min="0"
                    step="0.01"
                    value={formData.estimatedCost}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.estimatedCost ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.estimatedCost && <p className="mt-1 text-sm text-red-600">{errors.estimatedCost}</p>}
                </div>

                <div>
                  <label htmlFor="finalCost" className="block text-sm font-medium text-gray-700 mb-2">
                    Costo Final (€)
                  </label>
                  <input
                    type="number"
                    id="finalCost"
                    name="finalCost"
                    min="0"
                    step="0.01"
                    value={formData.finalCost}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.finalCost ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.finalCost && <p className="mt-1 text-sm text-red-600">{errors.finalCost}</p>}
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notas Adicionales
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Información adicional sobre la emergencia..."
                />
              </div>
            </div>

            {/* Información de tiempos */}
            {(emergency.startTime || emergency.endTime) && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Tiempos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {emergency.startTime && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="font-medium text-gray-900">Hora de inicio:</span>
                      <p className="text-gray-700 mt-1">{formatDate(emergency.startTime)}</p>
                    </div>
                  )}
                  {emergency.endTime && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="font-medium text-gray-900">Hora de finalización:</span>
                      <p className="text-gray-700 mt-1">{formatDate(emergency.endTime)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/admin/emergencies"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancelar
              </Link>
              <Link
                href={`/admin/emergencies/view/${emergency._id}`}
                className="px-6 py-3 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 font-medium"
              >
                Ver Detalles
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Actualizando...
                  </>
                ) : (
                  'Actualizar Emergencia'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

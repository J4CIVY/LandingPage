'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  FaSpinner, 
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaDollarSign,
  FaImage,
  FaTags,
  FaInfoCircle,
  FaPhone,
  FaEnvelope,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarCheck,
  FaEye
} from 'react-icons/fa';

interface Event {
  _id: string;
  name: string;
  startDate: string;
  endDate?: string;
  description: string;
  longDescription?: string;
  mainImage: string;
  eventType: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  departureLocation: {
    address: string;
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  arrivalLocation?: {
    address: string;
    city: string;
    country: string;
  };
  maxParticipants?: number;
  currentParticipants: number;
  registrationDeadline?: string;
  price: number;
  includedServices?: string[];
  requirements?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  distance?: number;
  duration?: number;
  organizer: {
    name: string;
    phone: string;
    email: string;
  };
  participants?: any[];
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800'
};

const statusLabels = {
  draft: 'Borrador',
  published: 'Publicado',
  cancelled: 'Cancelado',
  completed: 'Completado'
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-orange-100 text-orange-800',
  expert: 'bg-red-100 text-red-800'
};

const difficultyLabels = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
  expert: 'Experto'
};

export default function EventDetailPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);

  // Verificar autenticación y permisos
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'admin' && user.role !== 'super-admin') {
      router.push('/dashboard');
      return;
    }
  }, [user, isAuthenticated, isLoading, router]);

  // Cargar evento
  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/events/${eventId}`);
        if (response.ok) {
          const data = await response.json();
          setEvent(data.event);
        } else {
          router.push('/admin/events');
        }
      } catch (error) {
        console.error('Error cargando evento:', error);
        router.push('/admin/events');
      } finally {
        setLoading(false);
      }
    };

    if (user && (user.role === 'admin' || user.role === 'super-admin') && eventId) {
      loadEvent();
    }
  }, [user, eventId, router]);

  const handleToggleStatus = async () => {
    if (!event) return;

    try {
      const response = await fetch(`/api/admin/events/${eventId}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !event.isActive })
      });

      if (response.ok) {
        setEvent(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
      }
    } catch (error) {
      console.error('Error cambiando estado:', error);
    }
  };

  const handleDelete = async () => {
    if (!event || !confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        router.push('/admin/events');
      }
    } catch (error) {
      console.error('Error eliminando evento:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Evento no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout 
      title={`Evento: ${event.name}`} 
      description="Detalles completos del evento"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Volver a Eventos
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.name}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[event.status]}`}>
                  {statusLabels[event.status]}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  event.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {event.isActive ? 'Activo' : 'Inactivo'}
                </span>
                {event.difficulty && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${difficultyColors[event.difficulty]}`}>
                    {difficultyLabels[event.difficulty]}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-4 sm:mt-0">
              <button
                onClick={() => router.push(`/admin/events/${eventId}/edit`)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaEdit className="mr-2" />
                Editar
              </button>
              <button
                onClick={handleToggleStatus}
                className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                  event.isActive 
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {event.isActive ? <FaTimesCircle className="mr-2" /> : <FaCheckCircle className="mr-2" />}
                {event.isActive ? 'Desactivar' : 'Activar'}
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaTrash className="mr-2" />
                Eliminar
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Imagen Principal */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <img
                src={event.mainImage}
                alt={event.name}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-event.jpg';
                }}
              />
            </div>

            {/* Descripción */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Descripción</h3>
              <p className="text-gray-700 mb-4">{event.description}</p>
              {event.longDescription && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Descripción Detallada</h4>
                  <p className="text-gray-700 whitespace-pre-line">{event.longDescription}</p>
                </div>
              )}
            </div>

            {/* Ubicación */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaMapMarkerAlt className="mr-2 text-blue-500" />
                Ubicación
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Punto de Salida</h4>
                  <p className="text-gray-700">{event.departureLocation.address}</p>
                  <p className="text-gray-500">{event.departureLocation.city}, {event.departureLocation.country}</p>
                </div>

                {event.arrivalLocation && event.arrivalLocation.address && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Destino</h4>
                    <p className="text-gray-700">{event.arrivalLocation.address}</p>
                    <p className="text-gray-500">{event.arrivalLocation.city}, {event.arrivalLocation.country}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Servicios y Requerimientos */}
            {(event.includedServices?.length || event.requirements?.length) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Servicios y Requerimientos</h3>
                
                {event.includedServices && event.includedServices.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Servicios Incluidos</h4>
                    <div className="flex flex-wrap gap-2">
                      {event.includedServices.map((service, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {event.requirements && event.requirements.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Requerimientos</h4>
                    <div className="flex flex-wrap gap-2">
                      {event.requirements.map((requirement, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                        >
                          {requirement}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Participantes */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaUsers className="mr-2 text-blue-500" />
                  Participantes ({event.currentParticipants}{event.maxParticipants ? `/${event.maxParticipants}` : ''})
                </h3>
                {event.participants && event.participants.length > 0 && (
                  <button
                    onClick={() => setShowParticipants(!showParticipants)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {showParticipants ? 'Ocultar' : 'Ver Lista'}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{event.currentParticipants}</p>
                  <p className="text-sm text-gray-600">Registrados</p>
                </div>
                {event.maxParticipants && (
                  <>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-600">{event.maxParticipants - event.currentParticipants}</p>
                      <p className="text-sm text-gray-600">Disponibles</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {Math.round((event.currentParticipants / event.maxParticipants) * 100)}%
                      </p>
                      <p className="text-sm text-gray-600">Ocupación</p>
                    </div>
                  </>
                )}
              </div>

              {showParticipants && event.participants && event.participants.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 mb-2">Lista de Participantes</h4>
                  <div className="max-h-60 overflow-y-auto">
                    {event.participants.map((participant, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-gray-900">
                            {participant.firstName} {participant.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{participant.email}</p>
                        </div>
                        {participant.membershipType && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {participant.membershipType}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna Lateral */}
          <div className="space-y-6">
            {/* Información General */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaInfoCircle className="mr-2 text-blue-500" />
                Información General
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Evento</label>
                  <p className="text-gray-900 capitalize">{event.eventType}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                  <p className="text-gray-900">{formatDate(event.startDate)}</p>
                </div>

                {event.endDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
                    <p className="text-gray-900">{formatDate(event.endDate)}</p>
                  </div>
                )}

                {event.registrationDeadline && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha Límite de Registro</label>
                    <p className="text-gray-900">{formatDate(event.registrationDeadline)}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio</label>
                  <p className="text-gray-900">
                    {event.price > 0 ? `$${event.price.toLocaleString('es-MX')} MXN` : 'Gratuito'}
                  </p>
                </div>

                {event.distance && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Distancia</label>
                    <p className="text-gray-900">{event.distance} km</p>
                  </div>
                )}

                {event.duration && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duración</label>
                    <p className="text-gray-900">{event.duration} horas</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Creado</label>
                  <p className="text-gray-900">{formatDateShort(event.createdAt)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Última Actualización</label>
                  <p className="text-gray-900">{formatDateShort(event.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Organizador */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizador</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <p className="text-gray-900">{event.organizer.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <p className="text-gray-900 flex items-center">
                    <FaPhone className="mr-2 text-gray-400" />
                    <a href={`tel:${event.organizer.phone}`} className="text-blue-600 hover:text-blue-800">
                      {event.organizer.phone}
                    </a>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900 flex items-center">
                    <FaEnvelope className="mr-2 text-gray-400" />
                    <a href={`mailto:${event.organizer.email}`} className="text-blue-600 hover:text-blue-800">
                      {event.organizer.email}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Etiquetas */}
            {event.tags && event.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaTags className="mr-2 text-blue-500" />
                  Etiquetas
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones Rápidas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.open(`/events/${eventId}`, '_blank')}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaEye className="mr-2" />
                  Ver en Sitio Público
                </button>
                
                <button
                  onClick={() => router.push(`/admin/events/${eventId}/edit`)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaEdit className="mr-2" />
                  Editar Evento
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCSRFToken } from '@/lib/csrf-client';
import { 
  FaSpinner, 
  FaCalendarAlt, 
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaArrowLeft,
  FaPlus,
  FaCalendarCheck,
  FaMapMarkerAlt,
  FaUsers,
  FaUserCheck
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
  };
  arrivalLocation?: {
    address: string;
    city: string;
    country: string;
  };
  maxParticipants?: number;
  currentParticipants: number;
  price: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminEventsPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  // Cargar eventos
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoadingEvents(true);
        const params = new URLSearchParams({
          page: currentPage.toString(),
          search: searchTerm,
          type: filterType,
          status: filterStatus
        });

        const response = await fetch(`/api/admin/events?${params}`);
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events);
          setTotalPages(data.pagination.totalPages);
        }
      } catch (error) {
        console.error('Error cargando eventos:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    if (user && (user.role === 'admin' || user.role === 'super-admin')) {
      loadEvents();
    }
  }, [user, currentPage, searchTerm, filterType, filterStatus]);

  const handleToggleEventStatus = async (eventId: string, currentStatus: boolean) => {
    try {
      const csrfToken = getCSRFToken();
      const response = await fetch(`/api/admin/events/${eventId}/toggle-status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || '',
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (response.ok) {
        setEvents(events.map(e => 
          e._id === eventId ? { ...e, isActive: !currentStatus } : e
        ));
      }
    } catch (error) {
      console.error('Error cambiando status del evento:', error);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      return;
    }

    try {
      const csrfToken = getCSRFToken();
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'x-csrf-token': csrfToken || '',
        },
      });

      if (response.ok) {
        setEvents(events.filter(e => e._id !== eventId));
      }
    } catch (error) {
      console.error('Error eliminando evento:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      rodada: 'bg-blue-100 text-blue-800',
      reunion: 'bg-green-100 text-green-800',
      curso: 'bg-yellow-100 text-yellow-800',
      social: 'bg-purple-100 text-purple-800',
      mantenimiento: 'bg-red-100 text-red-800',
      competencia: 'bg-orange-100 text-orange-800',
      viaje: 'bg-indigo-100 text-indigo-800',
      patrocinado: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'super-admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Acceso Denegado</h1>
          <Link href="/admin" className="text-blue-600 hover:underline">
            Volver al Panel de Administración
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/admin" className="mr-4">
                <FaArrowLeft className="text-xl text-gray-600 hover:text-gray-900" />
              </Link>
              <FaCalendarAlt className="text-2xl text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Eventos</h1>
                <p className="text-sm text-gray-600">Crear y administrar eventos del motoclub</p>
              </div>
            </div>
            
            <Link
              href="/admin/events/new"
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              Nuevo Evento
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Título, ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Evento
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los tipos</option>
                <option value="rodada">Rodada</option>
                <option value="reunion">Reunión</option>
                <option value="curso">Curso/Taller</option>
                <option value="social">Evento Social</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="competencia">Competencia</option>
                <option value="viaje">Viaje Largo</option>
                <option value="patrocinado">Evento Patrocinado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="upcoming">Próximos</option>
                <option value="past">Pasados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Eventos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loadingEvents ? (
            <div className="p-12 text-center">
              <FaSpinner className="animate-spin text-2xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Cargando eventos...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="p-12 text-center">
              <FaCalendarAlt className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No se encontraron eventos</p>
              <Link
                href="/admin/events/new"
                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="mr-2" />
                Crear Primer Evento
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {events.map((event) => (
                <div key={event._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          {event.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeColor(event.eventType)}`}>
                          {event.eventType}
                        </span>
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                          event.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {event.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {event.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-2 text-blue-500" />
                          {formatDate(event.startDate)}
                        </div>
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="mr-2 text-green-500" />
                          {event.departureLocation.city}
                        </div>
                        <div className="flex items-center">
                          <FaUsers className="mr-2 text-purple-500" />
                          {event.currentParticipants}
                          {event.maxParticipants && `/${event.maxParticipants}`} participantes
                        </div>
                      </div>
                      
                      {event.price > 0 && (
                        <div className="mt-2">
                          <span className="text-lg font-bold text-green-600">
                            ${event.price.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-6">
                      <Link
                        href={`/admin/events/view/${event._id}`}
                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <FaEye />
                      </Link>
                      <Link
                        href={`/admin/events/attendance/${event._id}`}
                        className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Gestionar asistencia"
                      >
                        <FaUserCheck />
                      </Link>
                      <Link
                        href={`/admin/events/edit/${event._id}`}
                        className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => handleToggleEventStatus(event._id, event.isActive)}
                        className={`p-2 rounded-lg transition-colors ${
                          event.isActive 
                            ? 'text-red-600 hover:text-red-900 hover:bg-red-50' 
                            : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                        }`}
                        title={event.isActive ? 'Desactivar' : 'Activar'}
                      >
                        <FaCalendarCheck />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Página <span className="font-medium">{currentPage}</span> de{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + Math.max(1, currentPage - 2);
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

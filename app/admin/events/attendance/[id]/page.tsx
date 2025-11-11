'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  FaSpinner, 
  FaArrowLeft,
  FaUsers,
  FaCalendarCheck,
  FaUserCheck,
  FaUserTimes,
  FaSearch,
  FaCheck,
  FaTimes
} from 'react-icons/fa';

interface Participant {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  membershipType?: string;
  hasAttended: boolean;
}

interface AttendanceData {
  eventId: string;
  eventName: string;
  totalRegistered: number;
  totalAttended: number;
  participants: Participant[];
}

export default function EventAttendancePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAttendance, setFilterAttendance] = useState<'all' | 'attended' | 'not-attended'>('all');

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

  // Cargar datos de asistencia
  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/events/${eventId}/attendance`);
      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data.data);
      } else {
        router.push('/admin/events');
      }
    } catch (error) {
      console.error('Error cargando datos de asistencia:', error);
      router.push('/admin/events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'super-admin') && eventId) {
      void loadAttendanceData();
    }
  }, [user, eventId, router]);

  // Marcar/desmarcar asistencia
  const handleToggleAttendance = async (participantId: string, currentAttendance: boolean) => {
    try {
      setUpdating(participantId);
      const response = await fetch(`/api/admin/events/${eventId}/attendance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId,
          action: currentAttendance ? 'unmark' : 'mark'
        })
      });

      if (response.ok) {
        // Actualizar estado local
        setAttendanceData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            totalAttended: prev.totalAttended + (currentAttendance ? -1 : 1),
            participants: prev.participants.map(p =>
              p._id === participantId ? { ...p, hasAttended: !currentAttendance } : p
            )
          };
        });
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al actualizar asistencia');
      }
    } catch (error) {
      console.error('Error actualizando asistencia:', error);
      alert('Error de conexión');
    } finally {
      setUpdating(null);
    }
  };

  // Marcar todos como asistentes
  const handleMarkAllAttended = async () => {
    if (!attendanceData || !confirm('¿Marcar todos los participantes como asistentes?')) {
      return;
    }

    try {
      setLoading(true);
      const promises = attendanceData.participants
        .filter(p => !p.hasAttended)
        .map(p => 
          fetch(`/api/admin/events/${eventId}/attendance`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              participantId: p._id,
              action: 'mark'
            })
          })
        );

      await Promise.all(promises);
      await loadAttendanceData();
    } catch (error) {
      console.error('Error marcando todos como asistentes:', error);
      alert('Error al procesar solicitud');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar participantes
  const filteredParticipants = attendanceData?.participants.filter(participant => {
    const matchesSearch = !searchTerm || 
      participant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterAttendance === 'all' ||
      (filterAttendance === 'attended' && participant.hasAttended) ||
      (filterAttendance === 'not-attended' && !participant.hasAttended);

    return matchesSearch && matchesFilter;
  }) || [];

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos de asistencia...</p>
        </div>
      </div>
    );
  }

  if (!attendanceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No se pudieron cargar los datos de asistencia</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout 
      title={`Asistencia: ${attendanceData.eventName}`} 
      description="Gestionar asistencia de participantes al evento"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/admin/events/view/${eventId}`)}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Volver al Evento
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Control de Asistencia
              </h1>
              <p className="text-gray-600">{attendanceData.eventName}</p>
            </div>

            <div className="flex gap-2 mt-4 sm:mt-0">
              <button
                onClick={handleMarkAllAttended}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <FaUserCheck className="mr-2" />
                Marcar Todos Presentes
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaUsers className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Registrados</p>
                <p className="text-2xl font-bold text-gray-900">{attendanceData.totalRegistered}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <FaUserCheck className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Asistieron</p>
                <p className="text-2xl font-bold text-gray-900">{attendanceData.totalAttended}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg">
                <FaUserTimes className="text-red-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">No Asistieron</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendanceData.totalRegistered - attendanceData.totalAttended}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FaCalendarCheck className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">% Asistencia</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendanceData.totalRegistered > 0 
                    ? Math.round((attendanceData.totalAttended / attendanceData.totalRegistered) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar participante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="sm:w-64">
              <select
                value={filterAttendance}
                onChange={(e) => setFilterAttendance(e.target.value as 'all' | 'attended' | 'not-attended')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filtrar asistencia"
              >
                <option value="all">Todos los participantes</option>
                <option value="attended">Solo asistentes</option>
                <option value="not-attended">Solo ausentes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de participantes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Lista de Participantes ({filteredParticipants.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredParticipants.length > 0 ? (
              filteredParticipants.map((participant) => (
                <div key={participant._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${
                        participant.hasAttended ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {participant.firstName} {participant.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{participant.email}</p>
                        {participant.membershipType && (
                          <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {participant.membershipType}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        participant.hasAttended
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {participant.hasAttended ? 'Asistió' : 'No asistió'}
                      </span>

                      <button
                        onClick={() => handleToggleAttendance(participant._id, participant.hasAttended)}
                        disabled={updating === participant._id}
                        className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                          participant.hasAttended
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {updating === participant._id ? (
                          <FaSpinner className="animate-spin mr-2" />
                        ) : participant.hasAttended ? (
                          <FaTimes className="mr-2" />
                        ) : (
                          <FaCheck className="mr-2" />
                        )}
                        {participant.hasAttended ? 'Marcar Ausente' : 'Marcar Presente'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">
                  {searchTerm || filterAttendance !== 'all' 
                    ? 'No se encontraron participantes con los filtros aplicados'
                    : 'No hay participantes registrados en este evento'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

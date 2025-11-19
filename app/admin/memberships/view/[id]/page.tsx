'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaMotorcycle,
  FaSpinner,
  FaArrowLeft,
  FaExclamationTriangle,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCalendar,
  FaIdCard,
  FaComments,
  FaUserCheck,
  FaGlobe
} from 'react-icons/fa';
import Link from 'next/link';

interface MembershipApplication {
  _id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: 'friend' | 'rider' | 'rider-duo' | 'pro' | 'pro-duo';
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  age?: number;
  city?: string;
  motorcycleBrand?: string;
  motorcycleModel?: string;
  ridingExperience?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  reviewedBy?: string;
  reviewedByName?: string;
  reviewDate?: string;
  rejectionReason?: string;
  approvalNotes?: string;
  orientationCompleted?: boolean;
  orientationDate?: string;
  membershipStartDate?: string;
  membershipNumber?: string;
  referredBy?: string;
  source?: 'website' | 'referral' | 'event' | 'social-media' | 'other';
  createdAt: string;
  updatedAt: string;
}

export default function ViewMembershipPage() {
  const { user } = useAuth();
  const params = useParams();
  const membershipId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [membership, setMembership] = useState<MembershipApplication | null>(null);

  // Verificar permisos
  if (!user || !['admin', 'super-admin'].includes(user.role)) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <FaExclamationTriangle className="text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Sin permisos</h2>
            <p className="text-gray-600">No tienes permisos para acceder a esta sección.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Cargar datos de la membresía
  useEffect(() => {
    const loadMembership = async () => {
      try {
        const apiClient = (await import('@/lib/api-client')).default;
        const data = await apiClient.get(`/admin/memberships/${membershipId}`) as { application?: typeof membership };
        
        if (data.application) {
          setMembership(data.application);
        } else {
          setErrors({ load: 'Error al cargar la membresía' });
        }
      } catch (error) {
        console.error('Error:', error);
        setErrors({ load: 'Error al cargar la membresía' });
      } finally {
        setLoading(false);
      }
    };

    if (membershipId) {
      void loadMembership();
    }
  }, [membershipId]);

  const handleStatusChange = async (newStatus: 'approved' | 'rejected') => {
    if (!membership) return;

    try {
      const endpoint = newStatus === 'approved' ? 'approve' : 'reject';
      const apiClient = (await import('@/lib/api-client')).default;
      const updatedData = await apiClient.post(`/admin/memberships/${membershipId}/${endpoint}`, {
        reviewedBy: user.id,
        reviewedByName: `${user.firstName} ${user.lastName}`,
        [newStatus === 'approved' ? 'approvalNotes' : 'rejectionReason']: 
          `${newStatus === 'approved' ? 'Aprobado' : 'Rechazado'} desde vista detallada`
      }) as { application?: typeof membership };

      if (updatedData.application) {
        setMembership(updatedData.application);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const membershipTypeNames: Record<string, string> = {
    'friend': 'Amigo',
    'rider': 'Piloto',
    'rider-duo': 'Piloto Dúo',
    'pro': 'Profesional',
    'pro-duo': 'Profesional Dúo'
  };

  const ridingExperienceNames: Record<string, string> = {
    'beginner': 'Principiante',
    'intermediate': 'Intermedio',
    'advanced': 'Avanzado',
    'expert': 'Experto'
  };

  const sourceNames: Record<string, string> = {
    'website': 'Sitio Web',
    'referral': 'Referencia',
    'event': 'Evento',
    'social-media': 'Redes Sociales',
    'other': 'Otro'
  };

  const statusColors: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800'
  };

  const statusNames: Record<string, string> = {
    'pending': 'Pendiente',
    'approved': 'Aprobada',
    'rejected': 'Rechazada'
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  if (errors.load) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <FaExclamationTriangle className="text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Error</h2>
            <p className="text-gray-600">{errors.load}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!membership) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <div className="text-gray-600 mb-4">
            <FaExclamationTriangle className="text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Membresía no encontrada</h2>
            <p className="text-gray-600">La membresía solicitada no existe.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/memberships"
              className="text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft className="text-xl" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detalles de Membresía</h1>
              <p className="text-gray-600">Información completa de la solicitud</p>
            </div>
          </div>
          
          {/* Acciones */}
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[membership.status]}`}>
              {statusNames[membership.status]}
            </span>
            
            <Link
              href={`/admin/memberships/${membership._id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <FaEdit />
              <span>Editar</span>
            </Link>
            
            {/* Botones de cambio de estado */}
            {membership.status === 'pending' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleStatusChange('approved')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <FaCheckCircle />
                  <span>Aprobar</span>
                </button>
                <button
                  onClick={() => handleStatusChange('rejected')}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <FaTimesCircle />
                  <span>Rechazar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Información Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Personal */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FaUser className="mr-2" />
                  Información Personal
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Nombre Completo</label>
                    <p className="text-gray-900">{membership.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <p className="text-gray-900 flex items-center">
                      <FaEnvelope className="mr-2 text-gray-400" />
                      {membership.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Teléfono</label>
                    <p className="text-gray-900 flex items-center">
                      <FaPhone className="mr-2 text-gray-400" />
                      {membership.phone}
                    </p>
                  </div>
                  {membership.age && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Edad</label>
                      <p className="text-gray-900">{membership.age} años</p>
                    </div>
                  )}
                  {membership.city && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Ciudad</label>
                      <p className="text-gray-900 flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-gray-400" />
                        {membership.city}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Tipo de Membresía</label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {membershipTypeNames[membership.membershipType]}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de Motocicleta */}
            {(membership.motorcycleBrand || membership.motorcycleModel || membership.ridingExperience) && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <FaMotorcycle className="mr-2" />
                    Información de Motocicleta
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {membership.motorcycleBrand && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Marca</label>
                        <p className="text-gray-900">{membership.motorcycleBrand}</p>
                      </div>
                    )}
                    {membership.motorcycleModel && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Modelo</label>
                        <p className="text-gray-900">{membership.motorcycleModel}</p>
                      </div>
                    )}
                    {membership.ridingExperience && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Experiencia</label>
                        <p className="text-gray-900">{ridingExperienceNames[membership.ridingExperience]}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje */}
            {membership.message && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <FaComments className="mr-2" />
                    Mensaje
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 whitespace-pre-wrap">{membership.message}</p>
                </div>
              </div>
            )}

            {/* Información de Membresía (si está aprobada) */}
            {membership.status === 'approved' && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <FaIdCard className="mr-2" />
                    Información de Membresía
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {membership.membershipNumber && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Número de Membresía</label>
                        <p className="text-gray-900 font-medium">{membership.membershipNumber}</p>
                      </div>
                    )}
                    {membership.membershipStartDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Fecha de Inicio</label>
                        <p className="text-gray-900 flex items-center">
                          <FaCalendar className="mr-2 text-gray-400" />
                          {new Date(membership.membershipStartDate).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Orientación</label>
                      <div className="flex items-center">
                        {membership.orientationCompleted ? (
                          <>
                            <FaCheckCircle className="mr-2 text-green-500" />
                            <span className="text-green-700">Completada</span>
                          </>
                        ) : (
                          <>
                            <FaClock className="mr-2 text-yellow-500" />
                            <span className="text-yellow-700">Pendiente</span>
                          </>
                        )}
                      </div>
                    </div>
                    {membership.orientationDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Fecha de Orientación</label>
                        <p className="text-gray-900 flex items-center">
                          <FaCalendar className="mr-2 text-gray-400" />
                          {new Date(membership.orientationDate).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Columna Lateral */}
          <div className="space-y-6">
            {/* Estado y Fechas */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Estado</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Estado Actual</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[membership.status]}`}>
                    {statusNames[membership.status]}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Fecha de Solicitud</label>
                  <p className="text-gray-900 flex items-center">
                    <FaCalendar className="mr-2 text-gray-400" />
                    {new Date(membership.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>

                {membership.reviewDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Fecha de Revisión</label>
                    <p className="text-gray-900 flex items-center">
                      <FaCalendar className="mr-2 text-gray-400" />
                      {new Date(membership.reviewDate).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                )}

                {membership.reviewedByName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Revisado por</label>
                    <p className="text-gray-900 flex items-center">
                      <FaUserCheck className="mr-2 text-gray-400" />
                      {membership.reviewedByName}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Información Adicional */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Información Adicional</h3>
              </div>
              <div className="p-6 space-y-4">
                {membership.referredBy && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Referido por</label>
                    <p className="text-gray-900">{membership.referredBy}</p>
                  </div>
                )}

                {membership.source && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Fuente</label>
                    <p className="text-gray-900 flex items-center">
                      <FaGlobe className="mr-2 text-gray-400" />
                      {sourceNames[membership.source]}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Última Actualización</label>
                  <p className="text-gray-900 text-sm">
                    {new Date(membership.updatedAt).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>
            </div>

            {/* Notas de Revisión */}
            {(membership.approvalNotes || membership.rejectionReason) && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Notas de Revisión</h3>
                </div>
                <div className="p-6">
                  {membership.approvalNotes && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">Notas de Aprobación</h4>
                      <p className="text-green-700 text-sm">{membership.approvalNotes}</p>
                    </div>
                  )}
                  {membership.rejectionReason && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">Motivo de Rechazo</h4>
                      <p className="text-red-700 text-sm">{membership.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

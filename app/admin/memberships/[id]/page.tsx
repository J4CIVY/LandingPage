'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  FaSave, 
  FaTimes, 
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
  FaClock
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

export default function EditMembershipPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const membershipId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        const response = await fetch(`/api/admin/memberships/${membershipId}`);
        if (response.ok) {
          const data = await response.json();
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
      loadMembership();
    }
  }, [membershipId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!membership) return;
    
    const { name, value } = e.target;
    setMembership(prev => ({
      ...prev!,
      [name]: name === 'age' ? (value ? parseInt(value) : undefined) : value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!membership) return false;
    
    const newErrors: Record<string, string> = {};

    if (!membership.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!membership.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(membership.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    if (!membership.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (membership.age && (membership.age < 16 || membership.age > 100)) {
      newErrors.age = 'La edad debe estar entre 16 y 100 años';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!membership || !validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/admin/memberships/${membershipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...membership,
          updatedBy: user.id
        }),
      });

      if (response.ok) {
        router.push('/admin/memberships');
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || 'Error al actualizar la membresía' });
      }
    } catch (error) {
      console.error('Error:', error);
      setErrors({ submit: 'Error al actualizar la membresía' });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: 'pending' | 'approved' | 'rejected') => {
    if (!membership) return;

    try {
      const endpoint = newStatus === 'approved' ? 'approve' : newStatus === 'rejected' ? 'reject' : null;
      
      if (endpoint) {
        const response = await fetch(`/api/admin/memberships/${membershipId}/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reviewedBy: user.id,
            reviewedByName: `${user.firstName} ${user.lastName}`,
            [newStatus === 'approved' ? 'approvalNotes' : 'rejectionReason']: 
              `${newStatus === 'approved' ? 'Aprobado' : 'Rechazado'} desde edición`
          }),
        });

        if (response.ok) {
          const updatedData = await response.json();
          setMembership(updatedData.application);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const membershipTypes = [
    { value: 'friend', label: 'Amigo' },
    { value: 'rider', label: 'Piloto' },
    { value: 'rider-duo', label: 'Piloto Dúo' },
    { value: 'pro', label: 'Profesional' },
    { value: 'pro-duo', label: 'Profesional Dúo' }
  ];

  const ridingExperiences = [
    { value: 'beginner', label: 'Principiante' },
    { value: 'intermediate', label: 'Intermedio' },
    { value: 'advanced', label: 'Avanzado' },
    { value: 'expert', label: 'Experto' }
  ];

  const sources = [
    { value: 'website', label: 'Sitio Web' },
    { value: 'referral', label: 'Referencia' },
    { value: 'event', label: 'Evento' },
    { value: 'social-media', label: 'Redes Sociales' },
    { value: 'other', label: 'Otro' }
  ];

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
              <h1 className="text-2xl font-bold text-gray-900">Editar Membresía</h1>
              <p className="text-gray-600">Modificar información de la membresía</p>
            </div>
          </div>
          
          {/* Estado actual */}
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[membership.status]}`}>
              {statusNames[membership.status]}
            </span>
            
            {/* Botones de cambio de estado */}
            {membership.status === 'pending' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleStatusChange('approved')}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                >
                  <FaCheckCircle />
                  <span>Aprobar</span>
                </button>
                <button
                  onClick={() => handleStatusChange('rejected')}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                >
                  <FaTimesCircle />
                  <span>Rechazar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Información de seguimiento */}
        {(membership.reviewDate || membership.reviewedByName) && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Información de Revisión</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              {membership.reviewedByName && (
                <div>
                  <span className="font-medium">Revisado por:</span> {membership.reviewedByName}
                </div>
              )}
              {membership.reviewDate && (
                <div>
                  <span className="font-medium">Fecha de revisión:</span> {new Date(membership.reviewDate).toLocaleString('es-ES')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error general */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}

            {/* Información Personal */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUser className="inline mr-2" />
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={membership.name}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Introduce el nombre completo"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaEnvelope className="inline mr-2" />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={membership.email}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="ejemplo@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaPhone className="inline mr-2" />
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={membership.phone}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+34 600 000 000"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Edad
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={membership.age || ''}
                    onChange={handleInputChange}
                    min="16"
                    max="100"
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.age ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Edad"
                  />
                  {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaMapMarkerAlt className="inline mr-2" />
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={membership.city || ''}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ciudad de residencia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Membresía *
                  </label>
                  <select
                    name="membershipType"
                    value={membership.membershipType}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {membershipTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Información de Motocicleta */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                <FaMotorcycle className="inline mr-2" />
                Información de Motocicleta
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca de Motocicleta
                  </label>
                  <input
                    type="text"
                    name="motorcycleBrand"
                    value={membership.motorcycleBrand || ''}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Yamaha, Honda, KTM..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo de Motocicleta
                  </label>
                  <input
                    type="text"
                    name="motorcycleModel"
                    value={membership.motorcycleModel || ''}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: MT-07, CB650R..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experiencia de Conducción
                  </label>
                  <select
                    name="ridingExperience"
                    value={membership.ridingExperience || 'beginner'}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ridingExperiences.map(exp => (
                      <option key={exp.value} value={exp.value}>
                        {exp.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información Adicional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referido por
                  </label>
                  <input
                    type="text"
                    name="referredBy"
                    value={membership.referredBy || ''}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre del miembro que lo refirió"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuente
                  </label>
                  <select
                    name="source"
                    value={membership.source || 'website'}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sources.map(source => (
                      <option key={source.value} value={source.value}>
                        {source.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje / Notas
                </label>
                <textarea
                  name="message"
                  value={membership.message || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mensaje adicional o notas sobre la membresía..."
                />
              </div>
            </div>

            {/* Información de Membresía (si está aprobada) */}
            {membership.status === 'approved' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Membresía</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Membresía
                    </label>
                    <input
                      type="text"
                      name="membershipNumber"
                      value={membership.membershipNumber || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: BSK-2024-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Inicio
                    </label>
                    <input
                      type="date"
                      name="membershipStartDate"
                      value={membership.membershipStartDate ? membership.membershipStartDate.split('T')[0] : ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Orientación Completada
                    </label>
                    <select
                      name="orientationCompleted"
                      value={membership.orientationCompleted ? 'true' : 'false'}
                      onChange={(e) => setMembership(prev => ({
                        ...prev!,
                        orientationCompleted: e.target.value === 'true'
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="false">No</option>
                      <option value="true">Sí</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/admin/memberships"
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FaTimes />
                <span>Cancelar</span>
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

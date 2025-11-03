'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getCSRFToken } from '@/lib/csrf-client';
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
  FaExclamationTriangle
} from 'react-icons/fa';
import Link from 'next/link';

interface MembershipFormData {
  name: string;
  email: string;
  phone: string;
  membershipType: 'friend' | 'rider' | 'rider-duo' | 'pro' | 'pro-duo';
  message?: string;
  age?: number;
  city?: string;
  motorcycleBrand?: string;
  motorcycleModel?: string;
  ridingExperience?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  referredBy?: string;
  source?: 'website' | 'referral' | 'event' | 'social-media' | 'other';
}

export default function NewMembershipPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<MembershipFormData>({
    name: '',
    email: '',
    phone: '',
    membershipType: 'friend',
    message: '',
    age: undefined,
    city: '',
    motorcycleBrand: '',
    motorcycleModel: '',
    ridingExperience: 'beginner',
    referredBy: '',
    source: 'website'
  });

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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
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
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (formData.age && (formData.age < 16 || formData.age > 100)) {
      newErrors.age = 'La edad debe estar entre 16 y 100 años';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const csrfToken = getCSRFToken();
      const response = await fetch('/api/admin/memberships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken || '',
        },
        body: JSON.stringify({
          ...formData,
          status: 'approved', // Las membresías creadas por admin están automáticamente aprobadas
          reviewedBy: user.id,
          reviewedByName: `${user.firstName} ${user.lastName}`,
          approvalNotes: 'Membresía creada directamente por administrador'
        }),
      });

      if (response.ok) {
        router.push('/admin/memberships');
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || 'Error al crear la membresía' });
      }
    } catch (error) {
      console.error('Error:', error);
      setErrors({ submit: 'Error al crear la membresía' });
    } finally {
      setLoading(false);
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
              <h1 className="text-2xl font-bold text-gray-900">Nueva Membresía</h1>
              <p className="text-gray-600">Crear una nueva membresía del motoclub</p>
            </div>
          </div>
        </div>

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
                    value={formData.name}
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
                    value={formData.email}
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
                    value={formData.phone}
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
                    value={formData.age || ''}
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
                    value={formData.city}
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
                    value={formData.membershipType}
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
                    value={formData.motorcycleBrand}
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
                    value={formData.motorcycleModel}
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
                    value={formData.ridingExperience}
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
                    value={formData.referredBy}
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
                    value={formData.source}
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
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mensaje adicional o notas sobre la membresía..."
                />
              </div>
            </div>

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
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Creando...</span>
                  </>
                ) : (
                  <>
                    <FaSave />
                    <span>Crear Membresía</span>
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

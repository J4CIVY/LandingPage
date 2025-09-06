'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaMotorcycle,
  FaCalendarAlt,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaArrowLeft,
  FaCheck,
  FaExclamationTriangle,
  FaInfoCircle,
  FaLock,
  FaUserCircle,
  FaCertificate
} from 'react-icons/fa';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  dateOfBirth?: string;
  motorcycleInfo?: {
    brand?: string;
    model?: string;
    year?: string;
    licensePlate?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  membershipType: string;
  isEmailVerified: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    dateOfBirth: '',
    motorcycleInfo: {
      brand: '',
      model: '',
      year: '',
      licensePlate: ''
    },
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    membershipType: '',
    isEmailVerified: false
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const userProfile = data.data.user;
        setProfile(userProfile);
        setFormData({
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          email: userProfile.email || '',
          phone: userProfile.phone || '',
          address: userProfile.address || '',
          city: userProfile.city || '',
          country: userProfile.country || '',
          dateOfBirth: userProfile.dateOfBirth ? userProfile.dateOfBirth.split('T')[0] : '',
          motorcycleInfo: {
            brand: userProfile.motorcycleInfo?.brand || '',
            model: userProfile.motorcycleInfo?.model || '',
            year: userProfile.motorcycleInfo?.year || '',
            licensePlate: userProfile.motorcycleInfo?.licensePlate || ''
          },
          emergencyContact: {
            name: userProfile.emergencyContact?.name || '',
            phone: userProfile.emergencyContact?.phone || '',
            relationship: userProfile.emergencyContact?.relationship || ''
          },
          membershipType: userProfile.membershipType || '',
          isEmailVerified: userProfile.isEmailVerified || false
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Perfil actualizado exitosamente' });
        setProfile(formData);
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al actualizar el perfil' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión. Inténtalo de nuevo.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      setSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' });
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/users/change-password', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Contraseña actualizada exitosamente' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al cambiar la contraseña' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión. Inténtalo de nuevo.' });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile();
    } else if (!isLoading && !isAuthenticated) {
      router.push('/login?returnUrl=/profile');
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const membershipColors = {
    friend: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rider: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'rider-duo': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    pro: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    'pro-duo': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Volver al Dashboard
          </button>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-full flex items-center justify-center">
                <FaUserCircle className="text-3xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {formData.firstName} {formData.lastName}
                </h1>
                <p className="text-gray-600 dark:text-slate-400">{formData.email}</p>
                <div className="flex items-center space-x-3 mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${membershipColors[formData.membershipType as keyof typeof membershipColors]}`}>
                    <FaCertificate className="mr-1" />
                    {formData.membershipType.charAt(0).toUpperCase() + formData.membershipType.slice(1)}
                  </span>
                  {formData.isEmailVerified && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <FaCheck className="mr-1" />
                      Verificado
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje de estado */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <FaCheck className="mr-2" />
              ) : (
                <FaExclamationTriangle className="mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información Personal */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
                <FaUser className="mr-2 text-blue-600 dark:text-blue-400" />
                Información Personal
              </h2>
            </div>
            
            <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    País
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Dirección
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaCheck className="mr-2" />
                )}
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>

          {/* Información de Motocicleta y Contacto de Emergencia */}
          <div className="space-y-6">
            {/* Información de Motocicleta */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
                  <FaMotorcycle className="mr-2 text-blue-600 dark:text-blue-400" />
                  Información de Motocicleta
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Marca
                    </label>
                    <input
                      type="text"
                      value={formData.motorcycleInfo?.brand || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        motorcycleInfo: { ...formData.motorcycleInfo, brand: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Modelo
                    </label>
                    <input
                      type="text"
                      value={formData.motorcycleInfo?.model || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        motorcycleInfo: { ...formData.motorcycleInfo, model: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Año
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max="2030"
                      value={formData.motorcycleInfo?.year || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        motorcycleInfo: { ...formData.motorcycleInfo, year: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Placa
                    </label>
                    <input
                      type="text"
                      value={formData.motorcycleInfo?.licensePlate || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        motorcycleInfo: { ...formData.motorcycleInfo, licensePlate: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contacto de Emergencia */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
                  <FaPhone className="mr-2 text-red-600 dark:text-red-400" />
                  Contacto de Emergencia
                </h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact?.name || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContact?.phone || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Relación
                  </label>
                  <select
                    value={formData.emergencyContact?.relationship || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      emergencyContact: { ...formData.emergencyContact, relationship: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="padre">Padre</option>
                    <option value="madre">Madre</option>
                    <option value="esposo">Esposo(a)</option>
                    <option value="hermano">Hermano(a)</option>
                    <option value="hijo">Hijo(a)</option>
                    <option value="amigo">Amigo(a)</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Cambiar Contraseña */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center">
                  <FaLock className="mr-2 text-yellow-600 dark:text-yellow-400" />
                  Cambiar Contraseña
                </h2>
              </div>
              
              <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-100"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 dark:bg-yellow-500 text-white rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (
                    <FaLock className="mr-2" />
                  )}
                  {saving ? 'Actualizando...' : 'Cambiar Contraseña'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

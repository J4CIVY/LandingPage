'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import UserAvatar from '@/components/shared/UserAvatar';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaCalendar, 
  FaMapMarkerAlt, 
  FaEdit,
  FaArrowLeft,
  FaUserShield,
  FaCrown,
  FaMotorcycle,
  FaHeart,
  FaBirthdayCake,
  FaHome,
  FaExclamationTriangle
} from 'react-icons/fa';

interface UserDetails {
  _id: string;
  documentType: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  address: string;
  neighborhood?: string;
  city: string;
  country: string;
  postalCode?: string;
  birthDate: string;
  birthPlace: string;
  binaryGender: string;
  genderIdentity?: string;
  occupation?: string;
  discipline?: string;
  bloodType?: string;
  rhFactor?: string;
  allergies?: string;
  healthInsurance?: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  emergencyContactAddress?: string;
  emergencyContactCity?: string;
  emergencyContactCountry?: string;
  motorcycleBrand?: string;
  motorcycleModel?: string;
  motorcycleYear?: string;
  motorcyclePlate?: string;
  motorcycleEngineSize?: string;
  membershipType: string;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  profileImage?: string;
}

export default function UserDetailsPage() {
  const params = useParams();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/users/${params.id}`);
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setError('Error al cargar los detalles del usuario');
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Error al cargar los detalles del usuario');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchUserDetails();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
        <p className="text-red-600 dark:text-red-400">{error || 'Usuario no encontrado'}</p>
        <Link
          href="/admin/users"
          className="inline-flex items-center mt-4 text-blue-600 dark:text-blue-400 hover:underline"
        >
          <FaArrowLeft className="mr-2" />
          Volver a la lista
        </Link>
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super-admin':
        return <FaCrown className="text-yellow-500" />;
      case 'admin':
        return <FaUserShield className="text-blue-500" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
  };

  const getMembershipBadge = (type: string) => {
    const colors: Record<string, string> = {
      'friend': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'rider': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'rider-duo': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'pro': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'pro-duo': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };

    const colorClass = colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/users"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaArrowLeft className="text-xl" />
            </Link>
            <UserAvatar
              imageUrl={user.profileImage}
              name={`${user.firstName} ${user.lastName}`}
              size="lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h1>
              <div className="flex items-center space-x-3 mt-2">
                <div className="flex items-center space-x-2">
                  {getRoleIcon(user.role)}
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {user.role}
                  </span>
                </div>
                {getMembershipBadge(user.membershipType)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {user.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
          <Link
            href={`/admin/users/${user._id}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FaEdit />
            <span>Editar</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información Personal */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FaUser className="mr-2" />
            Información Personal
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Documento</label>
              <p className="text-gray-900 dark:text-white">
                {user.documentType}: {user.documentNumber}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Nacimiento</label>
              <p className="text-gray-900 dark:text-white flex items-center">
                <FaBirthdayCake className="mr-2 text-pink-500" />
                {new Date(user.birthDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Lugar de Nacimiento</label>
              <p className="text-gray-900 dark:text-white">{user.birthPlace}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Género</label>
              <p className="text-gray-900 dark:text-white">{user.binaryGender}</p>
            </div>
            {user.occupation && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Ocupación</label>
                <p className="text-gray-900 dark:text-white">{user.occupation}</p>
              </div>
            )}
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FaEnvelope className="mr-2" />
            Contacto
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
              <p className="text-gray-900 dark:text-white flex items-center">
                <FaEnvelope className="mr-2 text-blue-500" />
                {user.email}
                {user.isEmailVerified && (
                  <span className="ml-2 text-green-500 text-xs">✓ Verificado</span>
                )}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Teléfono</label>
              <p className="text-gray-900 dark:text-white flex items-center">
                <FaPhone className="mr-2 text-green-500" />
                {user.phone}
              </p>
            </div>
            {user.whatsapp && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">WhatsApp</label>
                <p className="text-gray-900 dark:text-white">{user.whatsapp}</p>
              </div>
            )}
          </div>
        </div>

        {/* Dirección */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FaHome className="mr-2" />
            Dirección
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Dirección</label>
              <p className="text-gray-900 dark:text-white">{user.address}</p>
            </div>
            {user.neighborhood && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Barrio</label>
                <p className="text-gray-900 dark:text-white">{user.neighborhood}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Ciudad</label>
              <p className="text-gray-900 dark:text-white flex items-center">
                <FaMapMarkerAlt className="mr-2 text-red-500" />
                {user.city}, {user.country}
              </p>
            </div>
            {user.postalCode && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Código Postal</label>
                <p className="text-gray-900 dark:text-white">{user.postalCode}</p>
              </div>
            )}
          </div>
        </div>

        {/* Contacto de Emergencia */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FaExclamationTriangle className="mr-2 text-red-500" />
            Contacto de Emergencia
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre</label>
              <p className="text-gray-900 dark:text-white">{user.emergencyContactName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Relación</label>
              <p className="text-gray-900 dark:text-white">{user.emergencyContactRelationship}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Teléfono</label>
              <p className="text-gray-900 dark:text-white flex items-center">
                <FaPhone className="mr-2 text-red-500" />
                {user.emergencyContactPhone}
              </p>
            </div>
            {user.emergencyContactAddress && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Dirección</label>
                <p className="text-gray-900 dark:text-white">
                  {user.emergencyContactAddress}
                  {user.emergencyContactCity && `, ${user.emergencyContactCity}`}
                  {user.emergencyContactCountry && `, ${user.emergencyContactCountry}`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Información de Salud */}
        {(user.bloodType || user.allergies || user.healthInsurance) && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FaHeart className="mr-2 text-red-500" />
              Información de Salud
            </h2>
            <div className="space-y-3">
              {user.bloodType && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tipo de Sangre</label>
                  <p className="text-gray-900 dark:text-white">
                    {user.bloodType}{user.rhFactor && user.rhFactor}
                  </p>
                </div>
              )}
              {user.allergies && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Alergias</label>
                  <p className="text-gray-900 dark:text-white">{user.allergies}</p>
                </div>
              )}
              {user.healthInsurance && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Seguro de Salud</label>
                  <p className="text-gray-900 dark:text-white">{user.healthInsurance}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información de Motocicleta */}
        {(user.motorcycleBrand || user.motorcycleModel) && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FaMotorcycle className="mr-2 text-orange-500" />
              Motocicleta
            </h2>
            <div className="space-y-3">
              {user.motorcycleBrand && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Marca</label>
                  <p className="text-gray-900 dark:text-white">{user.motorcycleBrand}</p>
                </div>
              )}
              {user.motorcycleModel && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Modelo</label>
                  <p className="text-gray-900 dark:text-white">{user.motorcycleModel}</p>
                </div>
              )}
              {user.motorcycleYear && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Año</label>
                  <p className="text-gray-900 dark:text-white">{user.motorcycleYear}</p>
                </div>
              )}
              {user.motorcyclePlate && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Placa</label>
                  <p className="text-gray-900 dark:text-white">{user.motorcyclePlate}</p>
                </div>
              )}
              {user.motorcycleEngineSize && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Cilindraje</label>
                  <p className="text-gray-900 dark:text-white">{user.motorcycleEngineSize}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información del Sistema */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FaCalendar className="mr-2" />
            Información del Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Registro</label>
              <p className="text-gray-900 dark:text-white">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Última Actualización</label>
              <p className="text-gray-900 dark:text-white">
                {new Date(user.updatedAt).toLocaleDateString()}
              </p>
            </div>
            {user.lastLogin && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Último Acceso</label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(user.lastLogin).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

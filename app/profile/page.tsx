'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  FaSpinner,
  FaArrowLeft,
  FaCheck,
  FaExclamationTriangle,
} from 'react-icons/fa';
import {
  ProfileHeader,
  PersonalInfo,
  EmergencyContact,
  MedicalData,
  MotorcycleInfo,
  Documents,
  AccountSettings,
  UserActivity
} from '@/components/dashboard/profile';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState('personal');

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
        setProfile(data.data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Error al cargar el perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Perfil actualizado exitosamente' });
        setProfile({ ...profile, ...data });
        // Recargar el perfil para obtener datos actualizados
        await fetchProfile();
      } else {
        setMessage({ type: 'error', text: result.message || 'Error al actualizar el perfil' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión. Inténtalo de nuevo.' });
    }
  };

  const handleAvatarChange = async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/api/users/upload-avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Foto de perfil actualizada exitosamente' });
        setProfile({ ...profile, profileImage: result.data.profileImage });
      } else {
        setMessage({ type: 'error', text: result.message || 'Error al subir la imagen' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al subir la imagen' });
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile();
    } else if (!isLoading && !isAuthenticated) {
      router.push('/login?returnUrl=/profile');
    }
  }, [isAuthenticated, user, isLoading, router]);

  // Limpiar mensaje después de 5 segundos
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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

  if (!isAuthenticated || !user || !profile) {
    return null;
  }

  const tabs = [
    { id: 'personal', label: 'Información Personal', icon: 'user' },
    { id: 'medical', label: 'Datos Médicos', icon: 'heartbeat' },
    { id: 'motorcycle', label: 'Motocicleta', icon: 'motorcycle' },
    { id: 'emergency', label: 'Contacto de Emergencia', icon: 'phone' },
    { id: 'documents', label: 'Documentos', icon: 'file' },
    { id: 'account', label: 'Configuración', icon: 'cog' },
    { id: 'activity', label: 'Actividad', icon: 'history' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Volver al Dashboard
          </button>
        </div>

        {/* Profile Header */}
        <ProfileHeader 
          user={profile} 
          onAvatarChange={handleAvatarChange}
        />

        {/* Message */}
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

        {/* Tabs Navigation */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 mb-6">
          <div className="border-b border-gray-200 dark:border-slate-700">
            <nav className="-mb-px flex flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'personal' && (
              <PersonalInfo user={profile} onSave={handleSave} />
            )}
            {activeTab === 'medical' && (
              <MedicalData user={profile} onSave={handleSave} />
            )}
            {activeTab === 'motorcycle' && (
              <MotorcycleInfo user={profile} onSave={handleSave} />
            )}
            {activeTab === 'emergency' && (
              <EmergencyContact user={profile} onSave={handleSave} />
            )}
            {activeTab === 'documents' && (
              <Documents userId={profile.id} />
            )}
            {activeTab === 'account' && (
              <AccountSettings user={profile} onSave={handleSave} />
            )}
            {activeTab === 'activity' && (
              <UserActivity user={profile} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

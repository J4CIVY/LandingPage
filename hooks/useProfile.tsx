'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface ProfileData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  profilePicture?: string;
  membershipNumber?: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Campos extendidos (mantener si hay contexto útil)
  documentType?: string;
  documentNumber?: string;
  birthDate?: string;
  birthPlace?: string;
  binaryGender?: string;
  // Datos adicionales del perfil extendido (mantener si hay contexto útil)
  profileCompletion?: number;
  emergencyContact?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  medicalData?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  motorcycleInfo?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  documents?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  activities?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  notificationPreferences?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function useProfile() {
  const { user, isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtiene datos del perfil de usuario (mantener si hay contexto útil)
  const fetchProfile = async () => {
    if (!isAuthenticated || !user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/users/${user.id}/profile`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        setError(`Error fetching profile: ${response.status}`);
        return;
      }

      const data = await response.json();
      setProfileData(data.data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Actualiza perfil de usuario (mantener si hay contexto útil)
  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!isAuthenticated || !user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const response = await fetch(`/api/users/${user.id}/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorMsg = `Error updating profile: ${response.status}`;
        setError(errorMsg);
        return null;
      }

      const data = await response.json();
      setProfileData(data.data.user);
      return data.data.user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating profile');
      return null;
    }
  };

  // Sube avatar (mantener si hay contexto útil)
  const uploadAvatar = async (file: File) => {
    if (!isAuthenticated || !user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`/api/users/${user.id}/avatar`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorMsg = `Error uploading avatar: ${response.status}`;
        setError(errorMsg);
        return null;
      }

      const data = await response.json();
      setProfileData(prev => prev ? { ...prev, profilePicture: data.data.avatarUrl } : null);
      return data.data.avatarUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error uploading avatar');
      return null;
    }
  };

  // Sube documento (mantener si hay contexto útil)
  const uploadDocument = async (file: File, documentType: string, category: string) => {
    if (!isAuthenticated || !user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);
      formData.append('category', category);

      const response = await fetch(`/api/users/${user.id}/documents`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorMsg = `Error uploading document: ${response.status}`;
        setError(errorMsg);
        return null;
      }

      const data = await response.json();
  // Refresca perfil para obtener documentos actualizados
      await fetchProfile();
      return data.data.document;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error uploading document');
      return null;
    }
  };

  // Obtiene actividades del usuario (mantener si hay contexto útil)
  const fetchActivities = async () => {
    if (!isAuthenticated || !user?.id) {
      return [];
    }

    try {
      const response = await fetch(`/api/users/${user.id}/activities`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Error fetching activities: ${response.status}`);
        return [];
      }

      const data = await response.json();
      return data.data.activities;
    } catch (err) {
      console.error('Error fetching activities:', err);
      return [];
    }
  };

  // Calcula el porcentaje de perfil completo (mantener si hay contexto útil)
  const calculateProfileCompletion = (profile: ProfileData | null): number => {
    if (!profile) return 0;

    let filledFields = 0;
    let totalFields = 0;

  // Campos básicos (40%)
    const basicFields = ['firstName', 'lastName', 'email', 'phone', 'birthDate'];
    totalFields += basicFields.length;
    filledFields += basicFields.filter(field => profile[field as keyof ProfileData]).length;

  // Dirección (10%)
    totalFields += 1;
    if (profile.address && profile.city) filledFields += 1;

  // Info adicional (15%)
    const additionalFields = ['documentNumber', 'birthPlace', 'binaryGender'];
    totalFields += additionalFields.length;
    filledFields += additionalFields.filter(field => profile[field as keyof ProfileData]).length;

  // Contacto emergencia (15%)
    totalFields += 1;
    if (profile.emergencyContact?.firstName && profile.emergencyContact?.phone) filledFields += 1;

  // Moto (10%)
    totalFields += 1;
    if (profile.motorcycleInfo?.motorcycles?.length > 0) filledFields += 1;

  // Documentos requeridos (10%)
    totalFields += 1;
    const requiredDocs = profile.documents?.filter(doc => doc.isRequired) || [];
    const approvedRequiredDocs = requiredDocs.filter(doc => doc.status === 'approved');
    if (requiredDocs.length > 0 && approvedRequiredDocs.length === requiredDocs.length) filledFields += 1;

    return Math.round((filledFields / totalFields) * 100);
  };

  // Carga perfil al montar y cuando cambia el usuario (mantener si hay contexto útil)
  useEffect(() => {
    fetchProfile();
  }, [isAuthenticated, user?.id]);

  return {
    profileData,
    loading,
    error,
    profileCompletion: calculateProfileCompletion(profileData),
    fetchProfile,
    updateProfile,
    uploadAvatar,
    uploadDocument,
    fetchActivities,
    refresh: fetchProfile
  };
}
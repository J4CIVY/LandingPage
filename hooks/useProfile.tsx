'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import apiClient from '@/lib/api-client';

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
  // Campos extendidos
  documentType?: string;
  documentNumber?: string;
  birthDate?: string;
  birthPlace?: string;
  binaryGender?: string;
  // Datos adicionales del perfil extendido
  profileCompletion?: number;
  emergencyContact?: Record<string, unknown>;
  medicalData?: Record<string, unknown>;
  motorcycleInfo?: Record<string, unknown>;
  documents?: Array<Record<string, unknown>>;
  activities?: Array<Record<string, unknown>>;
  notificationPreferences?: Record<string, unknown>;
}

export function useProfile() {
  const { user, isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtiene datos del perfil de usuario - NestJS: GET /users/me
  const fetchProfile = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await apiClient.get<ProfileData>('/users/me');
      setProfileData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Actualiza perfil de usuario - NestJS: PUT /users/me
  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const data = await apiClient.put<ProfileData>('/users/me', updates);
      setProfileData(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating profile');
      return null;
    }
  };

  // Sube avatar - NestJS: POST /uploads/profile-image
  const uploadAvatar = async (file: File) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const data = await apiClient.upload<{ url: string }>('/uploads/profile-image', formData);
      
      // Actualizar el perfil con la nueva URL del avatar
      setProfileData(prev => prev ? { ...prev, profilePicture: data.url } : null);
      return data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error uploading avatar');
      return null;
    }
  };

  // Sube documento - NestJS: POST /uploads/document
  const uploadDocument = async (file: File, documentType: string, category: string) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }

    try {
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', documentType);
      formData.append('category', category);

      const data = await apiClient.upload<{ url: string; publicId: string }>('/uploads/document', formData);
      
      // Refresca perfil para obtener documentos actualizados
      await fetchProfile();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error uploading document');
      return null;
    }
  };

  // Obtiene actividades del usuario - NestJS: GET /users/:id/activities (puede no estar implementado aún)
  const fetchActivities = async () => {
    if (!isAuthenticated || !user?.id) {
      return [];
    }

    try {
      // Nota: Este endpoint puede necesitar ser implementado en el backend
      const data = await apiClient.get<Array<Record<string, unknown>>>(`/users/${user.id}/activities`);
      return data;
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
    if (profile.motorcycleInfo?.motorcycles && Array.isArray(profile.motorcycleInfo.motorcycles) && profile.motorcycleInfo.motorcycles.length > 0) filledFields += 1;

  // Documentos requeridos (10%)
    totalFields += 1;
    const requiredDocs = profile.documents?.filter(doc => doc.isRequired) || [];
    const approvedRequiredDocs = requiredDocs.filter(doc => doc.status === 'approved');
    if (requiredDocs.length > 0 && approvedRequiredDocs.length === requiredDocs.length) filledFields += 1;

    return Math.round((filledFields / totalFields) * 100);
  };

  // Carga perfil al montar y cuando cambia el usuario (mantener si hay contexto útil)
  useEffect(() => {
    void fetchProfile();
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
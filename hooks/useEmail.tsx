import { useState, useCallback } from 'react';
import apiClient from '@/lib/api-client';

interface EmailStatus {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string | null;
  message: string | null;
}

interface ContactEmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
  category?: 'general' | 'support' | 'sales' | 'technical' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  phone?: string;
  company?: string;
}

interface NotificationEmailData {
  type: 'welcome' | 'password_reset' | 'account_verification' | 'event_reminder' | 'membership_update';
  recipientEmail: string;
  recipientName: string;
  templateData?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  priority?: 'low' | 'medium' | 'high';
}

interface TestEmailData {
  testEmail: string;
  testType?: 'basic' | 'welcome' | 'contact' | 'event';
}

/**
 * Hook personalizado para el manejo de correos electrónicos
 */
export function useEmail() {
  const [status, setStatus] = useState<EmailStatus>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
    message: null,
  });

  // Función para resetear el estado (mantener si hay contexto útil)
  const resetStatus = useCallback(() => {
    setStatus({
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null,
      message: null,
    });
  }, []);

  // Función para enviar correo de contacto (mantener si hay contexto útil)
  const sendContactEmail = useCallback(async (data: ContactEmailData) => {
    setStatus({
      isLoading: true,
      isSuccess: false,
      isError: false,
      error: null,
      message: null,
    });

    try {
      // NestJS: POST /contact/send
      const result = await apiClient.post<{ message: string }>('/contact/send', {
        ...data,
        category: data.category || 'general',
        priority: data.priority || 'medium',
      });

      setStatus({
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
        message: result.message || 'Correo enviado exitosamente',
      });

      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      setStatus({
        isLoading: false,
        isSuccess: false,
        isError: true,
        error: errorMessage,
        message: null,
      });

      return { success: false, error: errorMessage };
    }
  }, []);

  // Función para enviar notificaciones (solo admins, mantener si hay contexto útil)
  const sendNotification = useCallback(async (data: NotificationEmailData) => {
    setStatus({
      isLoading: true,
      isSuccess: false,
      isError: false,
      error: null,
      message: null,
    });

    try {
      // NestJS: POST /webhooks/email/notification
      const result = await apiClient.post<{ message: string }>('/webhooks/email/notification', { ...data } as Record<string, unknown>);

      setStatus({
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
        message: result.message || 'Notificación enviada exitosamente',
      });

      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      setStatus({
        isLoading: false,
        isSuccess: false,
        isError: true,
        error: errorMessage,
        message: null,
      });

      return { success: false, error: errorMessage };
    }
  }, []);

  // Función para enviar correo de prueba (solo admins, mantener si hay contexto útil)
  const sendTestEmail = useCallback(async (data: TestEmailData) => {
    setStatus({
      isLoading: true,
      isSuccess: false,
      isError: false,
      error: null,
      message: null,
    });

    try {
      // NestJS: POST /webhooks/email/test (endpoint de testing)
      const result = await apiClient.post<{ message: string }>('/webhooks/email/test', { ...data } as Record<string, unknown>);

      setStatus({
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
        message: result.message || 'Correo de prueba enviado exitosamente',
      });

      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      setStatus({
        isLoading: false,
        isSuccess: false,
        isError: true,
        error: errorMessage,
        message: null,
      });

      return { success: false, error: errorMessage };
    }
  }, []);

  // Función para obtener configuración de correo (solo admins, mantener si hay contexto útil)
  const getEmailConfig = useCallback(async () => {
    try {
      // NestJS: GET /webhooks/email/config
      const result = await apiClient.get<{ status: string }>('/webhooks/email/config?action=status');
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Función para obtener URL de autorización OAuth (solo admins, mantener si hay contexto útil)
  const getAuthUrl = useCallback(async (redirectUri?: string) => {
    try {
      const params = new URLSearchParams();
      if (redirectUri) {
        params.append('redirect_uri', redirectUri);
      }

      // NestJS: GET /webhooks/email/config
      const result = await apiClient.get<{ authUrl: string }>(`/webhooks/email/config?${params.toString()}`);
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Función para intercambiar código por tokens (solo admins, mantener si hay contexto útil)
  const exchangeCodeForTokens = useCallback(async (code: string, redirectUri: string) => {
    try {
      // NestJS: POST /webhooks/email/config
      const result = await apiClient.post<{ tokens: string }>('/webhooks/email/config', { code, redirectUri });
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, error: errorMessage };
    }
  }, []);

  return {
  // Estado (mantener si hay contexto útil)
    ...status,
    
  // Funciones (mantener si hay contexto útil)
    sendContactEmail,
    sendNotification,
    sendTestEmail,
    getEmailConfig,
    getAuthUrl,
    exchangeCodeForTokens,
    resetStatus,
  };
}

export type { ContactEmailData, NotificationEmailData, TestEmailData };

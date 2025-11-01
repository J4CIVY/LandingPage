import { useState, useCallback } from 'react';

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
      const response = await fetch('/api/email/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          category: data.category || 'general',
          priority: data.priority || 'medium',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMsg = result.error || 'Error al enviar el correo';
        setStatus({
          isLoading: false,
          isSuccess: false,
          isError: true,
          error: errorMsg,
          message: null,
        });
        return { success: false, error: errorMsg };
      }

      setStatus({
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
        message: result.message || 'Correo enviado exitosamente',
      });

      return { success: true, data: result.data };
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
      const response = await fetch('/api/email/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al enviar la notificación');
      }

      setStatus({
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
        message: result.message || 'Notificación enviada exitosamente',
      });

      return { success: true, data: result.data };
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
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || 'Error al enviar el correo de prueba';
        setStatus({
          isLoading: false,
          isSuccess: false,
          isError: true,
          error: errorMessage,
          message: null,
        });
        return { success: false, error: errorMessage };
      }

      setStatus({
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
        message: result.message || 'Correo de prueba enviado exitosamente',
      });

      return { success: true, data: result.data };
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
      const response = await fetch('/api/email/config?action=status');
      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Error al obtener configuración' };
      }

      return { success: true, data: result.data };
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

      const response = await fetch(`/api/email/config?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || 'Error al obtener URL de autorización';
        return { success: false, error: errorMessage };
      }

      return { success: true, data: result.data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Función para intercambiar código por tokens (solo admins, mantener si hay contexto útil)
  const exchangeCodeForTokens = useCallback(async (code: string, redirectUri: string) => {
    try {
      const response = await fetch('/api/email/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, redirectUri }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || 'Error al intercambiar código por tokens';
        return { success: false, error: errorMessage };
      }

      return { success: true, data: result.data };
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

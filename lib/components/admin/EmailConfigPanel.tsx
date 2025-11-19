'use client';

import { useState, useEffect } from 'react';
import { useEmail } from '@/hooks/useEmail';

interface EmailConfigData {
  hasClientCredentials: boolean;
  hasTokens: boolean;
  hasAccountId: boolean;
  isFullyConfigured: boolean;
  emailEnabled: boolean;
  fromEmail: string | null;
  adminEmail: string | null;
  supportEmail: string | null;
  accountsStatus: boolean;
  accountsCount: number;
  lastCheck: string;
}

export default function EmailConfigPanel() {
  const [config, setConfig] = useState<EmailConfigData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [testType, setTestType] = useState<'basic' | 'welcome' | 'contact' | 'event'>('basic');
  
  const { 
    getEmailConfig, 
    getAuthUrl, 
    sendTestEmail,
    isLoading: emailLoading,
    isSuccess,
    isError,
    error,
    message,
    resetStatus
  } = useEmail();

  useEffect(() => {
    void loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const result = await getEmailConfig();
      if (result.success && result.data) {
        setConfig(result.data as unknown as EmailConfigData);
      }
    } catch (error) {
      console.error('Error loading email config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAuthUrl = async () => {
    try {
      const result = await getAuthUrl();
      if (result.success && result.data?.authUrl) {
        window.open(result.data.authUrl, '_blank');
      }
    } catch (error) {
      console.error('Error getting auth URL:', error);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) return;
    
    resetStatus();
    try {
      await sendTestEmail({
        testEmail,
        testType
      });
    } catch (error) {
      console.error('Error sending test email:', error);
    }
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estado de configuración */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Estado de configuración de correo</h2>
          <button
            onClick={loadConfig}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>

        {config && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`flex items-center p-3 rounded-lg ${getStatusColor(config.hasClientCredentials)}`}>
              {getStatusIcon(config.hasClientCredentials)}
              <span className="ml-2 text-sm font-medium">
                Credenciales de cliente
              </span>
            </div>

            <div className={`flex items-center p-3 rounded-lg ${getStatusColor(config.hasTokens)}`}>
              {getStatusIcon(config.hasTokens)}
              <span className="ml-2 text-sm font-medium">
                Tokens OAuth
              </span>
            </div>

            <div className={`flex items-center p-3 rounded-lg ${getStatusColor(config.hasAccountId)}`}>
              {getStatusIcon(config.hasAccountId)}
              <span className="ml-2 text-sm font-medium">
                ID de cuenta
              </span>
            </div>

            <div className={`flex items-center p-3 rounded-lg ${getStatusColor(config.accountsStatus)}`}>
              {getStatusIcon(config.accountsStatus)}
              <span className="ml-2 text-sm font-medium">
                Conectividad con Zoho ({config.accountsCount} cuentas)
              </span>
            </div>

            <div className={`flex items-center p-3 rounded-lg ${getStatusColor(config.emailEnabled)}`}>
              {getStatusIcon(config.emailEnabled)}
              <span className="ml-2 text-sm font-medium">
                Sistema de correo habilitado
              </span>
            </div>

            <div className={`flex items-center p-3 rounded-lg ${getStatusColor(config.isFullyConfigured)}`}>
              {getStatusIcon(config.isFullyConfigured)}
              <span className="ml-2 text-sm font-medium">
                Configuración completa
              </span>
            </div>
          </div>
        )}

        {config && !config.isFullyConfigured && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Configuración incompleta
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>El sistema de correo no está completamente configurado. Necesitas:</p>
                  <ul className="mt-1 list-disc list-inside">
                    {!config.hasClientCredentials && <li>Configurar las credenciales de cliente OAuth</li>}
                    {!config.hasTokens && <li>Obtener tokens de acceso OAuth</li>}
                    {!config.hasAccountId && <li>Configurar el ID de cuenta de Zoho</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Configuración OAuth */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración OAuth</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Obtener autorización OAuth
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Haz clic en el botón para abrir la página de autorización de Zoho. 
              Después de autorizar, copia el código de autorización y configúralo en las variables de entorno.
            </p>
            <button
              onClick={handleGetAuthUrl}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Autorizar con Zoho
            </button>
          </div>

          {config && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Información de configuración:</h4>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Email de envío:</dt>
                  <dd className="text-gray-900">{config.fromEmail || 'No configurado'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Email de administrador:</dt>
                  <dd className="text-gray-900">{config.adminEmail || 'No configurado'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Email de soporte:</dt>
                  <dd className="text-gray-900">{config.supportEmail || 'No configurado'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Última verificación:</dt>
                  <dd className="text-gray-900">
                    {new Date(config.lastCheck).toLocaleString('es-ES')}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Prueba de correo */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Enviar correo de prueba</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="testEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Email de destino
            </label>
            <input
              type="email"
              id="testEmail"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label htmlFor="testType" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de prueba
            </label>
            <select
              id="testType"
              value={testType}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e) => setTestType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="basic">Correo básico</option>
              <option value="welcome">Correo de bienvenida</option>
              <option value="contact">Correo de contacto</option>
              <option value="event">Notificación de evento</option>
            </select>
          </div>

          <button
            onClick={handleTestEmail}
            disabled={!testEmail || emailLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {emailLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Enviar prueba
              </>
            )}
          </button>
        </div>

        {/* Mensajes de estado */}
        {isError && error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isSuccess && message && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Éxito</h3>
                <p className="mt-1 text-sm text-green-700">{message}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

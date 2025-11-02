'use client';

import React, { useState, useEffect } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface EmailConfig {
  isConfigured: boolean;
  lastSync: string | null;
  accountEmail: string | null;
  hasValidTokens: boolean;
  refreshTokenValid: boolean;
  needsReauthorization: boolean;
  lastTokenCheck?: string;
  errorMessage?: string;
}

interface TestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

const EmailConfigPage: React.FC = () => {
  const { user, isLoading: authLoading } = useRequireAuth();
  const router = useRouter();
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && user && user.role === 'admin') {
      void fetchConfig();
      
      // Verificar si venimos de una autorización exitosa
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('auth_success') === 'true') {
        const storedCode = localStorage.getItem('zoho_auth_code');
        const timestamp = localStorage.getItem('zoho_auth_timestamp');
        
        if (storedCode && timestamp) {
          // Verificar que el código no sea muy antiguo (10 minutos)
          const codeAge = Date.now() - parseInt(timestamp);
          if (codeAge < 10 * 60 * 1000) {
            setAuthCode(storedCode);
            setAuthSuccess(true);
            
            // Limpiar el código del localStorage
            localStorage.removeItem('zoho_auth_code');
            localStorage.removeItem('zoho_auth_timestamp');
            
            // Limpiar la URL
            window.history.replaceState({}, document.title, '/admin/email-config');
          } else {
            // Código expirado
            localStorage.removeItem('zoho_auth_code');
            localStorage.removeItem('zoho_auth_timestamp');
          }
        }
      }
    } else if (!authLoading && user && user.role !== 'admin') {
      router.push('/admin');
    }
  }, [user, authLoading, router]);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/email/config?action=status');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      } else {
        setConfig({
          isConfigured: false,
          lastSync: null,
          accountEmail: null,
          hasValidTokens: false,
          refreshTokenValid: false,
          needsReauthorization: true,
          errorMessage: 'Error al cargar configuración'
        });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      setConfig({
        isConfigured: false,
        lastSync: null,
        accountEmail: null,
        hasValidTokens: false,
        refreshTokenValid: false,
        needsReauthorization: true,
        errorMessage: 'Error de conexión'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAuthUrl = () => {
    const clientId = process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID;
    
    if (!clientId) {
      alert('Error: NEXT_PUBLIC_ZOHO_CLIENT_ID no está configurado. Por favor revisa tu archivo .env.local');
      return;
    }
    
    const redirectUri = encodeURIComponent(`${window.location.origin}/oauth/zoho/callback`);
    const scope = encodeURIComponent('ZohoMail.messages.CREATE,ZohoMail.accounts.READ,ZohoMail.folders.READ');
    
    const authUrl = `https://accounts.zoho.com/oauth/v2/auth?scope=${scope}&client_id=${clientId}&response_type=code&access_type=offline&redirect_uri=${redirectUri}`;
    
    // Usar la misma ventana en lugar de popup
    window.location.href = authUrl;
  };

  const testConnection = async () => {
    if (!testEmail.trim()) {
      setTestResult({
        success: false,
        message: 'Por favor ingresa un email de prueba'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testEmail: testEmail.trim(),
          testType: 'basic'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult({
          success: true,
          message: 'Correo de prueba enviado exitosamente',
          details: data
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Error al enviar correo de prueba',
          details: data
        });
      }
    } catch (error) {
      console.error('Error testing email:', error);
      setTestResult({
        success: false,
        message: 'Error de conexión al probar el sistema'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copiado al portapapeles');
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const generateCurlCommand = () => {
    const clientId = process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID || 'TU_CLIENT_ID';
    const redirectUri = `${window.location.origin}/oauth/zoho/callback`;
    
    return `curl -X POST "https://accounts.zoho.com/oauth/v2/token" \\
  -d "code=${authCode}" \\
  -d "grant_type=authorization_code" \\
  -d "client_id=${clientId}" \\
  -d "client_secret=TU_CLIENT_SECRET" \\
  -d "redirect_uri=${redirectUri}" \\
  -d "scope=ZohoMail.messages.CREATE,ZohoMail.accounts.READ,ZohoMail.folders.READ"`;
  };

  const refreshConfig = () => {
    void fetchConfig();
    setTestResult(null);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-950 dark:text-white">
            Configuración del Sistema de Email
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gestiona la configuración de Zoho Mail API y prueba la conectividad
          </p>
        </div>

        {/* Estado de Configuración */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
              Estado de la Configuración
            </h2>
            <button
              onClick={refreshConfig}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              🔄 Actualizar
            </button>
          </div>

          {config && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${config.isConfigured ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-slate-950 dark:text-white">
                  Sistema: {config.isConfigured ? 'Configurado' : 'No configurado'}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${config.hasValidTokens ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-slate-950 dark:text-white">
                  Tokens OAuth: {config.hasValidTokens ? 'Válidos' : 'Inválidos o expirados'}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${config.refreshTokenValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-slate-950 dark:text-white">
                  Refresh Token: {config.refreshTokenValid ? 'Válido' : 'Expirado - Requiere renovación'}
                </span>
              </div>

              {config.needsReauthorization && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-yellow-500 shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-white m-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                        Reautorización Requerida
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        El refresh token ha expirado. Es necesario reautorizar la aplicación para continuar enviando emails.
                      </p>
                      <button
                        onClick={generateAuthUrl}
                        disabled={isLoading}
                        className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 text-sm"
                      >
                        Reautorizar Ahora
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {config.accountEmail && (
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-slate-950 dark:text-white">
                    Cuenta: {config.accountEmail}
                  </span>
                </div>
              )}

              {config.lastSync && (
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span className="text-slate-950 dark:text-white">
                    Última sincronización: {new Date(config.lastSync).toLocaleString('es-ES')}
                  </span>
                </div>
              )}

              {config.errorMessage && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 font-medium">Error:</p>
                  <p className="text-red-700 dark:text-red-300 text-sm">{config.errorMessage}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Verificación de Variables de Entorno */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white mb-4">
            Verificación de Variables de Entorno
          </h2>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-slate-950 dark:text-white text-sm">
                NEXT_PUBLIC_ZOHO_CLIENT_ID: {
                  process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID ? 'Configurado' : 'Falta configurar'
                }
              </span>
            </div>

            {!process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <h4 className="text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                  ⚠️ Variables de entorno faltantes
                </h4>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-3">
                  Para usar el sistema de autorización OAuth, necesitas configurar las siguientes variables en tu archivo <code>.env.local</code>:
                </p>
                <div className="bg-gray-900 rounded p-3 text-green-400 text-xs font-mono">
                  <div>ZOHO_CLIENT_ID=tu_client_id</div>
                  <div>ZOHO_CLIENT_SECRET=tu_client_secret</div>
                  <div>NEXT_PUBLIC_ZOHO_CLIENT_ID=tu_client_id</div>
                </div>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-3">
                  Después de configurar las variables, reinicia la aplicación.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Código de Autorización (si está disponible) */}
        {authSuccess && authCode && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">✅</span>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                  ¡Autorización Exitosa!
                </h3>
              </div>
              <p className="text-green-700 dark:text-green-300">
                Se ha obtenido el código de autorización correctamente.
              </p>
            </div>

            <h2 className="text-xl font-semibold text-slate-950 dark:text-white mb-4">
              Código de Autorización Obtenido
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código de autorización:
                </label>
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <code className="text-sm text-gray-700 dark:text-gray-300 break-all">
                      {authCode}
                    </code>
                    <button
                      onClick={() => copyToClipboard(authCode)}
                      className="ml-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                    >
                      📋 Copiar
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comando cURL para obtener tokens:
                </label>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-sm">
                    {generateCurlCommand()}
                  </pre>
                </div>
                <button
                  onClick={() => copyToClipboard(generateCurlCommand())}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  📋 Copiar Comando cURL
                </button>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  <strong>Importante:</strong> Reemplaza <code>TU_CLIENT_SECRET</code> con tu client secret real antes de ejecutar el comando.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Configuración OAuth */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white mb-4">
            Configuración OAuth 2.0
          </h2>

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h3 className="text-blue-800 dark:text-blue-200 font-medium mb-2">
                Pasos para configurar OAuth:
              </h3>
              <ol className="text-blue-700 dark:text-blue-300 text-sm space-y-1 list-decimal list-inside">
                <li>Haz clic en "Autorizar con Zoho" para ir a la página de autorización</li>
                <li>Autoriza la aplicación en Zoho Mail</li>
                <li>Serás redirigido de vuelta con el código de autorización</li>
                <li>Usa el código para obtener los tokens (ver documentación)</li>
                <li>Actualiza las variables de entorno con los tokens obtenidos</li>
              </ol>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={generateAuthUrl}
                disabled={!process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID}
                className={`px-6 py-2 rounded-lg transition ${
                  process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                🔐 Autorizar con Zoho
              </button>
              
              <a
                href="/admin/email-config/callback"
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                🔗 Ver página de callback
              </a>
            </div>

            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
              <h4 className="font-medium text-slate-950 dark:text-white mb-2">
                URL de callback configurada:
              </h4>
              <code className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 px-2 py-1 rounded">
                {typeof window !== 'undefined' ? `${window.location.origin}/oauth/zoho/callback` : 'https://tu-dominio.com/oauth/zoho/callback'}
              </code>
            </div>
          </div>
        </div>

        {/* Prueba de Conectividad */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white mb-4">
            Prueba de Conectividad
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="testEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email de prueba:
              </label>
              <input
                type="email"
                id="testEmail"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@ejemplo.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-slate-950 dark:text-white"
              />
            </div>

            <button
              onClick={testConnection}
              disabled={isTesting || !config?.hasValidTokens}
              className={`px-6 py-2 rounded-lg transition ${
                isTesting || !config?.hasValidTokens
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isTesting ? '📤 Enviando...' : '📧 Enviar Correo de Prueba'}
            </button>

            {!config?.hasValidTokens && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                ⚠️ Necesitas configurar tokens válidos antes de poder enviar correos de prueba
              </p>
            )}

            {testResult && (
              <div className={`rounded-lg p-4 ${
                testResult.success 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'
              }`}>
                <p className={`font-medium ${
                  testResult.success 
                    ? 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {testResult.success ? '✅ Éxito' : '❌ Error'}
                </p>
                <p className={`text-sm mt-1 ${
                  testResult.success 
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}>
                  {testResult.message}
                </p>
                {testResult.details && (
                  <details className="mt-2">
                    <summary className={`text-sm cursor-pointer ${
                      testResult.success 
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      Ver detalles
                    </summary>
                    <pre className={`text-xs mt-2 p-2 rounded ${
                      testResult.success 
                        ? 'bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-200'
                    }`}>
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Enlaces útiles */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white mb-4">
            Enlaces Útiles
          </h2>
          <div className="space-y-2">
            <a
              href="https://accounts.zoho.com/developerconsole"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 dark:text-blue-400 hover:underline"
            >
              🔗 Zoho Developer Console
            </a>
            <a
              href="/docs/EMAIL_SYSTEM.md"
              target="_blank"
              className="block text-blue-600 dark:text-blue-400 hover:underline"
            >
              📖 Documentación del Sistema de Email
            </a>
            <a
              href="/admin/notifications"
              className="block text-blue-600 dark:text-blue-400 hover:underline"
            >
              📬 Panel de Notificaciones
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfigPage;

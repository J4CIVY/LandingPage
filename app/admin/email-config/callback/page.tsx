'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const CallbackContent: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/admin');
      return;
    }

    // Obtener el código de autorización de la URL
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (errorParam) {
      setError(`Error de autorización: ${errorParam} - ${errorDescription || 'Error desconocido'}`);
    } else if (code) {
      setAuthCode(code);
    } else {
      setError('No se recibió código de autorización válido');
    }
  }, [user, authLoading, router, searchParams]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const generateCurlCommand = () => {
    const clientId = process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID || 'TU_CLIENT_ID';
    const redirectUri = `${window.location.origin}/admin/email-config/callback`;
    
    return `curl -X POST "https://accounts.zoho.com/oauth/v2/token" \\
  -d "code=${authCode}" \\
  -d "grant_type=authorization_code" \\
  -d "client_id=${clientId}" \\
  -d "client_secret=TU_CLIENT_SECRET" \\
  -d "redirect_uri=${redirectUri}" \\
  -d "scope=ZohoMail.messages.CREATE,ZohoMail.accounts.READ,ZohoMail.folders.READ"`;
  };

  if (authLoading) {
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
            OAuth Callback - Configuración de Email
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Resultado de la autorización con Zoho Mail
          </p>
        </div>

        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <span className="text-2xl">❌</span>
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
                  Error de Autorización
                </h2>
              </div>
            </div>
            <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/admin/email-config')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Volver a Configuración
              </button>
              <button
                onClick={() => window.close()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        ) : authCode ? (
          <div className="space-y-6">
            {/* Éxito */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-3">
                  <h2 className="text-lg font-semibold text-green-800 dark:text-green-200">
                    Autorización Exitosa
                  </h2>
                </div>
              </div>
              <p className="text-green-700 dark:text-green-300">
                Se ha obtenido el código de autorización correctamente. Ahora necesitas intercambiarlo por tokens de acceso.
              </p>
            </div>

            {/* Código de autorización */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-slate-950 dark:text-white mb-4">
                Código de Autorización
              </h3>
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <code className="text-sm text-gray-700 dark:text-gray-300 break-all">
                    {authCode}
                  </code>
                  <button
                    onClick={() => copyToClipboard(authCode)}
                    className="ml-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                  >
                    {copied ? '✓' : '📋'}
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Este código expira en unos minutos. Úsalo inmediatamente para obtener los tokens.
              </p>
            </div>

            {/* Comando cURL */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-slate-950 dark:text-white mb-4">
                Comando cURL para Obtener Tokens
              </h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
                  {generateCurlCommand()}
                </pre>
              </div>
              <button
                onClick={() => copyToClipboard(generateCurlCommand())}
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                📋 Copiar Comando
              </button>
              <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  <strong>Importante:</strong> Reemplaza <code>TU_CLIENT_SECRET</code> con tu client secret real antes de ejecutar el comando.
                </p>
              </div>
            </div>

            {/* Pasos siguientes */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-slate-950 dark:text-white mb-4">
                Pasos Siguientes
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li>Copia y ejecuta el comando cURL en tu terminal</li>
                <li>Extrae los valores <code>access_token</code>, <code>refresh_token</code> y <code>expires_in</code> de la respuesta</li>
                <li>Actualiza tu archivo <code>.env.local</code> con estos valores:</li>
              </ol>
              
              <div className="mt-4 bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                <pre className="text-sm text-gray-700 dark:text-gray-300">
{`ZOHO_ACCESS_TOKEN=1000.xxxxxxxxxxxxxxxxxxxxx
ZOHO_REFRESH_TOKEN=1000.xxxxxxxxxxxxxxxxxxxxx`}
                </pre>
              </div>
              
              <ol start={4} className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 mt-4">
                <li>Reinicia tu aplicación</li>
                <li>Vuelve a la página de configuración para probar la conectividad</li>
              </ol>
            </div>

            {/* Obtener Account ID */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-slate-950 dark:text-white mb-4">
                Obtener Account ID (Opcional)
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Si necesitas el Account ID, ejecuta este comando después de obtener el access token:
              </p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
{`curl "https://mail.zoho.com/api/accounts" \\
  -H "Authorization: Zoho-oauthtoken TU_ACCESS_TOKEN"`}
                </pre>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/admin/email-config')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Volver a Configuración
              </button>
              <button
                onClick={() => window.close()}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Cerrar Ventana
              </button>
              <a
                href="https://www.zoho.com/mail/help/api/get-account-details.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                📖 Documentación Zoho
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Procesando autorización...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CallbackPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
};

export default CallbackPage;

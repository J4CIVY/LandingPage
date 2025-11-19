'use client';

import { useEffect, useState, Suspense, type FC } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const PublicCallbackContent: FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Obtener el código de autorización de la URL
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (errorParam) {
      setStatus('error');
      setMessage(`Error de autorización: ${errorParam} - ${errorDescription || 'Error desconocido'}`);
    } else if (code) {
      // SECURITY FIX: Send code to server-side endpoint instead of localStorage
      // Never store sensitive authorization codes in localStorage
      (async () => {
        try {
          const apiClient = (await import('@/lib/api-client')).default;
          const result = await apiClient.post('/oauth/zoho/callback', { code }) as { success?: boolean; message?: string };
          
          if (result.success) {
            setStatus('success');
            setMessage('Autorización exitosa. Redirigiendo al panel de administración...');
            
            // Redirigir al panel de admin después de 2 segundos
            setTimeout(() => {
              router.push('/admin/email-config?auth_success=true');
            }, 2000);
          } else {
            setStatus('error');
            setMessage(result.message || 'Error al procesar autorización');
          }
        } catch (error) {
          console.error('Error processing OAuth callback:', error);
          setStatus('error');
          setMessage('Error al procesar la autorización. Por favor intenta nuevamente.');
        }
      })();
    } else {
      setStatus('error');
      setMessage('No se recibió código de autorización válido');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="max-w-md mx-auto p-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
          {status === 'processing' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white mb-2">
                Procesando autorización...
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Por favor espera mientras procesamos la respuesta de Zoho.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                ¡Autorización Exitosa!
              </h2>
              <p className="text-green-700 dark:text-green-300 mb-4">
                {message}
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
                Error de Autorización
              </h2>
              <p className="text-red-700 dark:text-red-300 mb-4">
                {message}
              </p>
              <button
                onClick={() => router.push('/admin/email-config')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Volver a Intentar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const PublicCallbackPage: FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    }>
      <PublicCallbackContent />
    </Suspense>
  );
};

export default PublicCallbackPage;

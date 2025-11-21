'use client';

import { useEffect, useState, Suspense, type FC } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaEnvelope } from 'react-icons/fa';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface VerificationResult {
  success: boolean;
  message: string;
}

const VerifyEmailContent: FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmail } = useAuth();
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');
    
    if (emailParam) {
      setEmail(emailParam);
    }
    
    if (!token) {
      // Si no hay token, mostrar página de espera
      setVerificationResult(null);
      setIsLoading(false);
      return;
    }

    // Verificar el token
    const verifyEmailToken = async () => {
      try {
        const result = await verifyEmail(token);
        
        setVerificationResult({
          success: result.success,
          message: result.message
        });
        
        // Si la verificación fue exitosa, redirigir al login
        if (result.success) {
          setTimeout(() => {
            router.push('/login?verified=true');
          }, 3000);
        }
      } catch (error) {
        console.error('Error verificando email:', error);
        setVerificationResult({
          success: false,
          message: 'Error de conexión. Intenta nuevamente más tarde.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    void verifyEmailToken();
  }, [searchParams, verifyEmail, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <FaSpinner className="text-6xl text-blue-600 dark:text-blue-400 mx-auto animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Verificando correo electrónico...
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Por favor espera mientras verificamos tu correo electrónico.
          </p>
        </div>
      </div>
    );
  }

  // Si no hay token, mostrar página de espera
  if (!verificationResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <FaEnvelope className="text-6xl text-blue-600 dark:text-blue-400 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Verifica tu correo electrónico
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {email ? (
              <>
                Hemos enviado un correo de verificación a <strong>{email}</strong>. 
                Por favor revisa tu bandeja de entrada y haz clic en el enlace de verificación.
              </>
            ) : (
              'Hemos enviado un correo de verificación. Por favor revisa tu bandeja de entrada y haz clic en el enlace de verificación.'
            )}
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>¿No recibiste el correo?</strong><br />
              Revisa tu carpeta de spam o correo no deseado.
            </p>
          </div>
          <Link
            href="/login"
            className="block w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Ir al Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          {verificationResult?.success ? (
            <FaCheckCircle className="text-6xl text-green-600 dark:text-green-400 mx-auto" />
          ) : (
            <FaTimesCircle className="text-6xl text-red-600 dark:text-red-400 mx-auto" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {verificationResult?.success ? '¡Email Verificado!' : 'Error de Verificación'}
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {verificationResult?.message}
        </p>

        {verificationResult?.success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <p className="text-green-800 dark:text-green-300 text-sm">
              <strong>¡Bienvenido!</strong><br/>
              Tu cuenta ha sido activada exitosamente. Serás redirigido al login en unos segundos.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {verificationResult?.success ? (
            <>
              <Link
                href="/login"
                className="block w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Iniciar Sesión Ahora
              </Link>
              <Link
                href="/"
                className="block w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Ir al Inicio
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="block w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Registrarse Nuevamente
              </Link>
              <Link
                href="/"
                className="block w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Ir al Inicio
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente principal que envuelve con Suspense
const VerifyEmailPage: FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <FaSpinner className="text-6xl text-blue-600 dark:text-blue-400 mx-auto animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Cargando...
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Preparando la verificación de email.
          </p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
};

export default VerifyEmailPage;

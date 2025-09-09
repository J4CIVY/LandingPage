'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaEnvelope } from 'react-icons/fa';
import Link from 'next/link';

interface VerificationResult {
  success: boolean;
  message: string;
  data?: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

const VerifyEmailContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setVerificationResult({
        success: false,
        message: 'Token de verificación no encontrado en la URL.'
      });
      setIsLoading(false);
      return;
    }

    // Verificar el token
    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();
        setVerificationResult(result);
        
        // Si la verificación fue exitosa, redirigir a la página de bienvenida
        if (result.success && result.data) {
          setTimeout(() => {
            const params = new URLSearchParams({
              email: result.data.email,
              firstName: result.data.firstName,
              lastName: result.data.lastName
            });
            router.push(`/welcome?${params.toString()}`);
          }, 2000); // Esperar 2 segundos para que el usuario vea el mensaje
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

    verifyEmail();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <FaSpinner className="text-6xl text-blue-600 dark:text-blue-400 mx-auto animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">
            Verificando correo electrónico...
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            Por favor espera mientras verificamos tu correo electrónico.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          {verificationResult?.success ? (
            <FaCheckCircle className="text-6xl text-green-600 dark:text-green-400 mx-auto" />
          ) : (
            <FaTimesCircle className="text-6xl text-red-600 dark:text-red-400 mx-auto" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">
          {verificationResult?.success ? '¡Email Verificado!' : 'Error de Verificación'}
        </h1>

        <p className="text-gray-600 dark:text-slate-400 mb-6">
          {verificationResult?.message}
        </p>

        {verificationResult?.success && verificationResult.data && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <p className="text-green-800 dark:text-green-300 text-sm">
              <strong>Bienvenido, {verificationResult.data.firstName} {verificationResult.data.lastName}!</strong><br/>
              Tu cuenta ha sido activada exitosamente.
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
                Iniciar Sesión
              </Link>
              <Link
                href="/"
                className="block w-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-slate-100 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Ir al Inicio
              </Link>
            </>
          ) : (
            <>
              <ResendVerificationSection />
              <Link
                href="/"
                className="block w-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-slate-100 font-medium py-3 px-4 rounded-lg transition-colors"
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

const ResendVerificationSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setResendMessage('Por favor ingresa tu email.');
      return;
    }

    setIsResending(true);
    setResendMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      setResendMessage(result.message);
    } catch (error) {
      console.error('Error reenviando verificación:', error);
      setResendMessage('Error de conexión. Intenta nuevamente más tarde.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
      <div className="mb-4">
        <FaEnvelope className="text-2xl text-gray-400 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
          ¿Necesitas un nuevo email de verificación?
        </h3>
      </div>
      
      <form onSubmit={handleResend} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu correo electrónico"
          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
          disabled={isResending}
        />
        
        <button
          type="submit"
          disabled={isResending}
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isResending ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Enviando...
            </>
          ) : (
            'Reenviar Email de Verificación'
          )}
        </button>
      </form>
      
      {resendMessage && (
        <p className="mt-3 text-sm text-center text-gray-600 dark:text-slate-400">
          {resendMessage}
        </p>
      )}
    </div>
  );
};

// Componente principal que envuelve con Suspense
const VerifyEmailPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <FaSpinner className="text-6xl text-blue-600 dark:text-blue-400 mx-auto animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">
            Cargando...
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
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

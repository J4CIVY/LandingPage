'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEnvelope, FaArrowRight, FaSpinner, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';
import Link from 'next/link';

interface Step1EmailProps {
  onEmailVerified: (email: string) => void;
  returnUrl: string;
}

export default function Step1Email({ onEmailVerified, returnUrl }: Step1EmailProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validación básica
      if (!email || !email.includes('@')) {
        setError('Por favor ingresa un correo electrónico válido');
        setIsLoading(false);
        return;
      }

      // Verificar si el email existe
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const result = await response.json();

      if (result.success) {
        // Email existe y está verificado, pasar al siguiente paso
        onEmailVerified(email.trim().toLowerCase());
      } else {
        // Manejar diferentes códigos de error
        if (result.code === 'USER_NOT_FOUND') {
          setError('No se encontró una cuenta con este correo. ¿Quieres registrarte?');
        } else if (result.code === 'EMAIL_NOT_VERIFIED') {
          setError('Debes verificar tu correo antes de iniciar sesión.');
        } else {
          setError(result.message || 'Error al verificar el email');
        }
      }
    } catch (error) {
      console.error('Error verificando email:', error);
      setError('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md w-full">
        {/* Card Principal */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-6 py-8 sm:px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white dark:bg-slate-700 rounded-full mb-4 shadow-lg">
                <FaEnvelope className="text-blue-600 dark:text-blue-400 text-2xl" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Iniciar Sesión
              </h1>
              <p className="text-blue-100 dark:text-slate-300 text-sm sm:text-base">
                Usa tu cuenta de BSK Motorcycle Team
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Email */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2"
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400 dark:text-slate-500" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      error 
                        ? 'border-red-300 dark:border-red-500' 
                        : 'border-gray-300 dark:border-slate-600'
                    } rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all text-base`}
                    placeholder="tu@email.com"
                    autoComplete="email"
                    autoFocus
                    disabled={isLoading}
                  />
                </div>
                {error && (
                  <div className="mt-2">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    {error.includes('registrarte') && (
                      <Link
                        href="/register"
                        className="inline-flex items-center mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                      >
                        Crear cuenta nueva
                      </Link>
                    )}
                    {error.includes('verificar tu correo') && (
                      <Link
                        href="/verify-email"
                        className="inline-flex items-center mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                      >
                        Ir a verificación de email
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Botón Siguiente */}
              <button
                type="submit"
                disabled={isLoading || !email}
                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white transition-all ${
                  isLoading || !email
                    ? 'bg-gray-400 dark:bg-slate-600 cursor-not-allowed'
                    : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:focus:ring-offset-slate-800 active:scale-[0.98] hover:shadow-lg'
                }`}
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Verificando...
                  </>
                ) : (
                  <>
                    Siguiente
                    <FaArrowRight className="ml-2" />
                  </>
                )}
              </button>

              {/* Indicador de Seguridad */}
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-slate-400">
                <FaShieldAlt className="text-green-600 dark:text-green-400" />
                <span>Conexión segura con encriptación RSA-2048</span>
              </div>
            </form>

            {/* Link a Recuperar Contraseña */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-600 text-center">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                ¿Olvidaste tu correo o contraseña?
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-slate-900 px-6 py-4 sm:px-8">
            <p className="text-center text-sm text-gray-600 dark:text-slate-400">
              ¿Nuevo en BSK Motorcycle Team?{' '}
              <Link
                href="/register"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Crear cuenta
              </Link>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center">
          <p className="text-blue-100 dark:text-slate-400 text-xs sm:text-sm">
            © 2025 BSK Motorcycle Team. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

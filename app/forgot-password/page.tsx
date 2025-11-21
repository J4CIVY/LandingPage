'use client';

import { useState, type FC, type FormEvent } from 'react';
import Link from 'next/link';
import { FaEnvelope, FaSpinner, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';

const ForgotPasswordPage: FC = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validación básica
    if (!email) {
      setError('Por favor ingresa tu correo electrónico');
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Por favor ingresa un correo electrónico válido');
      setIsLoading(false);
      return;
    }

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        setIsSuccess(true);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Error en forgot password:', err);
      setError('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                <FaCheckCircle className="text-4xl text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ¡Correo Enviado!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Hemos enviado un correo a <strong className="text-gray-900 dark:text-white">{email}</strong> con instrucciones para restablecer tu contraseña.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Revisa tu bandeja de entrada</strong><br />
                El correo puede tardar unos minutos en llegar. Si no lo ves, revisa tu carpeta de spam.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/login"
                className="flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                Volver al Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            No te preocupes, te ayudaremos a recuperarla
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                  placeholder="tu@email.com"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Ingresa el correo electrónico asociado a tu cuenta
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                'Enviar Instrucciones'
              )}
            </button>
          </form>

          {/* Links adicionales */}
          <div className="mt-6 text-center space-y-2">
            <Link
              href="/login"
              className="flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Volver al Login
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿No tienes una cuenta?{' '}
              <Link
                href="/register"
                className="font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            <strong>Nota de seguridad:</strong> Por motivos de seguridad, recibirás un correo confirmando la solicitud 
            incluso si la dirección de email no está registrada en nuestro sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

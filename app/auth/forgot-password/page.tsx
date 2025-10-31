'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FaEnvelope, FaSpinner, FaArrowLeft, FaMotorcycle } from 'react-icons/fa';
import { forgotPasswordSchema } from '@/schemas/authSchemas';

type ForgotPasswordFormData = {
  email: string;
};

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    getValues
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange'
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormData> = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
      } else {
        setError(result.message || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-slate-700">
            {/* Encabezado de éxito */}
            <div className="text-center mb-8">
              <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-950 dark:text-white mb-2">
                ¡Correo Enviado!
              </h1>
              <p className="text-gray-600 dark:text-slate-400">
                Hemos enviado las instrucciones para restablecer tu contraseña
              </p>
            </div>

            {/* Mensaje de éxito */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-700 dark:text-green-300 text-center">
                Revisa tu bandeja de entrada y sigue las instrucciones en el correo que enviamos a{' '}
                <span className="font-medium">{getValues('email')}</span>
              </p>
            </div>

            {/* Información adicional */}
            <div className="space-y-4 text-sm text-gray-600 dark:text-slate-400">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  💡 Consejos importantes:
                </h3>
                <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• Revisa también tu carpeta de spam</li>
                  <li>• El enlace expira en 1 hora</li>
                  <li>• Si no recibes el correo, intenta nuevamente</li>
                </ul>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Link
                href="/login"
                className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg"
              >
                <FaArrowLeft className="mr-2 text-sm" />
                Volver al Login
              </Link>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setError('');
                }}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 font-medium rounded-lg"
              >
                Enviar Otro Correo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-slate-700">
          {/* Encabezado */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <FaMotorcycle className="text-white text-xl" />
                </div>
                <div className="text-2xl font-bold text-slate-950 dark:text-white">
                  BSK <span className="text-blue-600">MT</span>
                </div>
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-slate-950 dark:text-white mb-2">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-gray-600 dark:text-slate-400">
              No te preocupes, te enviaremos instrucciones para restablecerla
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400 dark:text-slate-500 text-sm" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.email 
                      ? 'border-red-300 dark:border-red-500' 
                      : 'border-gray-300 dark:border-slate-600'
                  } rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors`}
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Error general */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isLoading || !isValid}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                isLoading || !isValid
                  ? 'bg-gray-400 dark:bg-slate-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2 text-sm" />
                  Enviando...
                </>
              ) : (
                <>
                  <FaEnvelope className="mr-2 text-sm" />
                  Enviar Instrucciones
                </>
              )}
            </button>
          </form>

          {/* Enlaces */}
          <div className="mt-6 text-center space-y-3">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
            >
              <FaArrowLeft className="mr-2 text-xs" />
              Volver al inicio de sesión
            </Link>
            
            <div className="text-sm text-gray-600 dark:text-slate-400">
              ¿No tienes una cuenta?{' '}
              <Link
                href="/register"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium"
              >
                Regístrate aquí
              </Link>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-slate-500">
            © 2025 BSK Motorcycle Team. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

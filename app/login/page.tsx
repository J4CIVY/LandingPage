'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FaEye, FaEyeSlash, FaSpinner, FaEnvelope, FaLock, FaMotorcycle } from 'react-icons/fa';
import { loginSchema } from '@/schemas/authSchemas';
import { useAuth } from '@/hooks/useAuth';

type LoginFormData = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getRedirectUrl, clearRedirectUrl } = useAuth();

  // Obtener la URL de retorno de los parámetros de consulta o del sessionStorage
  const urlParamRedirect = searchParams.get('returnUrl');
  const sessionRedirect = getRedirectUrl();
  const returnUrl = urlParamRedirect || sessionRedirect || '/dashboard';

  // TEMPORALMENTE REMOVIDO - useEffect que causaba redirecciones automáticas

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      // Llamar directamente a la API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          email: data.email, 
          password: data.password, 
          rememberMe: data.rememberMe 
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Login exitoso - limpiar URL guardada y redireccionar
        clearRedirectUrl();
        console.log('Login exitoso! Redirigiendo a:', returnUrl);
        
        // Usar router.push en lugar de window.location.href para mejor UX
        router.push(returnUrl);
        
      } else {
        // Mostrar error específico
        setLoginError(result.message || 'Error al iniciar sesión');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error en login:', error);
      setLoginError('Error de conexión. Por favor intenta nuevamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md w-full space-y-8">
        {/* Formulario de Login */}
        <div className="p-6 sm:p-8">
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

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400 dark:text-slate-500 text-sm" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`block w-full pl-10 pr-12 py-3 border ${
                    errors.password 
                      ? 'border-red-300 dark:border-red-500' 
                      : 'border-gray-300 dark:border-slate-600'
                  } rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors`}
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 text-sm transition-colors" />
                  ) : (
                    <FaEye className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 text-sm transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Recordarme y Olvidé mi contraseña */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center">
                <input
                  {...register('rememberMe')}
                  id="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 dark:text-slate-300">
                  Recordarme
                </label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Error de Login */}
            {loginError && (
              <div className={`border rounded-lg p-4 ${
                loginError.includes('verificar tu correo') 
                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}>
                <p className={`text-sm ${
                  loginError.includes('verificar tu correo')
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {loginError}
                </p>
                {loginError.includes('verificar tu correo') && (
                  <div className="mt-3">
                    <Link
                      href="/verify-email"
                      className="inline-flex items-center text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 underline"
                    >
                      <FaEnvelope className="mr-1" />
                      Ir a verificación de email
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Botón de Submit */}
            <button
              type="submit"
              disabled={isLoading || !isValid}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200 ${
                isLoading || !isValid
                  ? 'bg-gray-400 dark:bg-slate-600 cursor-not-allowed'
                  : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:focus:ring-offset-slate-800 active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  <span className="hidden sm:inline">Iniciando sesión...</span>
                  <span className="sm:hidden">Iniciando...</span>
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Separador */}
          <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200 dark:border-slate-600">
            <p className="text-center text-sm text-gray-600 dark:text-slate-400">
              ¿No tienes una cuenta?{' '}
              <Link
                href="/register"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-blue-100 dark:text-slate-400 text-xs sm:text-sm">
            © 2025 BSK Motorcycle Team. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 flex items-center justify-center">
        <FaSpinner className="animate-spin text-white text-4xl" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

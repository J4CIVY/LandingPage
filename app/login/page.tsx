'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSpinner, FaLock, FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

function LoginFlow() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  // Obtener la URL de retorno
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';

  const cloudName = "dz0peilmu";
  
  // Logo blanco para modo oscuro
  const logoWhiteUrl = {
    avif: `https://res.cloudinary.com/${cloudName}/image/upload/f_avif,q_auto,w_192/BSK_MT_Logo_Letras_White_192_x_192_px_nptwwj`,
    webp: `https://res.cloudinary.com/${cloudName}/image/upload/f_webp,q_auto,w_192/BSK_MT_Logo_Letras_White_192_x_192_px_nptwwj`,
    png: `https://res.cloudinary.com/${cloudName}/image/upload/f_png,q_auto,w_192/BSK_MT_Logo_Letras_White_192_x_192_px_nptwwj`
  };

  // Logo azul para modo claro
  const logoBlueUrl = {
    avif: `https://res.cloudinary.com/${cloudName}/image/upload/f_avif,q_auto,w_192/BSK_MT_Logo_Letras_Blue_192_x_192_px_tj3msl`,
    webp: `https://res.cloudinary.com/${cloudName}/image/upload/f_webp,q_auto,w_192/BSK_MT_Logo_Letras_Blue_192_x_192_px_tj3msl`,
    png: `https://res.cloudinary.com/${cloudName}/image/upload/f_png,q_auto,w_192/BSK_MT_Logo_Letras_Blue_192_x_192_px_tj3msl`
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      router.push(returnUrl);
    } catch (err) {
      console.error('Error en login:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-600 to-indigo-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md w-full">
        {/* Card Principal */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 px-6 py-8 sm:px-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center mb-4">
                {/* Logo para modo claro (azul) */}
                <picture className="block dark:hidden">
                  <source srcSet={logoBlueUrl.avif} type="image/avif" />
                  <source srcSet={logoBlueUrl.webp} type="image/webp" />
                  <Image
                    src={logoBlueUrl.png}
                    alt="Logo BSK Motorcycle Team"
                    className="w-16 h-16 object-contain"
                    width={64}
                    height={64}
                    priority
                  />
                </picture>
                
                {/* Logo para modo oscuro (blanco) */}
                <picture className="hidden dark:block">
                  <source srcSet={logoWhiteUrl.avif} type="image/avif" />
                  <source srcSet={logoWhiteUrl.webp} type="image/webp" />
                  <Image
                    src={logoWhiteUrl.png}
                    alt="Logo BSK Motorcycle Team"
                    className="w-16 h-16 object-contain"
                    width={64}
                    height={64}
                    priority
                  />
                </picture>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Iniciar Sesión
              </h1>
              <p className="text-blue-100 dark:text-blue-200 text-sm">
                Accede a tu cuenta de BSK MT
              </p>
            </div>
          </div>

          {/* Formulario */}
          <div className="px-6 py-8 sm:px-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            {/* Links */}
            <div className="mt-6 space-y-3">
              <div className="text-center">
                <a
                  href="/reset-password"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                ¿No tienes cuenta?{' '}
                <a
                  href="/register"
                  className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Regístrate aquí
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-linear-to-br from-blue-600 to-indigo-900 flex items-center justify-center">
        <FaSpinner className="animate-spin text-white text-4xl" />
      </div>
    }>
      <LoginFlow />
    </Suspense>
  );
}

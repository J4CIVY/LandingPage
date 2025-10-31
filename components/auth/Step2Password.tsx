'use client';

import { useState, useEffect } from 'react';
import { FaLock, FaEye, FaEyeSlash, FaArrowRight, FaArrowLeft, FaSpinner, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import InactivityWarning from './InactivityWarning';
import Image from 'next/image';

interface Step2PasswordProps {
  email: string;
  onPasswordVerified: (preAuthToken: string) => void;
  onBack: () => void;
}

export default function Step2Password({ email, onPasswordVerified, onBack }: Step2PasswordProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);

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

  // Timer de inactividad: 90 segundos, advertencia a los 15 segundos restantes
  const { timeRemaining, showWarning, resetTimer, pauseTimer } = useInactivityTimer({
    timeout: 90000, // 90 segundos
    warningTime: 15000, // Advertencia a los 15 segundos
    onTimeout: () => {
      setShowInactivityWarning(true);
    }
  });

  // Resetear timer cuando el usuario escribe
  useEffect(() => {
    if (password.length > 0) {
      resetTimer();
    }
  }, [password, resetTimer]);

  // Pausar timer cuando está cargando
  useEffect(() => {
    if (isLoading) {
      pauseTimer();
    }
  }, [isLoading, pauseTimer]);

  // Manejar reintentar desde advertencia
  const handleRetryFromWarning = () => {
    setShowInactivityWarning(false);
    setPassword('');
    setError(null);
    resetTimer();
  };

  // Si está mostrando advertencia de inactividad
  if (showInactivityWarning) {
    return (
      <InactivityWarning
        email={email}
        step="password"
        timeRemaining={30000} // 30 segundos para decidir
        onRetry={handleRetryFromWarning}
        onCancel={onBack}
        retryText="Ingresar contraseña nuevamente"
        cancelText="Volver al inicio"
        alternativeOptions={
          <div className="text-center">
            <a
              href="/reset-password"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-block"
            >
              ¿Olvidaste tu contraseña? Recuperarla aquí
            </a>
          </div>
        }
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Verificar soporte de encriptación
      if (!window.crypto || !window.crypto.subtle) {
        setError('Tu navegador no soporta encriptación. Por favor actualiza tu navegador.');
        setIsLoading(false);
        return;
      }

      // Obtener la llave pública
      const publicKeyResponse = await fetch('/api/auth/public-key');
      const { publicKey } = await publicKeyResponse.json();

      // Importar la llave pública
      const pemContents = publicKey
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replace(/\s/g, '');
      
      const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
      
      const cryptoKey = await window.crypto.subtle.importKey(
        'spki',
        binaryKey,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['encrypt']
      );

      // Encriptar la contraseña
      const encoder = new TextEncoder();
      const encodedPassword = encoder.encode(password);
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { 
          name: 'RSA-OAEP'
        },
        cryptoKey,
        encodedPassword
      );

      // Convertir a base64
      const encryptedArray = new Uint8Array(encryptedBuffer);
      const encryptedPassword = btoa(String.fromCharCode(...encryptedArray));

      // Validar credenciales encriptadas
      const validateResponse = await fetch('/api/auth/validate-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          encryptedPassword
        })
      });

      const validateResult = await validateResponse.json();

      if (!validateResult.success) {
        setError(validateResult.message || 'Contraseña incorrecta');
        setIsLoading(false);
        return;
      }

      // Contraseña correcta, pasar al siguiente paso
      onPasswordVerified(validateResult.data.preAuthToken);

    } catch (error) {
      console.error('Error validando contraseña:', error);
      setError('Error de conexión. Por favor intenta nuevamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-md w-full">
        {/* Card Principal */}
        <div className="bg-gray-100 dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gray-200 dark:bg-slate-800 px-6 py-8 sm:px-8">
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
                Bienvenido
              </h1>
              <div className="flex items-center justify-center space-x-2 text-blue-100 dark:text-slate-300">
                <FaCheckCircle className="text-green-300 dark:text-green-400" />
                <p className="text-sm sm:text-base truncate max-w-[250px]">{email}</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8">
            {/* Advertencia de tiempo restante */}
            {showWarning && (
              <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 animate-pulse">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 text-sm">
                  <FaCheckCircle className="text-lg shrink-0" />
                  <span>
                    Ingresa tu contraseña pronto. Tiempo restante: {Math.ceil(timeRemaining / 1000)}s
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Contraseña */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400 dark:text-slate-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full pl-10 pr-12 py-3 border ${
                      error 
                        ? 'border-red-300 dark:border-red-500' 
                        : 'border-gray-300 dark:border-slate-600'
                    } rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all text-base`}
                    placeholder="Ingresa tu contraseña"
                    autoComplete="current-password"
                    autoFocus
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300" />
                    ) : (
                      <FaEye className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300" />
                    )}
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onBack}
                  disabled={isLoading}
                  className="flex-1 flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm text-base font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:focus:ring-offset-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaArrowLeft className="mr-2" />
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !password}
                  className={`flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white transition-all ${
                    isLoading || !password
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
              </div>

              {/* Indicador de Seguridad */}
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-slate-400">
                <FaShieldAlt className="text-green-600 dark:text-green-400" />
                <span>Tu contraseña se encripta antes de enviarse</span>
              </div>
            </form>

            {/* Link a Recuperar Contraseña */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-600 text-center">
              <a
                href="/auth/forgot-password"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          {/* Footer - Cambiar cuenta */}
          <div className="bg-gray-200 dark:bg-slate-800 px-6 py-4 sm:px-8">
            <button
              onClick={onBack}
              className="w-full text-center text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 font-medium"
            >
              ¿No eres tú? Cambia de cuenta
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-slate-500 text-xs sm:text-sm">
            © 2025 BSK Motorcycle Team. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

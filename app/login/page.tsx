'use client';

import { useState, type FC, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner, FaMotorcycle, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { deviceService } from '@/lib/services/device.service';

const LoginPage: FC = () => {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  // Credenciales básicas
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Flujo 2FA
  const [showTwoFactorInput, setShowTwoFactorInput] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [riskScore, setRiskScore] = useState<number | undefined>();
  
  // Flujo dispositivo confiable
  const [showDeviceTrustPrompt, setShowDeviceTrustPrompt] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);
  
  // Bloqueo de cuenta
  const [isBlocked, setIsBlocked] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);
  
  // Estados generales
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    // Validaciones básicas
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (!email.includes('@')) {
      setError('Por favor ingresa un email válido');
      return;
    }

    // Si se pidió 2FA y no hay código
    if (showTwoFactorInput && !twoFactorCode) {
      setError('Por favor ingresa el código de autenticación');
      return;
    }

    try {
      // Intentar login (puede ser primera vez o con 2FA)
      const result = await login(email, password, rememberMe, twoFactorCode);

      // CASO 1: CUENTA BLOQUEADA
      if (result.blocked) {
        setIsBlocked(true);
        setAlerts(result.alerts || ['Tu cuenta ha sido bloqueada temporalmente por seguridad']);
        setError('Cuenta bloqueada por actividad sospechosa. Revisa tu email para más información.');
        return;
      }

      // CASO 2: REQUIERE CÓDIGO 2FA
      if (result.requires2FA) {
        setShowTwoFactorInput(true);
        setRiskScore(result.riskScore);
        setInfoMessage('Se requiere código de autenticación de dos factores');
        
        if (result.riskScore && result.riskScore >= 60) {
          setInfoMessage('Hemos detectado actividad inusual. Por favor ingresa tu código 2FA para verificar tu identidad.');
        }
        return;
      }

      // CASO 3: REQUIERE CONFIAR EN DISPOSITIVO
      if (result.requiresDeviceTrust) {
        setShowDeviceTrustPrompt(true);
        setInfoMessage('¿Deseas confiar en este dispositivo por 30 días?');
        return;
      }

      // CASO 4: LOGIN EXITOSO
      if (result.success) {
        // Si el usuario había elegido confiar en el dispositivo, registrarlo
        if (trustDevice && showDeviceTrustPrompt) {
          try {
            await deviceService.trust();
          } catch (err) {
            console.error('Error al confiar dispositivo:', err);
            // No bloquear el login por esto
          }
        }

        // Esperar un momento para asegurar que el estado se actualice
        // antes de navegar al dashboard
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Redirigir al dashboard
        router.push('/dashboard');
        return;
      }

      // CASO 5: ERROR GENERAL
      setError(result.message || 'Email o contraseña incorrectos. Por favor intenta nuevamente.');
      
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error de conexión. Por favor intenta nuevamente.');
    }
  };

  const handleTrustDeviceAndContinue = async () => {
    setTrustDevice(true);
    
    try {
      // Confiar en el dispositivo
      await deviceService.trust();
      setInfoMessage('Dispositivo confiable registrado exitosamente');
      
      // Continuar con el login
      router.push('/dashboard');
    } catch (err) {
      console.error('Error al confiar dispositivo:', err);
      setError('No se pudo registrar el dispositivo, pero puedes continuar');
      // Permitir continuar de todas formas
      setTimeout(() => router.push('/dashboard'), 2000);
    }
  };

  const handleSkipDeviceTrust = () => {
    // Continuar sin confiar en el dispositivo
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-full mb-4">
            <FaMotorcycle className="text-4xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {showTwoFactorInput ? 'Autenticación de Dos Factores' : showDeviceTrustPrompt ? 'Dispositivo Nuevo' : 'Iniciar Sesión'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {showTwoFactorInput 
              ? 'Ingresa el código de tu aplicación authenticator' 
              : showDeviceTrustPrompt 
              ? '¿Confiar en este dispositivo?' 
              : 'Bienvenido de vuelta a BSK Motorcycle Team'}
          </p>
        </div>

        {/* Alertas de cuenta bloqueada */}
        {isBlocked && alerts.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-6 mb-6">
            <div className="flex items-start">
              <FaExclamationTriangle className="text-red-500 text-2xl mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                  Cuenta Bloqueada Temporalmente
                </h3>
                <ul className="space-y-1">
                  {alerts.map((alert, idx) => (
                    <li key={idx} className="text-sm text-red-700 dark:text-red-400">
                      • {alert}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-red-600 dark:text-red-400 mt-3">
                  Revisa tu email para más información o contacta a soporte.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Score de riesgo alto */}
        {riskScore && riskScore >= 60 && !isBlocked && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-500 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <FaShieldAlt className="text-yellow-600 text-xl mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Hemos detectado actividad inusual en tu cuenta. Por seguridad, verifica tu identidad.
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                  Score de riesgo: {riskScore}/100
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Prompt de dispositivo confiable */}
        {showDeviceTrustPrompt && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-500 rounded-xl p-6 mb-6">
            <div className="text-center mb-4">
              <FaShieldAlt className="text-blue-600 text-4xl mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                ¿Confiar en este dispositivo?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Si confías en este dispositivo, no necesitarás ingresar el código 2FA durante los próximos 30 días.
              </p>
            </div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleTrustDeviceAndContinue}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Sí, confiar en este dispositivo (30 días)
              </button>
              <button
                type="button"
                onClick={handleSkipDeviceTrust}
                className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
              >
                No, continuar sin confiar
              </button>
            </div>
          </div>
        )}

        {/* Formulario principal */}
        {!showDeviceTrustPrompt && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              {!showTwoFactorInput && (
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
                    />
                  </div>
                </div>
              )}

              {/* Contraseña */}
              {!showTwoFactorInput && (
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              )}

              {/* Código 2FA */}
              {showTwoFactorInput && (
                <div>
                  <label
                    htmlFor="twoFactorCode"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Código de Autenticación (6 dígitos)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaShieldAlt className="text-gray-400" />
                    </div>
                    <input
                      id="twoFactorCode"
                      type="text"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors text-center text-2xl tracking-widest font-mono"
                      placeholder="000000"
                      maxLength={6}
                      required
                      autoComplete="one-time-code"
                      autoFocus
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Abre tu aplicación authenticator (Google Authenticator, Authy, etc.) para obtener el código
                  </p>
                </div>
              )}

              {/* Mensaje de información */}
              {infoMessage && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-600 dark:text-blue-400">{infoMessage}</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Recordarme y Olvidé mi contraseña */}
              {!showTwoFactorInput && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="rememberMe"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <label
                      htmlFor="rememberMe"
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      Recordarme (30 días)
                    </label>
                  </div>

                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              )}

              {/* Botón de volver (cuando está en 2FA) */}
              {showTwoFactorInput && (
                <button
                  type="button"
                  onClick={() => {
                    setShowTwoFactorInput(false);
                    setTwoFactorCode('');
                    setError('');
                    setInfoMessage('');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 underline"
                >
                  ← Volver al login
                </button>
              )}

              {/* Botón de submit */}
              <button
                type="submit"
                disabled={isLoading || isBlocked}
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    {showTwoFactorInput ? 'Verificando código...' : 'Iniciando sesión...'}
                  </>
                ) : (
                  <>{showTwoFactorInput ? 'Verificar Código' : 'Iniciar Sesión'}</>
                )}
              </button>
            </form>

            {/* Registro */}
            {!showTwoFactorInput && (
              <div className="mt-6 text-center">
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
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Al iniciar sesión, aceptas nuestros{' '}
            <Link href="/terms" className="underline hover:text-gray-700 dark:hover:text-gray-300">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link href="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-300">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

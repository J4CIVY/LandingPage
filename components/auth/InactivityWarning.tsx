'use client';

import { FaExclamationTriangle, FaClock, FaRedo, FaSignOutAlt } from 'react-icons/fa';

interface InactivityWarningProps {
  email?: string;
  step: 'password' | '2fa';
  timeRemaining: number; // en milisegundos
  onRetry: () => void;
  onCancel: () => void;
  retryText?: string;
  cancelText?: string;
  alternativeOptions?: React.ReactNode;
}

/**
 * Componente de advertencia de inactividad
 * Similar al mensaje "No tenemos noticias suyas" de Microsoft
 */
export default function InactivityWarning({
  email,
  step,
  timeRemaining,
  onRetry,
  onCancel,
  retryText,
  cancelText,
  alternativeOptions
}: InactivityWarningProps) {
  const seconds = Math.ceil(timeRemaining / 1000);
  
  const getStepMessage = () => {
    if (step === 'password') {
      return {
        title: 'No hemos recibido tu contraseña',
        description: 'Has estado inactivo por un tiempo. Por favor ingresa tu contraseña para continuar.',
        icon: <FaExclamationTriangle className="text-yellow-500 text-5xl mb-4" />
      };
    } else {
      return {
        title: 'No hemos recibido el código',
        description: 'Hemos enviado un código de verificación, pero no lo hemos recibido a tiempo.',
        icon: <FaClock className="text-orange-500 text-5xl mb-4" />
      };
    }
  };

  const message = getStepMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-block">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">BSK</span>
            </div>
          </div>
        </div>

        {/* Email (si está disponible) */}
        {email && (
          <div className="text-center mb-6">
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              {email}
            </p>
          </div>
        )}

        {/* Icono de advertencia */}
        <div className="flex justify-center mb-4">
          {message.icon}
        </div>

        {/* Título */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
          {message.title}
        </h2>

        {/* Descripción */}
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          {message.description}
        </p>

        {/* Tiempo restante */}
        {seconds > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-yellow-800 dark:text-yellow-200">
              <FaClock className="text-lg" />
              <span className="font-medium">
                Esta sesión expirará en {seconds} segundo{seconds !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Botón principal de reintentar */}
        <button
          onClick={onRetry}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 mb-4"
        >
          <FaRedo />
          {retryText || (step === 'password' ? 'Ingresar contraseña nuevamente' : 'Enviar nuevo código')}
        </button>

        {/* Opciones alternativas */}
        {alternativeOptions && (
          <div className="mb-4">
            {alternativeOptions}
          </div>
        )}

        {/* Botón de cancelar */}
        <button
          onClick={onCancel}
          className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <FaSignOutAlt />
          {cancelText || 'Volver al inicio'}
        </button>

        {/* Problemas */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            ¿Tienes problemas?
          </p>
          <div className="flex flex-col gap-2">
            {step === '2fa' && (
              <a
                href="https://wa.me/573185555555"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Obtener ayuda por WhatsApp
              </a>
            )}
            <a
              href="/reset-password"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

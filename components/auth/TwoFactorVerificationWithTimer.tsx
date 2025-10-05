'use client';

import { useState, useEffect } from 'react';
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import InactivityWarning from './InactivityWarning';
import TwoFactorVerification from './TwoFactorVerification';

interface TwoFactorVerificationWithTimerProps {
  twoFactorId: string;
  phoneNumber: string;
  expiresIn: number;
  preAuthToken?: string;
  email?: string;
  onVerified: () => void;
  onCancel: () => void;
  onResend: () => Promise<void>;
}

/**
 * Wrapper del componente TwoFactorVerification con timer de inactividad
 * Similar al comportamiento de Microsoft/Google
 */
export default function TwoFactorVerificationWithTimer({
  twoFactorId,
  phoneNumber,
  expiresIn,
  preAuthToken,
  email,
  onVerified,
  onCancel,
  onResend
}: TwoFactorVerificationWithTimerProps) {
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [internalTwoFactorId, setInternalTwoFactorId] = useState(twoFactorId);
  const [internalPhoneNumber, setInternalPhoneNumber] = useState(phoneNumber);
  const [internalExpiresIn, setInternalExpiresIn] = useState(expiresIn);

  // Timer de inactividad: 120 segundos (2 minutos), advertencia a los 30 segundos
  const { timeRemaining, resetTimer, pauseTimer } = useInactivityTimer({
    timeout: 120000, // 2 minutos
    warningTime: 30000, // Advertencia a los 30 segundos
    onTimeout: () => {
      setShowInactivityWarning(true);
      pauseTimer();
    }
  });

  // Resetear timer cuando cambia el twoFactorId (nuevo código enviado)
  useEffect(() => {
    setInternalTwoFactorId(twoFactorId);
    setInternalPhoneNumber(phoneNumber);
    setInternalExpiresIn(expiresIn);
    resetTimer();
  }, [twoFactorId, phoneNumber, expiresIn, resetTimer]);

  // Manejar reintentar desde advertencia
  const handleRetryFromWarning = async () => {
    try {
      // Reenviar código
      await onResend();
      setShowInactivityWarning(false);
      resetTimer();
    } catch (error) {
      console.error('Error al reenviar código:', error);
    }
  };

  // Wrapper del onResend para resetear el timer
  const handleResendWithTimer = async () => {
    await onResend();
    resetTimer();
  };

  // Wrapper del onVerified para pausar el timer
  const handleVerifiedWithTimer = () => {
    pauseTimer();
    onVerified();
  };

  // Si está mostrando advertencia de inactividad
  if (showInactivityWarning) {
    return (
      <InactivityWarning
        email={email}
        step="2fa"
        timeRemaining={45000} // 45 segundos para decidir
        onRetry={handleRetryFromWarning}
        onCancel={onCancel}
        retryText="Enviar nuevo código"
        cancelText="Volver al inicio"
        alternativeOptions={
          <div className="space-y-2">
            <a
              href="https://wa.me/573185555555"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline py-2 px-4 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              Obtener ayuda por WhatsApp
            </a>
            <button
              onClick={() => {
                setShowInactivityWarning(false);
                resetTimer();
              }}
              className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Continuar esperando el código
            </button>
          </div>
        }
      />
    );
  }

  // Renderizar el componente original con los wrappers
  return (
    <TwoFactorVerification
      twoFactorId={internalTwoFactorId}
      phoneNumber={internalPhoneNumber}
      expiresIn={internalExpiresIn}
      preAuthToken={preAuthToken}
      onVerified={handleVerifiedWithTimer}
      onCancel={onCancel}
      onResend={handleResendWithTimer}
    />
  );
}

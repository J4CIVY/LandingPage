'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSpinner } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import Step1Email from '@/components/auth/Step1Email';
import Step2Password from '@/components/auth/Step2Password';
import TwoFactorVerificationWithTimer from '@/components/auth/TwoFactorVerificationWithTimer';

interface TwoFactorData {
  twoFactorId: string;
  phoneNumber: string;
  expiresIn: number;
}

function LoginFlow() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [preAuthToken, setPreAuthToken] = useState<string | null>(null);
  const [twoFactorData, setTwoFactorData] = useState<TwoFactorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getRedirectUrl, clearRedirectUrl, checkAuth } = useAuth();

  // Obtener la URL de retorno
  const urlParamRedirect = searchParams.get('returnUrl');
  const sessionRedirect = getRedirectUrl();
  const returnUrl = urlParamRedirect || sessionRedirect || '/dashboard';

  // Handler cuando el email es verificado (Paso 1 → Paso 2)
  const handleEmailVerified = (verifiedEmail: string) => {
    setEmail(verifiedEmail);
    setCurrentStep(2);
  };

  // Handler cuando la contraseña es verificada (Paso 2 → Paso 3)
  const handlePasswordVerified = async (token: string) => {
    setPreAuthToken(token);
    
    try {
      // Generar código 2FA usando el token
      const response = await fetch('/api/auth/2fa/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ preAuthToken: token })
      });

      const result = await response.json();

      if (result.success) {
        setTwoFactorData({
          twoFactorId: result.data.twoFactorId,
          phoneNumber: result.data.phoneNumber,
          expiresIn: result.data.expiresIn
        });
        setCurrentStep(3);
      } else {
        setError(result.message || 'Error al generar código de verificación');
      }
    } catch (error) {
      console.error('Error generando 2FA:', error);
      setError('Error de conexión. Por favor intenta nuevamente.');
    }
  };

  // Handler cuando el 2FA es verificado (Paso 3 → Dashboard)
  const handle2FAVerified = async () => {
    try {
      // Esperar un momento para asegurar que las cookies estén disponibles
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Actualizar el estado del AuthProvider
      const authSuccess = await checkAuth();
      
      if (authSuccess) {
        clearRedirectUrl();
        router.push(returnUrl);
      } else {
        console.error('No se pudo verificar la autenticación después de 2FA');
        setError('Error al completar la autenticación. Por favor intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error en handle2FAVerified:', error);
      setError('Error de conexión. Por favor intenta nuevamente.');
    }
  };

  // Handler para cancelar 2FA y volver al paso 1
  const handle2FACancel = () => {
    setCurrentStep(1);
    setEmail('');
    setPreAuthToken(null);
    setTwoFactorData(null);
    setError(null);
  };

  // Handler para reenviar código 2FA
  const handle2FAResend = async () => {
    if (!preAuthToken) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch('/api/auth/2fa/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ preAuthToken })
    });

    const result = await response.json();

    if (result.success) {
      setTwoFactorData({
        twoFactorId: result.data.twoFactorId,
        phoneNumber: result.data.phoneNumber,
        expiresIn: result.data.expiresIn
      });
    } else {
      throw new Error(result.message || 'Error al reenviar código');
    }
  };

  // Handler para volver del paso 2 al paso 1
  const handleBackToEmail = () => {
    setCurrentStep(1);
    setEmail('');
    setError(null);
  };

  // Renderizar el paso correspondiente
  if (currentStep === 1) {
    return <Step1Email onEmailVerified={handleEmailVerified} returnUrl={returnUrl} />;
  }

  if (currentStep === 2) {
    return (
      <Step2Password
        email={email}
        onPasswordVerified={handlePasswordVerified}
        onBack={handleBackToEmail}
      />
    );
  }

  if (currentStep === 3 && twoFactorData) {
    return (
      <TwoFactorVerificationWithTimer
        twoFactorId={twoFactorData.twoFactorId}
        phoneNumber={twoFactorData.phoneNumber}
        expiresIn={twoFactorData.expiresIn}
        preAuthToken={preAuthToken || undefined}
        email={email}
        onVerified={handle2FAVerified}
        onCancel={handle2FACancel}
        onResend={handle2FAResend}
      />
    );
  }

  // Fallback (no debería llegar aquí)
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
      <FaSpinner className="animate-spin text-white text-4xl" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <FaSpinner className="animate-spin text-white text-4xl" />
      </div>
    }>
      <LoginFlow />
    </Suspense>
  );
}

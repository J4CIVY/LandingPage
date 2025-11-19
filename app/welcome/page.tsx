'use client';

import { useEffect, useState, Suspense, type FC } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaCheckCircle, FaSpinner, FaEnvelope, FaMedal, FaMotorcycle, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import { GiSteelwingEmblem } from 'react-icons/gi';
import Link from 'next/link';

interface WelcomeData {
  email: string;
  firstName: string;
  lastName: string;
}

const WelcomeContent: FC = () => {
  const searchParams = useSearchParams();
  const [welcomeData, setWelcomeData] = useState<WelcomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Obtener datos del usuario desde los parámetros de URL
    const email = searchParams.get('email');
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');

    if (email && firstName && lastName) {
      setWelcomeData({ email, firstName, lastName });
    }
    
    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center">
          <FaSpinner className="text-6xl text-red-600 dark:text-red-400 mx-auto animate-spin mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            Preparando tu bienvenida...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-4xl w-full">
        {/* Header con logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <GiSteelwingEmblem className="text-red-600 dark:text-red-400 text-6xl" />
          </div>
          
          <div className="flex justify-center mb-6">
            <FaCheckCircle className="text-green-600 dark:text-green-400 text-6xl" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4">
            ¡Bienvenido al BSK Motorcycle Team!
          </h1>
          
          {welcomeData && (
            <p className="text-xl text-gray-700 dark:text-slate-300 mb-6">
              <strong>{welcomeData.firstName} {welcomeData.lastName}</strong>, tu cuenta ha sido verificada exitosamente.
            </p>
          )}
        </div>

        {/* Información de bienvenida */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-4 flex items-center">
              <FaMedal className="mr-2" />
              Tu Membresía
            </h2>
            <p className="text-red-700 dark:text-red-300 text-sm mb-3">
              Has sido registrado como miembro <strong>Friend</strong> de BSK Motorcycle Team.
            </p>
            <ul className="text-red-600 dark:text-red-400 text-sm space-y-1">
              <li>• Acceso a eventos del club</li>
              <li>• Participación en rodadas grupales</li>
              <li>• Descuentos en tienda oficial</li>
              <li>• Acceso a cursos de manejo</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
              <FaEnvelope className="mr-2" />
              Próximos Pasos
            </h2>
            <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-2">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">1.</span>
                Revisa tu correo de bienvenida con información detallada
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">2.</span>
                Completa tu perfil con información de tu motocicleta
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">3.</span>
                Explora eventos disponibles y únete a tu primera rodada
              </li>
            </ul>
          </div>
        </div>

        {/* Características del club */}
        <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-6 text-center">
            ¿Qué puedes hacer ahora?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <FaMotorcycle className="text-2xl text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">Rodadas</h3>
              <p className="text-gray-600 dark:text-slate-400 text-sm">
                Únete a nuestras rodadas grupales todos los fines de semana
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <FaUsers className="text-2xl text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">Comunidad</h3>
              <p className="text-gray-600 dark:text-slate-400 text-sm">
                Conecta con otros motociclistas y comparte experiencias
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <FaCalendarAlt className="text-2xl text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">Eventos</h3>
              <p className="text-gray-600 dark:text-slate-400 text-sm">
                Participa en eventos especiales, cursos y competencias
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white font-medium rounded-lg"
          >
            <FaMedal className="mr-2" />
            Ir a mi Dashboard
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg"
          >
            <FaUsers className="mr-2" />
            Completar Perfil
          </Link>
          <Link
            href="/events"
            className="inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-medium rounded-lg"
          >
            <FaCalendarAlt className="mr-2" />
            Ver Eventos
          </Link>
        </div>

        {/* Nota sobre email */}
        <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-center">
          <p className="text-amber-800 dark:text-amber-200 text-sm">
            <FaEnvelope className="inline mr-2" />
            Hemos enviado un correo de bienvenida con información detallada a <strong>{welcomeData?.email}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente principal que envuelve con Suspense
const WelcomePage: FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <FaSpinner className="text-6xl text-red-600 dark:text-red-400 mx-auto animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">
            Preparando tu bienvenida...
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            Un momento mientras preparamos todo para ti.
          </p>
        </div>
      </div>
    }>
      <WelcomeContent />
    </Suspense>
  );
};

export default WelcomePage;

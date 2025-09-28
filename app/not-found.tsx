'use client';

import Link from 'next/link';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-950 text-center">
      <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mt-4">Página no encontrada</h2>
      <p className="text-gray-700 dark:text-gray-300 mt-2">Lo sentimos, la página que buscas no existe.</p>
      <Link href="/" className="mt-6 px-4 py-2 text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" aria-label="Volver a la página de inicio">
        Volver al inicio
      </Link>
    </div>
  );
};

export default NotFound;

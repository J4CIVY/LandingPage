import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const LoadingErrorHandler = ({ loading, error, logout, navigate }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-950 mx-auto" role="status" aria-label="Cargando" />
          <p className="mt-4 text-gray-600 text-base">Cargando tus datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-center max-w-md p-6 bg-red-50 rounded-lg shadow">
          <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Error al cargar los datos</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-slate-950 hover:bg-green-500 text-white px-4 py-2 rounded-md transition focus:outline-none focus:ring-2 focus:ring-slate-950"
            aria-label="Reintentar carga"
          >
            Reintentar
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="ml-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label="Volver al Login"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingErrorHandler;
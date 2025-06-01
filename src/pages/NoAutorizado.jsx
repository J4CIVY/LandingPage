import { useLocation, Link } from 'react-router-dom';

const NoAutorizado = () => {
  const { state } = useLocation();
  
  return (
    <div className="max-w-md mx-auto p-6 text-center mt-10">
      <h1 className="text-2xl font-bold text-red-600 mb-4">
        Acceso no autorizado
      </h1>
      <div className="bg-red-50 p-4 rounded-lg mb-4">
        <p className="mb-2">
          Tu rol actual: <strong>{state?.currentRole || 'No definido'}</strong>
        </p>
        <p>
          Rol requerido: <strong>
            {Array.isArray(state?.requiredRole) 
              ? state.requiredRole.join(' o ') 
              : state?.requiredRole}
          </strong>
        </p>
      </div>
      <div className="flex justify-center gap-4 mt-6">
        <Link 
          to="/" 
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          Ir al inicio
        </Link>
        <Link 
          to={state?.from?.pathname || '/'} 
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
        >
          Volver atrás
        </Link>
      </div>
    </div>
  );
};

export default NoAutorizado;
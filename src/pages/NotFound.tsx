import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <h2 className="text-2xl font-semibold text-gray-600 mt-4">Página no encontrada</h2>
      <p className="text-gray-500 mt-2">Lo sentimos, la página que buscas no existe.</p>
      <Link to="/" className="mt-6 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
        Volver al inicio
      </Link>
    </div>
  );
};

export default NotFound;

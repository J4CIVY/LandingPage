import { useAuth } from './auth/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

const RutaPrivada = ({ children, roles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-orange-500 text-4xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Guardamos la ubicación actual para redirigir después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificación de roles si se especifican
  if (roles) {
    const hasRequiredRole = Array.isArray(roles) 
      ? roles.includes(user?.role)
      : user?.role === roles;

    if (!hasRequiredRole) {
      return (
        <Navigate 
          to="/no-autorizado" 
          state={{ 
            from: location,
            requiredRole: roles,
            currentRole: user?.role 
          }} 
          replace 
        />
      );
    }
  }

  return children;
};

export default RutaPrivada;
import { useAuth } from './auth/AuthContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

const RutaPrivada = ({ children, roles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-orange-500 text-4xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    // Redirige a no autorizado si no tiene el rol adecuado
    navigate('/no-autorizado', { 
      state: { 
        from: location,
        requiredRole: roles,
        currentRole: user?.role 
      },
      replace: true
    });
    return null;
  }

  return children;
};

export default RutaPrivada;
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import jwtDecode from 'jwt-decode';

const ProtectedRoute = ({ children }) => {
  const { user, loadingAuth } = useAuth();
  const location = useLocation();

  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  };

  const token = localStorage.getItem('token');

  if (loadingAuth) {
    return <div>Cargando autenticación...</div>;
  }

  if (!user || !token || !isTokenValid(token)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
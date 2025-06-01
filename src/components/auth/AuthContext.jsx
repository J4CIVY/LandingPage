import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Normaliza los datos del usuario para garantizar estructura consistente
  const normalizeUser = (userData) => {
    return {
      id: userData?.id || userData?._id,
      email: userData?.email,
      name: userData?.name || userData?.fullName,
      role: userData?.role || 'member', // Valor por defecto 'member' si no existe
      avatar: userData?.avatar || '/default-avatar.jpg',
      // Añade otros campos necesarios
      ...userData
    };
  };

  const fetchCurrentUser = async (token) => {
    try {
      const { data } = await axios.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!data?.data?.user) {
        throw new Error('Datos de usuario no recibidos');
      }
      
      return normalizeUser(data.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      setError('Error al cargar datos de usuario');
      return null;
    }
  };

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const userData = await fetchCurrentUser(token);
        if (userData) {
          setUser(userData);
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data } = await axios.post('/auth/login', { email, password });
      
      const token = data.accessToken || data.token;
      if (!token) {
        throw new Error('No se recibió token de autenticación');
      }

      localStorage.setItem('token', token);
      
      const userData = await fetchCurrentUser(token);
      if (!userData) {
        throw new Error('Error al cargar datos de usuario');
      }

      setUser(userData);
      setError(null);
      return userData;
    } catch (err) {
      setError(err.response?.data?.message || 'Error en el inicio de sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await axios.post('/auth/logout', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setError(null);
      navigate('/login');
      setLoading(false);
    }
  };

  // Función para verificar roles
  const hasRole = (requiredRoles) => {
    if (!user?.role) return false;
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role);
    }
    return user.role === requiredRoles;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error,
      login, 
      logout,
      hasRole,
      refetchUser: async () => {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await fetchCurrentUser(token);
          setUser(userData);
          return userData;
        }
        return null;
      },
      isAuthenticated: !!user
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
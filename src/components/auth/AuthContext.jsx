import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Función para obtener datos del usuario autenticado
  const fetchCurrentUser = async (token) => {
    try {
      const { data } = await axios.get('/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Adaptación a la estructura de tu backend
      return data.data.user;
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await fetchCurrentUser(token);
        setUser(userData);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // Adaptado para tu endpoint de login actual
      const { data } = await axios.post('/auth/login', { email, password });
      
      // Asume que tu backend devuelve token en data.accessToken
      const token = data.accessToken || data.token;
      localStorage.setItem('token', token);
      
      const userData = await fetchCurrentUser(token);
      setUser(userData);
      
      return userData;
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  const logout = async () => {
    try {
      // Opcional: Llama al endpoint de logout de tu backend si existe
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout,
      refetchUser: async () => {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await fetchCurrentUser(token);
          setUser(userData);
        }
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
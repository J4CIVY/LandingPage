import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const navigate = useNavigate();

  // Verifica si el token es válido
  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return decoded.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  };

  // Login centralizado
  const login = async (credentials) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://api.bskmt.com";
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      
      const { accessToken, refreshToken, data } = response.data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      setUser(data.user); // Actualiza el estado global
      navigate('/miembros'); // Redirige SIN recargar
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    navigate('/login');
  };

  // Refrescar token
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        logout();
        return null;
      }

      const response = await axios.post('/auth/refresh-token', { refreshToken });
      const { accessToken } = response.data;
      
      localStorage.setItem('token', accessToken);
      return accessToken;
    } catch (error) {
      console.error('Refresh token error:', error);
      logout();
      return null;
    }
  };

  // Verifica autenticación al cargar
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token && isTokenValid(token)) {
        try {
          const response = await axios.get('/auth/verifyToken', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data.user);
        } catch (error) {
          if (error.response?.status === 401) {
            const newToken = await refreshToken();
            if (newToken) {
              const response = await axios.get('/auth/verifyToken', {
                headers: { Authorization: `Bearer ${newToken}` }
              });
              setUser(response.data.user);
            }
          }
        }
      }
      setLoadingAuth(false);
    };

    verifyAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loadingAuth, login, logout, refreshToken }}>
      {!loadingAuth && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
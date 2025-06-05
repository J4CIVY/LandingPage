import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const navigate = useNavigate();

  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post('/auth/login', credentials);
      const { accessToken, refreshToken, data } = response.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      setUser(data.user);
      return data.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    navigate('/login');
  };

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
      logout();
      return null;
    }
  };

  // Verificar autenticación al cargar
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
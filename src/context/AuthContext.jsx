import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Verifica token salvo no localStorage ao iniciar
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await api.get('/api/auth/verificar');
          setUser(response.data.usuario);
          setIsAuthenticated(true);
        } catch (error) {
          // Token inválido ou expirado
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
        }
      }
      setLoading(false);
    };
    checkToken();
  }, []);

  // Login
  const login = async (email, senha) => {
    try {
      const response = await api.post('/api/auth/login', { email, senha });
      const { token, usuario } = response.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(usuario));

      setUser(usuario);
      setIsAuthenticated(true);

      navigate('/dashboard', { replace: true });
      return { success: true };
    } catch (error) {
      console.error("Erro no login:", error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Erro ao tentar fazer login.' };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login', { replace: true });
  };

 
  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    localStorage.setItem('authUser', JSON.stringify(updatedUser));
  };

  // 🔹 Provider exportando tudo
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

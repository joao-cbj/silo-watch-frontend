import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const AuthContext = createContext();

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

  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('authUser');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          const result = await authService.getUser(userData.id);

          if (result.success && result.user) {
            setUser(result.user);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('authUser');
          }
        } catch (error) {
          localStorage.removeItem('authUser');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, senha) => {
    try {
      const result = await authService.login(email, senha);

      if (result.success) {
        localStorage.setItem('authUser', JSON.stringify(result.user));
        setUser(result.user);
        setIsAuthenticated(true);
        navigate('/dashboard', { replace: true });
        return { success: true };
      }

      return { success: false, message: result.message };
    } catch (error) {
      console.error("Erro no login:", error);
      return { success: false, message: 'Erro ao tentar fazer login.' };
    }
  };

  const logout = () => {
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

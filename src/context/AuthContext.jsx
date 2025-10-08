import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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
    const checkToken = async () => {
      const token = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('authUser');
      
      if (token) {
        try {
          const response = await api.get('/api/auth/verificar');
          setUser(response.data.usuario);
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          
          // Se tinha usuário salvo, use ele temporariamente
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              setUser(parsedUser);
            } catch (e) {
              console.error('Erro ao parsear usuário salvo:', e);
            }
          }
        }
      } else if (savedUser) {
        // Se não tem token mas tem usuário salvo, use ele
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (e) {
          console.error('Erro ao parsear usuário salvo:', e);
        }
      }
      setLoading(false);
    };
    checkToken();
  }, []);

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

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login', { replace: true });
  };

  const updateUser = (newUserData) => {
    // Garante que o _id sempre será mantido
    const updatedUser = { 
      ...user,           // Mantém todos os dados atuais (incluindo _id)
      ...newUserData     // Sobrescreve apenas os campos novos
    };
    
    // Log para debug (remova em produção)
    console.log('Atualizando usuário:', {
      userAtual: user,
      novosDados: newUserData,
      usuarioAtualizado: updatedUser
    });
    
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
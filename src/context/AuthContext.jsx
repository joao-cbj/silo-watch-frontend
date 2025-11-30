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
      
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token) {
        try {
          console.log('[Auth Context] Verificando token existente...');
          const response = await api.get('/api/auth/verificar');
          
          console.log('[Auth Context] ✓ Token válido');
          setUser(response.data.usuario);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('[Auth Context] ✗ Token inválido/expirado');
          // Token inválido ou expirado - limpa tudo
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }
      } else if (savedUser) {
        console.log('[Auth Context] Sem token, mas tem usuário salvo');
        // Se não tem token mas tem usuário salvo, use ele
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (e) {
          console.error('[Auth Context] Erro ao parsear usuário salvo:', e);
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    checkToken();
  }, []);

  // Login
  const login = async (email, senha, mfaCode = null) => {
    try {
      console.log('[Auth Context] Fazendo login...');
      
      const payload = { email, senha };
      if (mfaCode) {
        payload.mfaCode = mfaCode;
      }
      
      const response = await api.post('/api/auth/login', payload);
      
      console.log('[Auth Context] Resposta do servidor:', response.data);

      // Verifica se precisa de MFA
      if (response.data.requiresMFA) {
        console.log('[Auth Context] MFA necessário');
        return { 
          success: false, 
          requiresMFA: true,
          message: response.data.message || 'Digite o código do Microsoft Authenticator'
        };
      }

      // Login bem-sucedido
      const { token, usuario } = response.data;

      if (!token) {
        console.error('[Auth Context] ✗ Token não retornado pelo servidor');
        return { 
          success: false, 
          message: 'Erro: Token não recebido do servidor' 
        };
      }

      // CORRIGIDO: Salva com o nome 'token' (sem 'auth' no prefixo)
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));

      console.log('[Auth Context] ✓ Login bem-sucedido');
      console.log('[Auth Context] Token salvo:', token.substring(0, 20) + '...');
      console.log('[Auth Context] Usuário:', usuario);

      setUser(usuario);
      setIsAuthenticated(true);

      navigate('/dashboard', { replace: true });
      return { success: true };
    } catch (error) {
      console.error('[Auth Context] ✗ Erro no login:', error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.error || error.response?.data?.message || 'Erro ao tentar fazer login.' 
      };
    }
  };

  // Logout
  const logout = () => {
    console.log('[Auth Context] Fazendo logout...');
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setUser(null);
    setIsAuthenticated(false);
    
    navigate('/login', { replace: true });
  };

  // Atualiza dados do usuário
  const updateUser = (newUserData) => {
    // Garante que o id/_id sempre será mantido
    const updatedUser = { 
      ...user,           // Mantém todos os dados atuais (incluindo id e _id)
      ...newUserData     // Sobrescreve apenas os campos novos
    };
    
    console.log('[Auth Context] Atualizando usuário:', {
      antes: user,
      novos: newUserData,
      resultado: updatedUser
    });
    
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Provider exportando tudo
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
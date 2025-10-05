import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/silo-watch-logo.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Usa a função login do AuthContext
      const result = await login(email, senha);
      
      if (!result.success) {
        setError(result.message || 'Erro ao fazer login');
      }
      // Se success for true, o AuthContext já redireciona automaticamente
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Erro inesperado ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg flex max-w-4xl">
        {/* Lado esquerdo - Logo */}
        <div className="w-1/2 bg-gray-800 p-8 rounded-l-lg flex flex-col justify-center items-center text-white">
          <img src={logo} alt="Silo Watch Logo" className="w-32 mb-4" />
          <h1 className="text-3xl font-bold">Silo Watch</h1>
          <p className="text-gray-400 text-sm mt-2">Sistema de Monitoramento</p>
        </div>
        
        {/* Lado direito - Formulário */}
        <div className="w-1/2 p-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Acessar o Painel</h2>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Email
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="seu@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Senha
              </label>
              <input 
                type="password" 
                value={senha} 
                onChange={(e) => setSenha(e.target.value)} 
                required 
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" 
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-semibold"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Primeiro acesso? Entre em contato com o administrador.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
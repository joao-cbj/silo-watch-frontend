import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/silo-watch-logo.png';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [showMfaInput, setShowMfaInput] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Usa a função login do AuthContext
      const result = await login(email, senha, showMfaInput ? mfaCode : null);
      
      if (result.requiresMFA) {
        // Backend pediu código MFA
        setShowMfaInput(true);
        setError('');
        setLoading(false);
        return;
      }
      
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

  const handleBackToCredentials = () => {
    setShowMfaInput(false);
    setMfaCode('');
    setError('');
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
          {!showMfaInput ? (
            <>
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
            </>
          ) : (
            <>
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-700 mb-2 text-center">
                Autenticação de Dois Fatores
              </h2>
              <p className="text-sm text-gray-500 mb-6 text-center">
                Digite o código de 6 dígitos do Microsoft Authenticator
              </p>
              
              <form onSubmit={handleLogin}>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-semibold mb-2 text-center">
                    Código de Verificação
                  </label>
                  <input 
                    type="text" 
                    value={mfaCode} 
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    required 
                    placeholder="000000"
                    autoFocus
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  />
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                    {error}
                  </div>
                )}
                
                <button 
                  type="submit" 
                  disabled={loading || mfaCode.length !== 6} 
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold mb-3"
                >
                  {loading ? 'Verificando...' : 'Verificar Código'}
                </button>

                <button 
                  type="button"
                  onClick={handleBackToCredentials}
                  className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Voltar
                </button>
              </form>
            </>
          )}
          
          {!showMfaInput && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Primeiro acesso? Entre em contato com o administrador.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
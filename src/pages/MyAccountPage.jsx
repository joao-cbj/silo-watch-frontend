import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftIcon, UserCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import Sidebar from '../components/Sidebar';
import { authService } from '../services/authService';

const MyAccountPage = () => {
  const { user, updateUser } = useAuth(); //  usa updateUser do contexto
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await authService.updateUser(user.id, formData);

      if (result.success) {
        updateUser(result.user);

        setMessage({
          type: 'success',
          text: 'Perfil atualizado com sucesso! Redirecionando...'
        });

        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setMessage({ type: 'error', text: result.message || 'Erro ao atualizar perfil.' });
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setMessage({
        type: 'error',
        text: 'Erro ao atualizar perfil'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition duration-200"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Voltar ao Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Minha Conta</h1>
            <p className="text-gray-600 mt-2">Gerencie suas informações pessoais</p>
          </div>

          {/* Card do Formulário */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-6 pb-6 border-b border-gray-200">
              <div className="bg-gray-800 rounded-full p-4">
                <UserCircleIcon className="h-12 w-12 text-white" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-800">{user?.nome}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <UserCircleIcon className="h-4 w-4 inline mr-1" />
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Mensagem de Feedback */}
              {message.text && (
                <div
                  className={`mt-6 p-4 rounded-lg ${
                    message.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:bg-gray-400"
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition duration-200"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage;

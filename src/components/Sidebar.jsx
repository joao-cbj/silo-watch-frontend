import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PowerIcon, Cog6ToothIcon, DocumentChartBarIcon, UsersIcon, ArchiveBoxIcon, ChartPieIcon, UserCircleIcon, BellIcon, KeyIcon, ShieldCheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import logo from '../assets/silo-watch-logo.png';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showConfigModal, setShowConfigModal] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleOpenConfig = (e) => {
    e.preventDefault();
    setShowConfigModal(true);
  };

  const handleCloseConfig = () => {
    setShowConfigModal(false);
  };

  const handleMyAccount = () => {
    setShowConfigModal(false);
    navigate('/minha-conta');
  };

  return (
    <>
      <div className="w-64 bg-gray-800 text-white h-screen flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-center p-4 border-b border-gray-700">
            <img src={logo} alt="Silo Watch" className="w-12 h-12 mr-2" />
            <h1 className="text-xl font-bold">SILO WATCH</h1>
          </div>
          <nav className="mt-6">
            <a href="#" className="flex items-center py-3 px-4 bg-gray-900 text-white">
              <ChartPieIcon className="h-6 w-6 mr-3" /> Dashboard
            </a>
            <a href="#" className="flex items-center py-3 px-4 hover:bg-gray-700 transition duration-200">
              <ArchiveBoxIcon className="h-6 w-6 mr-3" /> Gerenciar Silos
            </a>
            <a href="#" className="flex items-center py-3 px-4 hover:bg-gray-700 transition duration-200">
              <UsersIcon className="h-6 w-6 mr-3" /> Gerenciar Usuários
            </a>
            <a href="#" className="flex items-center py-3 px-4 hover:bg-gray-700 transition duration-200">
              <DocumentChartBarIcon className="h-6 w-6 mr-3" /> Relatórios
            </a>
            <a 
              href="#" 
              onClick={handleOpenConfig}
              className="flex items-center py-3 px-4 hover:bg-gray-700 transition duration-200"
            >
              <Cog6ToothIcon className="h-6 w-6 mr-3" /> Configurações
            </a>
          </nav>
        </div>
        <div className="p-4 border-t border-gray-700">
          <div className="mb-4">
            <p className="font-semibold">{user?.nome || 'Carregando...'}</p>
            <p className="text-sm text-gray-400">{user?.email || ''}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            <PowerIcon className="h-5 w-5 mr-2" />
            Sair
          </button>
        </div>
      </div>

      {/* Modal de Configurações */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 max-h-[80vh] overflow-hidden">
            {/* Header do Modal */}
            <div className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <Cog6ToothIcon className="h-6 w-6 mr-2" />
                <h2 className="text-xl font-bold">Configurações</h2>
              </div>
              <button 
                onClick={handleCloseConfig}
                className="hover:bg-gray-700 rounded-full p-1 transition duration-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-4">
              {/* Minha Conta - ATIVA */}
              <button 
                onClick={handleMyAccount}
                className="w-full flex items-center px-4 py-3 hover:bg-gray-100 rounded-lg transition duration-200 text-left"
              >
                <UserCircleIcon className="h-6 w-6 mr-3 text-gray-700" />
                <div>
                  <p className="font-semibold text-gray-800">Minha Conta</p>
                  <p className="text-xs text-gray-500">Editar informações pessoais</p>
                </div>
              </button>
              
              {/* Notificações - INATIVA */}
              <button 
                disabled
                className="w-full flex items-center px-4 py-3 rounded-lg transition duration-200 text-left opacity-50 cursor-not-allowed"
              >
                <BellIcon className="h-6 w-6 mr-3 text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-500">Notificações</p>
                  <p className="text-xs text-gray-400">Gerenciar alertas e avisos</p>
                </div>
                <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Em breve</span>
              </button>

              {/* Segurança - INATIVA */}
              <button 
                disabled
                className="w-full flex items-center px-4 py-3 rounded-lg transition duration-200 text-left opacity-50 cursor-not-allowed"
              >
                <KeyIcon className="h-6 w-6 mr-3 text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-500">Segurança</p>
                  <p className="text-xs text-gray-400">Alterar senha e autenticação</p>
                </div>
                <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Em breve</span>
              </button>

              {/* Privacidade - INATIVA */}
              <button 
                disabled
                className="w-full flex items-center px-4 py-3 rounded-lg transition duration-200 text-left opacity-50 cursor-not-allowed"
              >
                <ShieldCheckIcon className="h-6 w-6 mr-3 text-gray-400" />
                <div>
                  <p className="font-semibold text-gray-500">Privacidade</p>
                  <p className="text-xs text-gray-400">Controle de dados e permissões</p>
                </div>
                <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Em breve</span>
              </button>
            </div>

            {/* Footer do Modal */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <button 
                onClick={handleCloseConfig}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2 px-4 rounded transition duration-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
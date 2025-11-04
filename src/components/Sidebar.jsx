import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PowerIcon, Cog6ToothIcon, ChartBarIcon, UsersIcon, ArchiveBoxIcon, ChartPieIcon } from '@heroicons/react/24/outline';
import logo from '../assets/silo-watch-logo.png';
import SettingsWindow from './SettingsWindow';
import AnalysisWindow from './AnalysisWindow';
import UsersWindow from './UsersWindow';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);

  const handleOpenAnalysis = (e) => {
    e.preventDefault();
    setShowAnalysisModal(true);
  };
  
  const handleCloseAnalysis = () => setShowAnalysisModal(false);
  const handleCloseUsers = () => setShowUsersModal(false);

  const handleLogout = () => {
    logout();
  }
  
  const handleOpenConfig = (e) => {
    e.preventDefault();
    setShowConfigModal(true);
  };

  const handleCloseConfig = () => {
    setShowConfigModal(false);
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
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setShowUsersModal(true); }}
              className="flex items-center py-3 px-4 hover:bg-gray-700 transition duration-200"
            >
              <UsersIcon className="h-6 w-6 mr-3" /> Gerenciar Usuários
            </a>
            <a
              href="#"
              onClick={handleOpenAnalysis}
              className="flex items-center py-3 px-4 hover:bg-gray-700 transition duration-200"
            >
              <ChartBarIcon className="h-6 w-6 mr-3" /> Análises
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

      {/* Modais */}
      {showConfigModal && <SettingsWindow onClose={handleCloseConfig} />}
      {showAnalysisModal && <AnalysisWindow onClose={handleCloseAnalysis} />}
      {showUsersModal && <UsersWindow onClose={handleCloseUsers} />}
    </>
  );
};

export default Sidebar;
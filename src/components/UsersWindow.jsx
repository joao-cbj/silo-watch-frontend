import React, { useState } from "react";
import {
  UsersIcon,
  XMarkIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import logo from "../assets/silo-watch-logo.png";
import UserListTab from "./users/tabs/UserListTab";

const UsersWindow = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState(null);

  const renderContent = () => {
    if (!activeTab) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-gray-500">
          <UsersIcon className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-xl font-semibold text-gray-700">
            Gerenciamento de Usuários
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Escolha uma categoria à esquerda para começar.
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case "userlist":
        return <UserListTab />;
      case "permissions":
        return <PermissionsTab />;
      case "logs":
        return <LogsTab />;
      default:
        return null;
    }
  };

  const menuItems = [
    {
      id: "userlist",
      label: "Lista de Usuários",
      icon: ListBulletIcon,
      enabled: true,
    },
    {
      id: "permissions",
      label: "Gerenciar Permissões",
      icon: ShieldCheckIcon,
      enabled: false,
    },
    {
      id: "logs",
      label: "Logs de Atividades",
      icon: ClipboardDocumentListIcon,
      enabled: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fundo borrado */}
      <div
        className="absolute inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-md"
        style={{
          WebkitBackdropFilter: "blur(10px)",
          backdropFilter: "blur(10px)",
        }}
        onClick={onClose}
      ></div>

      {/* Janela principal */}
      <div 
        className="relative flex w-[900px] h-[600px] bg-white border border-gray-200 shadow-2xl z-10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar com gradiente azul */}
        <div
          className="w-64 flex flex-col text-white"
          style={{
            background: "linear-gradient(180deg, #1f2937 0%, #1F2238 100%)",
          }}
        >
          {/* Header com logo */}
          <div className="flex items-center justify-center py-5 border-b border-gray-400/40">
            <img src={logo} alt="Silo Watch" className="w-10 h-10 mr-2" />
            <h2 className="font-bold text-lg tracking-tight">SILO WATCH</h2>
          </div>

          {/* Título */}
          <div className="flex items-center px-5 py-4 border-b border-gray-400/30">
            <UsersIcon className="h-5 w-5 mr-2 text-blue-100" />
            <span className="font-semibold text-blue-50">Usuários</span>
          </div>

          {/* Menu de Opções */}
          <div className="flex flex-col mt-2 text-sm overflow-y-auto flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => item.enabled && setActiveTab(item.id)}
                  disabled={!item.enabled}
                  className={`flex items-center px-5 py-3 transition-all duration-150 text-left ${
                    activeTab === item.id
                      ? "bg-blue-700/80"
                      : item.enabled
                      ? "hover:bg-blue-700/60"
                      : "opacity-60 cursor-not-allowed"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 mr-3 ${
                      item.enabled ? "text-blue-100" : "text-blue-200"
                    }`}
                  />
                  <span
                    className={`${
                      activeTab === item.id || item.enabled
                        ? "font-medium text-blue-50"
                        : "text-blue-100"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer com versão */}
          <div className="px-5 py-3 border-t border-blue-700/30 text-xs text-blue-200">
            <p>Versão 1.0.0</p>
            <p className="mt-1 opacity-70">Apenas Administradores</p>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 relative bg-white">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-3 right-3 p-2 hover:bg-gray-100 transition rounded-lg z-10"
            aria-label="Fechar"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// Placeholder para tabs desabilitadas
const PermissionsTab = () => (
  <div className="p-6">
    <h3 className="text-lg font-semibold">Gerenciar Permissões</h3>
    <p className="text-gray-500 mt-2">Em desenvolvimento...</p>
  </div>
);

const LogsTab = () => (
  <div className="p-6">
    <h3 className="text-lg font-semibold">Logs de Atividades</h3>
    <p className="text-gray-500 mt-2">Em desenvolvimento...</p>
  </div>
);

export default UsersWindow;
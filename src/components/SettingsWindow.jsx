import React, { useState } from "react";
import {
  Cog6ToothIcon,
  UserCircleIcon,
  BellIcon,
  KeyIcon,
  ShieldCheckIcon,
  XMarkIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import logo from "../assets/silo-watch-logo.png";

const SettingsWindow = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState(null);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: user?.nome || "",
    email: user?.email || "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await api.put(`/api/usuarios/${user._id}`, formData);

      if (response.data.success) {
        updateUser(formData);
        setMessage({
          type: "success",
          text: "Perfil atualizado com sucesso!",
        });
      } else {
        setMessage({ type: "error", text: "Erro ao atualizar perfil." });
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Erro ao atualizar perfil",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (!activeTab) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-gray-500">
          <Cog6ToothIcon className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-xl font-semibold text-gray-700">
            Painel de Configurações
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Escolha uma categoria à esquerda para começar.
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case "account":
        return (
          <div className="p-8 h-full overflow-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Minha Conta
            </h2>

            <div className="flex items-center mb-8 pb-6 border-b border-gray-200">
              <div className="bg-blue-600 rounded-full p-4">
                <UserCircleIcon className="h-12 w-12 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {user?.nome}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>

              {message.text && (
                <div
                  className={`mt-6 p-4 rounded-lg ${
                    message.type === "success"
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:bg-gray-400"
                >
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        );

      case "security":
        return (
          <div className="p-8 h-full overflow-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Segurança
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <KeyIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-700 font-semibold">
                Funcionalidade em desenvolvimento
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Em breve você poderá alterar sua senha e configurar autenticação
                em duas etapas.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fundo borrado */}
      <div
        className="absolute inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-md"
        style={{
          WebkitBackdropFilter: "blur(10px)",
          backdropFilter: "blur(10px)",
        }}
      ></div>

      {/* Janela principal */}
      <div className="relative flex w-[900px] h-[600px] bg-white border border-gray-200 shadow-2xl z-10">
        {/* Sidebar com gradiente azul */}
        <div
          className="w-64 flex flex-col text-white"
          style={{
            background: "linear-gradient(180deg, #2563EB 0%, #1E3A8A 100%)",
          }}
        >
          {/* Header com logo */}
          <div className="flex items-center justify-center py-5 border-b border-blue-700/40">
            <img src={logo} alt="Silo Watch" className="w-10 h-10 mr-2" />
            <h2 className="font-bold text-lg tracking-tight">SILO WATCH</h2>
          </div>

          {/* Título */}
          <div className="flex items-center px-5 py-4 border-b border-blue-700/30">
            <Cog6ToothIcon className="h-5 w-5 mr-2 text-blue-100" />
            <span className="font-semibold text-blue-50">Configurações</span>
          </div>

          {/* Opções */}
          <div className="flex flex-col mt-2 text-sm">
            <button
              onClick={() => setActiveTab("account")}
              className={`flex items-center px-5 py-3 transition-all duration-150 text-left ${
                activeTab === "account"
                  ? "bg-blue-700/80"
                  : "hover:bg-blue-700/60"
              }`}
            >
              <UserCircleIcon className="h-5 w-5 mr-3 text-blue-100" />
              <span className="font-medium text-blue-50">Minha Conta</span>
            </button>

            <button
              disabled
              className="flex items-center px-5 py-3 opacity-60 cursor-not-allowed text-left"
            >
              <BellIcon className="h-5 w-5 mr-3 text-blue-200" />
              <span className="text-blue-100">Notificações</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center px-5 py-3 transition-all duration-150 text-left ${
                activeTab === "security"
                  ? "bg-blue-700/80"
                  : "hover:bg-blue-700/60"
              }`}
            >
              <KeyIcon className="h-5 w-5 mr-3 text-blue-100" />
              <span className="font-medium text-blue-50">Segurança</span>
            </button>

            <button
              disabled
              className="flex items-center px-5 py-3 opacity-60 cursor-not-allowed text-left"
            >
              <ShieldCheckIcon className="h-5 w-5 mr-3 text-blue-200" />
              <span className="text-blue-100">Privacidade</span>
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 relative bg-white">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 hover:bg-gray-100 transition rounded z-10"
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

export default SettingsWindow;

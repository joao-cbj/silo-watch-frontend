import React, { useState } from "react";
import {
  UserCircleIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../../context/AuthContext";
import api from "./../../../services/api";

const AccountTab = () => {
  const { user, updateUser } = useAuth();
  
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
        // Atualiza apenas os campos editados, mantendo _id e outros dados
        updateUser({
          nome: formData.nome,
          email: formData.email,
        });
        
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

  return (
    <div className="p-8 h-full overflow-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Minha Conta</h2>

      {/* Header do Perfil */}
      <div className="flex items-center mb-8 pb-6 border-b border-gray-200">
        <div className="bg-blue-600 rounded-full p-4">
          <UserCircleIcon className="h-12 w-12 text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-xl font-semibold text-gray-800">{user?.nome}</h3>
          <p className="text-sm text-gray-500">{user?.email}</p>
          {user?.createdAt && (
            <p className="text-xs text-gray-400 mt-1">
              Membro desde {new Date(user.createdAt).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>
      </div>

      {/* Formulário */}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Mensagem de Feedback */}
        {message.text && (
          <div
            className={`mt-6 p-4 rounded-lg flex items-center ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircleIcon className="h-5 w-5 mr-2" />
            ) : (
              <ExclamationCircleIcon className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        {/* Botão Salvar */}
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
};

export default AccountTab;
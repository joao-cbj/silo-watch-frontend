import React, { useState } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../../context/AuthContext";
import api from "./../../../services/api";

const SecurityTab = () => {
  const { user } = useAuth();

  const [senhaData, setSenhaData] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });

  const [mostrarSenhas, setMostrarSenhas] = useState({
    atual: false,
    nova: false,
    confirmar: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSenhaChange = (e) => {
    setSenhaData({
      ...senhaData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleMostrarSenha = (campo) => {
    setMostrarSenhas({
      ...mostrarSenhas,
      [campo]: !mostrarSenhas[campo],
    });
  };

  // Validação de força da senha
  const validarForcaSenha = (senha) => {
    const requisitos = {
      tamanho: senha.length >= 8,
      maiuscula: /[A-Z]/.test(senha),
      minuscula: /[a-z]/.test(senha),
      numero: /[0-9]/.test(senha),
      especial: /[!@#$%^&*(),.?":{}|<>]/.test(senha),
    };

    const forca = Object.values(requisitos).filter(Boolean).length;
    return { requisitos, forca };
  };

  const { requisitos, forca } = validarForcaSenha(senhaData.novaSenha);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    // Validações
    if (senhaData.novaSenha !== senhaData.confirmarSenha) {
      setMessage({ type: "error", text: "As senhas não coincidem" });
      return;
    }

    if (forca < 4) {
      setMessage({
        type: "error",
        text: "Senha muito fraca. Cumpra todos os requisitos.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.put(`/api/usuarios/${user._id}/senha`, {
        senhaAtual: senhaData.senhaAtual,
        novaSenha: senhaData.novaSenha,
      });

      if (response.data.success) {
        setMessage({
          type: "success",
          text: "Senha alterada com sucesso!",
        });
        setSenhaData({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
      }
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Erro ao alterar senha",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Segurança</h2>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Senha Atual */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Senha Atual
            </label>
            <div className="relative">
              <input
                type={mostrarSenhas.atual ? "text" : "password"}
                name="senhaAtual"
                value={senhaData.senhaAtual}
                onChange={handleSenhaChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => toggleMostrarSenha("atual")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {mostrarSenhas.atual ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Nova Senha */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nova Senha
            </label>
            <div className="relative">
              <input
                type={mostrarSenhas.nova ? "text" : "password"}
                name="novaSenha"
                value={senhaData.novaSenha}
                onChange={handleSenhaChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => toggleMostrarSenha("nova")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {mostrarSenhas.nova ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Barra de Força da Senha */}
            {senhaData.novaSenha && (
              <div className="mt-3">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((nivel) => (
                    <div
                      key={nivel}
                      className={`h-1 flex-1 rounded ${
                        nivel <= forca
                          ? forca <= 2
                            ? "bg-red-500"
                            : forca <= 3
                            ? "bg-yellow-500"
                            : "bg-green-500"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p
                  className={`text-xs font-semibold ${
                    forca <= 2
                      ? "text-red-600"
                      : forca <= 3
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {forca <= 2 ? "Fraca" : forca <= 3 ? "Média" : "Forte"}
                </p>
              </div>
            )}

            {/* Requisitos da Senha */}
            {senhaData.novaSenha && (
              <div className="mt-3 space-y-1 text-xs">
                <div
                  className={`flex items-center ${
                    requisitos.tamanho ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Mínimo 8 caracteres
                </div>
                <div
                  className={`flex items-center ${
                    requisitos.maiuscula ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Uma letra maiúscula
                </div>
                <div
                  className={`flex items-center ${
                    requisitos.minuscula ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Uma letra minúscula
                </div>
                <div
                  className={`flex items-center ${
                    requisitos.numero ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Um número
                </div>
                <div
                  className={`flex items-center ${
                    requisitos.especial ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Um caractere especial
                </div>
              </div>
            )}
          </div>

          {/* Confirmar Senha */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <input
                type={mostrarSenhas.confirmar ? "text" : "password"}
                name="confirmarSenha"
                value={senhaData.confirmarSenha}
                onChange={handleSenhaChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => toggleMostrarSenha("confirmar")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {mostrarSenhas.confirmar ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {senhaData.confirmarSenha &&
              senhaData.novaSenha !== senhaData.confirmarSenha && (
                <p className="text-xs text-red-600 mt-1">
                  As senhas não coincidem
                </p>
              )}
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
            {loading ? "Alterando..." : "Alterar Senha"}
          </button>
        </div>
      </form>

      {/* Autenticação em Duas Etapas (Futuro) */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
          <ShieldCheckIcon className="h-5 w-5 mr-2 text-blue-600" />
          Autenticação em Duas Etapas
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Adicione uma camada extra de segurança à sua conta.
        </p>
        <button
          disabled
          className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm cursor-not-allowed"
        >
          Em breve
        </button>
      </div>
    </div>
  );
};

export default SecurityTab;
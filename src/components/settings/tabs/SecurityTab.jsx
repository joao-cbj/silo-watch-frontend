import React, { useState } from "react";
import api from "../../../services/api";
import { KeyIcon, ShieldCheckIcon, CheckCircleIcon, XCircleIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const SecurityTab = () => {
  const [formData, setFormData] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  const validatePassword = () => {
    if (!formData.senhaAtual || !formData.novaSenha || !formData.confirmarSenha) {
      setMessage({ type: "error", text: "Preencha todos os campos" });
      return false;
    }

    if (formData.novaSenha.length < 6) {
      setMessage({ type: "error", text: "A nova senha deve ter no mínimo 6 caracteres" });
      return false;
    }

    if (formData.novaSenha !== formData.confirmarSenha) {
      setMessage({ type: "error", text: "As senhas não coincidem" });
      return false;
    }

    if (formData.senhaAtual === formData.novaSenha) {
      setMessage({ type: "error", text: "A nova senha deve ser diferente da atual" });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setMessage(null);

    if (!validatePassword()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const userId = JSON.parse(atob(token.split('.')[1])).id;

      const response = await api.put(`/api/usuarios/${userId}/senha`, {
        senhaAtual: formData.senhaAtual,
        novaSenha: formData.novaSenha
      });

      if (response.data.success) {
        setMessage({ type: "success", text: "Senha alterada com sucesso!" });
        setFormData({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Erro ao alterar senha"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Segurança</h2>
        <p className="text-sm text-gray-500 mb-6">
          Gerencie a segurança da sua conta e altere sua senha
        </p>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <XCircleIcon className="h-5 w-5" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <KeyIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Alterar Senha</h3>
              <p className="text-sm text-gray-500">Mantenha sua conta segura com uma senha forte</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha Atual
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="senhaAtual"
                  value={formData.senhaAtual}
                  onChange={handleChange}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="novaSenha"
                  value={formData.novaSenha}
                  onChange={handleChange}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite sua nova senha"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Mínimo de 6 caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirme sua nova senha"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
            >
              {loading ? "Alterando..." : "Alterar Senha"}
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Dicas de Segurança</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use uma senha forte com letras, números e símbolos</li>
                <li>• Não compartilhe sua senha com ninguém</li>
                <li>• Altere sua senha regularmente</li>
                <li>• Nunca use a mesma senha em múltiplos serviços</li>
                <li>• Habilite autenticação de dois fatores quando disponível</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;
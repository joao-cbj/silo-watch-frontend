import React, { useState } from "react";
import api from "../../../services/api";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

const AddSiloTab = ({ onSiloCreated }) => {
  const [formData, setFormData] = useState({
    nome: "",
    tipoSilo: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const tiposSilo = [
    { value: "superficie", label: "Superfície" },
    { value: "trincheira", label: "Trincheira" },
    { value: "cilindrico", label: "Cilíndrico" },
    { value: "silo-bolsa", label: "Silo-Bolsa" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await api.post("/api/silos", formData);

      if (response.data.success) {
        setSuccess(true);
        setFormData({ nome: "", tipoSilo: "" });
        
        setTimeout(() => {
          if (onSiloCreated) onSiloCreated();
        }, 1500);
      }
    } catch (err) {
      console.error("Erro ao cadastrar silo:", err);
      setError(
        err.response?.data?.error || "Erro ao cadastrar silo. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h3 className="text-2xl font-bold text-gray-800 mb-2">Cadastrar Novo Silo</h3>
      <p className="text-gray-500 text-sm mb-6">
        Preencha os dados para adicionar um novo silo ao sistema
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
        {/* Nome do Silo */}
        <div>
          <label
            htmlFor="nome"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nome do Silo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            placeholder="Ex: Silo A1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        {/* Tipo do Silo */}
        <div>
          <label
            htmlFor="tipoSilo"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Tipo do Silo <span className="text-red-500">*</span>
          </label>
          <select
            id="tipoSilo"
            name="tipoSilo"
            value={formData.tipoSilo}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          >
            <option value="">Selecione o tipo</option>
            {tiposSilo.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="flex items-start bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <XCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Mensagem de Sucesso */}
        {success && (
          <div className="flex items-start bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">
              Silo cadastrado com sucesso! Redirecionando...
            </span>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
          >
            {loading ? "Cadastrando..." : "Cadastrar Silo"}
          </button>
          <button
            type="button"
            onClick={() => setFormData({ nome: "", tipoSilo: "" })}
            disabled={loading}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition font-medium"
          >
            Limpar
          </button>
        </div>

        {/* Informação sobre integração */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Dica:</strong> Após cadastrar o silo, você pode integrá-lo
            com um dispositivo na aba <strong>"Integrações"</strong>.
          </p>
        </div>
      </form>
    </div>
  );
};

export default AddSiloTab;
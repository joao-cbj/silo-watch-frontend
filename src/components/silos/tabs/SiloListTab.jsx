import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import {
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

const SiloListTab = () => {
  const [silos, setSilos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSilo, setEditingSilo] = useState(null);
  const [editFormData, setEditFormData] = useState({ nome: "", tipoSilo: "" });

  const tiposSilo = [
    { value: "superficie", label: "Superfície" },
    { value: "trincheira", label: "Trincheira" },
    { value: "cilindrico", label: "Cilíndrico" },
    { value: "silo-bolsa", label: "Silo-Bolsa" },
  ];

  const fetchSilos = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/api/silos");

      if (response.data.success) {
        setSilos(response.data.silos);
      }
    } catch (err) {
      console.error("Erro ao buscar silos:", err);
      setError("Erro ao carregar lista de silos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSilos();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar este silo?")) return;

    try {
      const response = await api.delete(`/api/silos/${id}`);

      if (response.data.success) {
        setSilos((prev) => prev.filter((silo) => silo._id !== id));
      }
    } catch (err) {
      console.error("Erro ao deletar silo:", err);
      alert(err.response?.data?.error || "Erro ao deletar silo");
    }
  };

  const handleEdit = (silo) => {
    setEditingSilo(silo._id);
    setEditFormData({
      nome: silo.nome,
      tipoSilo: silo.tipoSilo,
    });
  };

  const handleCancelEdit = () => {
    setEditingSilo(null);
    setEditFormData({ nome: "", tipoSilo: "" });
  };

  const handleSaveEdit = async (id) => {
    try {
      const response = await api.put(`/api/silos/${id}`, editFormData);

      if (response.data.success) {
        setSilos((prev) =>
          prev.map((silo) =>
            silo._id === id ? { ...silo, ...editFormData } : silo
          )
        );
        setEditingSilo(null);
      }
    } catch (err) {
      console.error("Erro ao atualizar silo:", err);
      alert(err.response?.data?.error || "Erro ao atualizar silo");
    }
  };

  const getTipoLabel = (value) => {
    return tiposSilo.find((t) => t.value === value)?.label || value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando silos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-600">
          <XCircleIcon className="h-12 w-12 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Lista de Silos</h3>
          <p className="text-gray-500 text-sm mt-1">
            {silos.length} {silos.length === 1 ? "silo cadastrado" : "silos cadastrados"}
          </p>
        </div>
        <button
          onClick={fetchSilos}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          Atualizar
        </button>
      </div>

      {silos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Nenhum silo cadastrado ainda
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Use a aba "Adicionar Silo" para cadastrar
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Dispositivo
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {silos.map((silo) => (
                <tr key={silo._id} className="hover:bg-gray-50 transition">
                  {editingSilo === silo._id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editFormData.nome}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              nome: e.target.value,
                            }))
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={editFormData.tipoSilo}
                          onChange={(e) =>
                            setEditFormData((prev) => ({
                              ...prev,
                              tipoSilo: e.target.value,
                            }))
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          {tiposSilo.map((tipo) => (
                            <option key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            silo.integrado
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {silo.integrado ? "Integrado" : "Não integrado"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {silo.dispositivo || "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleSaveEdit(silo._id)}
                          className="text-green-600 hover:text-green-800 mr-3"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {silo.nome}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getTipoLabel(silo.tipoSilo)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            silo.integrado
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {silo.integrado ? (
                            <>
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Integrado
                            </>
                          ) : (
                            "Não integrado"
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {silo.dispositivo || "-"}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(silo)}
                          className="text-blue-600 hover:text-blue-800 transition inline-flex items-center"
                          title="Editar"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(silo._id)}
                          className="text-red-600 hover:text-red-800 transition inline-flex items-center"
                          title="Deletar"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SiloListTab;
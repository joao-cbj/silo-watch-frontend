import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import {
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  LinkSlashIcon,
} from "@heroicons/react/24/outline";

const SiloListTab = () => {
  const [silos, setSilos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSilo, setEditingSilo] = useState(null);
  const [editFormData, setEditFormData] = useState({ nome: "", tipoSilo: "" });
  const [deleteModal, setDeleteModal] = useState({ show: false, silo: null });
  const [desintegrarModal, setDesintegrarModal] = useState({ show: false, silo: null });
  const [processando, setProcessando] = useState(false);

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

  const handleDeleteClick = (silo) => {
    setDeleteModal({ show: true, silo });
  };

  const handleDeleteConfirm = async () => {
    const { silo } = deleteModal;
    setProcessando(true);
    
    try {
      const response = await api.delete(`/api/silos/${silo._id}`);

      if (response.data.success) {
        setSilos((prev) => prev.filter((s) => s._id !== silo._id));
        
        if (response.data.dadosDeletados > 0) {
          alert(`✓ Silo deletado com sucesso!\n${response.data.dadosDeletados} leituras também foram removidas.\n${silo.integrado ? 'Pressione o botão do ESP32 por 3 segundos para resetar.' : ''}`);
        } else {
          alert("✓ Silo deletado com sucesso!");
        }
      }
    } catch (err) {
      console.error("Erro ao deletar silo:", err);
      alert(err.response?.data?.error || "Erro ao deletar silo");
    } finally {
      setProcessando(false);
      setDeleteModal({ show: false, silo: null });
    }
  };

  const handleDesintegrarClick = (silo) => {
    setDesintegrarModal({ show: true, silo });
  };

  const handleDesintegrarConfirm = async () => {
    const { silo } = desintegrarModal;
    setProcessando(true);
    
    try {
      const response = await api.post("/api/mqtt-provisioning/desintegrar", {
        siloId: silo._id
      });

      if (response.data.success) {
        await fetchSilos();
        alert(`✓ ${response.data.message}`);
      }
    } catch (err) {
      console.error("Erro ao desintegrar:", err);
      alert(err.response?.data?.error || "Erro ao desintegrar silo");
    } finally {
      setProcessando(false);
      setDesintegrarModal({ show: false, silo: null });
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
    setProcessando(true);
    
    try {
      const response = await api.put(`/api/silos/${id}`, editFormData);

      if (response.data.success) {
        setSilos((prev) =>
          prev.map((silo) =>
            silo._id === id ? { ...silo, ...editFormData } : silo
          )
        );
        setEditingSilo(null);
        alert("✓ Silo atualizado com sucesso!");
      }
    } catch (err) {
      console.error("Erro ao atualizar silo:", err);
      alert(err.response?.data?.error || "Erro ao atualizar silo");
    } finally {
      setProcessando(false);
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
      {/* Modal de Deleção */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirmar Exclusão
                </h3>
                <p className="text-sm text-gray-500">Esta ação não pode ser desfeita</p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-700 mb-2 break-words">
                Você está prestes a deletar o silo:{" "}
                <strong className="text-gray-900">{deleteModal.silo?.nome}</strong>
              </p>
              
              {deleteModal.silo?.integrado && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800 font-medium">
                    ⚠️ ATENÇÃO: Este silo está integrado!
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Todas as leituras serão excluídas. Pressione o botão do ESP32 por 3 segundos para resetar.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal({ show: false, silo: null })}
                disabled={processando}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={processando}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
              >
                {processando ? "Deletando..." : "Sim, deletar tudo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Desintegração */}
      {desintegrarModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <LinkSlashIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirmar Desintegração
                </h3>
                <p className="text-sm text-gray-500">Desvincular ESP32 do sistema</p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-gray-700 mb-2 break-words">
                Desintegrar o silo:{" "}
                <strong className="text-gray-900">{desintegrarModal.silo?.nome}</strong>
              </p>
              
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800 font-medium">
                  📡 O que acontecerá:
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                  <li>Silo será desvinculado no sistema</li>
                  <li>Pressione o botão do ESP32 por 3s para resetar</li>
                  <li>Após reset, ficará disponível para nova integração</li>
                  <li>Dados históricos serão mantidos no banco</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDesintegrarModal({ show: false, silo: null })}
                disabled={processando}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDesintegrarConfirm}
                disabled={processando}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium disabled:opacity-50"
              >
                {processando ? "Desintegrando..." : "Sim, desintegrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Lista de Silos</h3>
          <p className="text-gray-500 text-sm mt-1">
            {silos.length} {silos.length === 1 ? "silo cadastrado" : "silos cadastrados"}
          </p>
        </div>
        <button
          onClick={fetchSilos}
          disabled={processando}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
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
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[150px]">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[120px]">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[120px]">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[180px]">
                  Dispositivo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[180px]">
                  MAC Address
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[120px]">
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
                          disabled={processando}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
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
                          disabled={processando}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
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
                      <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[180px]" title={silo.dispositivo || "-"}>
                        {silo.dispositivo || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600 truncate max-w-[180px]" title={silo.macAddress || "-"}>
                        {silo.macAddress || "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleSaveEdit(silo._id)}
                          disabled={processando}
                          className="text-green-600 hover:text-green-800 mr-3 disabled:opacity-50"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={processando}
                          className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                        >
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[150px]" title={silo.nome}>
                        {silo.nome}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getTipoLabel(silo.tipoSilo)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
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
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono truncate max-w-[180px]" title={silo.dispositivo || "-"}>
                        {silo.dispositivo || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600 truncate max-w-[180px]" title={silo.macAddress || "-"}>
                        {silo.macAddress || "-"}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(silo)}
                          disabled={processando}
                          className="text-blue-600 hover:text-blue-800 transition inline-flex items-center disabled:opacity-50"
                          title="Editar"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        
                        {silo.integrado && (
                          <button
                            onClick={() => handleDesintegrarClick(silo)}
                            disabled={processando}
                            className="text-orange-600 hover:text-orange-800 transition inline-flex items-center disabled:opacity-50"
                            title="Desintegrar"
                          >
                            <LinkSlashIcon className="h-5 w-5" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteClick(silo)}
                          disabled={processando}
                          className="text-red-600 hover:text-red-800 transition inline-flex items-center disabled:opacity-50"
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
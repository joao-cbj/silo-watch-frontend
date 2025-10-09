import React, { useState, useEffect } from "react";
import { XMarkIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import api from "../services/api";

const ReportsWindow = ({ onClose }) => {
  const [dispositivos, setDispositivos] = useState([]);
  const [dispositivoId, setDispositivoId] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // Busca os dispositivos existentes (a partir das leituras)
  useEffect(() => {
    const fetchDispositivos = async () => {
      try {
        const res = await api.get("/api/dados/ultimas");
        if (res.data.success) {
          const lista = res.data.data.map((d) => ({
            id: d.dispositivo,
            nome: d.dispositivo,
          }));
          setDispositivos(lista);
        }
      } catch (err) {
        console.error("Erro ao buscar dispositivos:", err);
      }
    };
    fetchDispositivos();
  }, []);

  const handleExportar = async () => {
    if (!dispositivoId || !dataInicio || !dataFim) {
      alert("Selecione o dispositivo e o intervalo de datas.");
      return;
    }

    try {
      const res = await api.get("/api/dados/exportar", {
        params: { dispositivoId, de: dataInicio, ate: dataFim },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `relatorio_${dispositivoId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Erro ao exportar CSV:", err);
      alert("Erro ao exportar CSV.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-md"
        onClick={onClose}
      ></div>

      <div className="relative w-[600px] bg-white rounded-xl shadow-2xl z-10 p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-lg"
        >
          <XMarkIcon className="h-6 w-6 text-gray-600" />
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Relatórios
        </h2>

        <div className="flex flex-col space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dispositivo
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2"
              value={dispositivoId}
              onChange={(e) => setDispositivoId(e.target.value)}
            >
              <option value="">Selecione...</option>
              {dispositivos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg p-2"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Final
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg p-2"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleExportar}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition duration-150"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Exportar CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsWindow;

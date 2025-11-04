import React, { useState, useEffect } from "react";
import {
  DocumentArrowDownIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import api from "../../../services/api";
import axios from "axios";

const ANALYTICS_API =
  import.meta.env.VITE_ANALYTICS_API_URL || "http://localhost:8000";

const ReportsTab = ({ activeTab, setActiveTab }) => {
  const [dispositivos, setDispositivos] = useState([]);
  const [dispositivoId, setDispositivoId] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: "tab1", name: "Dados Brutos" },
    { id: "tab2", name: "Estatísticas" },
    { id: "tab3", name: "Anomalias" },
    { id: "tab4", name: "Tendências" },
  ];

  useEffect(() => {
    fetchDispositivos();
  }, []);

  const fetchDispositivos = async () => {
    try {
      const res = await api.get("/api/dados/ultimas");
      if (res.data.success) {
        const lista = res.data.data.map((d) => ({
          id: d.dispositivo,
          nome: d.dispositivo,
        }));
        setDispositivos(lista);
        if (lista.length > 0) {
          setDispositivoId(lista[0].id);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar dispositivos:", err);
    }
  };

  const handleExportRawData = async () => {
    if (!dispositivoId || !dataInicio || !dataFim) {
      alert("Selecione o dispositivo e o intervalo de datas.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/api/dados/exportar", {
        params: { dispositivo: dispositivoId, inicio: dataInicio, fim: dataFim },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `dados_brutos_${dispositivoId}_${dataInicio}_${dataFim}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Erro ao exportar CSV:", err);
      alert("Erro ao exportar CSV.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportStatistics = async () => {
    if (!dispositivoId || !dataInicio || !dataFim) {
      alert("Selecione o dispositivo e o intervalo de datas.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${ANALYTICS_API}/api/analytics/estatisticas/${dispositivoId}`,
        {
          params: { start_date: dataInicio, end_date: dataFim },
        }
      );

      const data = response.data;
      const csv = convertToCSV(data);
      downloadCSV(
        csv,
        `estatisticas_${dispositivoId}_${dataInicio}_${dataFim}.csv`
      );
    } catch (err) {
      console.error("Erro ao exportar estatísticas:", err);
      alert("Erro ao exportar estatísticas.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportAnomalies = async () => {
    if (!dispositivoId) {
      alert("Selecione o dispositivo.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${ANALYTICS_API}/api/analytics/anomalias/${dispositivoId}?hours=168`
      );

      const data = response.data;
      const csv = convertAnomaliesCSV(data);
      downloadCSV(csv, `anomalias_${dispositivoId}_7dias.csv`);
    } catch (err) {
      console.error("Erro ao exportar anomalias:", err);
      alert("Erro ao exportar anomalias.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportTrends = async () => {
    if (!dispositivoId) {
      alert("Selecione o dispositivo.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${ANALYTICS_API}/api/analytics/tendencias/${dispositivoId}?days=30`
      );

      const data = response.data;
      const csv = convertTrendsCSV(data);
      downloadCSV(csv, `tendencias_${dispositivoId}_30dias.csv`);
    } catch (err) {
      console.error("Erro ao exportar tendências:", err);
      alert("Erro ao exportar tendências.");
    } finally {
      setLoading(false);
    }
  };

  const convertToCSV = (data) => {
    const headers = ["Métrica", "Valor"];
    const rows = [
      ["Dispositivo", data.dispositivo],
      ["Período Início", data.periodo.inicio],
      ["Período Fim", data.periodo.fim],
      ["Total Leituras", data.total_leituras],
      ["Temperatura Média", data.temperatura.media],
      ["Temperatura Mínima", data.temperatura.minimo],
      ["Temperatura Máxima", data.temperatura.maximo],
      ["Temperatura Desvio Padrão", data.temperatura.desvio_padrao],
      ["Umidade Média", data.umidade.media],
      ["Umidade Mínima", data.umidade.minimo],
      ["Umidade Máxima", data.umidade.maximo],
      ["Umidade Desvio Padrão", data.umidade.desvio_padrao],
    ];

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  const convertAnomaliesCSV = (data) => {
    const headers = ["Timestamp", "Tipo", "Valor", "Z-Score", "Gravidade"];
    const rows = data.anomalias.map((a) => [
      a.timestamp,
      a.tipo,
      a.valor,
      a.zscore,
      a.gravidade,
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  const convertTrendsCSV = (data) => {
    const headers = [
      "Métrica",
      "Tendência",
      "Variação/Hora",
      "Variação/Dia",
      "R²",
      "Confiabilidade",
    ];
    const rows = [
      [
        "Temperatura",
        data.temperatura.tendencia,
        data.temperatura.variacao_por_hora,
        data.temperatura.variacao_por_dia,
        data.temperatura.r_squared,
        data.temperatura.confiabilidade,
      ],
      [
        "Umidade",
        data.umidade.tendencia,
        data.umidade.variacao_por_hora,
        data.umidade.variacao_por_dia,
        data.umidade.r_squared,
        data.umidade.confiabilidade,
      ],
    ];

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const renderTabContent = () => {
    const commonFilters = (
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dispositivo
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2"
              value={dispositivoId}
              onChange={(e) => setDispositivoId(e.target.value)}
            >
              {dispositivos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome}
                </option>
              ))}
            </select>
          </div>
          {activeTab === "tab1" && (
            <>
              <div>
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
              <div>
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
            </>
          )}
        </div>
      </div>
    );

    switch (activeTab) {
      case "tab1":
        return (
          <>
            {commonFilters}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
              <h5 className="font-semibold text-blue-800 mb-2">
                📄 Dados Brutos
              </h5>
              <p className="text-sm text-gray-700">
                Exporta todas as leituras brutas do sensor no período
                selecionado. Formato: CSV com timestamp, temperatura, umidade.
              </p>
            </div>
            <button
              onClick={handleExportRawData}
              disabled={loading}
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition duration-150 w-full disabled:opacity-50"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              {loading ? "Exportando..." : "Exportar Dados Brutos"}
            </button>
          </>
        );
      case "tab2":
        return (
          <>
            {commonFilters}
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-4">
              <h5 className="font-semibold text-green-800 mb-2">
                📊 Estatísticas
              </h5>
              <p className="text-sm text-gray-700">
                Relatório com médias, mínimos, máximos, desvio padrão e quartis
                do período selecionado.
              </p>
            </div>
            <button
              onClick={handleExportStatistics}
              disabled={loading}
              className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition duration-150 w-full disabled:opacity-50"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              {loading ? "Exportando..." : "Exportar Estatísticas"}
            </button>
          </>
        );
      case "tab3":
        return (
          <>
            {commonFilters}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-4">
              <h5 className="font-semibold text-yellow-800 mb-2">
                ⚠️ Anomalias
              </h5>
              <p className="text-sm text-gray-700">
                Lista de todas as leituras anormais detectadas pela IA nos
                últimos 7 dias (Z-score &gt; 3).
              </p>
            </div>
            <button
              onClick={handleExportAnomalies}
              disabled={loading}
              className="flex items-center justify-center bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded-lg font-semibold transition duration-150 w-full disabled:opacity-50"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              {loading ? "Exportando..." : "Exportar Anomalias"}
            </button>
          </>
        );
      case "tab4":
        return (
          <>
            {commonFilters}
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded mb-4">
              <h5 className="font-semibold text-purple-800 mb-2">
                📈 Tendências
              </h5>
              <p className="text-sm text-gray-700">
                Análise de regressão linear dos últimos 30 dias. Inclui
                variação por hora/dia e confiabilidade.
              </p>
            </div>
            <button
              onClick={handleExportTrends}
              disabled={loading}
              className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition duration-150 w-full disabled:opacity-50"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              {loading ? "Exportando..." : "Exportar Tendências"}
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        Relatórios e Exportação
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Exporte análises em formato CSV para uso externo
      </p>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Conteúdo da tab */}
      {renderTabContent()}
    </div>
  );
};

export default ReportsTab;
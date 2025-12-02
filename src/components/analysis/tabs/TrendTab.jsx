import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../../../services/api";
import HistoricoGrafico from "../../dashboard/HistoricoGrafico";

const ANALYTICS_API = import.meta.env.VITE_ANALYTICS_API_URL || "http://localhost:8000";

const TrendTab = () => {
  const [dispositivos, setDispositivos] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [period, setPeriod] = useState("7");
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchTrends();
    }
  }, [selectedDevice, period]);

  const fetchDevices = async () => {
    try {
      const response = await api.get("/api/dados/ultimas");
      if (response.data.success) {
        setDispositivos(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedDevice(response.data.data[0].dispositivo);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dispositivos:", error);
    }
  };

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${ANALYTICS_API}/api/analytics/tendencias/${selectedDevice}?days=${period}`
      );
      setTrends(response.data);
    } catch (error) {
      console.error("Erro ao buscar tendências:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        Análise de Tendências
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Identificação de padrões e variações ao longo do tempo
      </p>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dispositivo
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2"
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
            >
              {dispositivos.map((d) => (
                <option key={d.dispositivo} value={d.dispositivo}>
                  {d.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Período
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg p-2"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="1">Último dia</option>
              <option value="7">Última semana</option>
              <option value="15">Últimos 15 dias</option>
              <option value="30">Último mês</option>
            </select>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h4 className="text-lg font-semibold text-gray-700 mb-4">
          Histórico de Leituras
        </h4>
        {selectedDevice && (
          <HistoricoGrafico dispositivoId={selectedDevice} />
        )}
      </div>

      {/* Análise de Tendências */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Calculando tendências...</p>
        </div>
      ) : trends && !trends.erro ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Temperatura */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg shadow p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              🌡️ Tendência de Temperatura
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span
                  className={`text-sm font-semibold ${
                    trends.temperatura.tendencia === "aumentando"
                      ? "text-red-600"
                      : trends.temperatura.tendencia === "diminuindo"
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  {trends.temperatura.tendencia === "aumentando"
                    ? "↑ Aumentando"
                    : trends.temperatura.tendencia === "diminuindo"
                    ? "↓ Diminuindo"
                    : "→ Estável"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Variação/dia:</span>
                <span className="text-sm font-semibold text-gray-800">
                  {trends.temperatura.variacao_por_dia > 0 ? "+" : ""}
                  {trends.temperatura.variacao_por_dia.toFixed(2)}°C
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Variação/hora:</span>
                <span className="text-sm font-semibold text-gray-800">
                  {trends.temperatura.variacao_por_hora > 0 ? "+" : ""}
                  {trends.temperatura.variacao_por_hora.toFixed(4)}°C
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Confiabilidade:</span>
                <span
                  className={`text-sm font-semibold ${
                    trends.temperatura.confiabilidade === "alta"
                      ? "text-green-600"
                      : trends.temperatura.confiabilidade === "moderada"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {trends.temperatura.confiabilidade}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-orange-200">
                <span className="text-xs text-gray-500">
                  R² = {trends.temperatura.r_squared.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* Umidade */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              💧 Tendência de Umidade
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span
                  className={`text-sm font-semibold ${
                    trends.umidade.tendencia === "aumentando"
                      ? "text-blue-600"
                      : trends.umidade.tendencia === "diminuindo"
                      ? "text-orange-600"
                      : "text-gray-600"
                  }`}
                >
                  {trends.umidade.tendencia === "aumentando"
                    ? "↑ Aumentando"
                    : trends.umidade.tendencia === "diminuindo"
                    ? "↓ Diminuindo"
                    : "→ Estável"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Variação/dia:</span>
                <span className="text-sm font-semibold text-gray-800">
                  {trends.umidade.variacao_por_dia > 0 ? "+" : ""}
                  {trends.umidade.variacao_por_dia.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Variação/hora:</span>
                <span className="text-sm font-semibold text-gray-800">
                  {trends.umidade.variacao_por_hora > 0 ? "+" : ""}
                  {trends.umidade.variacao_por_hora.toFixed(4)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Confiabilidade:</span>
                <span
                  className={`text-sm font-semibold ${
                    trends.umidade.confiabilidade === "alta"
                      ? "text-green-600"
                      : trends.umidade.confiabilidade === "moderada"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {trends.umidade.confiabilidade}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-blue-200">
                <span className="text-xs text-gray-500">
                  R² = {trends.umidade.r_squared.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Selecione um dispositivo para ver as tendências
        </div>
      )}
    </div>
  );
};

export default TrendTab;
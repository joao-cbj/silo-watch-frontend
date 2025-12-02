import React, { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, Cell } from "recharts";
import { AlertCircle, TrendingUp, TrendingDown, Droplets, Thermometer, Clock, ChartBar } from "lucide-react";
import api from "../../../services/api";
import axios from "axios";

const ANALYTICS_API = import.meta.env.VITE_ANALYTICS_API_URL || "http://localhost:8000";

const IndicatorsTab = ({ activeTab, setActiveTab }) => {
  const [dispositivos, setDispositivos] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [period, setPeriod] = useState("7");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tabs = [
    { id: "tab1", name: "Amplitude Térmica", endpoint: "amplitude-termica" },
    { id: "tab2", name: "Taxa de Umidade", endpoint: "taxa-umidade" },
    { id: "tab3", name: "Índice de Risco", endpoint: "indice-fungos" },
    { id: "tab4", name: "Tempo Crítico", endpoint: "tempo-critico" },
  ];

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice && activeTab) {
      fetchIndicatorData();
    }
  }, [selectedDevice, period, activeTab]);

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
      setError("Não foi possível carregar os dispositivos");
    }
  };

  const fetchIndicatorData = async () => {
    if (!selectedDevice || !activeTab) return;

    const currentTab = tabs.find(t => t.id === activeTab);
    if (!currentTab) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${ANALYTICS_API}/api/indicators/${currentTab.endpoint}/${selectedDevice}`,
        { params: { days: parseInt(period) } }
      );
      
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError(response.data.erro || "Erro ao carregar dados");
        setData(null);
      }
    } catch (error) {
      console.error("Erro ao buscar indicador:", error);
      setError(error.response?.data?.detail || "Erro ao conectar com a API de Analytics");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (nivel) => {
    if (!nivel) return "text-gray-600 bg-gray-50";
    const nivelLower = nivel.toLowerCase();
    
    switch (nivelLower) {
      case "baixo": case "baixa": return "text-green-600 bg-green-50 border-green-200";
      case "moderado": case "moderada": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "alto": case "alta": case "alerta": return "text-orange-600 bg-orange-50 border-orange-200";
      case "crítico": case "critico": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const renderError = () => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
      <p className="text-lg font-semibold text-gray-700">{error}</p>
      <button
        onClick={fetchIndicatorData}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Tentar novamente
      </button>
    </div>
  );

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600">Carregando dados...</p>
    </div>
  );

  const renderNoData = () => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      <ChartBar className="h-16 w-16 text-gray-300 mb-4" />
      <p className="text-lg font-semibold text-gray-700">Sem dados disponíveis</p>
      <p className="text-sm text-gray-500 mt-2">
        Não há dados suficientes para este período
      </p>
    </div>
  );

  const renderTabContent = () => {
    if (loading) return renderLoading();
    if (error) return renderError();
    if (!data) return renderNoData();

    switch (activeTab) {
      case "tab1":
        return renderAmplitudeThermal();
      case "tab2":
        return renderHumidityRate();
      case "tab3":
        return renderFungusRisk();
      case "tab4":
        return renderCriticalTime();
      default:
        return null;
    }
  };

  const renderAmplitudeThermal = () => {
    return (
      <div className="space-y-4">
        {/* Header Info */}
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
          <h5 className="font-semibold text-orange-800 mb-2 flex items-center">
            <Thermometer className="h-5 w-5 mr-2" />
            Amplitude Térmica Diária
          </h5>
          <p className="text-sm text-gray-700 mb-3">
            <strong>Cálculo:</strong> Máx - Mín do dia
          </p>
          <p className="text-sm text-gray-600">
            <strong>Aplicação:</strong> Mede a estabilidade do silo. Alta amplitude indica variações que podem afetar a qualidade dos grãos.
          </p>
        </div>

        {/* Métricas principais */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">Amplitude Média</div>
            <div className="text-2xl font-bold text-orange-600">{data.amplitude_media}°C</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">Amplitude Máxima</div>
            <div className="text-2xl font-bold text-red-600">{data.amplitude_maxima}°C</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">Estabilidade</div>
            <div className={`text-lg font-semibold px-3 py-1 rounded inline-block border ${getRiskColor(data.estabilidade)}`}>
              {data.estabilidade?.toUpperCase() || 'N/A'}
            </div>
          </div>
        </div>

        {/* Alerta */}
        {data.alerta && (
          <div className={`flex items-center p-3 rounded-lg border ${getRiskColor(data.estabilidade)}`}>
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="text-sm font-medium">{data.alerta}</span>
          </div>
        )}

        {/* Gráfico de Amplitude */}
        {data.historico_diario && data.historico_diario.length > 0 && (
          <>
            <div className="bg-white rounded-lg shadow p-4">
              <h6 className="font-semibold text-gray-800 mb-4">Histórico de Amplitude Térmica</h6>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.historico_diario}>
                  <defs>
                    <linearGradient id="colorAmplitude" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="data" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} label={{ value: '°C', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                    formatter={(value) => [`${value}°C`, 'Amplitude']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amplitude" 
                    stroke="#f97316" 
                    fillOpacity={1}
                    fill="url(#colorAmplitude)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de Temperatura Min/Max */}
            <div className="bg-white rounded-lg shadow p-4">
              <h6 className="font-semibold text-gray-800 mb-4">Temperaturas Mínimas e Máximas</h6>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.historico_diario}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="data"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} label={{ value: '°C', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                    formatter={(value) => `${value}°C`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="temp_maxima" stroke="#ef4444" name="Máxima" strokeWidth={2} />
                  <Line type="monotone" dataKey="temp_minima" stroke="#3b82f6" name="Mínima" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderHumidityRate = () => {
    const taxaData = [
      { periodo: 'Variação Absoluta Média', valor: data.taxa_abs_media || 0 },
      { periodo: 'Maior Aumento', valor: Math.max(0, data.taxa_maxima_aumento_por_hora || 0) },
      { periodo: 'Maior Diminuição', valor: Math.abs(Math.min(0, data.taxa_maxima_diminuicao_por_hora || 0)) },
    ];

    const isIncreasing = (data.taxa_media_por_hora || 0) > 0;

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <h5 className="font-semibold text-blue-800 mb-2 flex items-center">
            <Droplets className="h-5 w-5 mr-2" />
            Taxa de Variação de Umidade (ΔU/Δt)
          </h5>
          <p className="text-sm text-gray-700 mb-3">
            <strong>Cálculo:</strong> Mudança percentual por hora/dia
          </p>
          <p className="text-sm text-gray-600">
            <strong>Aplicação:</strong> Indica infiltração ou falha na vedação. Umidade variando &gt;2%/dia é sinal de alerta.
          </p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">Taxa Média/Hora</div>
            <div className={`text-2xl font-bold ${isIncreasing ? 'text-red-600' : 'text-blue-600'}`}>
              {isIncreasing ? '+' : ''}{data.taxa_media_por_hora}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {data.tendencia ? `Tendência: ${data.tendencia}` : ''}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">Variação Absoluta</div>
            <div className="text-2xl font-bold text-orange-600">{data.taxa_abs_media}%</div>
            <div className="text-xs text-gray-500 mt-1">Média das variações</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">Nível de Risco</div>
            <div className={`text-lg font-semibold px-3 py-1 rounded inline-block border ${getRiskColor(data.risco)}`}>
              {data.risco?.toUpperCase() || 'N/A'}
            </div>
          </div>
        </div>

        {/* Alerta */}
        {data.alerta && (
          <div className={`flex items-center p-3 rounded-lg border ${getRiskColor(data.risco)}`}>
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="text-sm font-medium">{data.alerta}</span>
          </div>
        )}

        {/* Gráfico de Taxas */}
        <div className="bg-white rounded-lg shadow p-4">
          <h6 className="font-semibold text-gray-800 mb-4">Análise de Variações</h6>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taxaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} label={{ value: 'Taxa (%/h)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${value.toFixed(3)}%/h`} />
              <Bar dataKey="valor" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                {taxaData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={
                    index === 0 ? '#f59e0b' : 
                    index === 1 ? '#ef4444' : '#3b82f6'
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Indicador de tendência */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Taxa Média Diária</div>
              <div className={`text-3xl font-bold ${isIncreasing ? 'text-red-600' : 'text-blue-600'}`}>
                {isIncreasing ? '+' : ''}{data.taxa_media_por_dia}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {data.total_leituras_analisadas} leituras analisadas
              </div>
            </div>
            <div className={`flex items-center ${Math.abs(data.taxa_abs_media || 0) > 2 ? 'text-red-600' : 'text-green-600'}`}>
              {isIncreasing ? (
                <TrendingUp className="h-12 w-12" />
              ) : (
                <TrendingDown className="h-12 w-12" />
              )}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Maior aumento:</span>
              <span className="font-semibold text-red-600">+{data.taxa_maxima_aumento_por_hora}%/h</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">Maior diminuição:</span>
              <span className="font-semibold text-blue-600">{data.taxa_maxima_diminuicao_por_hora}%/h</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFungusRisk = () => {
    const distribuicaoData = [
      { status: 'Normal', horas: data.horas_normais, cor: '#22c55e' },
      { status: 'Alerta', horas: data.horas_alerta, cor: '#f59e0b' },
      { status: 'Crítico', horas: data.horas_criticas, cor: '#ef4444' },
    ];

    return (
      <div className="space-y-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <h5 className="font-semibold text-red-800 mb-2 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Índice de Risco de Fungos (IRF)
          </h5>
          <p className="text-sm text-gray-700 mb-3">
            <strong>Cálculo:</strong> Função de T e UR alta (&gt;30°C e &gt;75%)
          </p>
          <p className="text-sm text-gray-600">
            <strong>Aplicação:</strong> Prevenção de contaminação. IRF alto = condições ideais para fungos.
          </p>
        </div>

        {/* Métricas IRF */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">IRF Médio</div>
            <div className="text-2xl font-bold text-orange-600">{data.irf_medio}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">IRF Máximo</div>
            <div className="text-2xl font-bold text-red-600">{data.irf_maximo}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">Nível de Risco</div>
            <div className={`text-lg font-semibold px-3 py-1 rounded inline-block border ${getRiskColor(data.nivel_risco)}`}>
              {data.nivel_risco?.toUpperCase() || 'N/A'}
            </div>
          </div>
        </div>

        {/* Recomendação */}
        {data.recomendacao && (
          <div className={`flex items-center p-3 rounded-lg border ${getRiskColor(data.nivel_risco)}`}>
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="text-sm font-medium">{data.recomendacao}</span>
          </div>
        )}

        {/* Distribuição de Horas */}
        <div className="bg-white rounded-lg shadow p-4">
          <h6 className="font-semibold text-gray-800 mb-4">Distribuição de Horas por Risco</h6>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distribuicaoData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="status" type="category" tick={{ fontSize: 12 }} width={80} />
              <Tooltip formatter={(value) => `${value} horas`} />
              <Bar dataKey="horas" radius={[0, 8, 8, 0]}>
                {distribuicaoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Percentual Crítico */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h6 className="font-semibold text-gray-800">Tempo em Condição Crítica</h6>
            <span className="text-2xl font-bold text-red-600">{data.percentual_critico}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-red-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(data.percentual_critico, 100)}%` }}
            ></div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {data.horas_criticas} de {data.horas_criticas + data.horas_alerta + data.horas_normais} horas analisadas
          </div>
        </div>
      </div>
    );
  };

  const renderCriticalTime = () => {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <h5 className="font-semibold text-yellow-800 mb-2 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Horas Acima de Limite Crítico (TAC)
          </h5>
          <p className="text-sm text-gray-700 mb-3">
            <strong>Cálculo:</strong> Tempo acumulado com T&gt;35°C
          </p>
          <p className="text-sm text-gray-600">
            <strong>Aplicação:</strong> Mede exposição a risco de deterioração. Mais de 6h críticas = ação urgente.
          </p>
        </div>

        {/* Métricas principais */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">Horas Acima 35°C</div>
            <div className="text-2xl font-bold text-yellow-600">{data.horas_acima_35c}h</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">Temp. Máxima</div>
            <div className="text-2xl font-bold text-red-600">{data.temperatura_maxima_registrada}°C</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">Nível de Risco</div>
            <div className={`text-lg font-semibold px-3 py-1 rounded inline-block border ${getRiskColor(data.nivel_risco)}`}>
              {data.nivel_risco?.toUpperCase() || 'N/A'}
            </div>
          </div>
        </div>

        {/* Ação Recomendada */}
        {data.acao_recomendada && (
          <div className={`flex items-center p-3 rounded-lg border ${getRiskColor(data.nivel_risco)}`}>
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="text-sm font-medium">{data.acao_recomendada}</span>
          </div>
        )}

        {/* Percentual Crítico Visual */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h6 className="font-semibold text-gray-800">Exposição ao Risco</h6>
            <span className="text-2xl font-bold text-yellow-600">{data.percentual_critico}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className={`h-4 rounded-full transition-all duration-500 ${
                data.percentual_critico > 10 ? 'bg-red-600' : 
                data.percentual_critico > 5 ? 'bg-yellow-600' : 'bg-green-600'
              }`}
              style={{ width: `${Math.min(data.percentual_critico, 100)}%` }}
            ></div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {data.horas_acima_35c} de {data.total_horas_analisadas} horas em condição crítica
          </div>
        </div>

        {/* Períodos Críticos Timeline */}
        {data.periodos_criticos && data.periodos_criticos.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <h6 className="font-semibold text-gray-800 mb-4">Períodos Críticos Registrados</h6>
            <div className="space-y-3">
              {data.periodos_criticos.map((periodo, index) => (
                <div key={index} className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium text-gray-700">
                      Período {index + 1}
                    </div>
                    <div className="text-sm font-bold text-red-600">
                      {periodo.temp_maxima}°C
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    <div>
                      {new Date(periodo.inicio).toLocaleString('pt-BR')} até{' '}
                      {new Date(periodo.fim).toLocaleString('pt-BR')}
                    </div>
                    <div className="mt-1">
                      Duração: <span className="font-medium">{periodo.duracao_horas}h</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        Indicadores Avançados
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Métricas específicas para análise de qualidade e risco
      </p>

      {/* Controles */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dispositivo
          </label>
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={dispositivos.length === 0}
          >
            {dispositivos.length === 0 ? (
              <option>Carregando dispositivos...</option>
            ) : (
              dispositivos.map((d) => (
                <option key={d.dispositivo} value={d.dispositivo}>
                  {d.nome}
                </option>
              ))
            )}
          </select>
        </div>
        <div className="w-48">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período (dias)
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7">7 dias</option>
            <option value="15">15 dias</option>
            <option value="30">30 dias</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
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
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default IndicatorsTab;
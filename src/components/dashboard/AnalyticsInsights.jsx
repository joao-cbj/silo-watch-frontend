import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LightBulbIcon, 
  ExclamationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/solid';

const ANALYTICS_API = import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:8000';

const AnalyticsInsights = ({ deviceId }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, [deviceId]);

  const fetchInsights = async () => {
    if (!deviceId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `${ANALYTICS_API}/api/analytics/resumo-dispositivo/${deviceId}?days=7`
      );
      setInsights(response.data);
    } catch (error) {
      console.error('Erro ao buscar insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  const getTrendIcon = (tendencia) => {
    if (tendencia === 'aumentando') {
      return <ArrowTrendingUpIcon className="h-5 w-5 text-red-500" />;
    } else if (tendencia === 'diminuindo') {
      return <ArrowTrendingDownIcon className="h-5 w-5 text-blue-500" />;
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 shadow-md">
      <div className="flex items-center mb-4">
        <LightBulbIcon className="h-6 w-6 text-yellow-500 mr-2" />
        <h3 className="text-xl font-bold text-gray-800">Insights Inteligentes</h3>
      </div>

      <div className="space-y-4">
        {/* Anomalias */}
        {insights.anomalias && insights.anomalias.total_anomalias > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-start">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">
                  {insights.anomalias.total_anomalias} anomalia(s) detectada(s)
                </p>
                <p className="text-sm text-red-600 mt-1">
                  Leituras fora do padrão nas últimas {insights.anomalias.periodo_horas}h
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tendências */}
        {insights.tendencias && (
          <div className="space-y-2">
            <div className="bg-white p-3 rounded shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Temperatura</span>
                {getTrendIcon(insights.tendencias.temperatura.tendencia)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {insights.tendencias.temperatura.tendencia} 
                {' '}({insights.tendencias.temperatura.variacao_por_dia.toFixed(2)}°C/dia)
              </p>
            </div>

            <div className="bg-white p-3 rounded shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Umidade</span>
                {getTrendIcon(insights.tendencias.umidade.tendencia)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {insights.tendencias.umidade.tendencia}
                {' '}({insights.tendencias.umidade.variacao_por_dia.toFixed(2)}%/dia)
              </p>
            </div>
          </div>
        )}

        {/* Conforto */}
        {insights.conforto && (
          <div className="bg-white p-4 rounded shadow-sm">
            <p className="text-sm font-medium text-gray-700 mb-2">Análise de Conforto</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">Ambiente confortável:</span>
              <span className="text-lg font-bold text-green-600">
                {insights.conforto.percentual_confortavel}%
              </span>
            </div>
            {insights.conforto.recomendacoes && insights.conforto.recomendacoes.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-1">Recomendações:</p>
                {insights.conforto.recomendacoes.map((rec, index) => (
                  <p key={index} className="text-xs text-gray-600 mb-1">• {rec}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Insights gerais */}
        {insights.insights && insights.insights.length > 0 && (
          <div className="bg-white p-4 rounded shadow-sm">
            <p className="text-sm font-medium text-gray-700 mb-2">Resumo Executivo</p>
            <ul className="space-y-1">
              {insights.insights.map((insight, index) => (
                <li key={index} className="text-xs text-gray-600 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Powered by Python Analytics API + AI
      </div>
    </div>
  );
};

export default AnalyticsInsights;
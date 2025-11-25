import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  CloudIcon,
  ArrowTrendingUpIcon,
  BeakerIcon,
  FireIcon,
  SparklesIcon,
  XCircleIcon
} from '@heroicons/react/24/solid';
import axios from 'axios';
import api from '../../services/api';

const ANALYTICS_API = import.meta.env.VITE_ANALYTICS_API_URL || 'http://localhost:8000';

const MetricCards = ({ silos }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [siloStats, setSiloStats] = useState({ total: 0, ativos: 0, inativos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, [silos]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchSiloStatistics(),
      fetchMetrics(),
      fetchWeatherData(),
      fetchAnalytics()
    ]);
    setLoading(false);
  };

  const fetchSiloStatistics = async () => {
    try {
      const response = await api.get('/api/silos/estatisticas');
      if (response.data.success) {
        setSiloStats(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      setSiloStats({
        total: silos.length,
        ativos: silos.filter(s => s.integrado).length,
        inativos: silos.filter(s => !s.integrado).length
      });
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(`${ANALYTICS_API}/api/metrics/global`);
      
      if (response.data.success && response.data.data) {
        setMetrics(response.data.data);
      } else {
        setMetrics(calculateLocalMetrics());
      }
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      setMetrics(calculateLocalMetrics());
    }
  };

  const calculateLocalMetrics = () => {
    if (!silos || silos.length === 0) return null;
    
    const temperaturas = silos.map(s => s.temperatura);
    const umidades = silos.map(s => s.umidade);
    
    return {
      silos_ativos: silos.length,
      silos_em_alerta: silos.filter(s => s.temperatura >= 35 || s.umidade >= 80).length,
      temperatura: {
        media: temperaturas.reduce((a, b) => a + b, 0) / temperaturas.length,
        minima: Math.min(...temperaturas),
        maxima: Math.max(...temperaturas),
        variacao: Math.max(...temperaturas) - Math.min(...temperaturas)
      },
      umidade: {
        media: umidades.reduce((a, b) => a + b, 0) / umidades.length,
        minima: Math.min(...umidades),
        maxima: Math.max(...umidades),
        variacao: Math.max(...umidades) - Math.min(...umidades)
      }
    };
  };

  const fetchWeatherData = async () => {
    try {
      const lat = silos[0]?.latitude || -8.05;
      const lon = silos[0]?.longitude || -34.9;
      
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m&timezone=America/Recife`
      );
      setWeatherData(response.data.current);
    } catch (error) {
      console.error('Erro ao buscar clima:', error);
    }
  };

  const fetchAnalytics = async () => {
    if (silos.length === 0) return;
    
    try {
      const deviceId = silos[0].dispositivo;
      const response = await axios.get(
        `${ANALYTICS_API}/api/analytics/anomalias/${deviceId}?hours=24`
      );
      
      setAnalytics(response.data);
    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
      setAnalytics({ total_anomalias: 0 });
    }
  };

  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-9 gap-3">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded p-3 shadow animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-1"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total de Silos',
      value: siloStats.total,
      subtitle: `${siloStats.total} cadastrados`,
      icon: CheckCircleIcon,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Silos Ativos',
      value: siloStats.ativos,
      subtitle: 'Integrados',
      icon: CheckCircleIcon,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Silos Inativos',
      value: siloStats.inativos,
      subtitle: 'Aguardando',
      icon: XCircleIcon,
      color: siloStats.inativos > 0 ? 'gray' : 'green',
      bgColor: siloStats.inativos > 0 ? 'bg-gray-50' : 'bg-green-50',
      iconColor: siloStats.inativos > 0 ? 'text-gray-600' : 'text-green-600'
    },
    {
      title: 'Silos em Alerta',
      value: metrics.silos_em_alerta,
      subtitle: metrics.silos_em_alerta > 0 ? 'Atenção' : 'Normal',
      icon: ExclamationTriangleIcon,
      color: metrics.silos_em_alerta > 0 ? 'red' : 'green',
      bgColor: metrics.silos_em_alerta > 0 ? 'bg-red-50' : 'bg-green-50',
      iconColor: metrics.silos_em_alerta > 0 ? 'text-red-600' : 'text-green-600'
    },
    {
      title: 'Clima Externo',
      value: weatherData ? `${weatherData.temperature_2m?.toFixed(1)}°C` : '--',
      subtitle: weatherData ? `${weatherData.relative_humidity_2m}% umid` : 'Carregando...',
      icon: CloudIcon,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Temp. Média',
      value: `${metrics.temperatura.media.toFixed(1)}°C`,
      subtitle: `Var: ${metrics.temperatura.variacao.toFixed(1)}°C`,
      icon: FireIcon,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Umid. Média',
      value: `${metrics.umidade.media.toFixed(1)}%`,
      subtitle: `${metrics.umidade.minima.toFixed(1)}% - ${metrics.umidade.maxima.toFixed(1)}%`,
      icon: BeakerIcon,
      color: 'cyan',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600'
    },
    {
      title: 'Anomalias 24h',
      value: analytics?.total_anomalias || 0,
      subtitle: 'Detecções IA',
      icon: SparklesIcon,
      color: analytics?.total_anomalias > 0 ? 'yellow' : 'green',
      bgColor: analytics?.total_anomalias > 0 ? 'bg-yellow-50' : 'bg-green-50',
      iconColor: analytics?.total_anomalias > 0 ? 'text-yellow-600' : 'text-green-600'
    },
    {
      title: 'Tendência',
      value: metrics.temperatura.media > 30 ? '↑ Subindo' : metrics.temperatura.media < 20 ? '↓ Caindo' : '→ Estável',
      subtitle: 'Análise preditiva',
      icon: ArrowTrendingUpIcon,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-9 gap-3">
      {cards.map((card, index) => (
        <div 
          key={index}
          className={`${card.bgColor} rounded p-3 shadow hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-semibold text-gray-700">{card.title}</h3>
            <card.icon className={`h-5 w-5 ${card.iconColor}`} />
          </div>
          <div className="mb-0.5">
            <p className={`text-xl font-bold text-${card.color}-600`}>
              {card.value}
            </p>
          </div>
          <p className="text-[10px] text-gray-600 leading-tight">{card.subtitle}</p>
        </div>
      ))}
    </div>
  );
};

export default MetricCards;
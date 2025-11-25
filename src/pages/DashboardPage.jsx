import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import SiloCard from '../components/SiloCard';
import SiloTable from '../components/dashboard/SiloTable';
import MetricCards from '../components/dashboard/MetricCards';
import AnalyticsInsights from '../components/dashboard/AnalyticsInsights';
import HistoricoGrafico from '../components/dashboard/HistoricoGrafico';
import TabelaCriticos from '../components/dashboard/TabelaCriticos';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

const DashboardPage = () => {
  const [silos, setSilos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [viewMode, setViewMode] = useState('simples');
  const intervalRef = useRef(null);

  const fetchData = async () => {
    setError(null);

    try {
      const response = await api.get('/api/dados/ultimas');

      if (response.data.success) {
        setSilos(response.data.data);
        setLastUpdated(new Date());
      } else {
        setError('Erro ao buscar dados');
      }
    } catch (error) {
      console.error("Erro ao buscar dados dos silos:", error);

      if (error.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Erro ao conectar com o servidor');
      }
    }
  };

  const handleManualRefresh = async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  };

  useEffect(() => {
    handleManualRefresh();
    intervalRef.current = setInterval(handleManualRefresh, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Dashboard de Monitoramento</h2>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-0.5">
              <button
                onClick={() => setViewMode('simples')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'simples'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Visão Simples
              </button>
              <button
                onClick={() => setViewMode('detalhada')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'detalhada'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Visão Detalhada
              </button>
            </div>

            <span className="text-sm text-gray-500">
              Atualizado em: {lastUpdated.toLocaleTimeString('pt-BR')}
            </span>
            <button 
              onClick={handleManualRefresh} 
              disabled={loading} 
              className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 disabled:bg-gray-400 flex items-center transition-colors w-[130px] justify-center"
            >
              <ArrowPathIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Atualizando...' : 'Atualizar'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {loading && silos.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <ArrowPathIcon className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
              <p className="text-gray-600">Carregando dados dos silos...</p>
            </div>
          </div>
        ) : silos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum silo cadastrado ainda</p>
          </div>
        ) : (
          <>
            {viewMode === 'simples' ? (
              <>
                {/* Cards dos Silos - Visão Simples */}
                <div className="flex flex-wrap gap-3 mb-8">
                  {silos.map(silo => (
                    <SiloCard 
                      key={silo._id || silo.dispositivo} 
                      silo={silo} 
                    />
                  ))}
                </div>

                {/* Histórico e Alertas - Visão Simples */}
                <div className="grid grid-cols-2 gap-6" style={{ height: 'calc(100vh - 280px)' }}>
                  <div className="bg-white rounded-lg p-4 shadow flex flex-col overflow-hidden">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Histórico</h3>
                    <div className="flex-1 overflow-auto">
                      <HistoricoGrafico silos={silos} />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow flex flex-col overflow-hidden">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Alertas Críticos</h3>
                    <div className="flex-1 overflow-auto">
                      <TabelaCriticos silos={silos} />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Visão Detalhada */}
                <div className="space-y-6">
                  {/* Tabela de Silos */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      Monitoramento Detalhado dos Silos
                    </h3>
                    <SiloTable silos={silos} />
                  </div>

                  {/* Cards de Métricas */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      Métricas e Analytics
                    </h3>
                    <MetricCards silos={silos} />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
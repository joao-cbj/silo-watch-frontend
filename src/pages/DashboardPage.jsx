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

  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'simples' ? 'detalhada' : 'simples'));
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Dashboard de Monitoramento</h2>
          
          <div className="flex items-center gap-6">
            <label htmlFor="viewModeSwitch" className="flex items-center cursor-pointer select-none">
              <span className="mr-2 text-gray-700 text-sm font-medium">
                {viewMode === 'simples' ? 'Visão Simples' : 'Visão Detalhada'}
              </span>
              <div className="relative">
                <input 
                  id="viewModeSwitch" 
                  type="checkbox" 
                  className="sr-only" 
                  checked={viewMode === 'detalhada'} 
                  onChange={toggleViewMode} 
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full shadow-inner"></div>
                <div 
                  className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${
                    viewMode === 'detalhada' ? 'transform translate-x-5' : ''
                  }`}
                ></div>
              </div>
            </label>

            <span className="text-sm text-gray-500">
              Atualizado em: {lastUpdated.toLocaleTimeString('pt-BR')}
            </span>
            <button 
              onClick={handleManualRefresh} 
              disabled={loading} 
              className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 disabled:bg-gray-400 flex items-center transition-colors"
            >
              <ArrowPathIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Atualizando...' : 'Atualizar'}
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
            <p className="text-gray-500 text-lg mb-4">Nenhum silo cadastrado ainda</p>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
              <PlusIcon className="h-5 w-5 inline mr-2" />
              Adicionar Primeiro Silo
            </button>
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

                  <button className="flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors h-[150px] w-[150px]">
                    <PlusIcon className="h-8 w-8 mb-1" />
                    <span className="font-medium text-xs">Adicionar Silo</span>
                  </button>
                </div>

                {/* Histórico e Alertas - Visão Simples */}
                <div className="flex gap-6">
                  <div className="w-1/2 bg-white rounded-lg p-3 shadow max-h-[400px] overflow-y-auto">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Histórico</h3>
                    <div className="text-sm">
                      <HistoricoGrafico dispositivoId={silos[0]?.dispositivo || "ESP32_SILO_01"} />
                    </div>
                  </div>

                  <div className="w-1/2 bg-white rounded-lg p-3 shadow max-h-[400px] overflow-y-auto">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Alertas Críticos</h3>
                    <div className="text-xs">
                      <TabelaCriticos dispositivoId={silos[0]?.dispositivo || "ESP32_SILO_01"} />
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
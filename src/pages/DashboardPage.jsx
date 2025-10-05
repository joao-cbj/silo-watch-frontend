import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import SiloCard from '../components/SiloCard';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

const DashboardPage = () => {
  const [silos, setSilos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
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
    setLoading(true); // inicia animação
    await fetchData();
    setLoading(false); // finaliza animação
  };

  useEffect(() => {
    // Atualização inicial
    handleManualRefresh();

    // Atualização automática a cada 30 segundos
    intervalRef.current = setInterval(handleManualRefresh, 30000);

    // Limpa intervalo ao desmontar componente
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
          <div className="flex items-center gap-4">
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

        {/* Mensagem de erro */}
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

        {/* Loading state */}
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
          // Grid de silos
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {silos.map(silo => (
              <SiloCard 
                key={silo._id || silo.dispositivo} 
                silo={silo} 
              />
            ))}

            <button className="flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors min-h-[200px]">
              <PlusIcon className="h-12 w-12 mb-2" />
              <span className="font-medium">Adicionar Novo Silo</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const TabelaCriticos = ({ silos = [] }) => {
  const [criticos, setCriticos] = useState([]);
  const [filtroSilo, setFiltroSilo] = useState('todos');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    buscarCriticos();
    const intervalo = setInterval(buscarCriticos, 30000); // Atualiza a cada 30s
    return () => clearInterval(intervalo);
  }, [silos]);

  const buscarCriticos = async () => {
    if (silos.length === 0) return;
    
    setLoading(true);
    try {
      const todasLeiturasCriticas = [];

      // Busca dados críticos de todos os silos
      for (const silo of silos) {
        const response = await api.get(`/api/dados/${silo.dispositivo}?horas=24`);
        
        if (response.data.success) {
          const leiturasCriticas = response.data.dados
            .filter((dado) => dado.temperatura > 30 || dado.umidade > 80)
            .map((dado) => ({
              ...dado,
              dispositivo: silo.dispositivo,
              nomeSilo: silo.nome || silo.dispositivo
            }));
          
          todasLeiturasCriticas.push(...leiturasCriticas);
        }
      }

      // Ordena por timestamp (mais recente primeiro) e limita a 10
      const ordenadas = todasLeiturasCriticas
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);

      setCriticos(ordenadas);
    } catch (err) {
      console.error("Erro ao buscar dados críticos", err);
    } finally {
      setLoading(false);
    }
  };

  const getSeveridadeBadge = (temperatura, umidade) => {
    const isCritico = temperatura > 35 || umidade > 85;
    const isAlto = temperatura > 30 || umidade > 80;

    if (isCritico) {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
          CRÍTICO
        </span>
      );
    } else if (isAlto) {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
          ALTO
        </span>
      );
    }
    return null;
  };

  const criticosFiltrados = filtroSilo === 'todos' 
    ? criticos 
    : criticos.filter(c => c.dispositivo === filtroSilo);

  if (silos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        Nenhum silo disponível
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filtro de Silo */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium text-gray-700">
          Filtrar por Silo:
        </label>
        <select
          value={filtroSilo}
          onChange={(e) => setFiltroSilo(e.target.value)}
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="todos">Todos os Silos</option>
          {silos.map(silo => (
            <option key={silo.dispositivo} value={silo.dispositivo}>
              {silo.nome || silo.dispositivo}
            </option>
          ))}
        </select>
      </div>

      {/* Tabela de Alertas */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Carregando alertas...
          </div>
        ) : criticosFiltrados.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <ExclamationTriangleIcon className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            <p>Nenhum alerta crítico nas últimas 24h</p>
          </div>
        ) : (
          <table className="w-full bg-white shadow rounded overflow-hidden">
            <thead className="bg-red-50 border-b border-red-100">
              <tr>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700">
                  Silo
                </th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700">
                  Severidade
                </th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700">
                  Temperatura
                </th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700">
                  Umidade
                </th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700">
                  Data/Hora
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {criticosFiltrados.map((dado, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 text-xs">
                    <div className="font-medium text-gray-900">
                      {dado.nomeSilo}
                    </div>
                    <div className="text-gray-500 text-[10px]">
                      {dado.dispositivo}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {getSeveridadeBadge(dado.temperatura, dado.umidade)}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`text-xs font-medium ${
                      dado.temperatura > 35 ? 'text-red-600' : 
                      dado.temperatura > 30 ? 'text-orange-600' : 
                      'text-gray-600'
                    }`}>
                      {dado.temperatura.toFixed(1)}°C
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`text-xs font-medium ${
                      dado.umidade > 85 ? 'text-red-600' : 
                      dado.umidade > 80 ? 'text-orange-600' : 
                      'text-blue-600'
                    }`}>
                      {dado.umidade.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-600">
                    <div>
                      {new Date(dado.timestamp).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {new Date(dado.timestamp).toLocaleTimeString('pt-BR')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Contador de alertas */}
      {criticosFiltrados.length > 0 && (
        <div className="text-xs text-gray-500 text-right pt-2 border-t border-gray-200">
          Total: {criticosFiltrados.length} {criticosFiltrados.length === 1 ? 'alerta' : 'alertas'}
        </div>
      )}
    </div>
  );
};

export default TabelaCriticos;
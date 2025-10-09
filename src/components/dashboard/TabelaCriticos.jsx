import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const TabelaCriticos = ({ dispositivoId }) => {
  const [criticos, setCriticos] = useState([]);

  useEffect(() => {
    const buscarCriticos = async () => {
      try {
        const response = await api.get(`/api/dados/${dispositivoId}?horas=24`);
        if (response.data.success) {
          const todasLeituras = response.data.dados;

          const filtradas = todasLeituras
            .filter((dado) => dado.temperatura > 30 || dado.umidade > 80)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);

          setCriticos(filtradas);
        }
      } catch (err) {
        console.error("Erro ao buscar dados críticos", err);
      }
    };

    buscarCriticos();
    const intervalo = setInterval(buscarCriticos, 30000); // Atualiza a cada 30s

    return () => clearInterval(intervalo);
  }, [dispositivoId]);

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4 text-red-600">Últimos Alertas Críticos</h3>
      {criticos.length === 0 ? (
        <p className="text-gray-500">Nenhum dado crítico nas últimas 24h.</p>
      ) : (
        <table className="w-full bg-white shadow rounded overflow-hidden">
          <thead className="bg-red-100 text-red-800">
            <tr>
              <th className="text-left px-4 py-2">Horário</th>
              <th className="text-left px-4 py-2">Temperatura (°C)</th>
              <th className="text-left px-4 py-2">Umidade (%)</th>
            </tr>
          </thead>
          <tbody>
            {criticos.map((dado, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2">{new Date(dado.timestamp).toLocaleString('pt-BR')}</td>
                <td className="px-4 py-2 text-orange-600">{dado.temperatura.toFixed(1)}°C</td>
                <td className="px-4 py-2 text-blue-600">{dado.umidade.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TabelaCriticos;

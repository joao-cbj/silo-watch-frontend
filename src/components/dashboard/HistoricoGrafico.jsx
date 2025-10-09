import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { format, parseISO } from 'date-fns';

const agruparPor60Minutos = (dados) => {
  const agrupados = {};

  dados.forEach((item) => {
    const data = new Date(item.timestamp);
    data.setSeconds(0, 0);
    
    // arredonda o minuto para o múltiplo de 60 mais próximo (0 ou 30)
    const minutos = Math.floor(data.getMinutes() / 60) * 60;
    data.setMinutes(minutos);

    const chave = data.toISOString();

    if (!agrupados[chave]) {
      agrupados[chave] = {
        timestamp: chave,
        temperaturaTotal: 0,
        umidadeTotal: 0,
        count: 0,
      };
    }

    agrupados[chave].temperaturaTotal += item.temperatura;
    agrupados[chave].umidadeTotal += item.umidade;
    agrupados[chave].count += 1;
  });

  return Object.values(agrupados).map((g) => ({
    timestamp: format(parseISO(g.timestamp), 'HH:mm'),
    temperatura: (g.temperaturaTotal / g.count).toFixed(1),
    umidade: (g.umidadeTotal / g.count).toFixed(1),
  }));
};


const HistoricoGrafico = ({ dispositivoId }) => {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const res = await api.get(`/api/dados/${dispositivoId}?horas=24`);
        if (res.data.success) {
          const agrupado = agruparPor60Minutos(res.data.dados);
          setDados(agrupado);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do gráfico:', err);
      }
    };

    fetchDados();
  }, [dispositivoId]);

  if (!dados.length) return null;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-4 w-full">
      <h4 className="text-sm font-semibold mb-2 text-gray-700">Histórico (últimas 24h)</h4>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis domain={[0, 'auto']} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="temperatura" stroke="#EF4444" name="Temperatura (°C)" />
          <Line type="monotone" dataKey="umidade" stroke="#3B82F6" name="Umidade (%)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoricoGrafico;

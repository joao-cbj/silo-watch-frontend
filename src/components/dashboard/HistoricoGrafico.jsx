import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { format, parseISO } from 'date-fns';

const agruparPorIntervalo = (dados, intervalo) => {
  const agrupados = {};
  
  dados.forEach((item) => {
    const data = new Date(item.timestamp);
    data.setSeconds(0, 0);
    
    // Agrupa baseado no intervalo escolhido
    if (intervalo === 60) {
      const minutos = Math.floor(data.getMinutes() / 60) * 60;
      data.setMinutes(minutos);
    } else if (intervalo === 30) {
      const minutos = Math.floor(data.getMinutes() / 30) * 30;
      data.setMinutes(minutos);
    } else if (intervalo === 'hora') {
      data.setMinutes(0);
    } else if (intervalo === 'dia') {
      data.setHours(0, 0, 0, 0);
    }
    
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
    timestamp: g.timestamp,
    temperatura: parseFloat((g.temperaturaTotal / g.count).toFixed(1)),
    umidade: parseFloat((g.umidadeTotal / g.count).toFixed(1)),
  }));
};

const formatarTimestamp = (timestamp, periodo) => {
  const data = parseISO(timestamp);
  
  if (periodo === '1d') {
    return format(data, 'HH:mm');
  } else if (periodo === '5d') {
    return format(data, 'dd/MM HH:mm');
  } else {
    return format(data, 'dd/MM/yy');
  }
};

const HistoricoGrafico = ({ silos = [] }) => {
  const [dados, setDados] = useState([]);
  const [dispositivoSelecionado, setDispositivoSelecionado] = useState('');
  const [tipoMetrica, setTipoMetrica] = useState('ambos');
  const [periodo, setPeriodo] = useState('1d');
  const [loading, setLoading] = useState(false);
  
  const periodos = [
    { label: '1 D', value: '1d', horas: 24 },
    { label: '5 D', value: '5d', horas: 120 },
    { label: '1 M', value: '1m', horas: 720 },
    { label: '1 A', value: '1a', horas: 8760 },
    { label: '5 A', value: '5a', horas: 43800 },
    { label: 'Máx', value: 'max', horas: null }
  ];

  useEffect(() => {
    if (silos.length > 0 && !dispositivoSelecionado) {
      setDispositivoSelecionado(silos[0].dispositivo);
    }
  }, [silos]);

  useEffect(() => {
    if (dispositivoSelecionado) {
      fetchDados();
    }
  }, [dispositivoSelecionado, periodo]);

  const fetchDados = async () => {
    setLoading(true);
    try {
      const periodoSelecionado = periodos.find(p => p.value === periodo);
      const horas = periodoSelecionado?.horas || 8760;
      
      const res = await api.get(`/api/dados/${dispositivoSelecionado}?horas=${horas}`);
      
      if (res.data.success) {
        let intervalo = 60;
        
        if (periodo === '1d') intervalo = 30;
        else if (periodo === '5d') intervalo = 'hora';
        else if (periodo === '1m' || periodo === '1a') intervalo = 'dia';
        else if (periodo === '5a' || periodo === 'max') intervalo = 'dia';
        
        const agrupado = agruparPorIntervalo(res.data.dados, intervalo);
        setDados(agrupado);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do gráfico:', err);
    } finally {
      setLoading(false);
    }
  };

  const dadosFormatados = dados.map(d => ({
    ...d,
    timestampFormatado: formatarTimestamp(d.timestamp, periodo)
  }));

  if (silos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        Nenhum silo disponível
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center flex-shrink-0">
        {/* Seletor de Dispositivo */}
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Dispositivo
          </label>
          <select
            value={dispositivoSelecionado}
            onChange={(e) => setDispositivoSelecionado(e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {silos.map(silo => (
              <option key={silo.dispositivo} value={silo.dispositivo}>
                {silo.nome || silo.dispositivo}
              </option>
            ))}
          </select>
        </div>

        {/* Seletor de Métrica */}
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Métrica
          </label>
          <div className="flex items-center bg-white rounded-md shadow-sm border border-gray-200 p-0.5">
            <button
              onClick={() => setTipoMetrica('temperatura')}
              className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                tipoMetrica === 'temperatura'
                  ? 'bg-red-500 text-white shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Temp
            </button>
            <button
              onClick={() => setTipoMetrica('umidade')}
              className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                tipoMetrica === 'umidade'
                  ? 'bg-blue-500 text-white shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Umid
            </button>
            <button
              onClick={() => setTipoMetrica('ambos')}
              className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                tipoMetrica === 'ambos'
                  ? 'bg-green-600 text-white shadow'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Ambos
            </button>
          </div>
        </div>
      </div>

      {/* Filtros de Período */}
      <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1.5 flex-shrink-0">
        {periodos.map(p => (
          <button
            key={p.value}
            onClick={() => setPeriodo(p.value)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              periodo === p.value
                ? 'bg-white text-green-600 shadow-sm font-semibold'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Gráfico */}
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-3 shadow-sm min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 text-sm">Carregando dados...</div>
          </div>
        ) : dadosFormatados.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 text-sm">Nenhum dado disponível</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dadosFormatados} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="umidGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
              <XAxis 
                dataKey="timestampFormatado" 
                tick={{ fontSize: 10, fill: '#6B7280' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
                angle={periodo === '5d' ? -45 : 0}
                textAnchor={periodo === '5d' ? 'end' : 'middle'}
                height={periodo === '5d' ? 50 : 25}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#6B7280' }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#fff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#D1D5DB', marginBottom: '4px' }}
              />
              {tipoMetrica === 'ambos' && (
                <Legend 
                  wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }}
                  iconType="circle"
                />
              )}
              
              {(tipoMetrica === 'temperatura' || tipoMetrica === 'ambos') && (
                <Area
                  type="monotone" 
                  dataKey="temperatura" 
                  stroke="#EF4444" 
                  strokeWidth={2.5}
                  fill="url(#tempGradient)"
                  name="Temperatura (°C)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                />
              )}
              
              {(tipoMetrica === 'umidade' || tipoMetrica === 'ambos') && (
                <Area
                  type="monotone" 
                  dataKey="umidade" 
                  stroke="#3B82F6" 
                  strokeWidth={2.5}
                  fill="url(#umidGradient)"
                  name="Umidade (%)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Valor atual */}
      {dadosFormatados.length > 0 && (
        <div className="flex justify-end text-[10px] text-gray-500 flex-shrink-0">
          <span>
            {tipoMetrica === 'temperatura' && `${dadosFormatados[dadosFormatados.length - 1].temperatura}°C`}
            {tipoMetrica === 'umidade' && `${dadosFormatados[dadosFormatados.length - 1].umidade}%`}
            {tipoMetrica === 'ambos' && 
              `${dadosFormatados[dadosFormatados.length - 1].temperatura}°C / ${dadosFormatados[dadosFormatados.length - 1].umidade}%`
            }
            {' '}em {new Date(dadosFormatados[dadosFormatados.length - 1].timestamp).toLocaleString('pt-BR')}
          </span>
        </div>
      )}
    </div>
  );
};

export default HistoricoGrafico;
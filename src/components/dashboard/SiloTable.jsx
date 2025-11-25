import React from 'react';
import { 
  ExclamationTriangleIcon, 
  FunnelIcon
} from '@heroicons/react/24/solid';
import { WiThermometer, WiHumidity } from 'react-icons/wi';
import { TbWindmill } from 'react-icons/tb';

const SiloTable = ({ silos }) => {
  const tiposSilo = {
    'superficie': { label: 'Superfície', color: 'bg-green-100 text-green-800' },
    'trincheira': { label: 'Trincheira', color: 'bg-blue-100 text-blue-800' },
    'cilindrico': { label: 'Cilíndrico', color: 'bg-purple-100 text-purple-800' },
    'silo-bolsa': { label: 'Silo-Bolsa', color: 'bg-orange-100 text-orange-800' }
  };

  const getAlertIcon = (value, maxValue, type = 'temp') => {
    if (value >= maxValue) {
      return (
        <ExclamationTriangleIcon 
          className="h-5 w-5 text-red-500 animate-pulse" 
          title={`${type === 'temp' ? 'Temperatura' : 'Umidade'} crítica!`}
        />
      );
    }
    return <div className="h-5 w-5" />;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto" style={{ height: '280px', overflowY: 'auto' }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-800 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Silo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                Temperatura
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                <ExclamationTriangleIcon className="h-4 w-4 inline" />
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                Umidade
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                <ExclamationTriangleIcon className="h-4 w-4 inline" />
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                Última Leitura
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                Ventilação
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                CO₂
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {silos.map((silo, index) => (
              <tr key={silo._id || index} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <FunnelIcon className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {silo.dispositivo}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    tiposSilo[silo.tipoSilo?.toLowerCase()] 
                      ? tiposSilo[silo.tipoSilo.toLowerCase()].color 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {silo.tipoSilo 
                      ? tiposSilo[silo.tipoSilo.toLowerCase()]?.label || silo.tipoSilo 
                      : '-'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <WiThermometer className="h-6 w-6 text-red-500" />
                    <span className="text-lg font-bold text-gray-900">
                      {silo.temperatura?.toFixed(1)}°C
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {getAlertIcon(silo.temperatura, 35, 'temp')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <WiHumidity className="h-6 w-6 text-blue-500" />
                    <span className="text-lg font-bold text-gray-900">
                      {silo.umidade?.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {getAlertIcon(silo.umidade, 80, 'umid')}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-600">
                  {formatTimestamp(silo.timestamp)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <TbWindmill 
                    className={`h-6 w-6 mx-auto ${
                      silo.ventilacao ? 'text-green-500 animate-spin' : 'text-gray-300'
                    }`}
                    style={silo.ventilacao ? { animationDuration: '3s' } : {}}
                    title={silo.ventilacao ? 'Ventilação ativa' : 'Ventilação inativa'}
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {silo.co2 && silo.co2 > 1000 ? (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mx-auto animate-pulse" />
                  ) : (
                    <div className="h-5 w-5 mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SiloTable;
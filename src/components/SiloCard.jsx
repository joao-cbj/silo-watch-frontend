import React from 'react';
import { WiThermometer, WiCloud } from 'react-icons/wi';

const getStatusStyle = (value, type) => {
  const thresholds = {
    temperatura: { normal: 30, warning: 35 },
    umidade: { normal: 70, warning: 80 },
  };

  if (value >= thresholds[type].warning) return 'text-red-500';
  if (value >= thresholds[type].normal) return 'text-yellow-500';
  return 'text-green-500';
};

const SiloCard = ({ silo }) => {
  if (!silo) return null;

  const tempStatus = getStatusStyle(silo.temperatura, 'temperatura');
  const umidStatus = getStatusStyle(silo.umidade, 'umidade');

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden w-[240px]">
      {/* Header */}
      <div className="bg-gray-800 px-3 py-2 text-center">
        <h3 className="text-sm font-semibold text-white truncate">{silo.dispositivo}</h3>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="grid grid-cols-2 gap-2">
          {/* Temperatura */}
          <div className="flex flex-col items-center">
            <WiThermometer className={`h-7 w-7 ${tempStatus}`} />
            <div className="flex items-baseline mt-1">
              <span className={`text-2xl font-bold ${tempStatus}`}>
                {silo.temperatura.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500 ml-1">°C</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">Temp.</p>
          </div>

          {/* Umidade */}
          <div className="flex flex-col items-center">
            <WiCloud className={`h-7 w-7 ${umidStatus}`} />
            <div className="flex items-baseline mt-1">
              <span className={`text-2xl font-bold ${umidStatus}`}>
                {silo.umidade.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500 ml-1">%</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">Umid.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-gray-200">
          <p className="text-[10px] text-gray-400 text-center">
            Última leitura: {new Date(silo.timestamp).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SiloCard;

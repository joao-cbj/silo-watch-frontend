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
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden w-[150px] h-[150px] flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-1.5 py-1 text-center">
        <h3 className="text-[10px] font-semibold text-white truncate">{silo.nome}</h3>
      </div>

      {/* Content */}
      <div className="px-2 py-1.5 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-2 gap-1">
          {/* Temperatura */}
          <div className="flex flex-col items-center">
            <WiThermometer className={`h-6 w-6 ${tempStatus}`} />
            <div className="flex items-baseline">
              <span className={`text-xl font-bold ${tempStatus}`}>
                {silo.temperatura.toFixed(1)}
              </span>
              <span className="text-[10px] text-gray-500 ml-0.5">°C</span>
            </div>
            <p className="text-[9px] text-gray-500">Temp.</p>
          </div>

          {/* Umidade */}
          <div className="flex flex-col items-center">
            <WiCloud className={`h-6 w-6 ${umidStatus}`} />
            <div className="flex items-baseline">
              <span className={`text-xl font-bold ${umidStatus}`}>
                {silo.umidade.toFixed(1)}
              </span>
              <span className="text-[10px] text-gray-500 ml-0.5">%</span>
            </div>
            <p className="text-[9px] text-gray-500">Umid.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto px-1.5 pb-1">
        <div className="pt-1 border-t border-gray-200">
          <p className="text-[8px] text-black-400 text-center leading-tight">
            Última leitura:<br/>
            {new Date(silo.timestamp).toLocaleString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit', 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SiloCard;
import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../../../services/api";
import WindyMap from "../../WindyMap";
import { CloudIcon, SunIcon, BeakerIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

const ClimateMapTab = () => {
  const [silos, setSilos] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState({
    lat: -8.0476,
    lon: -34.877,
    name: "Recife, PE"
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchWeatherData();
  }, [selectedLocation]);

  const fetchData = async () => {
    try {
      const response = await api.get("/api/dados/ultimas");
      if (response.data.success && response.data.data.length > 0) {
        setSilos(response.data.data);
        const firstSilo = response.data.data[0];
        if (firstSilo.latitude && firstSilo.longitude) {
          setSelectedLocation({
            lat: firstSilo.latitude,
            lon: firstSilo.longitude,
            name: firstSilo.dispositivo
          });
        }
      }
    } catch (error) {
      console.error("Erro ao buscar silos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherData = async () => {
    try {
      // Clima atual
      const currentResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${selectedLocation.lat}&longitude=${selectedLocation.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,pressure_msl,wind_speed_10m,wind_direction_10m&timezone=America/Recife`
      );
      setWeatherData(currentResponse.data.current);

      // Previsão 7 dias
      const forecastResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${selectedLocation.lat}&longitude=${selectedLocation.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,wind_speed_10m_max&timezone=America/Recife&forecast_days=7`
      );
      setForecast(forecastResponse.data.daily);
    } catch (error) {
      console.error("Erro ao buscar clima:", error);
    }
  };

  const handleRefresh = () => {
    fetchWeatherData();
  };

  const handleLocationChange = (e) => {
    const siloId = e.target.value;
    const silo = silos.find(s => s.dispositivo === siloId);
    if (silo && silo.latitude && silo.longitude) {
      setSelectedLocation({
        lat: silo.latitude,
        lon: silo.longitude,
        name: silo.dispositivo
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">
            Mapa Climático da Região
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Visualização em tempo real das condições meteorológicas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            onChange={handleLocationChange}
            defaultValue={selectedLocation.name}
          >
            <option value="">Localização padrão</option>
            {silos.map((silo) => (
              silo.latitude && silo.longitude && (
                <option key={silo.dispositivo} value={silo.dispositivo}>
                  {silo.dispositivo}
                </option>
              )
            ))}
          </select>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Atualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Mapa principal */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gray-800 px-4 py-2">
            <h4 className="text-white font-semibold">Mapa Interativo</h4>
          </div>
          <div style={{ height: '600px', width: '100%' }}>
            {selectedLocation && (
              <WindyMap 
                lat={selectedLocation.lat} 
                lon={selectedLocation.lon}
                key={`${selectedLocation.lat}-${selectedLocation.lon}`}
              />
            )}
          </div>
        </div>

        {/* Informações climáticas */}
        <div className="space-y-4">
          {/* Condições atuais */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow p-5 border border-blue-100">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <CloudIcon className="h-6 w-6 mr-2 text-blue-600" />
              Condições Atuais
            </h4>
            {weatherData ? (
              <div className="space-y-4">
                {/* Temperatura destaque */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Temperatura</p>
                    <p className="text-5xl font-bold text-blue-600 mb-1">
                      {weatherData.temperature_2m?.toFixed(1)}°
                    </p>
                    <p className="text-xs text-gray-500">
                      Sensação: {weatherData.apparent_temperature?.toFixed(1)}°C
                    </p>
                  </div>
                </div>

                {/* Outras métricas */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">💧</span>
                      <span className="text-sm text-gray-600">Umidade</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-800">
                      {weatherData.relative_humidity_2m}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">🔽</span>
                      <span className="text-sm text-gray-600">Pressão</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-800">
                      {weatherData.pressure_msl?.toFixed(0)} hPa
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">🌬️</span>
                      <span className="text-sm text-gray-600">Vento</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-800">
                      {weatherData.wind_speed_10m?.toFixed(1)} km/h
                    </span>
                  </div>

                  {weatherData.precipitation > 0 && (
                    <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">🌧️</span>
                        <span className="text-sm text-blue-700 font-medium">Chuva</span>
                      </div>
                      <span className="text-lg font-semibold text-blue-700">
                        {weatherData.precipitation?.toFixed(1)} mm
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-500 text-center pt-2 border-t border-blue-100">
                  Última atualização: {new Date().toLocaleTimeString('pt-BR')}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Carregando dados...</p>
              </div>
            )}
          </div>

          {/* Previsão 7 dias */}
          <div className="bg-white rounded-lg shadow p-5">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <SunIcon className="h-6 w-6 mr-2 text-yellow-500" />
              Previsão 7 Dias
            </h4>
            {forecast ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {forecast.time.map((date, index) => {
                  const tempMin = forecast.temperature_2m_min[index];
                  const tempMax = forecast.temperature_2m_max[index];
                  const tempRange = 40; // Range de 0 a 40°C para cálculo
                  const minPercent = (tempMin / tempRange) * 100;
                  const maxPercent = (tempMax / tempRange) * 100;
                  const rangeWidth = maxPercent - minPercent;

                  return (
                    <div
                      key={date}
                      className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-semibold text-gray-800">
                          {new Date(date).toLocaleDateString('pt-BR', { 
                            weekday: 'short', 
                            day: '2-digit', 
                            month: 'short' 
                          })}
                        </p>
                        {forecast.precipitation_sum[index] > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                            💧 {forecast.precipitation_sum[index]?.toFixed(0)}mm
                          </span>
                        )}
                      </div>
                      
                      {/* Gráfico de temperatura */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-blue-600 w-8 text-right">
                          {tempMin?.toFixed(0)}°
                        </span>
                        <div className="flex-1 h-6 bg-gray-100 rounded-full relative overflow-hidden">
                          <div 
                            className="absolute h-full bg-gradient-to-r from-blue-400 via-yellow-400 to-red-400 rounded-full"
                            style={{
                              left: `${minPercent}%`,
                              width: `${rangeWidth}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-red-600 w-8">
                          {tempMax?.toFixed(0)}°
                        </span>
                      </div>

                      {/* Vento */}
                      {forecast.wind_speed_10m_max && forecast.wind_speed_10m_max[index] > 0 && (
                        <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
                          <span>🌬️ Vento</span>
                          <span className="font-medium">
                            {forecast.wind_speed_10m_max[index]?.toFixed(0)} km/h
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Carregando previsão...</p>
              </div>
            )}
          </div>

          {/* Alertas e observações */}
          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
            <h5 className="font-semibold text-yellow-800 mb-2 flex items-center">
              <BeakerIcon className="h-5 w-5 mr-2" />
              Observações
            </h5>
            <ul className="text-sm text-gray-700 space-y-1">
              {weatherData && (
                <>
                  {weatherData.temperature_2m > 35 && (
                    <li>⚠️ Temperatura muito alta - Risco de aquecimento</li>
                  )}
                  {weatherData.relative_humidity_2m > 80 && (
                    <li>💧 Umidade elevada - Risco de condensação</li>
                  )}
                  {weatherData.wind_speed_10m > 30 && (
                    <li>🌬️ Ventos fortes - Cuidado com estruturas</li>
                  )}
                  {weatherData.precipitation > 0 && (
                    <li>🌧️ Precipitação ativa - Verificar vedação</li>
                  )}
                  {weatherData.temperature_2m <= 35 && 
                   weatherData.relative_humidity_2m <= 80 && 
                   weatherData.wind_speed_10m <= 30 && (
                    <li>✅ Condições normais</li>
                  )}
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Rodapé com informações */}
      <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-600">
        <p>
          📍 Localização: {selectedLocation.name} 
          ({selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)})
        </p>
        <p className="text-xs mt-1">
          Dados fornecidos por Open-Meteo API • Atualização em tempo real
        </p>
      </div>
    </div>
  );
};

export default ClimateMapTab;
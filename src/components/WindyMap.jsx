import React, { useEffect, useRef, useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const WindyMap = ({ lat, lon }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const windyInitialized = useRef(false);
  const scriptsLoaded = useRef(false);

  // Coloque aqui sua API KEY do Windy
  const WINDY_API_KEY = import.meta.env.VITE_WINDY_API_KEY;

  useEffect(() => {
    // Previne múltiplas inicializações
    if (windyInitialized.current) {
      return;
    }

    const loadScript = (src, id) => {
      return new Promise((resolve, reject) => {
        // Verifica se já existe
        const existing = document.getElementById(id);
        if (existing) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.async = false;
        script.onload = () => {
          console.log(`✓ Script carregado: ${id}`);
          resolve();
        };
        script.onerror = () => reject(new Error(`✗ Falha ao carregar ${id}`));
        document.head.appendChild(script);
      });
    };

    const initWindy = async () => {
      try {
        setLoading(true);
        setError(null);

        // Carrega scripts apenas uma vez
        if (!scriptsLoaded.current) {
          console.log('📦 Carregando Leaflet...');
          await loadScript('https://unpkg.com/leaflet@1.4.0/dist/leaflet.js', 'leaflet-js');
          
          // Aguarda Leaflet estar disponível
          let attempts = 0;
          while (!window.L && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
          
          if (!window.L) {
            throw new Error('Leaflet não carregou');
          }
          console.log('✓ Leaflet disponível');

          console.log('📦 Carregando Windy API...');
          await loadScript('https://api.windy.com/assets/map-forecast/libBoot.js', 'windy-api');

          // Aguarda Windy estar disponível
          attempts = 0;
          while (!window.windyInit && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }

          if (!window.windyInit) {
            throw new Error('Windy API não carregou');
          }
          console.log('✓ Windy API disponível');
          
          scriptsLoaded.current = true;
        }

        console.log('🗺️ Inicializando mapa...');

        const options = {
          key: WINDY_API_KEY,
          lat: lat,
          lon: lon,
          zoom: 8,
        };

        window.windyInit(options, (windyAPI) => {
          console.log('✓ Mapa inicializado com sucesso!');
          const { map, store } = windyAPI;

          // Força as dimensões do container do mapa
          const windyContainer = document.getElementById('windy');
          if (windyContainer) {
            windyContainer.style.width = '280px';
            windyContainer.style.height = '280px';
          }

          // Invalida o tamanho do mapa após um pequeno delay
          setTimeout(() => {
            if (map) {
              map.invalidateSize();
            }
          }, 100);

          // Adiciona marcador
          if (window.L && map) {
            const marker = window.L.marker([lat, lon]).addTo(map);
            marker.bindPopup(`Silo<br>Lat: ${lat.toFixed(4)}<br>Lon: ${lon.toFixed(4)}`);
          }

          // Define camada padrão (vento)
          store.set('overlay', 'wind');

          windyInitialized.current = true;
          setLoading(false);
        });

      } catch (err) {
        console.error('❌ Erro:', err);
        setError(err.message || 'Erro ao carregar o mapa');
        setLoading(false);
      }
    };

    initWindy();

    // Cleanup não remove os scripts (eles podem ser reutilizados)
    return () => {
      // Não faz nada no cleanup para evitar recarregar
    };
  }, []); // Array vazio = executa apenas uma vez

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-semibold mb-2">Erro ao carregar mapa</p>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <div className="text-xs text-gray-500 space-y-1 mb-4">
              <p className="font-semibold">Verifique:</p>
              <p>✓ API key está configurada corretamente</p>
              <p>✓ Conexão com a internet está funcionando</p>
              <p>✓ Não há bloqueadores de scripts ativos</p>
              <p>✓ Console do navegador (F12) para mais detalhes</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ width: '280px', height: '280px' }}>
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Carregando mapa climático...</p>
            <p className="text-gray-500 text-sm mt-2">Aguarde alguns instantes</p>
          </div>
        </div>
      )}
      <div 
        id="windy"
        style={{ 
          width: '280px',
          height: '280px',
          minHeight: '280px',
          minWidth: '280px',
          maxWidth: '280px',
          maxHeight: '280px'
        }}
      />
    </div>
  );
};

export default WindyMap;
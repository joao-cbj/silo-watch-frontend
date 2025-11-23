import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import {
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  SignalIcon,
  WifiIcon,
} from "@heroicons/react/24/outline";

const IntegrationTab = () => {
  const [silos, setSilos] = useState([]);
  const [dispositivosBLE, setDispositivosBLE] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [provisioning, setProvisioning] = useState(null);
  const [error, setError] = useState(null);
  const [gatewayStatus, setGatewayStatus] = useState(null);

  const fetchSilos = async () => {
    try {
      const response = await api.get("/api/silos");
      if (response.data.success) {
        setSilos(response.data.silos);
      }
    } catch (err) {
      console.error("Erro ao buscar silos:", err);
    }
  };

  const checkGatewayStatus = async () => {
    try {
      const response = await api.get("/api/hybrid-provisioning/status");
      setGatewayStatus(response.data.gateway);
    } catch (err) {
      setGatewayStatus({ online: false });
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchSilos();
      await checkGatewayStatus();
      setLoading(false);
    };

    init();
    
    const interval = setInterval(checkGatewayStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleScan = async () => {
    setScanning(true);
    setError(null);
    setDispositivosBLE([]);

    try {
      const response = await api.post("/api/hybrid-provisioning/scan");

      if (response.data.success) {
        setDispositivosBLE(response.data.dispositivos || []);
        
        if (response.data.dispositivos.length === 0) {
          setError("Nenhum dispositivo ESP32 encontrado via BLE. Ligue o silo em modo setup.");
        }
      }
    } catch (err) {
      console.error("Erro ao escanear:", err);
      setError(err.response?.data?.error || "Erro ao escanear via Gateway");
    } finally {
      setScanning(false);
    }
  };

  const handleProvision = async (siloId, macSilo) => {
    setProvisioning(siloId);
    setError(null);

    try {
      const response = await api.post("/api/hybrid-provisioning/provision", {
        siloId,
        macSilo,
      });

      if (response.data.success) {
        alert("✓ Silo provisionado via BLE! O ESP32 irá reiniciar.");
        setDispositivosBLE([]);
        await fetchSilos();
      }
    } catch (err) {
      console.error("Erro ao provisionar:", err);
      const errorMsg = err.response?.data?.error || "Erro ao provisionar silo";
      alert("✗ " + errorMsg);
      setError(errorMsg);
    } finally {
      setProvisioning(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const silosNaoIntegrados = silos.filter((s) => !s.integrado);
  const silosIntegrados = silos.filter((s) => s.integrado);

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        Integrações ESP32 Híbridas
      </h3>
      <p className="text-gray-500 text-sm mb-4">
        Provisionamento via Firebase → Gateway → BLE
      </p>

      {/* Status do Gateway */}
      <div className={`mb-6 p-4 rounded-lg border ${
        gatewayStatus?.online 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiIcon className={`h-5 w-5 ${
              gatewayStatus?.online ? 'text-green-600' : 'text-red-600'
            }`} />
            <span className={`font-medium ${
              gatewayStatus?.online ? 'text-green-800' : 'text-red-800'
            }`}>
              Gateway ESP32: {gatewayStatus?.online ? 'Online' : 'Offline'}
            </span>
            {gatewayStatus?.online && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                Firebase + BLE
              </span>
            )}
          </div>
          <button
            onClick={checkGatewayStatus}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Verificar
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-800">{error}</span>
        </div>
      )}

      {/* Informação */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Como funciona:</strong> Clique em "Escanear BLE" para
          o Gateway buscar dispositivos próximos. Selecione o silo e clique
          em "Integrar" para provisionar via BLE local.
        </p>
      </div>

      {/* Botão de Scan */}
      <div className="mb-6">
        <button
          onClick={handleScan}
          disabled={scanning || !gatewayStatus?.online}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
        >
          <MagnifyingGlassIcon className={`h-5 w-5 ${scanning ? 'animate-pulse' : ''}`} />
          {scanning ? "Escaneando BLE via Gateway..." : "Escanear BLE"}
        </button>
        {!gatewayStatus?.online && (
          <p className="text-sm text-red-600 mt-2">
            Gateway offline. Verifique a conexão do ESP32.
          </p>
        )}
      </div>

      {/* Dispositivos BLE Encontrados */}
      {dispositivosBLE.length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <SignalIcon className="h-5 w-5 text-blue-600" />
            Dispositivos BLE Próximos ({dispositivosBLE.length})
          </h4>
          <div className="bg-white border border-gray-200 rounded-lg divide-y">
            {dispositivosBLE.map((device, idx) => (
              <div key={idx} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-800">
                      {device.nome || device.mac}
                    </h5>
                    <p className="text-sm text-gray-500 font-mono">
                      {device.mac}
                    </p>
                    <p className="text-xs text-gray-400">
                      Sinal: {device.rssi} dBm
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select
                      id={`silo-${idx}`}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      defaultValue=""
                    >
                      <option value="" disabled>Selecione o silo</option>
                      {silosNaoIntegrados.map(silo => (
                        <option key={silo._id} value={silo._id}>
                          {silo.nome}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        const siloId = document.getElementById(`silo-${idx}`).value;
                        if (!siloId) {
                          alert("Selecione um silo primeiro");
                          return;
                        }
                        handleProvision(siloId, device.mac);
                      }}
                      disabled={provisioning !== null || silosNaoIntegrados.length === 0}
                      className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition text-sm font-medium"
                    >
                      <LinkIcon className="h-4 w-4" />
                      {provisioning ? "Provisionando..." : "Integrar"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Silos Não Integrados */}
      {silosNaoIntegrados.length > 0 && dispositivosBLE.length === 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-700 mb-3">
            Silos Aguardando Integração ({silosNaoIntegrados.length})
          </h4>
          <div className="space-y-2">
            {silosNaoIntegrados.map((silo) => (
              <div
                key={silo._id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3"
              >
                <h5 className="font-semibold text-gray-800">{silo.nome}</h5>
                <p className="text-sm text-gray-500 capitalize">
                  {silo.tipoSilo.replace("-", " ")}
                </p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Clique em "Escanear BLE" para encontrar dispositivos
          </p>
        </div>
      )}

      {/* Silos Integrados */}
      {silosIntegrados.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            Silos Integrados ({silosIntegrados.length})
          </h4>
          <div className="space-y-3">
            {silosIntegrados.map((silo) => (
              <div
                key={silo._id}
                className="bg-green-50 border border-green-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                      {silo.nome}
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                        Ativo
                      </span>
                    </h5>
                    <p className="text-sm text-gray-600 mt-1">
                      Dispositivo: <span className="font-mono">{silo.dispositivo}</span>
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      Tipo: {silo.tipoSilo.replace("-", " ")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {silos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhum silo cadastrado</p>
          <p className="text-gray-400 text-sm mt-2">
            Cadastre um silo na aba "Adicionar Silo"
          </p>
        </div>
      )}
    </div>
  );
};

export default IntegrationTab;
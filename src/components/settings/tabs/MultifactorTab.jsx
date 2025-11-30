import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import { 
  ShieldCheckIcon, 
  QrCodeIcon, 
  DevicePhoneMobileIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

const MultifactorTab = () => {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [setupStep, setSetupStep] = useState(null); // null, 'setup', 'verify'
  const [message, setMessage] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      const response = await api.get("/api/auth/mfa/status");
      setMfaEnabled(response.data.enabled || false);
    } catch (error) {
      console.error("Erro ao verificar status MFA:", error);
      setMessage({
        type: "error",
        text: "Erro ao verificar status do MFA"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMFA = async () => {
    setProcessing(true);
    setMessage(null);

    try {
      const response = await api.post("/api/auth/mfa/setup");
      
      if (response.data.success) {
        setQrCode(response.data.qrCode);
        setSecret(response.data.secret);
        setSetupStep('setup');
        setMessage({
          type: "success",
          text: "QR Code gerado! Configure no Microsoft Authenticator"
        });
      }
    } catch (error) {
      console.error("Erro ao configurar MFA:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Erro ao configurar MFA"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setMessage({ type: "error", text: "Digite um código de 6 dígitos" });
      return;
    }

    setProcessing(true);
    setMessage(null);

    try {
      const response = await api.post("/api/auth/mfa/verify", {
        code: verificationCode
      });

      if (response.data.success) {
        setMfaEnabled(true);
        setSetupStep(null);
        setQrCode(null);
        setSecret(null);
        setVerificationCode("");
        setMessage({
          type: "success",
          text: "Autenticação de dois fatores ativada com sucesso!"
        });
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (error) {
      console.error("Erro ao verificar código:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Código inválido. Tente novamente."
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDisableMFA = async () => {
    if (!window.confirm("Tem certeza que deseja desativar a autenticação de dois fatores? Isso tornará sua conta menos segura.")) {
      return;
    }

    setProcessing(true);
    setMessage(null);

    try {
      const response = await api.post("/api/auth/mfa/disable");

      if (response.data.success) {
        setMfaEnabled(false);
        setMessage({
          type: "success",
          text: "Autenticação de dois fatores desativada"
        });
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (error) {
      console.error("Erro ao desativar MFA:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Erro ao desativar MFA"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSetup = () => {
    setSetupStep(null);
    setQrCode(null);
    setSecret(null);
    setVerificationCode("");
    setMessage(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <ArrowPathIcon className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 h-full overflow-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Autenticação Multifator</h2>
      <p className="text-sm text-gray-500 mb-6">
        Adicione uma camada extra de segurança à sua conta
      </p>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircleIcon className="h-5 w-5 mr-2" />
          ) : (
            <XCircleIcon className="h-5 w-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      {!setupStep ? (
        <>
          {/* Status Card */}
          <div className={`border rounded-lg p-6 mb-6 ${
            mfaEnabled 
              ? "bg-green-50 border-green-200" 
              : "bg-yellow-50 border-yellow-200"
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                mfaEnabled ? "bg-green-100" : "bg-yellow-100"
              }`}>
                <ShieldCheckIcon className={`h-6 w-6 ${
                  mfaEnabled ? "text-green-600" : "text-yellow-600"
                }`} />
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold mb-1 ${
                  mfaEnabled ? "text-green-900" : "text-yellow-900"
                }`}>
                  {mfaEnabled ? "MFA Ativado" : "MFA Desativado"}
                </h3>
                <p className={`text-sm ${
                  mfaEnabled ? "text-green-800" : "text-yellow-800"
                }`}>
                  {mfaEnabled 
                    ? "Sua conta está protegida com autenticação de dois fatores"
                    : "Sua conta não está usando autenticação de dois fatores"
                  }
                </p>
              </div>
              {mfaEnabled ? (
                <button
                  onClick={handleDisableMFA}
                  disabled={processing}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition text-sm font-semibold"
                >
                  {processing ? "Desativando..." : "Desativar"}
                </button>
              ) : (
                <button
                  onClick={handleEnableMFA}
                  disabled={processing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition text-sm font-semibold"
                >
                  {processing ? "Configurando..." : "Ativar MFA"}
                </button>
              )}
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Como funciona?
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-bold text-xs">1</span>
                </div>
                <p>Instale o <strong>Microsoft Authenticator</strong> no seu smartphone</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-bold text-xs">2</span>
                </div>
                <p>Escaneie o QR Code que será exibido</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-bold text-xs">3</span>
                </div>
                <p>Digite o código de 6 dígitos para confirmar</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-bold text-xs">4</span>
                </div>
                <p>A partir de agora, você precisará do código ao fazer login</p>
              </div>
            </div>
          </div>

          {/* Download Links */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <DevicePhoneMobileIcon className="h-5 w-5" />
              Baixar Microsoft Authenticator
            </h3>
            <div className="flex gap-4">
              <a
                href="https://apps.apple.com/app/microsoft-authenticator/id983156458"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-center text-sm font-medium"
              >
                📱 iOS / iPhone
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.azure.authenticator"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-center text-sm font-medium"
              >
                🤖 Android
              </a>
            </div>
          </div>
        </>
      ) : setupStep === 'setup' ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <QrCodeIcon className="h-6 w-6 text-blue-600" />
            Configurar Autenticação
          </h3>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Passo 1:</strong> Abra o Microsoft Authenticator no seu smartphone
              </p>
            </div>

            <div className="flex flex-col items-center">
              {qrCode ? (
                <img 
                  src={qrCode} 
                  alt="QR Code" 
                  className="w-64 h-64 border-4 border-gray-200 rounded-lg"
                />
              ) : (
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ArrowPathIcon className="h-12 w-12 animate-spin text-blue-600" />
                </div>
              )}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Não consegue escanear?</strong> Digite este código manualmente:
              </p>
              <div className="bg-white border border-gray-300 rounded px-3 py-2 font-mono text-sm text-center select-all">
                {secret}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSetupStep('verify')}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Próximo Passo
              </button>
              <button
                onClick={handleCancelSetup}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Verificar Código
          </h3>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Passo 2:</strong> Digite o código de 6 dígitos exibido no aplicativo
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Verificação
              </label>
              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                onKeyPress={(e) => e.key === 'Enter' && handleVerifyCode()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="000000"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleVerifyCode}
                disabled={processing || verificationCode.length !== 6}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition font-semibold"
              >
                {processing ? "Verificando..." : "Confirmar e Ativar"}
              </button>
              <button
                onClick={() => setSetupStep('setup')}
                disabled={processing}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultifactorTab;
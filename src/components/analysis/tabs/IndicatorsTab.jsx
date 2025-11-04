import React from "react";

const IndicatorsTab = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "tab1", name: "Amplitude Térmica" },
    { id: "tab2", name: "Taxa de Umidade" },
    { id: "tab3", name: "Índice de Risco" },
    { id: "tab4", name: "Tempo Crítico" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "tab1":
        return (
          <div className="space-y-4">
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
              <h5 className="font-semibold text-orange-800 mb-2">
                📊 Amplitude Térmica Diária
              </h5>
              <p className="text-sm text-gray-700 mb-3">
                <strong>Cálculo:</strong> Máx - Mín do dia
              </p>
              <p className="text-sm text-gray-600">
                <strong>Aplicação:</strong> Mede a estabilidade do silo. Alta
                amplitude indica variações que podem afetar a qualidade dos
                grãos.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-xs text-gray-500 mb-2">Implementação futura</p>
              <div className="h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                Gráfico de amplitude térmica
              </div>
            </div>
          </div>
        );
      case "tab2":
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <h5 className="font-semibold text-blue-800 mb-2">
                💧 Taxa de Aumento de Umidade (ΔU/Δt)
              </h5>
              <p className="text-sm text-gray-700 mb-3">
                <strong>Cálculo:</strong> Mudança percentual por hora/dia
              </p>
              <p className="text-sm text-gray-600">
                <strong>Aplicação:</strong> Indica infiltração ou falha na
                vedação. Umidade crescendo &gt;2%/dia é sinal de alerta.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-xs text-gray-500 mb-2">Implementação futura</p>
              <div className="h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                Gráfico de taxa de umidade
              </div>
            </div>
          </div>
        );
      case "tab3":
        return (
          <div className="space-y-4">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <h5 className="font-semibold text-red-800 mb-2">
                ⚠️ Índice de Risco de Fungos (IRF)
              </h5>
              <p className="text-sm text-gray-700 mb-3">
                <strong>Cálculo:</strong> Função de T e UR alta (&gt;30°C e
                &gt;75%)
              </p>
              <p className="text-sm text-gray-600">
                <strong>Aplicação:</strong> Prevenção de contaminação. IRF alto
                = condições ideais para fungos.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-xs text-gray-500 mb-2">Implementação futura</p>
              <div className="h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                Matriz de risco
              </div>
            </div>
          </div>
        );
      case "tab4":
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <h5 className="font-semibold text-yellow-800 mb-2">
                ⏱️ Horas Acima de Limite Crítico (TAC)
              </h5>
              <p className="text-sm text-gray-700 mb-3">
                <strong>Cálculo:</strong> Tempo acumulado com T&gt;35°C
              </p>
              <p className="text-sm text-gray-600">
                <strong>Aplicação:</strong> Mede exposição a risco de
                deterioração. Mais de 6h críticas = ação urgente.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-xs text-gray-500 mb-2">Implementação futura</p>
              <div className="h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                Timeline de períodos críticos
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        Indicadores Avançados
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Métricas específicas para análise de qualidade e risco
      </p>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Conteúdo da tab */}
      {renderTabContent()}
    </div>
  );
};

export default IndicatorsTab;
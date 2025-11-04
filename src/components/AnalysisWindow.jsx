import React, { useState } from "react";
import {
  XMarkIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentChartBarIcon,
  ArrowTrendingUpIcon,
  MapIcon,
} from "@heroicons/react/24/outline";
import logo from "../assets/silo-watch-logo.png";

// Importar as tabs
import TrendTab from "./analysis/tabs/TrendTab";
import IndicatorsTab from "./analysis/tabs/IndicatorsTab";
import ReportsTab from "./analysis/tabs/ReportsTab";
import ClimateMapTab from "./analysis/tabs/ClimateMapTab";

const AnalysisWindow = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  const renderContent = () => {
    if (!activeSection) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-gray-500">
          <ChartBarIcon className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-xl font-semibold text-gray-700">
            Painel de Análises
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Escolha uma categoria à esquerda para começar.
          </p>
        </div>
      );
    }

    switch (activeSection) {
      case "trend":
        return <TrendTab />;
      case "indicators":
        return <IndicatorsTab activeTab={activeTab} setActiveTab={setActiveTab} />;
      case "reports":
        return <ReportsTab activeTab={activeTab} setActiveTab={setActiveTab} />;
      case "climatemap":
        return <ClimateMapTab />;
      default:
        return null;
    }
  };

  const menuItems = [
    {
      id: "trend",
      label: "Tendências",
      icon: ArrowTrendingUpIcon,
      hasTabs: false,
    },
    {
      id: "indicators",
      label: "Indicadores",
      icon: ChartBarIcon,
      hasTabs: true,
    },
    {
      id: "climatemap",
      label: "Mapa Climático",
      icon: MapIcon,
      hasTabs: false,
    },
    {
      id: "reports",
      label: "Relatórios",
      icon: DocumentChartBarIcon,
      hasTabs: true,
    },
  ];

  const handleSectionClick = (sectionId, hasTabs) => {
    setActiveSection(sectionId);
    setActiveTab(hasTabs ? "tab1" : null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fundo borrado */}
      <div
        className="absolute inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-md"
        style={{
          WebkitBackdropFilter: "blur(10px)",
          backdropFilter: "blur(10px)",
        }}
        onClick={onClose}
      ></div>

      {/* Janela principal */}
      <div className="relative flex w-[1200px] h-[700px] bg-white border border-gray-200 shadow-2xl z-10 overflow-hidden">
        {/* Sidebar com gradiente */}
        <div
          className="w-64 flex flex-col text-white"
          style={{
            background: "linear-gradient(180deg, #1f2937 0%, #1F2238 100%)",
          }}
        >
          {/* Header com logo */}
          <div className="flex items-center justify-center py-5 border-b border-gray-400/40">
            <img src={logo} alt="Silo Watch" className="w-10 h-10 mr-2" />
            <h2 className="font-bold text-lg tracking-tight">SILO WATCH</h2>
          </div>

          {/* Título */}
          <div className="flex items-center px-5 py-4 border-b border-gray-400/30">
            <ChartBarIcon className="h-5 w-5 mr-2 text-blue-100" />
            <span className="font-semibold text-blue-50">Análises</span>
          </div>

          {/* Menu de Opções */}
          <div className="flex flex-col mt-2 text-sm overflow-y-auto flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id, item.hasTabs)}
                  className={`flex items-center px-5 py-3 transition-all duration-150 text-left ${
                    activeSection === item.id
                      ? "bg-blue-700/80"
                      : "hover:bg-blue-700/60"
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3 text-blue-100" />
                  <span
                    className={`${
                      activeSection === item.id
                        ? "font-medium text-blue-50"
                        : "text-blue-100"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer com versão */}
          <div className="px-5 py-3 border-t border-blue-700/30 text-xs text-blue-200">
            <p>Powered by Python Analytics</p>
            <p className="text-blue-300/70">Versão 1.0.0</p>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 relative bg-white overflow-hidden flex flex-col">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 hover:bg-gray-100 transition rounded-lg z-10"
            aria-label="Fechar"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>

          <div className="flex-1 overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisWindow;
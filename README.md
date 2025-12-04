# 🌾 Silo Watch

Dashboard para monitoramento de silos agrícolas em tempo real.

## 📋 Sobre

Sistema web que monitora temperatura, umidade e outras condições de silos através de sensores IoT. Exibe dados em tempo real, gera análises e alertas quando algo está fora do normal.

### O que faz

- Dashboard com todos os silos e suas condições
- Gráficos de histórico de temperatura e umidade
- Análise de tendências com IA
- Mapa climático da região
- Exportação de relatórios em CSV
- Alertas quando temperatura ou umidade estão críticas
- Sistema de login com autenticação multifator

## 🛠️ Tecnologias

- React 19 + Vite
- TailwindCSS para estilização
- Chart.js e Recharts para gráficos
- React Router para navegação
- Axios para consumir APIs
- Heroicons e React Icons

## 📁 Estrutura do Projeto

```
silo-watch/
├── src/
│   ├── assets/              # Imagens e recursos estáticos
│   ├── components/
│   │   ├── analysis/tabs/   # Componentes de análise
│   │   │   ├── ClimateMapTab.jsx    # Mapa climático
│   │   │   ├── IndicatorsTab.jsx    # Indicadores
│   │   │   ├── ReportsTab.jsx       # Relatórios
│   │   │   └── TrendTab.jsx         # Tendências
│   │   ├── dashboard/       # Componentes do dashboard
│   │   │   ├── AnalyticsInsights.jsx
│   │   │   ├── HistoricoGrafico.jsx
│   │   │   ├── MetricCards.jsx
│   │   │   ├── SiloTable.jsx
│   │   │   └── TabelaCriticos.jsx
│   │   ├── settings/tabs/   # Configurações
│   │   │   ├── AccountTab.jsx
│   │   │   ├── MultifactorTab.jsx
│   │   │   └── SecurityTab.jsx
│   │   ├── silos/tabs/      # Gerenciamento de silos
│   │   │   ├── AddSiloTab.jsx
│   │   │   ├── IntegrationTab.jsx
│   │   │   └── SiloListTab.jsx
│   │   ├── users/tabs/      # Gerenciamento de usuários
│   │   │   └── UserListTab.jsx
│   │   ├── AnalysisWindow.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── SettingsWindow.jsx
│   │   ├── Sidebar.jsx
│   │   ├── SiloCard.jsx
│   │   ├── SilosWindow.jsx
│   │   ├── UsersWindow.jsx
│   │   └── WindyMap.jsx
│   ├── context/
│   │   └── AuthContext.jsx  # Gerenciamento de autenticação
│   ├── pages/
│   │   ├── DashboardPage.jsx
│   │   └── LoginPage.jsx
│   ├── services/
│   │   └── api.js           # Configuração do Axios
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .env.example
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🚀 Como rodar

1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd silo-watch
```

2. Instale as dependências
```bash
npm install
```

3. Configure o `.env`
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_ANALYTICS_API_URL=http://localhost:8000
VITE_API_WINDY_KEY=sua_chave_aqui
```

4. Execute
```bash
npm run dev
```

Acesse em `http://localhost:5173`

## 🔌 APIs que o projeto usa

**API Principal** (Node.js + MongoDB)
- `/api/dados/ultimas` - pega últimas leituras dos silos
- `/api/dados/exportar` - exporta dados em CSV
- `/api/auth/login` - faz login
- `/api/auth/verificar` - verifica se o token é válido

**API Analytics** (Python)
- `/api/analytics/estatisticas/{dispositivo}` - estatísticas do silo
- `/api/analytics/anomalias/{dispositivo}` - detecta anomalias
- `/api/analytics/tendencias/{dispositivo}` - calcula tendências

**Open-Meteo API** - dados climáticos em tempo real

## 📁 Estrutura básica

```
src/
├── components/          # Componentes React
│   ├── analysis/       # Abas de análise (tendências, mapa, etc)
│   ├── dashboard/      # Componentes do dashboard
│   ├── settings/       # Configurações do usuário
│   ├── silos/         # Gerenciamento de silos
│   └── users/         # Gerenciamento de usuários
├── context/           # AuthContext para autenticação
├── pages/             # Páginas (Login e Dashboard)
├── services/          # Configuração da API (axios)
└── App.jsx            # Componente principal
```

## 🎨 Principais funcionalidades

### Dashboard
- Cards com resumo das métricas
- Tabela com todos os silos
- Gráficos de histórico
- Alertas visuais

### Análises
- Tendências com regressão linear
- Detecção de anomalias
- Mapa climático interativo
- Exportação de relatórios

### Alertas
- 🌡️ Temperatura ≥ 35°C
- 💧 Umidade ≥ 80%

## 🏗️ Build

```bash
npm run build
```

Deploy na Vercel é automático quando você faz push na branch principal.
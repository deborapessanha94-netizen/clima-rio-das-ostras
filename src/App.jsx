import React, { useState, useEffect, useCallback } from 'react';
import { STATIONS, NETWORKS, CATEGORIES, NEIGHBORHOODS } from './data/stations';
import { fetchStationWeather } from './services/weatherService';
import { Header } from './components/Header';
import { StationMap } from './components/StationMap';
import { StationCard } from './components/StationCard';
import { StationDetailModal } from './components/StationDetailModal';
import { ComparisonTable } from './components/ComparisonTable';
import { AddStationModal } from './components/AddStationModal';
import { DailyBulletinsModal } from './components/DailyBulletinsModal';
import { EmbeddedStationModal } from './components/EmbeddedStationModal';
import { StationLinksModal } from './components/StationLinksModal';
import { StationsComparisonChart } from './components/StationsComparisonChart';
import { Footer } from './components/Footer';
import { 
  LayoutGrid, 
  Table, 
  MapPin, 
  ShieldAlert,
  Search,
  Map as MapIcon,
  RotateCcw,
  BarChart3
} from 'lucide-react';

export function App() {
  const [stations, setStations] = useState(() => {
    const saved = localStorage.getItem('rdo_custom_stations');
    if (saved) {
      try {
        const custom = JSON.parse(saved);
        return [...STATIONS, ...custom];
      } catch (e) {
        return STATIONS;
      }
    }
    return STATIONS;
  });

  const [weatherData, setWeatherData] = useState({});
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Todos os Bairros');
  const [selectedNetwork, setSelectedNetwork] = useState('Todas as Redes');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMap, setShowMap] = useState(true);
  const [activeTab, setActiveTab] = useState('cards'); // 'cards' | 'table'
  const REFRESH_INTERVAL_SECONDS = 300; // 5 minutos
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_SECONDS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulletinsModalOpen, setIsBulletinsModalOpen] = useState(false);
  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);
  const [embeddedStation, setEmbeddedStation] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load weather for all stations
  const loadWeatherData = useCallback(async () => {
    setIsRefreshing(true);
    const results = {};

    await Promise.all(
      stations.map(async (st) => {
        try {
          const data = await fetchStationWeather(st);
          results[st.id] = data;
        } catch (err) {
          console.error(`Falha ao obter clima para ${st.name}:`, err);
        }
      })
    );

    setWeatherData(results);
    setLastUpdated(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    setIsRefreshing(false);
  }, [stations]);

  // Initial load
  useEffect(() => {
    loadWeatherData();
  }, [loadWeatherData]);

  // Automatic 5-minute interval timer (300 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          loadWeatherData();
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loadWeatherData]);

  // Manual refresh that also resets the 5-minute cycle
  const handleManualRefresh = useCallback(() => {
    loadWeatherData();
    setCountdown(REFRESH_INTERVAL_SECONDS);
  }, [loadWeatherData]);

  const formatCountdown = (totalSecs) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // Filter stations based on search query, neighborhood, network, category
  const filteredStations = stations.filter(st => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = st.name?.toLowerCase().includes(q);
      const matchNeighborhood = st.neighborhood?.toLowerCase().includes(q);
      const matchCode = st.code?.toLowerCase().includes(q);
      const matchNetwork = st.network?.toLowerCase().includes(q);
      if (!matchName && !matchNeighborhood && !matchCode && !matchNetwork) return false;
    }

    if (selectedNeighborhood !== 'Todos os Bairros') {
      if (!st.neighborhood.toLowerCase().includes(selectedNeighborhood.toLowerCase())) return false;
    }

    if (selectedNetwork !== 'Todas as Redes') {
      if (st.network !== selectedNetwork) return false;
    }

    if (activeCategory !== 'Todas') {
      if (st.category !== activeCategory) return false;
    }

    return true;
  });

  const hasActiveFilters = selectedNeighborhood !== 'Todos os Bairros' || 
    selectedNetwork !== 'Todas as Redes' || 
    activeCategory !== 'Todas' || 
    searchQuery.trim() !== '';

  const handleResetFilters = () => {
    setSelectedNeighborhood('Todos os Bairros');
    setSelectedNetwork('Todas as Redes');
    setActiveCategory('Todas');
    setSearchQuery('');
  };

  // Calculate alerts
  const alertStations = stations.filter(st => {
    const alert = weatherData[st.id]?.alert;
    return alert && (alert.level === 'warning' || alert.level === 'critical');
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c1322] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header - Unified navigation, live status and atmospheric ticker */}
        <Header 
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onRefresh={handleManualRefresh}
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
          countdownFormatted={formatCountdown(countdown)}
          countdownSeconds={countdown}
          stations={stations}
          weatherData={weatherData}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenBulletinsModal={() => setIsBulletinsModalOpen(true)}
          onOpenLinksModal={() => setIsLinksModalOpen(true)}
          onOpenChartTab={() => setActiveTab('chart')}
        />

        {/* Severe Weather Alert Notice Banner (if any) */}
        {alertStations.length > 0 && (
          <div className="p-3 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-semibold text-xs">Aviso Meteorológico:</span>
                <span className="text-xs text-amber-800 dark:text-amber-300 ml-1">
                  Atenção em: <strong>{alertStations.map(s => s.neighborhood).join(', ')}</strong> &bull; {weatherData[alertStations[0]?.id]?.alert?.description || 'Condições adversas'}.
                </span>
              </div>
            </div>
            <a 
              href="tel:199" 
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition whitespace-nowrap self-start sm:self-auto"
            >
              Defesa Civil 199
            </a>
          </div>
        )}

        {/* Section: Interactive Georeferenced Map (Collapsible) */}
        <section className="space-y-2 sm:space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
              <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                Mapa Georreferenciado &ndash; Rio das Ostras
              </h2>
              <span className="text-[11px] sm:text-xs text-slate-400">
                ({filteredStations.length} estações)
              </span>
            </div>
            <button
              onClick={() => setShowMap(!showMap)}
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/40"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>{showMap ? 'Ocultar Mapa' : 'Exibir Mapa'}</span>
            </button>
          </div>

          {showMap && (
            <StationMap 
              stations={filteredStations}
              weatherData={weatherData}
              selectedStation={selectedStation}
              onSelectStation={(st) => setSelectedStation(st)}
            />
          )}
        </section>

        {/* Section: Clean, Minimalist Toolbar (Zero Visual Clutter) */}
        <section className="space-y-3 sm:space-y-4">
          <div className="p-2.5 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar estação, bairro..."
                className="w-full pl-9 pr-7 py-1.5 sm:py-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category / Zone Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-sky-600 text-white shadow-xs font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Dropdown Filters & View Switcher */}
            <div className="flex items-center gap-1.5 sm:gap-2 self-start md:self-auto flex-wrap">
              {/* Bairro Selector */}
              <select
                value={selectedNeighborhood}
                onChange={(e) => setSelectedNeighborhood(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                title="Filtrar por Bairro"
              >
                {NEIGHBORHOODS.map(nh => (
                  <option key={nh} value={nh}>{nh}</option>
                ))}
              </select>

              {/* Rede Selector */}
              <select
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                title="Filtrar por Rede"
              >
                {NETWORKS.map(net => (
                  <option key={net} value={net}>{net}</option>
                ))}
              </select>

              {/* Reset button (visible when filters are applied) */}
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  title="Limpar todos os filtros"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* View Switcher: Cards vs Gráfico vs Table */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                <button
                  onClick={() => setActiveTab('cards')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'cards'
                      ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                  title="Visualização em Cards"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cards ({filteredStations.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('chart')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'chart'
                      ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                  title="Gráfico Comparativo Geral de Barras (estilo infográfico)"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Gráfico Geral</span>
                </button>

                <button
                  onClick={() => setActiveTab('table')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'table'
                      ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                  title="Visualização em Tabela"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tabela</span>
                </button>
              </div>
            </div>
          </div>

          {/* Empty search state */}
          {filteredStations.length === 0 && (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Nenhuma estação encontrada com os filtros selecionados.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition shadow-xs"
              >
                Limpar filtros
              </button>
            </div>
          )}

          {/* Main Content View */}
          {activeTab === 'chart' ? (
            <StationsComparisonChart 
              stations={filteredStations.length > 0 ? filteredStations : stations}
              weatherData={weatherData}
              lastUpdated={lastUpdated}
              countdownFormatted={formatCountdown(countdown)}
            />
          ) : activeTab === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStations.map(station => (
                <StationCard 
                  key={station.id}
                  station={station}
                  weather={weatherData[station.id]}
                  isSelected={selectedStation?.id === station.id}
                  onSelect={(st) => setSelectedStation(st)}
                  onOpenEmbed={(st) => setEmbeddedStation(st)}
                  onFocusMap={(st) => {
                    setSelectedStation(st);
                    setShowMap(true);
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                  }}
                />
              ))}
            </div>
          ) : (
            <ComparisonTable 
              stations={filteredStations}
              weatherData={weatherData}
              onSelectStation={(st) => setSelectedStation(st)}
              onOpenEmbed={(st) => setEmbeddedStation(st)}
              onFocusMap={(st) => {
                setSelectedStation(st);
                setShowMap(true);
                window.scrollTo({ top: 180, behavior: 'smooth' });
              }}
            />
          )}
        </section>

        {/* Station Detail Modal with Recharts Graphs & Full WU Summary Table */}
        {selectedStation && (
          <StationDetailModal 
            station={selectedStation}
            weather={weatherData[selectedStation.id]}
            onClose={() => setSelectedStation(null)}
          />
        )}

        {/* Embedded Station Web View Modal */}
        {embeddedStation && (
          <EmbeddedStationModal 
            station={embeddedStation}
            onClose={() => setEmbeddedStation(null)}
          />
        )}

        {/* All Official Station Links Modal */}
        <StationLinksModal 
          stations={stations}
          isOpen={isLinksModalOpen}
          onClose={() => setIsLinksModalOpen(false)}
          onOpenEmbed={(st) => setEmbeddedStation(st)}
        />

        {/* Daily Bulletins Modal */}
        <DailyBulletinsModal 
          isOpen={isBulletinsModalOpen}
          onClose={() => setIsBulletinsModalOpen(false)}
        />

        {/* Add Station Modal */}
        <AddStationModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddStation={(newSt) => {
            const updated = [...stations, newSt];
            setStations(updated);
            fetchStationWeather(newSt).then(data => {
              setWeatherData(prev => ({ ...prev, [newSt.id]: data }));
            });
          }}
        />

        {/* Footer */}
        <Footer 
          stations={stations}
          weatherData={weatherData}
        />
      </div>
    </div>
  );
}

export default App;

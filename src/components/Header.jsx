import React from 'react';
import { 
  CloudSun, 
  RefreshCw, 
  Moon, 
  Sun, 
  PhoneCall,
  FileText,
  ExternalLink,
  PlusCircle,
  Link2,
  BarChart3
} from 'lucide-react';

export function Header({ 
  darkMode, 
  setDarkMode, 
  onRefresh, 
  isRefreshing, 
  lastUpdated, 
  countdownFormatted,
  countdownSeconds,
  stations, 
  weatherData,
  onOpenAddModal,
  onOpenBulletinsModal,
  onOpenLinksModal,
  onOpenChartTab
}) {
  const activeStations = stations.filter(s => weatherData[s.id]?.status !== 'offline');
  const validWeathers = activeStations.map(s => weatherData[s.id]?.current).filter(Boolean);
  
  const avgTemp = validWeathers.length > 0 
    ? (validWeathers.reduce((acc, curr) => acc + (curr.temp || 0), 0) / validWeathers.length).toFixed(1)
    : '--';

  const hottestStation = activeStations.reduce((max, s) => {
    const temp = weatherData[s.id]?.current?.temp || -999;
    return temp > (max?.temp || -999) ? { name: s.neighborhood, temp } : max;
  }, null);

  const highestWind = activeStations.reduce((max, s) => {
    const wind = weatherData[s.id]?.current?.windGusts || weatherData[s.id]?.current?.windSpeed || 0;
    return wind > (max?.wind || 0) ? { name: s.neighborhood, wind } : max;
  }, null);

  const maxRain24h = activeStations.reduce((max, s) => {
    const rain = weatherData[s.id]?.current?.rainToday != null 
      ? weatherData[s.id]?.current?.rainToday 
      : (weatherData[s.id]?.current?.rainAccumulated24h || 0);
    return rain > (max?.rain || 0) ? { name: s.neighborhood, rain } : max;
  }, null);

  return (
    <header className="space-y-3">
      {/* Top Navigation Bar - Minimalist & Elegant */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 shadow-xs">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-600 dark:bg-sky-500 flex items-center justify-center text-white shadow-xs flex-shrink-0">
            <CloudSun className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Clima Rio das Ostras
              </h1>
              <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Ao Vivo
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Rede oficial e particular &bull; WU &bull; INEA &bull; CEMADEN
            </p>
          </div>
        </div>

        {/* Unified Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
          {/* Gráfico Geral */}
          {onOpenChartTab && (
            <button
              onClick={onOpenChartTab}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-sky-700 dark:text-sky-300 bg-sky-50/80 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition border border-sky-200/50 dark:border-sky-800/40"
              title="Comparativo Visual e Gráfico de todas as estações"
            >
              <BarChart3 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span className="hidden xs:inline">Gráfico Geral</span>
            </button>
          )}

          {/* Boletins INEA */}
          <button
            onClick={onOpenBulletinsModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Boletins Diários do INEA em PDF"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden xs:inline">Boletins INEA</span>
          </button>

          {/* Links das Estações */}
          <button
            onClick={onOpenLinksModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Todos os links oficiais das estações"
          >
            <Link2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden xs:inline">Links</span>
          </button>

          {/* Defesa Civil 199 */}
          <a
            href="tel:199"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
            title="Defesa Civil: Ligue 199"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>199</span>
          </a>

          {/* Auto Refresh & Countdown Pill */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition active:scale-95 disabled:opacity-50"
            title="Atualizar leituras (ciclo automático de 5 min)"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-500' : 'text-slate-400'}`} />
            <span className="font-mono text-[11px] font-semibold text-sky-600 dark:text-sky-400">{countdownFormatted || '05:00'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={darkMode ? "Modo Claro" : "Modo Escuro"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Atmospheric Summary Bar - Sleek Single Horizontal Strip */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap shadow-2xs">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-slate-400">🌡️ Média:</span>
          <strong className="text-slate-900 dark:text-slate-100 font-bold">{avgTemp}°C</strong>
          <span className="text-[10px] text-slate-400 font-normal">({activeStations.length} ativas)</span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-slate-400">🔥 Mais Quente:</span>
          <strong className="text-amber-600 dark:text-amber-400 font-bold">
            {hottestStation?.temp != null && hottestStation.temp > -900 ? `${hottestStation.temp}°C` : '--'}
          </strong>
          <span className="text-[10px] text-slate-400 truncate max-w-[120px]">({hottestStation?.name || '--'})</span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-slate-400">💨 Vento Registrado:</span>
          <strong className="text-teal-600 dark:text-teal-400 font-bold">
            {highestWind?.wind != null ? `${highestWind.wind} km/h` : '--'}
          </strong>
          <span className="text-[10px] text-slate-400 truncate max-w-[120px]">({highestWind?.name || '--'})</span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0" title={`Maior chuva registrada hoje pelos pluviômetros físicos (${maxRain24h?.name || 'Rio das Ostras'})`}>
          <span className="text-slate-400">🌧️ Chuva (Hoje):</span>
          <strong className="text-sky-600 dark:text-sky-400 font-bold">
            {maxRain24h?.rain != null ? `${maxRain24h.rain} mm` : '0 mm'}
          </strong>
          {maxRain24h?.name && (
            <span className="text-[10px] text-slate-400 truncate max-w-[120px]">({maxRain24h.name})</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-slate-400">🌊 Rio Jundiá:</span>
          <strong className="text-cyan-700 dark:text-cyan-300 font-bold">1.38 m</strong>
          <span className="text-[10px] text-emerald-600 font-semibold">(Vigilância)</span>
        </div>
      </div>
    </header>
  );
}

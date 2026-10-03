import React from 'react';
import { 
  Droplets, 
  Wind, 
  Gauge, 
  MapPin, 
  Activity, 
  CloudRain, 
  ExternalLink, 
  Waves,
  AlertCircle,
  Clock
} from 'lucide-react';
import { WeatherIcon } from './WeatherIcon';

export function StationCard({ station, weather, onSelect, onFocusMap, onOpenEmbed, isSelected }) {
  const current = weather?.current;
  const status = weather?.status || station.defaultStatus || 'online';
  const isInactive = status === 'offline';
  const isOutdated = status === 'desatualizada';

  return (
    <div 
      className={`group relative rounded-2xl p-4 sm:p-5 transition-all duration-200 bg-white dark:bg-slate-900/90 border flex flex-col justify-between hover:shadow-md ${
        isInactive 
          ? 'border-slate-200/60 dark:border-slate-800/60 opacity-75 bg-slate-50/50 dark:bg-slate-900/40' 
          : isSelected 
            ? 'border-sky-500 dark:border-sky-400 shadow-md ring-1 ring-sky-500/50 dark:ring-sky-400/50' 
            : 'border-slate-200/80 dark:border-slate-800/80 hover:border-sky-300 dark:hover:border-sky-700/60'
      }`}
    >
      <div>
        {/* Top Minimalist Header: Network/Category + Live Status Dot */}
        <div className="flex items-center justify-between gap-2 mb-2 text-xs">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{station.category}</span>
            <span>&bull;</span>
            <span className="truncate max-w-[120px]">{station.network}</span>
          </div>

          {/* Clean Status Dot */}
          <div className="flex items-center gap-1.5">
            {isInactive ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                Inativa
              </span>
            ) : isOutdated ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Desatualizada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Ativa
              </span>
            )}
          </div>
        </div>

        {/* Station Title with Direct Official Portal Link */}
        <div className="mb-3">
          {station.externalUrl ? (
            <a
              href={station.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/title inline-flex items-center gap-1.5 font-bold text-base text-slate-900 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400 transition"
              title={`Acessar portal oficial da estação: ${station.externalUrl}`}
            >
              <span className="leading-snug">{station.name}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/title:text-sky-600 dark:group-hover/title:text-sky-400 flex-shrink-0 transition-colors" />
            </a>
          ) : (
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug">
              {station.name}
            </h3>
          )}

          <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-sky-500 flex-shrink-0" />
            <span className="truncate">{station.neighborhood} &bull; Alt: {station.altitude}m</span>
          </p>
        </div>

        {/* Inactive Notice */}
        {isInactive ? (
          <div className="my-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Sem transmissão recente</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              O sensor físico não enviou leituras recentes. Verifique o status diretamente no portal da estação.
            </p>
          </div>
        ) : (
          <>
            {/* INEA Rio Jundiá Hydrological Callout (Single-Line Accent) */}
            {station.isHydrological && (
              <div className="mb-3 px-3 py-1.5 rounded-xl bg-cyan-50/80 dark:bg-cyan-950/30 border border-cyan-200/60 dark:border-cyan-800/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Waves className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    Rio Jundiá: <strong className="text-cyan-800 dark:text-cyan-300 font-extrabold">{current?.riverLevel != null ? `${current.riverLevel} m` : (station.riverLevel != null ? `${station.riverLevel} m` : '1.38 m')}</strong>
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-900/60 px-2 py-0.5 rounded-md">
                  {current?.statusMonitoramento || station.statusMonitoramento || 'VIGILÂNCIA'}
                </span>
              </div>
            )}

            {/* CEMADEN PCD Pluviometric Callout */}
            {(station.network === 'CEMADEN' || current?.isPcdPluviometrica) && (
              <div className="mb-3 px-3 py-1.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    PCD Chuva: <strong className="text-blue-800 dark:text-blue-300 font-extrabold">24h: {current?.rainAccumulated24h != null ? `${current.rainAccumulated24h} mm` : '--'}</strong> &bull; 96h: {current?.rain96h != null ? `${current.rain96h} mm` : '--'}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-md">
                  CEMADEN
                </span>
              </div>
            )}

            {/* Hero Weather: Temperature, Icon & Conditions */}
            <div className="flex items-center justify-between my-2.5">
              <div className="flex items-center gap-3">
                <WeatherIcon 
                  iconName={current?.weatherInfo?.icon || 'Sun'} 
                  className="w-10 h-10 text-sky-500 flex-shrink-0"
                  isDay={current?.isDay ?? true}
                />
                <div>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                      {current?.temp != null ? `${current.temp}°` : '--'}
                    </span>
                    <span className="text-sm font-semibold text-slate-400 ml-0.5">C</span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    Sensação {current?.feelsLike != null ? `${current.feelsLike}°C` : '--'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {current?.weatherInfo?.label || 'Estável'}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                  {Math.round(weather?.tempMin || current?.temp || 21)}° &bull; {Math.round(weather?.tempMax || current?.temp || 24)}°
                </p>
              </div>
            </div>

            {/* Modern Inline Telemetry Bar (Single Cohesive Capsule) */}
            <div className="grid grid-cols-4 gap-1 py-2 px-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 text-center mb-3">
              {/* Chuva */}
              <div className="px-1" title="Volume acumulado hoje e taxa instantânea de chuva">
                <span className="text-[10px] text-slate-400 font-medium block">Chuva (Hoje)</span>
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 block truncate">
                  {current?.rainToday != null ? `${current.rainToday} mm` : `${current?.rainAccumulated24h || 0} mm`}
                </span>
                {current?.rainStartTime ? (
                  <span className="text-[9px] text-sky-600 dark:text-sky-400 block truncate font-medium" title={`Chuva iniciou às ${current.rainStartTime}`}>
                    início: {current.rainStartTime}
                  </span>
                ) : current?.rain > 0 ? (
                  <span className="text-[9px] text-sky-500 block truncate font-medium" title="Taxa / intensidade com que a chuva está caindo neste momento">
                    taxa: {current.rain} mm/h
                  </span>
                ) : (
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 block truncate">
                    sem chuva agora
                  </span>
                )}
              </div>

              {/* Vento */}
              <div className="px-1">
                <span className="text-[10px] text-slate-400 font-medium block">
                  Vento ({current?.windDirectionText || 'N'})
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                  {current?.windSpeed != null ? `${current.windSpeed} km/h` : '--'}
                </span>
                {current?.windGusts > 0 && (
                  <span className="text-[9px] text-teal-600 dark:text-teal-400 block truncate font-medium" title="Maior rajada de vento registrada">
                    raj: {current.windGusts} km/h
                  </span>
                )}
              </div>

              {/* Umidade */}
              <div className="px-1">
                <span className="text-[10px] text-slate-400 font-medium block">Umidade</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {current?.humidity != null ? `${current.humidity}%` : '--'}
                </span>
              </div>

              {/* Pressão */}
              <div className="px-1">
                <span className="text-[10px] text-slate-400 font-medium block">Pressão</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                  {current?.pressure != null ? `${current.pressure}` : '--'} <span className="text-[9px] font-normal text-slate-400">hPa</span>
                </span>
              </div>
            </div>

            {/* Multi-Window Accumulation Strip (1h, 4h, 6h, 9h, 12h, 24h, 48h, 96h) */}
            {current?.rainWindows && (
              <div className="mb-3 p-2 rounded-xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold mb-1.5 px-0.5">
                  <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    <Clock className="w-3 h-3 text-sky-500" /> Acumulado por Período:
                  </span>
                  {current.rainStartTime && (
                    <span className="text-sky-600 dark:text-sky-400 font-medium">
                      início: {current.rainStartTime}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 text-center">
                  {[
                    { label: '1h', val: current.rainWindows.h1 },
                    { label: '4h', val: current.rainWindows.h4 },
                    { label: '6h', val: current.rainWindows.h6 },
                    { label: '9h', val: current.rainWindows.h9 },
                    { label: '12h', val: current.rainWindows.h12 },
                    { label: '24h', val: current.rainWindows.h24 },
                    { label: '48h', val: current.rainWindows.h48 },
                    { label: '96h', val: current.rainWindows.h96 }
                  ].map(w => {
                    const num = typeof w.val === 'number' ? w.val : 0;
                    const hasRain = num > 0;
                    return (
                      <div 
                        key={w.label}
                        className={`py-1 px-0.5 rounded-lg border text-[10px] transition-colors ${
                          hasRain 
                            ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-900/50 text-blue-900 dark:text-blue-200' 
                            : 'bg-white/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/60 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 block leading-tight">{w.label}</span>
                        <span className={`font-mono font-bold leading-tight block ${hasRain ? (num >= 30 ? 'text-red-600 dark:text-red-400' : 'text-blue-700 dark:text-blue-300') : ''}`}>
                          {num.toFixed(1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Card Action Row - Elegant & Light */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        {!isInactive ? (
          <button
            onClick={() => onSelect(station)}
            className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100/70 hover:bg-sky-50 dark:bg-slate-800/70 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5 text-sky-500" />
            <span>Ver Gráficos &bull; Detalhes</span>
          </button>
        ) : (
          <div className="flex-1 text-[11px] text-slate-400 py-1.5 text-center font-medium">
            Sem dados recentes
          </div>
        )}

        <button
          onClick={() => onFocusMap(station)}
          title="Focar no mapa"
          className="p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-slate-500 hover:text-sky-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <MapPin className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

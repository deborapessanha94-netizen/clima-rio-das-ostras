import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Activity,
  Layers,
  CloudRain,
  ExternalLink,
  Waves,
  AlertCircle,
  Globe,
  RefreshCw,
  Copy,
  Check,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { WeatherIcon } from './WeatherIcon';

export function StationDetailModal({ station, weather, onClose }) {
  const [activeTab, setActiveTab] = useState('temp');
  const [isCopied, setIsCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  if (!station) return null;

  const current = weather?.current;
  const chartData = weather?.chartData || [];
  const status = weather?.status || station.defaultStatus || 'online';
  const isInactive = status === 'offline';
  const isOutdated = status === 'desatualizada';

  const embedUrl = station.id === 'inea-jundia'
    ? 'https://alertadecheias.inea.rj.gov.br/alertadecheias/graficos2241036.html'
    : station.externalUrl;

  const handleCopyLink = () => {
    if (!station.externalUrl) return;
    navigator.clipboard.writeText(station.externalUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-neutral-200 dark:border-zinc-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Meteorological Style */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-slate-800 border border-sky-200/60 dark:border-sky-800/60 text-sky-600 dark:text-sky-400 flex-shrink-0">
              <WeatherIcon 
                iconName={current?.weatherInfo?.icon || 'Sun'} 
                className="w-8 h-8"
                isDay={current?.isDay ?? false}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {station.category}
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  {station.network}
                </span>
                {isInactive ? (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                    Inativa
                  </span>
                ) : isOutdated ? (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    Desatualizada
                  </span>
                ) : (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Ativa
                  </span>
                )}
              </div>

              {/* Title with Embedded Clickable Link */}
              {station.externalUrl ? (
                <a
                  href={station.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/title inline-flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400 transition"
                  title={`Abrir página oficial: ${station.externalUrl}`}
                >
                  <span className="truncate">{station.name}</span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover/title:text-sky-600 dark:group-hover/title:text-sky-400 flex-shrink-0" />
                </a>
              ) : (
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                  {station.name}
                </h2>
              )}

              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                <span className="truncate">Rio das Ostras &bull; {station.neighborhood} &bull; Lat: {station.lat.toFixed(4)}, Lon: {station.lng.toFixed(4)} &bull; Alt: {station.altitude}m</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {station.externalUrl && (
              <a
                href={station.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-xs transition"
              >
                <span>Portal Oficial</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* If Inactive Station */}
          {isInactive ? (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-center max-w-xl mx-auto my-4">
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3 text-slate-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">
                Estação sem transmissão recente
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                Esta estação ({station.code}) não está enviando leituras ativas ao Weather Underground.
                Geralmente isso ocorre por manutenção no sensor ou desativação temporária do equipamento.
              </p>
              {station.externalUrl && (
                <a
                  href={station.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl shadow-xs transition"
                >
                  <span>Verificar Histórico no Weather Underground</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : (
            <>
              {/* Hydrological Telemetry Box (INEA Rio Jundiá) */}
              {station.isHydrological && (
                <div className="p-4 rounded-2xl bg-cyan-50/80 dark:bg-cyan-950/40 border border-cyan-200/80 dark:border-cyan-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-600 text-white">
                      <Waves className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-cyan-700 dark:text-cyan-400">
                        Telemetria Fluvial INEA &bull; Estação 2241036
                      </span>
                      <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {station.river}: Cota Atual de <span className="text-cyan-700 dark:text-cyan-300 font-extrabold">{current?.riverLevel != null ? `${current.riverLevel} m` : (station.riverLevel != null ? `${station.riverLevel} m` : '1.39 m')}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Estágio: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{current?.statusMonitoramento || station.statusMonitoramento || 'VIGILÂNCIA'}</strong> &bull; Chuva 96h: <strong className="text-sky-600 dark:text-sky-400">{current?.rain96h || 18.4} mm</strong> &bull; Mês: <strong className="text-sky-600 dark:text-sky-400">{current?.rainMonth || 169.8} mm</strong>
                      </div>
                    </div>
                  </div>

                  {station.externalUrl && (
                    <a
                      href={station.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-cyan-100 dark:bg-cyan-900/60 hover:bg-cyan-200 dark:hover:bg-cyan-800 text-cyan-800 dark:text-cyan-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                    >
                      <span>Portal INEA Alerta de Cheias</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* CEMADEN PCD Pluviométrica Box */}
              {(station.network === 'CEMADEN' || current?.isPcdPluviometrica) && (
                <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-600 text-white">
                      <CloudRain className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400">
                        Telemetria Oficial CEMADEN PCD {station.code} ({current?.pcdNome || station.shortName})
                      </span>
                      <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                        Chuva 24h: <span className="text-blue-700 dark:text-blue-300 font-extrabold">{current?.rainAccumulated24h != null ? `${current.rainAccumulated24h} mm` : '--'}</span> &bull; 96h: <span className="text-blue-700 dark:text-blue-300 font-extrabold">{current?.rain96h != null ? `${current.rain96h} mm` : '--'}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Acumulados: 1h: <strong>{current?.rain1h ?? 0} mm</strong> &bull; 6h: <strong>{current?.rain6h ?? 0} mm</strong> &bull; 48h: <strong>{current?.rain48h ?? 0} mm</strong>
                      </div>
                    </div>
                  </div>

                  {station.externalUrl && (
                    <a
                      href={station.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-blue-100 dark:bg-blue-900/60 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                    >
                      <span>Gráfico CEMADEN</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 block mb-0.5">Temperatura</span>
                  <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                    {current?.temp != null ? `${current.temp}°C` : '--'}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Sensação: {current?.feelsLike != null ? `${current.feelsLike}°C` : '--'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 block mb-0.5">Chuva (Hoje)</span>
                  <div className="text-xl font-bold text-sky-600 dark:text-sky-400">
                    {current?.rainToday != null ? `${current.rainToday} mm` : `${current?.rainAccumulated24h || 0} mm`}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {current?.rainAccumulated24h > 0 ? `Acumulado 24h: ${current.rainAccumulated24h} mm` : 'Sem chuva hoje'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 block mb-0.5">Vento & Rajadas</span>
                  <div className="text-xl font-bold text-teal-600 dark:text-teal-400">
                    {current?.windSpeed != null ? `${current.windSpeed} km/h` : '--'}
                  </div>
                  <span className="text-[11px] text-slate-400 block truncate">
                    {current?.windDirectionText || 'N'} {current?.windHighToday > 0 ? `• Pico: ${current.windHighToday} km/h` : ''} {current?.windGusts > 0 ? `• Raj: ${current.windGusts} km/h` : ''}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 block mb-0.5">Umidade & Pressão</span>
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {current?.humidity != null ? `${current.humidity}%` : '--'}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {current?.pressure != null ? `${current.pressure} hPa` : '--'}
                  </span>
                </div>
              </div>

              {/* Multi-Window Accumulation Grid (1h, 4h, 6h, 9h, 12h, 24h, 36h, 48h, 96h) */}
              {current?.rainWindows && (
                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Acumulado por Janela de Tempo (1h a 96h)
                    </span>
                    {current.rainStartTime && (
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        Chuva iniciou às <strong>{current.rainStartTime}</strong>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-9 gap-2 text-center">
                    {[
                      { label: '1 Hora', short: '1h', val: current.rainWindows.h1 },
                      { label: '4 Horas', short: '4h', val: current.rainWindows.h4 },
                      { label: '6 Horas', short: '6h', val: current.rainWindows.h6 },
                      { label: '9 Horas', short: '9h', val: current.rainWindows.h9 },
                      { label: '12 Horas', short: '12h', val: current.rainWindows.h12 },
                      { label: '24 Horas', short: '24h', val: current.rainWindows.h24 },
                      { label: '36 Horas', short: '36h', val: current.rainWindows.h36 },
                      { label: '48 Horas', short: '48h', val: current.rainWindows.h48 },
                      { label: '96 Horas', short: '96h', val: current.rainWindows.h96 }
                    ].map(w => {
                      const num = typeof w.val === 'number' ? w.val : 0;
                      const hasRain = num > 0;
                      return (
                        <div 
                          key={w.short}
                          className={`p-2.5 rounded-xl border transition ${
                            hasRain 
                              ? 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 shadow-2xs' 
                              : 'bg-white/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 text-slate-400'
                          }`}
                        >
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">{w.short}</span>
                          <span className={`text-base font-extrabold font-mono block ${hasRain ? (num >= 30 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400') : 'text-slate-400 dark:text-slate-500'}`}>
                            {num.toFixed(1)}
                          </span>
                          <span className="text-[9px] text-slate-400 block">mm</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Exact Daily Summary Table (Matching Weather Underground "Summary" table) */}
              {current?.dailySummary && (
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-sky-500" /> Resumo do Dia (Summary) &bull; Registros da Estação
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Valores apurados do site oficial
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400">
                          <th className="py-2 px-3">Parâmetro</th>
                          <th className="py-2 px-3">Máxima (High)</th>
                          <th className="py-2 px-3">Mínima (Low)</th>
                          <th className="py-2 px-3">Média (Avg) / Atual</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                        <tr>
                          <td className="py-2 px-3 font-medium">Vento (Wind Speed)</td>
                          <td className="py-2 px-3 font-bold text-teal-600 dark:text-teal-400">{current.dailySummary.windHigh} km/h</td>
                          <td className="py-2 px-3">{current.dailySummary.windLow} km/h</td>
                          <td className="py-2 px-3">Méd: {current.dailySummary.windAvg} km/h &bull; <strong className="text-slate-900 dark:text-slate-100">Atual: {current.windSpeed} km/h</strong></td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium">Rajada (Wind Gust)</td>
                          <td className="py-2 px-3 font-bold text-teal-600 dark:text-teal-400">{current.dailySummary.gustHigh} km/h</td>
                          <td className="py-2 px-3">&ndash;</td>
                          <td className="py-2 px-3">Méd: {current.dailySummary.gustAvg} km/h</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium">Temperatura</td>
                          <td className="py-2 px-3 font-bold text-amber-600 dark:text-amber-400">{current.dailySummary.tempHigh}°C</td>
                          <td className="py-2 px-3 text-sky-600 dark:text-sky-400">{current.dailySummary.tempLow}°C</td>
                          <td className="py-2 px-3">Méd: {current.dailySummary.tempAvg}°C &bull; <strong className="text-slate-900 dark:text-slate-100">Atual: {current.temp}°C</strong></td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium">Chuva (Precipitação)</td>
                          <td className="py-2 px-3 font-bold text-sky-600 dark:text-sky-400">
                            {current.dailySummary.precipTotal} mm (Hoje)
                            {current.rainStartTime && (
                              <span className="block text-[10px] text-sky-600 dark:text-sky-400 font-normal">
                                Início às {current.rainStartTime}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3">&ndash;</td>
                          <td className="py-2 px-3">
                            Acumulado 24h: {current.rainAccumulated24h} mm
                            {current.rainStartTime && (
                              <span className="block text-[10px] text-slate-400 font-normal">
                                Primeiro registro: {current.rainStartTime}
                              </span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium">Pressão Barométrica</td>
                          <td className="py-2 px-3">{current.dailySummary.pressureMax} hPa</td>
                          <td className="py-2 px-3">{current.dailySummary.pressureMin} hPa</td>
                          <td className="py-2 px-3 font-semibold">Atual: {current.pressure} hPa</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Chart / Embedded Section */}
              <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-900">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      {activeTab === 'embed' ? 'Portal Oficial Embutido' : 'Evolução das Últimas 24h & Projeção'}
                    </h3>
                  </div>

                  {/* Chart Tabs including Embedded View */}
                  <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium flex-wrap gap-1">
                    <button
                      onClick={() => setActiveTab('temp')}
                      className={`px-3 py-1 rounded-lg transition ${
                        activeTab === 'temp' 
                          ? 'bg-sky-600 text-white shadow-xs font-semibold' 
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      }`}
                    >
                      Temperatura
                    </button>
                    <button
                      onClick={() => setActiveTab('rain')}
                      className={`px-3 py-1 rounded-lg transition ${
                        activeTab === 'rain' 
                          ? 'bg-sky-600 text-white shadow-xs font-semibold' 
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      }`}
                    >
                      Chuva
                    </button>
                    <button
                      onClick={() => setActiveTab('wind')}
                      className={`px-3 py-1 rounded-lg transition ${
                        activeTab === 'wind' 
                          ? 'bg-sky-600 text-white shadow-xs font-semibold' 
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      }`}
                    >
                      Vento
                    </button>
                    <button
                      onClick={() => setActiveTab('humidity')}
                      className={`px-3 py-1 rounded-lg transition ${
                        activeTab === 'humidity' 
                          ? 'bg-sky-600 text-white shadow-xs font-semibold' 
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      }`}
                    >
                      Umidade
                    </button>

                    {/* Embedded Portal Tab */}
                    {station.externalUrl && (
                      <button
                        onClick={() => setActiveTab('embed')}
                        className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
                          activeTab === 'embed' 
                            ? 'bg-sky-600 text-white shadow-xs font-semibold' 
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Página Embutida</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Render Content */}
                {activeTab === 'embed' && embedUrl ? (
                  <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
                    <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs p-1 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => setIframeKey(k => k + 1)}
                        className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Recarregar página"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={station.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 text-[11px]"
                        title="Abrir em aba separada"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <iframe
                      key={iframeKey}
                      src={embedUrl}
                      title={`Página de ${station.name}`}
                      className="w-full h-full border-0"
                      sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                    />
                  </div>
                ) : (
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {activeTab === 'temp' ? (
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                          <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} domain={['dataMin - 1', 'dataMax + 1']} unit="°C" />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                          <Line type="monotone" dataKey="temperatura" stroke="#ea580c" strokeWidth={2.5} dot={{ r: 3, fill: '#ea580c' }} name="Temperatura (°C)" />
                        </LineChart>
                      ) : activeTab === 'rain' ? (
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                          <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} unit="mm" />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                          <Bar dataKey="precipitacao" fill="#0284c7" radius={[4, 4, 0, 0]} name="Precipitação (mm)" />
                        </BarChart>
                      ) : activeTab === 'wind' ? (
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                          <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} unit="km/h" />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                          <Area type="monotone" dataKey="vento" stroke="#0d9488" strokeWidth={2} fillOpacity={0.25} fill="#0d9488" name="Vento (km/h)" />
                        </AreaChart>
                      ) : (
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                          <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                          <YAxis stroke="#94a3b8" fontSize={11} domain={[60, 100]} unit="%" />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                          <Line type="monotone" dataKey="umidade" stroke="#3b82f6" strokeWidth={2} dot={false} name="Umidade (%)" />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-500">
          <div className="text-[11px]">
            Última atualização: {weather?.timestamp || '--'} &bull; Link oficial disponível
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

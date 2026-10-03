import React, { useState } from 'react';
import { 
  ArrowUpDown, 
  MapPin, 
  Activity, 
  ExternalLink, 
  Search,
  Globe
} from 'lucide-react';

export function ComparisonTable({ stations, weatherData, onSelectStation, onFocusMap, onOpenEmbed }) {
  const [sortField, setSortField] = useState('temp');
  const [sortAsc, setSortAsc] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredStations = stations.filter(st => {
    const q = searchTerm.toLowerCase();
    return st.name.toLowerCase().includes(q) || 
           st.neighborhood.toLowerCase().includes(q) || 
           st.network.toLowerCase().includes(q) ||
           (st.code && st.code.toLowerCase().includes(q));
  });

  const sortedStations = [...filteredStations].sort((a, b) => {
    const wA = weatherData[a.id]?.current;
    const wB = weatherData[b.id]?.current;
    if (!wA && !wB) return 0;
    if (!wA) return 1;
    if (!wB) return -1;

    let valA = 0;
    let valB = 0;

    switch (sortField) {
      case 'temp':
        valA = wA.temp || 0;
        valB = wB.temp || 0;
        break;
      case 'feelsLike':
        valA = wA.feelsLike || 0;
        valB = wB.feelsLike || 0;
        break;
      case 'rain':
        valA = wA.rainAccumulated24h || 0;
        valB = wB.rainAccumulated24h || 0;
        break;
      case 'wind':
        valA = wA.windSpeed || 0;
        valB = wB.windSpeed || 0;
        break;
      case 'humidity':
        valA = wA.humidity || 0;
        valB = wB.humidity || 0;
        break;
      case 'river':
        valA = a.riverLevel || 0;
        valB = b.riverLevel || 0;
        break;
      default:
        return 0;
    }

    return sortAsc ? valA - valB : valB - valA;
  });

  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            Painel Comparativo das Estações &ndash; Rio das Ostras
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Comparativo de leituras em tempo real, cotas fluviais e status operacional
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Filtrar por nome, código ou bairro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-slate-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-2.5 px-4">Estação (Código & Nome)</th>
              <th className="py-2.5 px-3">Bairro</th>
              <th className="py-2.5 px-3">Status</th>
              <th 
                className="py-2.5 px-3 cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 transition"
                onClick={() => handleSort('river')}
              >
                <div className="flex items-center gap-1">
                  <span>Cota Rio Jundiá</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th 
                className="py-2.5 px-3 cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 transition"
                onClick={() => handleSort('temp')}
              >
                <div className="flex items-center gap-1">
                  <span>Temp.</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th 
                className="py-2.5 px-3 cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 transition"
                onClick={() => handleSort('rain')}
              >
                <div className="flex items-center gap-1">
                  <span>Chuva 24h</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th 
                className="py-2.5 px-3 cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 transition"
                onClick={() => handleSort('wind')}
              >
                <div className="flex items-center gap-1">
                  <span>Vento</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th 
                className="py-2.5 px-3 cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 transition"
                onClick={() => handleSort('humidity')}
              >
                <div className="flex items-center gap-1">
                  <span>Umidade</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedStations.map((station) => {
              const weather = weatherData[station.id];
              const current = weather?.current;
              const status = weather?.status || station.defaultStatus || 'online';
              const isInactive = status === 'offline';
              const isOutdated = status === 'desatualizada';

              return (
                <tr 
                  key={station.id}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                    isInactive ? 'opacity-60 bg-slate-50/40 dark:bg-slate-900/30' : ''
                  }`}
                >
                  <td className="py-2.5 px-4">
                    {station.externalUrl ? (
                      <a
                        href={station.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/name font-semibold text-slate-900 dark:text-slate-100 text-xs hover:text-sky-600 dark:hover:text-sky-400 inline-flex items-center gap-1 transition"
                        title={`Abrir página oficial: ${station.externalUrl}`}
                      >
                        <span>{station.name}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-400 group-hover/name:text-sky-600" />
                      </a>
                    ) : (
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                        {station.name}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {station.network} &bull; {station.altitude}m
                    </div>
                  </td>

                  <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                    {station.neighborhood}
                  </td>

                  <td className="py-2.5 px-3">
                    {isInactive ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        Inativa
                      </span>
                    ) : isOutdated ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                        Desatualizada
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
                        Ativa
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 font-semibold text-cyan-700 dark:text-cyan-400">
                    {station.isHydrological ? (
                      <span>{current?.riverLevel != null ? `${current.riverLevel} m` : (station.riverLevel != null ? `${station.riverLevel} m` : '1.39 m')}</span>
                    ) : (
                      <span className="text-slate-400 font-normal">&ndash;</span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                    {!isInactive && current?.temp != null ? `${current.temp}°C` : '--'}
                  </td>

                  <td className="py-2.5 px-3 font-semibold text-sky-700 dark:text-sky-400">
                    {!isInactive && current?.rainAccumulated24h != null ? (
                      <span>{current.rainAccumulated24h} mm</span>
                    ) : (
                      <span className="text-slate-400 font-normal">--</span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                    {!isInactive && current?.windSpeed != null ? (
                      <span>
                        {current.windSpeed} km/h
                        {current.windGusts > 0 ? (
                          <span className="text-[10px] text-teal-600 dark:text-teal-400 ml-1">
                            (raj: {current.windGusts})
                          </span>
                        ) : current.maxSpeed24h > 0 ? (
                          <span className="text-[10px] text-teal-600 dark:text-teal-400 ml-1">
                            (máx: {current.maxSpeed24h})
                          </span>
                        ) : null}
                      </span>
                    ) : '--'}
                  </td>

                  <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                    {!isInactive && current?.humidity != null ? `${current.humidity}%` : '--'}
                  </td>

                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onFocusMap(station)}
                        className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-sky-600 transition"
                        title="Ver no mapa"
                      >
                        <MapPin className="w-3 h-3" />
                      </button>
                      {!isInactive && (
                        <button
                          onClick={() => onSelectStation(station)}
                          className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-[11px] transition shadow-xs active:scale-95"
                        >
                          Gráficos
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

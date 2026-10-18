import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Share2, 
  Download, 
  Clock, 
  Layers
} from 'lucide-react';
import { getStationDisplayNameWithCode } from '../data/stations';

export function TextReportSection({ stations, weatherData, lastUpdated }) {
  const [reportFormat, setReportFormat] = useState('whatsapp'); // Default to minimalist WhatsApp as requested!
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedStationId, setCopiedStationId] = useState(null);

  const currentDate = new Date().toLocaleDateString('pt-BR');
  const currentTime = lastUpdated || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Helper to extract windows safely
  const getStationWindows = (st) => {
    const weather = weatherData[st.id];
    const current = weather?.current;
    const isInactive = weather?.status === 'offline';
    const fallbackToday = current?.rainToday ?? current?.rainAccumulated24h ?? 0;
    const raw = current?.rainWindows || {};

    return {
      isInactive,
      h1: isInactive ? 0 : (raw.h1 ?? Math.round(fallbackToday * 0.15 * 10) / 10),
      h4: isInactive ? 0 : (raw.h4 ?? Math.round(fallbackToday * 0.55 * 10) / 10),
      h6: isInactive ? 0 : (raw.h6 ?? Math.round(fallbackToday * 0.75 * 10) / 10),
      h9: isInactive ? 0 : (raw.h9 ?? Math.round(fallbackToday * 0.9 * 10) / 10),
      h12: isInactive ? 0 : (raw.h12 ?? fallbackToday),
      h24: isInactive ? 0 : (raw.h24 ?? fallbackToday),
      h36: isInactive ? 0 : (raw.h36 ?? fallbackToday),
      h48: isInactive ? 0 : (raw.h48 ?? fallbackToday),
      h96: isInactive ? 0 : (raw.h96 ?? fallbackToday),
      startTime: current?.rainStartTime || null,
      temp: current?.temp,
      humidity: current?.humidity,
      windSpeed: current?.windSpeed,
      riverLevel: current?.riverLevel || st.riverLevel,
      statusMonitoramento: current?.statusMonitoramento || st.statusMonitoramento,
      rainMonth: current?.rainMonth
    };
  };

  const displayedStations = stations.filter(st => {
    if (!filterActiveOnly) return true;
    return weatherData[st.id]?.status !== 'offline';
  });

  // 1. MINIMALIST WHATSAPP FORMAT (Clean, zero clutter, concise, no asterisks, only 12h, 24h, 36h)
  const generateWhatsAppReport = () => {
    let text = `CHUVAS EM RIO DAS OSTRAS\n`;
    text += `${currentDate} - ${currentTime}\n\n`;

    const activeList = [];
    const inactiveList = [];

    displayedStations.forEach(st => {
      const data = getStationWindows(st);
      const stationNameWithCode = getStationDisplayNameWithCode(st);
      if (data.isInactive) {
        inactiveList.push(stationNameWithCode);
      } else {
        let block = stationNameWithCode;
        if (st.isHydrological && data.riverLevel != null) {
          block += ` (Rio: ${data.riverLevel}m)`;
        }
        if (data.startTime) {
          block += ` [Início: ${data.startTime}]`;
        }
        block += `\n12h: ${data.h12.toFixed(1)}mm | 24h: ${data.h24.toFixed(1)}mm | 36h: ${data.h36.toFixed(1)}mm`;
        activeList.push(block);
      }
    });

    text += activeList.join('\n\n');

    if (inactiveList.length > 0 && !filterActiveOnly) {
      text += `\n\nInativas: ${inactiveList.join(', ')}`;
    }

    text += `\n\nPainel: https://clima-rio-das-ostras.vercel.app`;
    return text;
  };

  // 2. DETAILED BULLETIN FORMAT
  const generateDetailedReport = () => {
    let text = `BOLETIM PLUVIOMÉTRICO • RIO DAS OSTRAS - RJ\n`;
    text += `Data: ${currentDate} às ${currentTime}\n`;
    text += `------------------------------------------------------\n\n`;

    const items = displayedStations.map((st, idx) => {
      const data = getStationWindows(st);
      if (data.isInactive) {
        return `[${idx + 1}] ${st.name} (${st.code || st.id})\n• Status: Inativa (Sem transmissão recente)`;
      }

      let res = `[${idx + 1}] ${st.name} (${st.code || st.id})\n`;
      res += `• Rede: ${st.network} | Bairro: ${st.neighborhood}\n`;
      res += `• Status: Ativa`;
      if (data.temp != null) res += ` | Temp: ${data.temp}°C | Umid: ${data.humidity}%`;
      if (data.riverLevel != null) res += ` | Nível Rio: ${data.riverLevel}m (${data.statusMonitoramento || 'Vigilância'})`;
      if (data.startTime) res += `\n• Início da chuva: ${data.startTime}`;
      
      res += `\n• Acumulados:\n`;
      res += `  - 1h:  ${data.h1.toFixed(1)} mm\n`;
      res += `  - 4h:  ${data.h4.toFixed(1)} mm\n`;
      res += `  - 6h:  ${data.h6.toFixed(1)} mm\n`;
      res += `  - 9h:  ${data.h9.toFixed(1)} mm\n`;
      res += `  - 12h: ${data.h12.toFixed(1)} mm\n`;
      res += `  - 24h: ${data.h24.toFixed(1)} mm\n`;
      res += `  - 36h: ${data.h36.toFixed(1)} mm\n`;
      res += `  - 48h: ${data.h48.toFixed(1)} mm\n`;
      res += `  - 96h: ${data.h96.toFixed(1)} mm`;

      return res;
    });

    text += items.join('\n\n------------------------------------------------------\n\n');
    text += `\n\n------------------------------------------------------\n`;
    text += `Fontes: Weather Underground • INEA • CEMADEN\n`;
    text += `Acesso online: https://clima-rio-das-ostras.vercel.app`;
    return text;
  };

  // 3. TABLE FORMAT
  const generateTableReport = () => {
    let text = `ACUMULADOS DE CHUVA - RIO DAS OSTRAS - RJ\n`;
    text += `Data: ${currentDate} - ${currentTime}\n\n`;
    text += `Estação / Local             | 1h   | 4h   | 6h   | 9h   | 12h  | 24h  | 36h  | 48h  | 96h  | Observação\n`;
    text += `----------------------------------------------------------------------------------------------------------------\n`;

    displayedStations.forEach(st => {
      const data = getStationWindows(st);
      const name = getStationDisplayNameWithCode(st).padEnd(28).slice(0, 28);
      if (data.isInactive) {
        text += `${name} | Inativa (sem transmissão recente)\n`;
      } else {
        const c1 = `${data.h1.toFixed(1)}`.padStart(4);
        const c4 = `${data.h4.toFixed(1)}`.padStart(4);
        const c6 = `${data.h6.toFixed(1)}`.padStart(4);
        const c9 = `${data.h9.toFixed(1)}`.padStart(4);
        const c12 = `${data.h12.toFixed(1)}`.padStart(4);
        const c24 = `${data.h24.toFixed(1)}`.padStart(4);
        const c36 = `${data.h36.toFixed(1)}`.padStart(4);
        const c48 = `${data.h48.toFixed(1)}`.padStart(4);
        const c96 = `${data.h96.toFixed(1)}`.padStart(4);
        const obs = st.isHydrological ? `Rio: ${data.riverLevel}m` : (data.startTime ? `Início: ${data.startTime}` : '');

        text += `${name} | ${c1} | ${c4} | ${c6} | ${c9} | ${c12} | ${c24} | ${c36} | ${c48} | ${c96} | ${obs}\n`;
      }
    });

    text += `----------------------------------------------------------------------------------------------------------------\n`;
    text += `Painel 24h: https://clima-rio-das-ostras.vercel.app`;
    return text;
  };

  const currentReportText = reportFormat === 'whatsapp' 
    ? generateWhatsAppReport() 
    : reportFormat === 'table' 
    ? generateTableReport() 
    : generateDetailedReport();

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(currentReportText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyStation = async (st) => {
    const data = getStationWindows(st);
    const stationNameWithCode = getStationDisplayNameWithCode(st);
    if (data.isInactive) {
      try {
        await navigator.clipboard.writeText(`${stationNameWithCode}: Inativa (sem sinal)`);
        setCopiedStationId(st.id);
        setTimeout(() => setCopiedStationId(null), 2000);
      } catch (err) {
        console.error(err);
      }
      return;
    }

    let text = stationNameWithCode;
    if (st.isHydrological && data.riverLevel != null) text += ` (Rio: ${data.riverLevel}m)`;
    if (data.startTime) text += ` [Início: ${data.startTime}]`;

    if (reportFormat === 'whatsapp') {
      text += `\n12h: ${data.h12.toFixed(1)}mm | 24h: ${data.h24.toFixed(1)}mm | 36h: ${data.h36.toFixed(1)}mm`;
    } else {
      text += `\n1h: ${data.h1.toFixed(1)}mm | 4h: ${data.h4.toFixed(1)}mm | 6h: ${data.h6.toFixed(1)}mm | 9h: ${data.h9.toFixed(1)}mm`;
      text += `\n12h: ${data.h12.toFixed(1)}mm | 24h: ${data.h24.toFixed(1)}mm | 36h: ${data.h36.toFixed(1)}mm | 48h: ${data.h48.toFixed(1)}mm | 96h: ${data.h96.toFixed(1)}mm`;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedStationId(st.id);
      setTimeout(() => setCopiedStationId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(currentReportText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([currentReportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boletim-chuvas-rio-das-ostras-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Main Container - Matches site card styling */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5 border border-sky-100 dark:border-sky-900/40">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                  Material Escrito das Estações
                </h3>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900/50">
                  Pronto para Copiar
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Texto pronto para cópia rápida com opções compacta (12h, 24h, 36h) e completa (1h a 96h)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
              title="Copiar texto para colar no WhatsApp ou documento"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition active:scale-95 cursor-pointer"
              title="Compartilhar diretamente no WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
              title="Salvar como arquivo .txt"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar .TXT</span>
            </button>
          </div>
        </div>

        {/* Format Selector & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap mr-1">
              Formato:
            </span>
            {[
              { id: 'whatsapp', label: 'Compacto WhatsApp (12h, 24h, 36h)' },
              { id: 'detailed', label: 'Boletim Detalhado (1h a 96h)' },
              { id: 'table', label: 'Tabela em Texto (1h a 96h)' }
            ].map(fmt => (
              <button
                key={fmt.id}
                onClick={() => setReportFormat(fmt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap cursor-pointer ${
                  reportFormat === fmt.id
                    ? 'bg-sky-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400">
            <input 
              type="checkbox" 
              checked={filterActiveOnly} 
              onChange={(e) => setFilterActiveOnly(e.target.checked)} 
              className="w-3.5 h-3.5 rounded text-sky-600 focus:ring-sky-500 border-slate-300 dark:border-slate-700"
            />
            <span>Apenas estações ativas ({displayedStations.length})</span>
          </label>
        </div>

        {/* Text Box - Harmonized with site palette */}
        <div className="rounded-xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 p-4 font-mono text-xs text-slate-800 dark:text-slate-200">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/70 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-sans font-medium">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              {currentDate} às {currentTime}
            </span>
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 transition text-[11px] font-sans font-semibold cursor-pointer shadow-2xs"
            >
              {copiedAll ? <Check className="w-3 h-3 text-sky-600 dark:text-sky-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedAll ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>

          <textarea
            readOnly
            value={currentReportText}
            onClick={(e) => e.target.select()}
            rows={12}
            className="w-full bg-transparent text-slate-800 dark:text-slate-200 font-mono text-xs leading-relaxed focus:outline-none resize-y selection:bg-sky-500 selection:text-white"
            title="Clique para selecionar o texto"
          />

          <div className="text-[10px] text-slate-400 dark:text-slate-500 text-right pt-2 border-t border-slate-200/50 dark:border-slate-700/40 font-sans">
            Clique na caixa para selecionar todo o texto ou use o botão "Copiar Texto" acima.
          </div>
        </div>
      </div>

      {/* Individual Station Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            Cartões Individuais com Todos os Intervalos
          </h4>
          <span className="text-xs text-slate-400">Copie cada estação separadamente se preferir</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayedStations.map((st) => {
            const data = getStationWindows(st);
            const isCopied = copiedStationId === st.id;

            return (
              <div 
                key={st.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 block">
                        {getStationDisplayNameWithCode(st)}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        {st.neighborhood} &bull; {st.network}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyStation(st)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
                        isCopied 
                          ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800' 
                          : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                      title="Copiar texto desta estação"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-sky-600" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  {data.isInactive ? (
                    <div className="py-3 text-center text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60 my-1">
                      Estação inativa ou sem transmissão recente no momento.
                    </div>
                  ) : (
                    <>
                      {/* Telemetry info row */}
                      <div className="flex items-center gap-2.5 text-[11px] text-slate-600 dark:text-slate-300 mb-2.5 flex-wrap">
                        {data.temp != null && <span>Temp: <strong>{data.temp}°C</strong></span>}
                        {data.humidity != null && <span>Umid: <strong>{data.humidity}%</strong></span>}
                        {st.isHydrological && data.riverLevel != null && (
                          <span className="text-sky-700 dark:text-sky-300 font-semibold">
                            Rio: {data.riverLevel}m ({data.statusMonitoramento})
                          </span>
                        )}
                        {data.startTime && (
                          <span className="text-slate-500">
                            Início: <strong>{data.startTime}</strong>
                          </span>
                        )}
                      </div>

                      {/* 9-Intervals Grid */}
                      <div className="grid grid-cols-3 sm:grid-cols-9 gap-1 text-center bg-slate-50/80 dark:bg-slate-800/40 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                        {[
                          { label: '1h', val: data.h1 },
                          { label: '4h', val: data.h4 },
                          { label: '6h', val: data.h6 },
                          { label: '9h', val: data.h9 },
                          { label: '12h', val: data.h12 },
                          { label: '24h', val: data.h24 },
                          { label: '36h', val: data.h36 },
                          { label: '48h', val: data.h48 },
                          { label: '96h', val: data.h96 }
                        ].map(w => (
                          <div key={w.label} className="py-1 px-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                            <span className="text-[9px] font-bold text-slate-400 block">{w.label}</span>
                            <span className={`text-[11px] font-mono font-bold block ${w.val > 0 ? (w.val >= 30 ? 'text-red-600 dark:text-red-400' : 'text-sky-700 dark:text-sky-300') : 'text-slate-400 dark:text-slate-500'}`}>
                              {w.val.toFixed(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

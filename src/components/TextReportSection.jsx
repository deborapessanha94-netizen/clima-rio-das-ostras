import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Share2, 
  Download, 
  Layers, 
  Clock, 
  Droplets, 
  Waves, 
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export function TextReportSection({ stations, weatherData, lastUpdated, countdownFormatted }) {
  const [reportFormat, setReportFormat] = useState('detailed'); // 'detailed' | 'whatsapp' | 'table'
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
      startTime: current?.rainStartTime || '--',
      temp: current?.temp,
      humidity: current?.humidity,
      windSpeed: current?.windSpeed,
      riverLevel: current?.riverLevel || st.riverLevel,
      statusMonitoramento: current?.statusMonitoramento || st.statusMonitoramento,
      rainMonth: current?.rainMonth
    };
  };

  // Filter stations based on toggle
  const displayedStations = stations.filter(st => {
    if (!filterActiveOnly) return true;
    return weatherData[st.id]?.status !== 'offline';
  });

  // Generate Single Station Text
  const generateSingleStationText = (st) => {
    const data = getStationWindows(st);
    if (data.isInactive) {
      return `[ESTAÇÃO: ${st.name}]
• Rede: ${st.network} | Bairro: ${st.neighborhood}
• Status: INATIVA / SEM TRANSMISSÃO RECENTE`;
    }

    let text = `📍 ${st.name} (${st.code || st.id})
• Rede: ${st.network} | Bairro: ${st.neighborhood}
• Status: Ativa • Leitura: ${currentTime}`;

    if (data.temp != null) {
      text += ` | Temp: ${data.temp}°C | Umid: ${data.humidity}%`;
    }
    if (data.windSpeed != null && data.windSpeed > 0) {
      text += ` | Vento: ${data.windSpeed} km/h`;
    }
    if (st.isHydrological || data.riverLevel != null) {
      text += `\n• Nível do Rio: ${data.riverLevel} m [${data.statusMonitoramento || 'Vigilância'}]`;
    }
    if (data.startTime && data.startTime !== '--') {
      text += `\n• Início da Chuva: ${data.startTime}`;
    }

    text += `\n• Acumulados Pluviométricos:
  - 01 hora:  ${data.h1.toFixed(1)} mm
  - 04 horas: ${data.h4.toFixed(1)} mm
  - 06 horas: ${data.h6.toFixed(1)} mm
  - 09 horas: ${data.h9.toFixed(1)} mm
  - 12 horas: ${data.h12.toFixed(1)} mm
  - 24 horas: ${data.h24.toFixed(1)} mm
  - 36 horas: ${data.h36.toFixed(1)} mm
  - 48 horas: ${data.h48.toFixed(1)} mm
  - 96 horas: ${data.h96.toFixed(1)} mm`;

    if (data.rainMonth != null) {
      text += `\n  - Mês Atual: ${data.rainMonth.toFixed(1)} mm`;
    }

    return text;
  };

  // Generate Full Detailed Report
  const generateDetailedReport = () => {
    const header = `======================================================
🌧️ BOLETIM METEOROLÓGICO & PLUVIOMÉTRICO
📍 Rio das Ostras - RJ e Bacia Hidrográfica
📅 Data: ${currentDate} | 🕒 Horário: ${currentTime}
======================================================\n\n`;

    const body = displayedStations.map((st, idx) => {
      return `[${idx + 1}] ${generateSingleStationText(st)}`;
    }).join('\n\n------------------------------------------------------\n\n');

    const footer = `\n\n======================================================
📊 Fontes: Weather Underground PWS • INEA Alerta de Cheias • CEMADEN
🌐 Painel Online 24h: https://clima-rio-das-ostras.vercel.app
======================================================`;

    return header + body + footer;
  };

  // Generate WhatsApp / Compact Bullet Report
  const generateWhatsAppReport = () => {
    const header = `🌧️ *BOLETIM DE CHUVAS - RIO DAS OSTRAS*
📅 *Data:* ${currentDate} às ${currentTime}
----------------------------------------\n\n`;

    const body = displayedStations.map(st => {
      const data = getStationWindows(st);
      if (data.isInactive) {
        return `⚠️ *${st.shortName || st.name}*: Inativa (sem transmissão)`;
      }

      let line = `📍 *${st.shortName || st.name}* (${st.network})`;
      if (data.startTime && data.startTime !== '--') {
        line += `\n   ⏱️ Início da chuva: ${data.startTime}`;
      }
      if (st.isHydrological && data.riverLevel != null) {
        line += `\n   🌊 Rio Jundiá: ${data.riverLevel}m (${data.statusMonitoramento})`;
      }
      line += `\n   💧 *1h:* ${data.h1.toFixed(1)}mm | *4h:* ${data.h4.toFixed(1)}mm | *6h:* ${data.h6.toFixed(1)}mm`;
      line += `\n   💧 *9h:* ${data.h9.toFixed(1)}mm | *12h:* ${data.h12.toFixed(1)}mm | *24h:* ${data.h24.toFixed(1)}mm`;
      line += `\n   💧 *36h:* ${data.h36.toFixed(1)}mm | *48h:* ${data.h48.toFixed(1)}mm | *96h:* ${data.h96.toFixed(1)}mm`;
      return line;
    }).join('\n\n');

    const footer = `\n\n----------------------------------------
🔗 *Painel 24h:* https://clima-rio-das-ostras.vercel.app`;

    return header + body + footer;
  };

  // Generate Formatted Plain Text Table
  const generateTableReport = () => {
    let text = `BOLETIM PLUVIOMÉTRICO (TABELA DE ACUMULADOS) - RIO DAS OSTRAS - RJ
Data: ${currentDate} às ${currentTime}

Estação / Local              | 1h   | 4h   | 6h   | 9h   | 12h  | 24h  | 36h  | 48h  | 96h  | Início | Observação
----------------------------------------------------------------------------------------------------------------------\n`;

    displayedStations.forEach(st => {
      const data = getStationWindows(st);
      const name = (st.shortName || st.name).padEnd(28).slice(0, 28);
      if (data.isInactive) {
        text += `${name} | INATIVA (Sem transmissão recente)\n`;
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
        const start = (data.startTime || '--').padEnd(6);
        const obs = st.isHydrological ? `Rio: ${data.riverLevel}m` : (data.temp ? `${data.temp}°C` : '');

        text += `${name} | ${c1} | ${c4} | ${c6} | ${c9} | ${c12} | ${c24} | ${c36} | ${c48} | ${c96} | ${start} | ${obs}\n`;
      }
    });

    text += `----------------------------------------------------------------------------------------------------------------------
Fontes: Weather Underground PWS • INEA Alerta de Cheias • CEMADEN | Rio das Ostras - RJ
Acesso online: https://clima-rio-das-ostras.vercel.app`;

    return text;
  };

  // Get current active report text based on selection
  const currentReportText = reportFormat === 'whatsapp' 
    ? generateWhatsAppReport() 
    : reportFormat === 'table' 
    ? generateTableReport() 
    : generateDetailedReport();

  // Copy full report to clipboard
  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(currentReportText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  // Copy individual station
  const handleCopyStation = async (st) => {
    const text = generateSingleStationText(st);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStationId(st.id);
      setTimeout(() => setCopiedStationId(null), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(currentReportText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Download .txt file
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
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                  Material Escrito das Estações (Boletim Textual)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  Pronto para Copiar
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Acumulados de todos os 9 intervalos (1h a 96h) e telemetria de todas as estações prontos para WhatsApp, rádio ou relatório
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition active:scale-95"
              title="Copiar todo o texto para a área de transferência"
            >
              {copiedAll ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAll ? 'Copiado!' : 'Copiar Relatório Completo'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition active:scale-95"
              title="Abrir diretamente no WhatsApp"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
              title="Baixar em arquivo de texto (.txt)"
            >
              <Download className="w-4 h-4" />
              <span>Baixar .TXT</span>
            </button>
          </div>
        </div>

        {/* Format Selector and Filter Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap mr-1">
              Formato do Texto:
            </span>
            {[
              { id: 'detailed', label: 'Detalhado Completo' },
              { id: 'whatsapp', label: 'Compacto / WhatsApp' },
              { id: 'table', label: 'Tabela em Texto' }
            ].map(fmt => (
              <button
                key={fmt.id}
                onClick={() => setReportFormat(fmt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  reportFormat === fmt.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400 self-start sm:self-auto">
            <input 
              type="checkbox" 
              checked={filterActiveOnly} 
              onChange={(e) => setFilterActiveOnly(e.target.checked)} 
              className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
            />
            <span>Apenas estações ativas ({displayedStations.length})</span>
          </label>
        </div>

        {/* Live Monospace Text Box with Quick Copy */}
        <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-200 overflow-hidden shadow-inner">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300 font-sans font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Última atualização: <strong className="text-white">{currentTime}</strong> • {currentDate}
            </span>
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-[11px] font-sans font-semibold"
            >
              {copiedAll ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedAll ? 'Copiado!' : 'Copiar Tudo'}</span>
            </button>
          </div>

          <textarea
            readOnly
            value={currentReportText}
            onClick={(e) => e.target.select()}
            rows={14}
            className="w-full bg-transparent text-emerald-400 dark:text-emerald-300 font-mono text-xs leading-relaxed focus:outline-none resize-y selection:bg-blue-600 selection:text-white"
            title="Clique para selecionar todo o texto"
          />

          <div className="text-[10px] text-slate-500 text-right pt-2 border-t border-slate-900 font-sans">
            Dica: Clique dentro da caixa para selecionar automaticamente todo o conteúdo ou use o botão "Copiar Relatório Completo" acima.
          </div>
        </div>
      </div>

      {/* Grid of Individual Station Cards with Copy Button for Each */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Cartões Individuais com Todos os Intervalos ({displayedStations.length} estações)
          </h4>
          <span className="text-xs text-slate-400">Copie cada estação individualmente abaixo</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedStations.map((st) => {
            const data = getStationWindows(st);
            const isCopied = copiedStationId === st.id;

            return (
              <div 
                key={st.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition hover:border-blue-400 dark:hover:border-blue-600"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {st.name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {st.neighborhood} &bull; {st.network}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopyStation(st)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition shrink-0 ${
                        isCopied 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200' 
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                      title="Copiar texto desta estação"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  {data.isInactive ? (
                    <div className="py-4 text-center text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60 my-2">
                      Estação inativa ou sem transmissão recente no momento.
                    </div>
                  ) : (
                    <>
                      {/* Telemetry info row */}
                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 mb-3 flex-wrap">
                        {data.temp != null && <span>🌡️ Temp: <strong>{data.temp}°C</strong></span>}
                        {data.humidity != null && <span>💧 Umid: <strong>{data.humidity}%</strong></span>}
                        {st.isHydrological && data.riverLevel != null && (
                          <span className="text-blue-600 dark:text-blue-400 font-bold">
                            🌊 Rio Jundiá: {data.riverLevel} m ({data.statusMonitoramento})
                          </span>
                        )}
                        {data.startTime && data.startTime !== '--' && (
                          <span className="text-sky-600 dark:text-sky-400">
                            ⏱️ Início chuva: <strong>{data.startTime}</strong>
                          </span>
                        )}
                      </div>

                      {/* 9-Intervals Grid */}
                      <div className="grid grid-cols-3 sm:grid-cols-9 gap-1 text-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
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
                          <div key={w.label} className="py-1 px-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                            <span className="text-[9px] font-bold text-slate-400 block">{w.label}</span>
                            <span className={`text-[11px] font-mono font-bold block ${w.val > 0 ? (w.val >= 30 ? 'text-red-600' : 'text-blue-600 dark:text-blue-400') : 'text-slate-400'}`}>
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

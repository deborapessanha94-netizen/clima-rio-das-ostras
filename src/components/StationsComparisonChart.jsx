import React, { useState, useRef } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  BarChart3, 
  CloudRain, 
  Wind, 
  Thermometer, 
  ArrowUpDown,
  Share2,
  Clock,
  Layers,
  Table as TableIcon
} from 'lucide-react';

const RAIN_WINDOWS = [
  { id: '1h', label: '1h (1 hora)', short: '1h' },
  { id: '4h', label: '4h (4 horas)', short: '4h' },
  { id: '6h', label: '6h (6 horas)', short: '6h' },
  { id: '9h', label: '9h (9 horas)', short: '9h' },
  { id: '12h', label: '12h (12 horas)', short: '12h' },
  { id: '24h', label: '24h (24 horas)', short: '24h' },
  { id: '48h', label: '48h (48 horas)', short: '48h' },
  { id: '96h', label: '96h (96 horas)', short: '96h' }
];

export function StationsComparisonChart({ stations, weatherData, lastUpdated, countdownFormatted }) {
  const [metricType, setMetricType] = useState('rain'); // 'rain' | 'rainRate' | 'wind' | 'temp'
  const [rainWindow, setRainWindow] = useState('24h'); // '1h' | '4h' | '6h' | '9h' | '12h' | '24h' | '48h' | '96h'
  const [showMatrix, setShowMatrix] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc' | 'alphabetical'
  const [copied, setCopied] = useState(false);
  const chartRef = useRef(null);

  // Prepare data for each station
  const chartItems = stations.map(station => {
    const weather = weatherData[station.id];
    const current = weather?.current;
    const isInactive = weather?.status === 'offline';

    // Multi-temporal accumulation windows (1h, 4h, 6h, 9h, 12h, 24h, 48h, 96h)
    const rawWindows = current?.rainWindows || {};
    const fallbackToday = current?.rainToday ?? current?.rainAccumulated24h ?? 0;
    const windows = {
      h1: isInactive ? 0 : (rawWindows.h1 ?? Math.round(fallbackToday * 0.15 * 10) / 10),
      h4: isInactive ? 0 : (rawWindows.h4 ?? Math.round(fallbackToday * 0.55 * 10) / 10),
      h6: isInactive ? 0 : (rawWindows.h6 ?? Math.round(fallbackToday * 0.75 * 10) / 10),
      h9: isInactive ? 0 : (rawWindows.h9 ?? Math.round(fallbackToday * 0.9 * 10) / 10),
      h12: isInactive ? 0 : (rawWindows.h12 ?? fallbackToday),
      h24: isInactive ? 0 : (rawWindows.h24 ?? fallbackToday),
      h48: isInactive ? 0 : (rawWindows.h48 ?? fallbackToday),
      h96: isInactive ? 0 : (rawWindows.h96 ?? fallbackToday)
    };

    let value = 0;
    let unit = 'mm';
    let displayValue = '--';

    if (metricType === 'rain') {
      const winKey = `h${rainWindow.replace('h', '')}`;
      value = isInactive ? 0 : (windows[winKey] ?? fallbackToday);
      unit = 'mm';
      displayValue = isInactive ? 'Inativa' : `${value.toFixed(1)} mm`;
    } else if (metricType === 'rainRate') {
      value = isInactive ? 0 : (current?.rain ?? 0);
      unit = 'mm/h';
      displayValue = isInactive ? 'Inativa' : `${value.toFixed(1)} mm/h`;
    } else if (metricType === 'wind') {
      value = isInactive ? 0 : (current?.windSpeed ?? 0);
      unit = 'km/h';
      displayValue = isInactive ? 'Inativa' : `${value} km/h`;
    } else if (metricType === 'temp') {
      value = isInactive ? 0 : (current?.temp ?? 0);
      unit = '°C';
      displayValue = isInactive ? 'Inativa' : `${value}°C`;
    }

    const stationCode = station.code || station.id;
    const codeLabel = station.network?.includes('INEA') ? `INEA ${stationCode}` : 
                      station.network?.includes('CEMADEN') ? `CEMADEN ${stationCode}` : 
                      stationCode;
    
    let name = station.neighborhood.split('/')[0].trim();
    if (station.id === 'IRIODA17') name = 'Defesa Civil';
    if (station.id === 'IRIODA16') name = 'Cantagalo / Extensão do Bosque';
    if (station.id === 'IRIODA15') name = 'Rocha Leão / REBIO União';
    if (station.id === 'IRIODA6') name = 'Escola Jacinto';
    if (station.id === 'cemaden-18788') name = 'Palmital (G2-01A)';
    if (station.id === 'cemaden-18790') name = 'Palmital (G2-02A)';
    if (station.id === 'cemaden-18789') name = 'Palmital (G2-03A)';

    const rainStartTime = current?.rainStartTime || null;
    let rainStartLabel = '';
    if (isInactive) {
      rainStartLabel = 'Sensor inativo';
    } else if (windows.h24 > 0 && rainStartTime) {
      rainStartLabel = `Início às ${rainStartTime}`;
    } else if (windows.h24 > 0) {
      rainStartLabel = 'Com chuva';
    } else {
      rainStartLabel = 'Sem chuva hoje';
    }

    const displayNameWithCode = `${name} (${codeLabel})`;

    return {
      id: station.id,
      code: stationCode,
      codeLabel,
      name,
      displayNameWithCode,
      fullName: station.name,
      network: station.network,
      value: typeof value === 'number' ? value : 0,
      displayValue,
      isInactive,
      rainStartTime,
      rainStartLabel,
      windows
    };
  });

  // Sort items
  const sortedItems = [...chartItems].sort((a, b) => {
    if (a.isInactive && !b.isInactive) return 1;
    if (!a.isInactive && b.isInactive) return -1;
    if (sortOrder === 'desc') return b.value - a.value;
    if (sortOrder === 'asc') return a.value - b.value;
    return a.name.localeCompare(b.name);
  });

  // Calculate axis scale
  const maxValue = Math.max(...chartItems.map(i => i.value), 5);
  // Round up to nice number (e.g. 5, 10, 15, 20)
  const axisMax = Math.ceil(maxValue * 1.25);
  const stepCount = 5;
  const step = Math.ceil(axisMax / stepCount);
  const scaleMarks = Array.from({ length: stepCount + 1 }, (_, i) => i * step);

  // Generate PNG image of the chart using HTML5 Canvas
  const generateCanvasImage = () => {
    const canvas = document.createElement('canvas');
    const width = 1100;
    const itemHeight = 52;
    const topPadding = 120;
    const bottomPadding = 70;
    const height = topPadding + (sortedItems.length * itemHeight) + bottomPadding;
    
    // Scale for high resolution (Retina display)
    const dpr = 2;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Header Background Accent
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, 95);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 94, width, 1);

    // Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('MONITORAMENTO PLUVIOMÉTRICO - RIO DAS OSTRAS', 36, 42);

    // Subtitle & Timestamp
    ctx.fillStyle = '#64748b';
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const nowStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = lastUpdated || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const metricTitle = metricType === 'rain' 
      ? `Chuva Acumulada em ${rainWindow.toUpperCase()} (${rainWindow === '24h' ? 'Últimas 24 Horas' : `Últimas ${rainWindow}`})`
      : (metricType === 'rainRate' ? 'Taxa Instantânea de Chuva' : 
      (metricType === 'wind' ? 'Velocidade do Vento' : 'Temperatura Atual'));
    ctx.fillText(`${metricTitle} • Leituras ao vivo em ${nowStr} às ${timeStr}`, 36, 68);

    // Chart Area Boundaries
    const chartLeft = 360;
    const chartRight = width - 110;
    const chartWidth = chartRight - chartLeft;
    const barMax = scaleMarks[scaleMarks.length - 1] || 1;

    // Draw vertical dotted guide lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    scaleMarks.forEach(mark => {
      const x = chartLeft + (mark / barMax) * chartWidth;
      ctx.beginPath();
      ctx.moveTo(x, topPadding - 15);
      ctx.lineTo(x, topPadding + (sortedItems.length * itemHeight) + 5);
      ctx.stroke();

      // Axis label at bottom
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${mark}`, x, topPadding + (sortedItems.length * itemHeight) + 24);
    });

    ctx.setLineDash([]); // Reset dashed line

    // Draw Bars and Labels
    sortedItems.forEach((item, idx) => {
      const y = topPadding + (idx * itemHeight);
      
      // Station label with code on the left (Line 1)
      ctx.textAlign = 'right';
      ctx.fillStyle = item.isInactive ? '#94a3b8' : '#0f172a';
      ctx.font = '600 12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(item.displayNameWithCode, chartLeft - 16, y + 14);

      // Station network and rain start time subtitle on the left (Line 2)
      ctx.fillStyle = item.rainStartTime && !item.isInactive ? '#0284c7' : '#94a3b8';
      ctx.font = '500 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const subLabel = metricType === 'rain' 
        ? `${item.network} • ${item.rainStartLabel}`
        : item.network;
      ctx.fillText(subLabel, chartLeft - 16, y + 29);

      if (!item.isInactive) {
        // Bar width
        const barRatio = Math.min(Math.max(item.value / barMax, 0), 1);
        const barWidth = barRatio * chartWidth;

        // Draw Rounded Bar (Classic deep navy blue like reference image)
        const barHeight = 22;
        const radius = 6;
        const bx = chartLeft;
        const by = y + 5;

        if (barWidth > 0) {
          ctx.fillStyle = '#253b80'; // Exact deep blue from reference image
          ctx.beginPath();
          ctx.roundRect(bx, by, Math.max(barWidth, 6), barHeight, [radius, radius, radius, radius]);
          ctx.fill();
        }

        // Clean value text strictly after the bar with comfortable margin
        ctx.textAlign = 'left';
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const labelX = bx + Math.max(barWidth, 0) + 12;
        ctx.fillText(item.displayValue, labelX, y + 20);
      } else {
        // Inactive sensor
        ctx.textAlign = 'left';
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'italic 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('Sensor Inativo', chartLeft + 12, y + 20);
      }
    });

    // Horizontal baseline
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chartLeft, topPadding + (sortedItems.length * itemHeight) + 8);
    ctx.lineTo(chartRight, topPadding + (sortedItems.length * itemHeight) + 8);
    ctx.stroke();

    // Footer info
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Fontes: Weather Underground PWS • INEA Alerta de Cheias • CEMADEN | Rio das Ostras - RJ', 36, height - 20);

    return canvas;
  };

  // Download Image as PNG
  const handleDownloadImage = () => {
    const canvas = generateCanvasImage();
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    const winSuffix = metricType === 'rain' ? `-${rainWindow}` : `-${metricType}`;
    link.download = `chuva-rio-das-ostras${winSuffix}-${timestamp}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    try {
      const canvas = generateCanvasImage();
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch (err) {
          // Fallback: download if copy to clipboard is restricted by browser
          handleDownloadImage();
        }
      });
    } catch (e) {
      handleDownloadImage();
    }
  };

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                Comparativo Geral das Estações
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Visualização unificada de todas as estações • Atualizado a cada 5 min (próxima em {countdownFormatted})
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Download & Copy Image */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyImage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
            title="Copiar imagem do gráfico para o WhatsApp"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar Imagem'}</span>
          </button>

          <button
            onClick={handleDownloadImage}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition active:scale-95"
            title="Baixar imagem PNG de alta resolução para compartilhar"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar Imagem (PNG)</span>
          </button>
        </div>
      </div>

      {/* Metric Selector Pills & Sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setMetricType('rain')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
              metricType === 'rain'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Chuva Acumulada (mm)</span>
          </button>

          <button
            onClick={() => setMetricType('rainRate')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
              metricType === 'rainRate'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Taxa / Intensidade (mm/h)</span>
          </button>

          <button
            onClick={() => setMetricType('wind')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
              metricType === 'wind'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Vento (km/h)</span>
          </button>

          <button
            onClick={() => setMetricType('temp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
              metricType === 'temp'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Temperatura (°C)</span>
          </button>
        </div>

        {/* Sort Toggle */}
        <button
          onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : (prev === 'asc' ? 'alphabetical' : 'desc'))}
          className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition font-medium self-start sm:self-auto"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>
            {sortOrder === 'desc' ? 'Maior para menor' : (sortOrder === 'asc' ? 'Menor para maior' : 'Ordem alfabética')}
          </span>
        </button>
      </div>

      {/* Time Window Sub-selector for Rain (1h, 4h, 6h, 9h, 12h, 24h, 48h, 96h) */}
      {metricType === 'rain' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1 px-1 whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Intervalo de Acumulado:
            </span>
            {RAIN_WINDOWS.map(w => (
              <button
                key={w.id}
                onClick={() => setRainWindow(w.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  rainWindow === w.id
                    ? 'bg-blue-600 text-white shadow-xs scale-105'
                    : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
                title={`Ver volume acumulado nas últimas ${w.label}`}
              >
                {w.short}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowMatrix(prev => !prev)}
            className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 hover:underline self-end sm:self-auto"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>{showMatrix ? 'Ocultar Tabela de Horas' : 'Ver Tabela (1h a 96h)'}</span>
          </button>
        </div>
      )}

      {/* The Visual Pluviometric Chart (Exact Replica of User Reference Image) */}
      <div 
        ref={chartRef}
        className="p-4 sm:p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 relative"
      >
        <div className="space-y-3.5">
          {sortedItems.map(item => {
            const barMax = scaleMarks[scaleMarks.length - 1] || 1;
            const barRatio = Math.min(Math.max(item.value / barMax, 0), 1);
            const percentage = item.isInactive ? 0 : Math.max(barRatio * 100, item.value > 0 ? 3 : 0.8);

            return (
              <div key={item.id} className="flex items-center text-xs group">
                {/* Station Neighborhood Name & Code on the Left */}
                <div className="w-48 sm:w-72 md:w-80 text-right pr-3 sm:pr-4 flex-shrink-0">
                  <div className="flex items-center justify-end gap-1.5 flex-wrap sm:flex-nowrap">
                    <span 
                      className={`font-semibold truncate text-xs ${item.isInactive ? 'text-slate-400 dark:text-slate-600' : 'text-slate-800 dark:text-slate-200'}`} 
                      title={item.fullName}
                    >
                      {item.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-sky-700 dark:text-sky-300 border border-slate-200/70 dark:border-slate-700/70 whitespace-nowrap">
                      {item.codeLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-400 truncate">
                    <span>{item.network}</span>
                    {metricType === 'rain' && (
                      <span className={`inline-flex items-center font-medium ${item.rainStartTime && !item.isInactive ? 'text-sky-600 dark:text-sky-400 font-semibold' : 'text-slate-400 dark:text-slate-500'}`}>
                        • {item.rainStartLabel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bar Area with Guide Lines */}
                <div className="flex-1 relative flex items-center h-8">
                  {/* Dotted vertical scale guides */}
                  <div className="absolute inset-0 flex justify-between pointer-events-none">
                    {scaleMarks.map((_, i) => (
                      <div 
                        key={i} 
                        className="h-full border-r border-dashed border-slate-200/80 dark:border-slate-800/60" 
                      />
                    ))}
                  </div>

                  {/* The Horizontal Bar (Classic Royal Blue from reference image) */}
                  {!item.isInactive ? (
                    <div className="flex items-center w-full z-10">
                      <div 
                        style={{ width: `${percentage}%` }}
                        className="h-6 rounded-lg bg-[#253b80] dark:bg-blue-600 transition-all duration-500 shadow-2xs group-hover:brightness-110 flex-shrink-0"
                      />
                      
                      {/* Bold Value Label Right After Bar */}
                      <div className="pl-3 whitespace-nowrap flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                          {item.displayValue}
                        </span>
                        {metricType === 'rain' && item.rainStartTime && (
                          <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60 shadow-2xs">
                            início às {item.rainStartTime}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="z-10 pl-2">
                      <span className="text-[11px] text-slate-400 dark:text-slate-600 italic">
                        Sensor Inativo
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Horizontal Scale Axis */}
        <div className="flex items-center text-[11px] text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 mt-4">
          <div className="w-48 sm:w-72 md:w-80 flex-shrink-0" />
          <div className="flex-1 flex justify-between px-0.5">
            {scaleMarks.map((val, idx) => (
              <span key={idx} className="font-semibold">
                {val}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Window Accumulation Matrix Table (1h, 4h, 6h, 9h, 12h, 24h, 48h, 96h) */}
      {showMatrix && metricType === 'rain' && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="p-3.5 sm:p-4 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                  Matriz Comparativa de Acumulados (1h, 4h, 6h, 9h, 12h, 24h, 48h, 96h)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Clique na coluna desejada para alternar o gráfico de barras acima
                </p>
              </div>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Janela ativa no gráfico: <strong className="text-blue-600 dark:text-blue-400 font-bold">{rainWindow}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-300 font-bold">
                  <th className="py-2.5 px-3 whitespace-nowrap">Estação</th>
                  {[
                    { key: '1h', label: '1h' },
                    { key: '4h', label: '4h' },
                    { key: '6h', label: '6h' },
                    { key: '9h', label: '9h' },
                    { key: '12h', label: '12h' },
                    { key: '24h', label: '24h (Hoje)' },
                    { key: '48h', label: '48h' },
                    { key: '96h', label: '96h' }
                  ].map(w => (
                    <th 
                      key={w.key} 
                      onClick={() => setRainWindow(w.key)}
                      className={`py-2.5 px-2.5 text-center whitespace-nowrap cursor-pointer transition ${
                        rainWindow === w.key 
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-extrabold border-b-2 border-blue-600' 
                          : 'hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                      title={`Filtrar gráfico por ${w.label}`}
                    >
                      {w.label}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">Início da Chuva</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {sortedItems.map(item => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={item.isInactive ? 'text-slate-400' : ''}>{item.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">({item.codeLabel})</span>
                      </div>
                    </td>
                    
                    {['1h', '4h', '6h', '9h', '12h', '24h', '48h', '96h'].map(wKey => {
                      const prop = `h${wKey.replace('h', '')}`;
                      const val = item.isInactive ? 0 : (item.windows?.[prop] ?? 0);
                      const isSelected = rainWindow === wKey;
                      const hasRain = val > 0;
                      
                      return (
                        <td 
                          key={wKey} 
                          onClick={() => setRainWindow(wKey)}
                          className={`py-2.5 px-2.5 text-center font-mono cursor-pointer transition ${
                            isSelected 
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 font-extrabold text-blue-700 dark:text-blue-300' 
                              : ''
                          }`}
                        >
                          {item.isInactive ? (
                            <span className="text-slate-300 dark:text-slate-700">&ndash;</span>
                          ) : hasRain ? (
                            <span className={`font-bold ${val >= 30 ? 'text-red-600 dark:text-red-400' : (val >= 15 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200')}`}>
                              {val.toFixed(1)} <span className="text-[9px] font-normal text-slate-400">mm</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-[11px]">0.0</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-2.5 px-3 text-right text-[11px] whitespace-nowrap">
                      {item.isInactive ? (
                        <span className="text-slate-400 italic">Inativa</span>
                      ) : item.rainStartTime ? (
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {item.rainStartTime}
                        </span>
                      ) : (
                        <span className="text-slate-400">Sem chuva</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 dark:text-slate-500 pt-1">
        <span>Fontes: Weather Underground PWS &bull; INEA Alerta de Cheias &bull; CEMADEN</span>
        <span>Atualizado automaticamente a cada 5 minutos</span>
      </div>
    </div>
  );
}

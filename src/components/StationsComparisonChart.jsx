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
  FileText,
  Table as TableIcon,
  Sparkles,
  Search,
  Plus,
  X,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { getStationDisplayNameWithCode } from '../data/stations';
import { generateInfographicCanvas } from '../utils/infographicGenerator';

export const AVAILABLE_HORIZONS = [
  { id: '1h', label: '1h', fullLabel: '1 Hora', short: '1h' },
  { id: '4h', label: '4h', fullLabel: '4 Horas', short: '4h' },
  { id: '6h', label: '6h', fullLabel: '6 Horas', short: '6h' },
  { id: '9h', label: '9h', fullLabel: '9 Horas', short: '9h' },
  { id: '12h', label: '12h', fullLabel: '12 Horas', short: '12h' },
  { id: '24h', label: '24h', fullLabel: '24 Horas', short: '24h' },
  { id: '36h', label: '36h', fullLabel: '36 Horas', short: '36h' },
  { id: '48h', label: '48h', fullLabel: '48 Horas', short: '48h' },
  { id: '72h', label: '72h', fullLabel: '72 Horas', short: '72h' },
  { id: '96h', label: '96h', fullLabel: '96 Horas', short: '96h' }
];

export const HORIZON_PALETTE = [
  { hex: '#2563eb', bg: 'bg-blue-600', text: 'text-blue-600 dark:text-blue-400', name: 'Azul' },
  { hex: '#7c3aed', bg: 'bg-purple-600', text: 'text-purple-600 dark:text-purple-400', name: 'Roxo' },
  { hex: '#0284c7', bg: 'bg-sky-600', text: 'text-sky-600 dark:text-sky-400', name: 'Ciano' },
  { hex: '#059669', bg: 'bg-emerald-600', text: 'text-emerald-600 dark:text-emerald-400', name: 'Verde' },
  { hex: '#d97706', bg: 'bg-amber-600', text: 'text-amber-600 dark:text-amber-400', name: 'Âmbar' },
  { hex: '#dc2626', bg: 'bg-red-600', text: 'text-red-600 dark:text-red-400', name: 'Vermelho' },
  { hex: '#0891b2', bg: 'bg-teal-600', text: 'text-teal-600 dark:text-teal-400', name: 'Teal' }
];

export function getHorizonColor(index) {
  return HORIZON_PALETTE[index % HORIZON_PALETTE.length];
}

/**
 * Calculates or interpolates accumulation for any arbitrary hour
 */
export function getAccumulationForHour(windows, hourStrOrNum, fallback = 0) {
  if (!windows) return fallback;
  const numH = typeof hourStrOrNum === 'number' 
    ? hourStrOrNum 
    : parseInt(hourStrOrNum.toString().replace(/[^0-9]/g, ''), 10);
  if (isNaN(numH) || numH <= 0) return 0;

  // Hydrological station: calculate sum of hourly cotas for the last numH hours
  if (windows.isHydrological && Array.isArray(windows.hourlyCotas)) {
    if (numH === 1) return windows.currentCota || windows.h1 || 1.84;
    const n = Math.min(Math.max(1, numH), windows.hourlyCotas.length);
    const sum = windows.hourlyCotas.slice(0, n).reduce((a, b) => a + b, 0);
    return Math.round(sum * 10) / 10;
  }
  
  const key = `h${numH}`;
  if (typeof windows[key] === 'number') return windows[key];

  const known = [
    { h: 0, val: 0 },
    { h: 1, val: windows.h1 ?? 0 },
    { h: 4, val: windows.h4 ?? (windows.h1 ?? 0) * 1.5 },
    { h: 6, val: windows.h6 ?? windows.h4 ?? 0 },
    { h: 9, val: windows.h9 ?? windows.h6 ?? 0 },
    { h: 12, val: windows.h12 ?? windows.h9 ?? 0 },
    { h: 24, val: windows.h24 ?? fallback },
    { h: 36, val: windows.h36 ?? windows.h24 ?? fallback },
    { h: 48, val: windows.h48 ?? windows.h36 ?? fallback },
    { h: 96, val: windows.h96 ?? windows.h48 ?? fallback }
  ].sort((a, b) => a.h - b.h);

  if (numH >= 96) return known[known.length - 1].val;

  for (let i = 0; i < known.length - 1; i++) {
    const p1 = known[i];
    const p2 = known[i + 1];
    if (numH >= p1.h && numH <= p2.h) {
      if (p2.h === p1.h) return p1.val;
      const t = (numH - p1.h) / (p2.h - p1.h);
      const val = p1.val + (p2.val - p1.val) * t;
      return Math.round(val * 10) / 10;
    }
  }

  return fallback;
}

/**
 * Parses user input string (e.g. "24 e 36", "24, 36", "1h", "12 24 36") into array of horizon keys
 */
export function parseHorizonsInput(inputStr) {
  if (!inputStr || !inputStr.trim()) return [];
  const matches = inputStr.match(/\d+/g);
  if (!matches || matches.length === 0) return [];
  const parsed = matches.map(n => {
    const num = parseInt(n, 10);
    return num > 0 ? `${num}h` : null;
  }).filter(Boolean);
  return Array.from(new Set(parsed));
}

export function StationsComparisonChart({ stations, weatherData, lastUpdated, countdownFormatted, onOpenInfographicModal }) {
  const [metricType, setMetricType] = useState('rain'); // 'rain' | 'rainRate' | 'wind' | 'temp'
  const [selectedWindows, setSelectedWindows] = useState(['24h']); // Multi-horizon array (e.g. ['24h', '36h'] or ['1h'])
  const [customInput, setCustomInput] = useState('');
  const [showMatrix, setShowMatrix] = useState(true);
  const [showOnlySelectedInMatrix, setShowOnlySelectedInMatrix] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc' | 'alphabetical'
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const chartRef = useRef(null);

  // Toggle or add horizon
  const handleToggleWindow = (wId) => {
    if (selectedWindows.includes(wId)) {
      if (selectedWindows.length > 1) {
        setSelectedWindows(selectedWindows.filter(w => w !== wId));
      }
    } else {
      setSelectedWindows([...selectedWindows, wId]);
    }
  };

  const handleSelectOnly = (wId) => {
    setSelectedWindows([wId]);
  };

  const handleApplyCustomInput = () => {
    const parsed = parseHorizonsInput(customInput);
    if (parsed.length > 0) {
      setSelectedWindows(parsed);
      setCustomInput('');
    }
  };

  // Prepare data for each station
  const chartItems = stations.map(station => {
    const weather = weatherData[station.id];
    const current = weather?.current;
    const isHydro = Boolean(station.isHydrological || station.id === 'inea-jundia');
    const isOffline = weather?.status === 'offline';
    const fallbackToday = current?.rainToday ?? current?.rainAccumulated24h ?? 0;
    const isMarkingZero = !isHydro && fallbackToday <= 0;
    const isInactive = isOffline || isMarkingZero;

    // Multi-temporal accumulation windows (1h, 4h, 6h, 9h, 12h, 24h, 36h, 48h, 96h)
    const rawWindows = current?.rainWindows || {};
    const windows = {
      h1: isOffline ? 0 : (rawWindows.h1 ?? Math.round(fallbackToday * 0.15 * 10) / 10),
      h4: isOffline ? 0 : (rawWindows.h4 ?? Math.round(fallbackToday * 0.55 * 10) / 10),
      h6: isOffline ? 0 : (rawWindows.h6 ?? Math.round(fallbackToday * 0.75 * 10) / 10),
      h9: isOffline ? 0 : (rawWindows.h9 ?? Math.round(fallbackToday * 0.9 * 10) / 10),
      h12: isOffline ? 0 : (rawWindows.h12 ?? fallbackToday),
      h24: isOffline ? 0 : (rawWindows.h24 ?? fallbackToday),
      h36: isOffline ? 0 : (rawWindows.h36 ?? fallbackToday),
      h48: isOffline ? 0 : (rawWindows.h48 ?? fallbackToday),
      h96: isOffline ? 0 : (rawWindows.h96 ?? fallbackToday)
    };

    let value = 0;
    let unit = 'mm';
    let displayValue = '--';

    if (metricType === 'rain') {
      // Primary value represents max selected horizon or primary window
      const prim = selectedWindows[0] || '24h';
      value = isOffline ? 0 : getAccumulationForHour(windows, prim, fallbackToday);
      unit = isHydro ? 'm' : 'mm';
      displayValue = isOffline 
        ? 'Inativa' 
        : (isHydro ? `${value.toFixed(1)} m` : (value <= 0 ? '0.0 mm (inativa)' : `${value.toFixed(1)} mm`));
    } else if (metricType === 'rainRate') {
      value = isOffline ? 0 : (current?.rain ?? 0);
      unit = 'mm/h';
      displayValue = isOffline ? 'Inativa' : `${value.toFixed(1)} mm/h`;
    } else if (metricType === 'wind') {
      value = isOffline ? 0 : (current?.windSpeed ?? 0);
      unit = 'km/h';
      displayValue = isOffline ? 'Inativa' : `${value} km/h`;
    } else if (metricType === 'temp') {
      value = isOffline ? 0 : (current?.temp ?? 0);
      unit = '°C';
      displayValue = isOffline ? 'Inativa' : `${value}°C`;
    }

    const maxSelectedRain = isOffline ? 0 : Math.max(
      ...selectedWindows.map(w => getAccumulationForHour(windows, w, fallbackToday)),
      0
    );

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

    const riverLevel = current?.riverLevel ?? station.riverLevel ?? 1.84;
    const rainStartTime = current?.rainStartTime || null;
    let rainStartLabel = '';
    if (isOffline) {
      rainStartLabel = 'Sensor inativo';
    } else if (isHydro) {
      rainStartLabel = `Cota atual: ${riverLevel}m (${current?.statusMonitoramento || 'Vigilância'})`;
    } else if (isMarkingZero || windows.h24 <= 0) {
      rainStartLabel = 'Inativa (0.0 mm)';
    } else if (windows.h24 > 0 && rainStartTime) {
      rainStartLabel = `Início às ${rainStartTime}`;
    } else if (windows.h24 > 0) {
      rainStartLabel = 'Com chuva';
    } else {
      rainStartLabel = 'Inativa (0.0 mm)';
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
      maxSelectedRain,
      displayValue,
      isInactive,
      rainStartTime,
      rainStartLabel,
      windows,
      station,
      current
    };
  });

  // Sort items: Jundiá always last, active rain stations first, inactive/0mm stations next
  const sortedItems = [...chartItems].sort((a, b) => {
    // 1. INEA Rio Jundiá (isHydrological) ALWAYS at the very bottom
    const aHydro = Boolean(a.station?.isHydrological || a.id === 'inea-jundia');
    const bHydro = Boolean(b.station?.isHydrological || b.id === 'inea-jundia');
    if (aHydro && !bHydro) return 1;
    if (!aHydro && bHydro) return -1;

    // 2. Active stations with rain first, inactive/0mm stations after
    if (a.isInactive && !b.isInactive) return 1;
    if (!a.isInactive && b.isInactive) return -1;

    if (sortOrder === 'desc') {
      const vA = metricType === 'rain' ? a.maxSelectedRain : a.value;
      const vB = metricType === 'rain' ? b.maxSelectedRain : b.value;
      return vB - vA;
    }
    if (sortOrder === 'asc') {
      const vA = metricType === 'rain' ? a.maxSelectedRain : a.value;
      const vB = metricType === 'rain' ? b.maxSelectedRain : b.value;
      return vA - vB;
    }
    return a.name.localeCompare(b.name);
  });

  // Calculate axis scale across all active selected windows
  const maxValue = metricType === 'rain' 
    ? Math.max(...chartItems.flatMap(i => selectedWindows.map(w => getAccumulationForHour(i.windows, w, i.value))), 5)
    : Math.max(...chartItems.map(i => i.value), 5);

  const axisMax = Math.ceil(maxValue * 1.25);
  const stepCount = 5;
  const step = Math.ceil(axisMax / stepCount);
  const scaleMarks = Array.from({ length: stepCount + 1 }, (_, i) => i * step);

  // Generate PNG image of the chart using HTML5 Canvas
  const generateCanvasImage = (fmt = 'post') => {
    if (metricType === 'rain' && selectedWindows.length === 1) {
      const activeOnly = sortedItems.filter(i => !i.isInactive);
      return generateInfographicCanvas({
        items: activeOnly,
        rainWindow: selectedWindows[0],
        watermark: 'tempo@tempoemriodasostras',
        lastUpdated,
        format: fmt
      });
    }

    const canvas = document.createElement('canvas');
    const width = 1100;
    const windowCount = metricType === 'rain' ? selectedWindows.length : 1;
    const itemHeight = Math.max(34 + (windowCount * 22), 52);
    const topPadding = 135;
    const bottomPadding = 75;
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
    ctx.fillRect(0, 0, width, 105);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 104, width, 1);

    // Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('MONITORAMENTO PLUVIOMÉTRICO - RIO DAS OSTRAS', 36, 38);

    // Subtitle & Timestamp
    ctx.fillStyle = '#64748b';
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const nowStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = lastUpdated || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const metricTitle = metricType === 'rain' 
      ? `Horizontes de tempo pesquisados: ${selectedWindows.join(' e ')}`
      : (metricType === 'rainRate' ? 'Taxa Instantânea de Chuva' : 
      (metricType === 'wind' ? 'Velocidade do Vento' : 'Temperatura Atual'));
    ctx.fillText(`${metricTitle} • Leituras ao vivo em ${nowStr} às ${timeStr}`, 36, 64);

    // Legend if multiple rain windows
    if (metricType === 'rain' && selectedWindows.length > 1) {
      let legendX = 36;
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText('Legenda:', legendX, 90);
      legendX += 60;
      selectedWindows.forEach((w, idx) => {
        const color = getHorizonColor(idx);
        ctx.fillStyle = color.hex;
        ctx.fillRect(legendX, 80, 14, 14);
        ctx.fillStyle = '#0f172a';
        ctx.fillText(w, legendX + 18, 92);
        legendX += ctx.measureText(w).width + 36;
      });
    }

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
      ctx.fillText(item.displayNameWithCode, chartLeft - 16, y + 16);

      // Station network and rain start time subtitle on the left (Line 2)
      ctx.fillStyle = item.rainStartTime && !item.isInactive ? '#0284c7' : '#94a3b8';
      ctx.font = '500 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const subLabel = metricType === 'rain' 
        ? `${item.network} • ${item.rainStartLabel}`
        : item.network;
      ctx.fillText(subLabel, chartLeft - 16, y + 31);

      if (!item.isInactive) {
        if (metricType === 'rain') {
          // Render multiple or single bar
          selectedWindows.forEach((w, wIdx) => {
            const val = getAccumulationForHour(item.windows, w, item.value);
            const barRatio = Math.min(Math.max(val / barMax, 0), 1);
            const barWidth = barRatio * chartWidth;
            const barHeight = selectedWindows.length === 1 ? 22 : 16;
            const by = y + (wIdx * (barHeight + 4)) + 4;
            const color = getHorizonColor(wIdx);

            if (barWidth > 0) {
              ctx.fillStyle = color.hex;
              ctx.beginPath();
              ctx.roundRect(chartLeft, by, Math.max(barWidth, 6), barHeight, [5, 5, 5, 5]);
              ctx.fill();
            }

            ctx.textAlign = 'left';
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            const labelX = chartLeft + Math.max(barWidth, 0) + 10;
            const labelText = selectedWindows.length > 1 ? `${val.toFixed(1)} mm (${w})` : `${val.toFixed(1)} mm`;
            ctx.fillText(labelText, labelX, by + (barHeight / 2) + 4);
          });
        } else {
          // Single bar for non-rain metrics
          const barRatio = Math.min(Math.max(item.value / barMax, 0), 1);
          const barWidth = barRatio * chartWidth;
          const barHeight = 22;
          const bx = chartLeft;
          const by = y + 5;

          if (barWidth > 0) {
            ctx.fillStyle = '#253b80';
            ctx.beginPath();
            ctx.roundRect(bx, by, Math.max(barWidth, 6), barHeight, [6, 6, 6, 6]);
            ctx.fill();
          }

          ctx.textAlign = 'left';
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          const labelX = bx + Math.max(barWidth, 0) + 12;
          ctx.fillText(item.displayValue, labelX, y + 20);
        }
      } else {
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
    ctx.fillText('Fontes: Weather Underground PWS • INEA Alerta de Cheias • CEMADEN | tempo@tempoemriodasostras', 36, height - 20);

    return canvas;
  };

  // Download Image as PNG
  const handleDownloadImage = () => {
    const canvas = generateCanvasImage();
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    const winSuffix = metricType === 'rain' ? `-${selectedWindows.join('-')}` : `-${metricType}`;
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
          handleDownloadImage();
        }
      });
    } catch (e) {
      handleDownloadImage();
    }
  };

  // Copy Dynamic Text Report for WhatsApp with EXACTLY the selected horizons
  const handleCopyReportText = async () => {
    const curDate = new Date().toLocaleDateString('pt-BR');
    const curTime = lastUpdated || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    let text = `CHUVAS EM RIO DAS OSTRAS\n`;
    text += `${curDate} - ${curTime}\n`;
    text += `Horizontes pesquisados: ${selectedWindows.join(', ')}\n\n`;

    const activeList = [];
    const inactiveList = [];

    sortedItems.forEach(item => {
      const stationNameWithCode = getStationDisplayNameWithCode(item.station || item);
      if (item.isInactive) {
        inactiveList.push(stationNameWithCode);
      } else {
        let block = stationNameWithCode;
        if (item.station?.isHydrological) {
          const cota = item.current?.riverLevel ?? item.station?.riverLevel ?? 1.84;
          const statusM = item.current?.statusMonitoramento || 'Vigilância';
          block += ` (Cota atual: ${cota}m | ${statusM})`;
        }
        const parts = selectedWindows.map(w => {
          const val = getAccumulationForHour(item.windows, w, item.value);
          if (item.station?.isHydrological) {
            const numH = parseInt(w.toString().replace(/[^0-9]/g, ''), 10);
            return numH === 1 ? `${w}: ${val.toFixed(1)}m (cota)` : `${w}: ${val.toFixed(1)}m (soma cotas)`;
          }
          return `${w}: ${val.toFixed(1)}mm`;
        });
        block += `\n${parts.join(' | ')}`;
        activeList.push(block);
      }
    });

    text += activeList.join('\n\n');

    if (inactiveList.length > 0) {
      text += `\n\nInativas: ${inactiveList.join(', ')}`;
    }

    text += `\n\nPainel: https://clima-rio-das-ostras.vercel.app`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (e) {
      console.error('Falha ao copiar texto:', e);
    }
  };

  // Distinct list of all available + any custom user horizons
  const allKnownHorizons = Array.from(new Set([
    ...AVAILABLE_HORIZONS.map(h => h.id),
    ...selectedWindows
  ])).sort((a, b) => {
    const nA = parseInt(a.replace('h', ''), 10) || 0;
    const nB = parseInt(b.replace('h', ''), 10) || 0;
    return nA - nB;
  });

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
                Pesquisa e emissão personalizada de horizontes de tempo • Atualizado a cada 5 min (próxima em {countdownFormatted})
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Card Oficial Diário, Copy Text, Copy Image, Download Image */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenInfographicModal && (
            <button
              onClick={onOpenInfographicModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
              title="Abrir gerador e pré-visualização do Card Oficial Diário (Infográfico)"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>Card Oficial Diário</span>
            </button>
          )}

          <button
            onClick={handleCopyReportText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition active:scale-95 cursor-pointer"
            title={`Copiar texto dos horizontes selecionados (${selectedWindows.join(', ')}) para WhatsApp`}
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> : <FileText className="w-3.5 h-3.5" />}
            <span>{copiedText ? 'Texto Copiado!' : `Copiar Texto (${selectedWindows.join(', ')})`}</span>
          </button>

          <button
            onClick={handleCopyImage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
            title="Copiar imagem do gráfico para a área de transferência"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar Imagem'}</span>
          </button>

          <button
            onClick={handleDownloadImage}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap cursor-pointer ${
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
          className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition font-medium self-start sm:self-auto cursor-pointer"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>
            {sortOrder === 'desc' ? 'Maior para menor' : (sortOrder === 'asc' ? 'Menor para maior' : 'Ordem alfabética')}
          </span>
        </button>
      </div>

      {/* DYNAMIC TIME HORIZON SEARCH & MULTI-SELECT PANEL */}
      {metricType === 'rain' && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-sky-50/60 to-indigo-50/70 dark:from-slate-950 dark:via-sky-950/20 dark:to-indigo-950/20 border border-blue-200/70 dark:border-blue-900/60 space-y-3.5 shadow-xs">
          {/* Top Row: Search Input + Presets */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 max-w-md">
              <label className="text-[11px] font-bold text-blue-950 dark:text-blue-200 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Search className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Digitar Horizontes de Tempo (ex: 24, 36 ou 1h):
              </label>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleApplyCustomInput(); }}
                    placeholder="Digite ex: 24h e 36h, ou apenas 1h..."
                    className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-medium shadow-2xs"
                  />
                  {customInput && (
                    <button
                      onClick={() => setCustomInput('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  onClick={handleApplyCustomInput}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition active:scale-95 shadow-xs whitespace-nowrap cursor-pointer"
                >
                  Pesquisar
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Atalhos Rápidos:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedWindows(['1h'])}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                    selectedWindows.length === 1 && selectedWindows[0] === '1h'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                  }`}
                >
                  Apenas 1h
                </button>

                <button
                  onClick={() => setSelectedWindows(['24h', '36h'])}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                    selectedWindows.length === 2 && selectedWindows.includes('24h') && selectedWindows.includes('36h')
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                  }`}
                >
                  24h e 36h
                </button>

                <button
                  onClick={() => setSelectedWindows(['12h', '24h', '36h'])}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                    selectedWindows.length === 3 && selectedWindows.includes('12h') && selectedWindows.includes('24h') && selectedWindows.includes('36h')
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                  }`}
                >
                  12h, 24h, 36h
                </button>

                <button
                  onClick={() => setSelectedWindows(['6h', '12h', '24h', '36h'])}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                    selectedWindows.length === 4 && selectedWindows.includes('6h') && selectedWindows.includes('12h') && selectedWindows.includes('24h') && selectedWindows.includes('36h')
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-300'
                  }`}
                >
                  6h, 12h, 24h, 36h
                </button>

                <button
                  onClick={() => setSelectedWindows(['1h', '4h', '6h', '9h', '12h', '24h', '36h', '48h', '96h'])}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-blue-300 transition cursor-pointer"
                >
                  Todas (1h a 96h)
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Clickable Chips with Selection Badges */}
          <div className="pt-2 border-t border-blue-100/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-[11px] font-bold text-blue-900 dark:text-blue-300 whitespace-nowrap flex items-center gap-1 mr-1">
                <Clock className="w-3.5 h-3.5" />
                Horizontes:
              </span>
              {allKnownHorizons.map(wId => {
                const isSelected = selectedWindows.includes(wId);
                const idx = selectedWindows.indexOf(wId);
                const color = idx >= 0 ? getHorizonColor(idx) : null;

                return (
                  <button
                    key={wId}
                    onClick={() => handleToggleWindow(wId)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
                      isSelected
                        ? 'text-white shadow-xs scale-105'
                        : 'bg-white/90 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                    }`}
                    style={isSelected ? { backgroundColor: color.hex, borderColor: color.hex } : {}}
                    title={`Clique para alternar ${wId} na visualização e emissão`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                    <span>{wId}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
              <span className="text-[11px] text-blue-950 dark:text-blue-300 font-medium">
                Ativo para emissão: <strong className="font-extrabold text-blue-600 dark:text-blue-400">{selectedWindows.join(', ')}</strong>
              </span>
              <button
                onClick={() => setShowMatrix(prev => !prev)}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 hover:underline cursor-pointer"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>{showMatrix ? 'Ocultar Tabela' : 'Ver Tabela'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* The Visual Pluviometric Chart (Interactive Multi-Horizon Display) */}
      <div 
        ref={chartRef}
        className="p-4 sm:p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 relative"
      >
        {/* Multi-horizon Color Legend */}
        {metricType === 'rain' && selectedWindows.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap mb-4 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">Legenda dos Horizontes:</span>
            {selectedWindows.map((w, idx) => {
              const color = getHorizonColor(idx);
              return (
                <div key={w} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-2xs font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.hex }} />
                  <span style={{ color: color.hex }}>{w}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-4">
          {sortedItems.map(item => {
            const barMax = scaleMarks[scaleMarks.length - 1] || 1;

            return (
              <div key={item.id} className="flex items-start text-xs group pt-1">
                {/* Station Neighborhood Name & Code on the Left */}
                <div className="w-48 sm:w-72 md:w-80 text-right pr-3 sm:pr-4 flex-shrink-0 pt-0.5">
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
                <div className="flex-1 relative min-h-8">
                  {/* Dotted vertical scale guides */}
                  <div className="absolute inset-0 flex justify-between pointer-events-none">
                    {scaleMarks.map((_, i) => (
                      <div 
                        key={i} 
                        className="h-full border-r border-dashed border-slate-200/80 dark:border-slate-800/60" 
                      />
                    ))}
                  </div>

                  {/* Horizontal Bars */}
                  {!item.isInactive ? (
                    <div className="w-full z-10 space-y-1 py-0.5">
                      {metricType === 'rain' ? (
                        selectedWindows.map((w, wIdx) => {
                          const hVal = getAccumulationForHour(item.windows, w, item.value);
                          const barRatio = Math.min(Math.max(hVal / barMax, 0), 1);
                          const percentage = Math.max(barRatio * 100, hVal > 0 ? 3 : 0.8);
                          const color = getHorizonColor(wIdx);
                          const barHeightClass = selectedWindows.length === 1 ? 'h-6' : (selectedWindows.length === 2 ? 'h-4' : 'h-3.5');

                          return (
                            <div key={w} className="flex items-center w-full">
                              <div 
                                style={{ width: `${percentage}%`, backgroundColor: color.hex }}
                                className={`${barHeightClass} rounded-md transition-all duration-300 shadow-2xs group-hover:brightness-110 flex-shrink-0`}
                              />
                              <div className="pl-2.5 whitespace-nowrap flex items-center gap-1.5 text-xs">
                                <span className="font-extrabold text-slate-900 dark:text-slate-100">
                                  {hVal.toFixed(1)} {item.station?.isHydrological ? 'm' : 'mm'}
                                </span>
                                {selectedWindows.length > 1 && (
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-2xs" style={{ color: color.hex, backgroundColor: `${color.hex}18` }}>
                                    {w}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        // Single bar for non-rain metrics
                        (() => {
                          const barRatio = Math.min(Math.max(item.value / barMax, 0), 1);
                          const percentage = Math.max(barRatio * 100, item.value > 0 ? 3 : 0.8);
                          return (
                            <div className="flex items-center w-full">
                              <div 
                                style={{ width: `${percentage}%` }}
                                className="h-6 rounded-lg bg-[#253b80] dark:bg-blue-600 transition-all duration-500 shadow-2xs group-hover:brightness-110 flex-shrink-0"
                              />
                              <div className="pl-3 whitespace-nowrap flex items-center gap-2">
                                <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                                  {item.displayValue}
                                </span>
                              </div>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  ) : (
                    <div className="z-10 pl-2 pt-1">
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

      {/* Multi-Window Accumulation Matrix Table with Dynamic Column Filtering */}
      {showMatrix && metricType === 'rain' && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="p-3.5 sm:p-4 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                  Matriz Comparativa de Acumulados
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {showOnlySelectedInMatrix 
                    ? `Exibindo apenas os horizontes pesquisados (${selectedWindows.join(', ')})`
                    : 'Clique nas colunas para alternar horizontes na visualização'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOnlySelectedInMatrix(prev => !prev)}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{showOnlySelectedInMatrix ? 'Mostrar Todas as Horas (1h a 96h)' : 'Ver Apenas Horizontes Pesquisados'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-300 font-bold">
                  <th className="py-2.5 px-3 whitespace-nowrap">Estação</th>
                  {(showOnlySelectedInMatrix ? selectedWindows : allKnownHorizons).map(wKey => {
                    const isSelected = selectedWindows.includes(wKey);
                    const idx = selectedWindows.indexOf(wKey);
                    const color = idx >= 0 ? getHorizonColor(idx) : null;

                    return (
                      <th 
                        key={wKey} 
                        onClick={() => handleToggleWindow(wKey)}
                        className={`py-2.5 px-2.5 text-center whitespace-nowrap cursor-pointer transition ${
                          isSelected 
                            ? 'font-extrabold border-b-2 border-blue-600' 
                            : 'hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                        style={isSelected ? { backgroundColor: `${color.hex}20`, color: color.hex } : {}}
                        title={`Clique para ativar/desativar ${wKey} na emissão`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {isSelected && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color.hex }} />}
                          <span>{wKey}</span>
                        </div>
                      </th>
                    );
                  })}
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
                    
                    {(showOnlySelectedInMatrix ? selectedWindows : allKnownHorizons).map(wKey => {
                      const val = item.isInactive ? 0 : getAccumulationForHour(item.windows, wKey, item.value);
                      const isSelected = selectedWindows.includes(wKey);
                      const idx = selectedWindows.indexOf(wKey);
                      const color = idx >= 0 ? getHorizonColor(idx) : null;
                      const hasRain = val > 0;
                      
                      return (
                        <td 
                          key={wKey} 
                          onClick={() => handleToggleWindow(wKey)}
                          className={`py-2.5 px-2.5 text-center font-mono cursor-pointer transition ${
                            isSelected ? 'font-extrabold' : ''
                          }`}
                          style={isSelected ? { backgroundColor: `${color.hex}10` } : {}}
                        >
                          {item.isInactive ? (
                            <span className="text-slate-300 dark:text-slate-700">&ndash;</span>
                          ) : hasRain ? (
                            <span className={`font-bold ${val >= 30 ? 'text-red-600 dark:text-red-400' : (val >= 15 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200')}`}>
                              {val.toFixed(1)} <span className="text-[9px] font-normal text-slate-400">{item.station?.isHydrological ? 'm' : 'mm'}</span>
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
                      ) : item.station?.isHydrological ? (
                        <span className="font-semibold text-sky-600 dark:text-sky-400">
                          Cota: {item.current?.riverLevel ?? 1.84}m ({item.current?.statusMonitoramento || 'Vigilância'})
                        </span>
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
        <span>Fontes: Weather Underground PWS &bull; INEA Alerta de Cheias &bull; CEMADEN &bull; Assinatura: tempo@tempoemriodasostras</span>
        <span>Atualizado automaticamente a cada 5 minutos</span>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  Image as ImageIcon,
  Clock,
  Settings2,
  Smartphone,
  Square
} from 'lucide-react';
import { generateInfographicCanvas } from '../utils/infographicGenerator';

// Ordered exactly as requested: 6h, 12h, 24h, 36h
const INTERVALS = [
  { id: '6h', label: '6 Horas' },
  { id: '12h', label: '12 Horas' },
  { id: '24h', label: '24 Horas' },
  { id: '36h', label: '36 Horas' }
];

const FORMATS = [
  { 
    id: 'story', 
    label: 'Story / Status (9:16)', 
    res: '1080 × 1920 (Ultra-HD 4K)',
    icon: Smartphone 
  },
  { 
    id: 'post', 
    label: 'Post Instagram (4:5)', 
    res: '1080 × 1350 (Ultra-HD 4K)',
    icon: Square 
  }
];

export function DailyInfographicModal({ isOpen, onClose, stations, weatherData, lastUpdated }) {
  const [selectedInterval, setSelectedInterval] = useState('24h');
  const [selectedFormat, setSelectedFormat] = useState('story'); // 'story' | 'post'
  const [watermark, setWatermark] = useState('@tempoemriodasostras');
  const [onlyActive, setOnlyActive] = useState(true);
  const [copied, setCopied] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState('');
  const [canvasRef, setCanvasRef] = useState(null);

  // Prepare items for infographic
  useEffect(() => {
    if (!isOpen) return;

    // Filter stations based on onlyActive toggle (0mm stations are considered inactive)
    const filteredStations = stations.filter(st => {
      const weather = weatherData[st.id];
      const isHydro = Boolean(st.isHydrological || st.id === 'inea-jundia');
      const current = weather?.current;
      const winKey = `h${selectedInterval.replace('h', '')}`;
      const rawWindows = current?.rainWindows || {};
      const fallbackToday = isHydro 
        ? (current?.riverLevel ?? st.riverLevel ?? 1.84) 
        : (current?.rainToday ?? current?.rainAccumulated24h ?? 0);
      const val = rawWindows[winKey] ?? fallbackToday;

      if (onlyActive) {
        if (weather?.status === 'offline') return false;
        if (weather?.statusLabel === 'Inativa') return false;
        if (!weather && st.defaultStatus === 'offline') return false;
        if (weather?.alerts?.some(a => a.severity === 'offline' || a.event === 'Estação Inativa')) return false;
        // Non-hydrological stations marking 0mm are considered inactive and filtered out
        if (!isHydro && (!val || val <= 0)) return false;
        return true;
      }
      return true;
    });

    const items = filteredStations.map(st => {
      const weather = weatherData[st.id];
      const current = weather?.current;
      const isHydro = Boolean(st.isHydrological || st.id === 'inea-jundia');
      const riverLevel = current?.riverLevel ?? st.riverLevel ?? 1.84;
      const fallbackToday = isHydro ? riverLevel : (current?.rainToday ?? current?.rainAccumulated24h ?? 0);
      const rawWindows = current?.rainWindows || {};

      const winKey = `h${selectedInterval.replace('h', '')}`;
      const value = rawWindows[winKey] ?? fallbackToday;
      const numValue = typeof value === 'number' ? value : 0;
      const isMarkingZero = !isHydro && numValue <= 0;

      return {
        station: st,
        value: numValue,
        isHydrological: isHydro,
        riverLevel: riverLevel,
        isInactive: (weather?.status === 'offline') || isMarkingZero,
        rainStartTime: isHydro ? null : (current?.rainStartTime || null)
      };
    });

    // Sort descending by rain accumulation, with Jundiá (isHydrological) ALWAYS placed last!
    const sorted = [...items].sort((a, b) => {
      const aHydro = Boolean(a.isHydrological || a.station?.id === 'inea-jundia');
      const bHydro = Boolean(b.isHydrological || b.station?.id === 'inea-jundia');
      if (aHydro && !bHydro) return 1;
      if (!aHydro && bHydro) return -1;
      return b.value - a.value;
    });

    try {
      const canvas = generateInfographicCanvas({
        items: sorted,
        rainWindow: selectedInterval,
        watermark: watermark || '@tempoemriodasostras',
        lastUpdated,
        format: selectedFormat
      });
      setCanvasRef(canvas);
      setPreviewDataUrl(canvas.toDataURL('image/png'));
    } catch (err) {
      console.error('Error generating infographic preview:', err);
    }
  }, [isOpen, selectedInterval, selectedFormat, watermark, onlyActive, stations, weatherData, lastUpdated]);

  if (!isOpen) return null;

  // Download specific format
  const handleDownloadFormat = (fmt) => {
    const filteredStations = stations.filter(st => {
      const weather = weatherData[st.id];
      const isHydro = Boolean(st.isHydrological || st.id === 'inea-jundia');
      const current = weather?.current;
      const winKey = `h${selectedInterval.replace('h', '')}`;
      const rawWindows = current?.rainWindows || {};
      const fallbackToday = isHydro 
        ? (current?.riverLevel ?? st.riverLevel ?? 1.84) 
        : (current?.rainToday ?? current?.rainAccumulated24h ?? 0);
      const val = rawWindows[winKey] ?? fallbackToday;

      if (onlyActive) {
        if (weather?.status === 'offline') return false;
        if (weather?.statusLabel === 'Inativa') return false;
        if (!weather && st.defaultStatus === 'offline') return false;
        if (weather?.alerts?.some(a => a.severity === 'offline' || a.event === 'Estação Inativa')) return false;
        if (!isHydro && (!val || val <= 0)) return false;
        return true;
      }
      return true;
    });

    const items = filteredStations.map(st => {
      const weather = weatherData[st.id];
      const current = weather?.current;
      const isHydro = Boolean(st.isHydrological || st.id === 'inea-jundia');
      const riverLevel = current?.riverLevel ?? st.riverLevel ?? 1.84;
      const fallbackToday = isHydro ? riverLevel : (current?.rainToday ?? current?.rainAccumulated24h ?? 0);
      const rawWindows = current?.rainWindows || {};
      const winKey = `h${selectedInterval.replace('h', '')}`;
      const value = rawWindows[winKey] ?? fallbackToday;
      const numValue = typeof value === 'number' ? value : 0;
      const isMarkingZero = !isHydro && numValue <= 0;

      return {
        station: st,
        value: numValue,
        isHydrological: isHydro,
        riverLevel: riverLevel,
        isInactive: (weather?.status === 'offline') || isMarkingZero,
        rainStartTime: isHydro ? null : (current?.rainStartTime || null)
      };
    }).sort((a, b) => {
      const aHydro = Boolean(a.isHydrological || a.station?.id === 'inea-jundia');
      const bHydro = Boolean(b.isHydrological || b.station?.id === 'inea-jundia');
      if (aHydro && !bHydro) return 1;
      if (!aHydro && bHydro) return -1;
      return b.value - a.value;
    });

    const canvas = generateInfographicCanvas({
      items,
      rainWindow: selectedInterval,
      watermark: watermark || '@tempoemriodasostras',
      lastUpdated,
      format: fmt
    });

    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = `acumulados-chuva-rio-das-ostras-${fmt}-${selectedInterval}-${dateStr}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopy = async () => {
    if (!canvasRef) return;
    try {
      canvasRef.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch (err) {
          handleDownloadFormat(selectedFormat);
        }
      });
    } catch (e) {
      handleDownloadFormat(selectedFormat);
    }
  };

  const handleShare = async () => {
    if (!canvasRef) return;
    try {
      canvasRef.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `chuva-rio-das-ostras-${selectedFormat}-${selectedInterval}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Acumulados de Chuva - Rio das Ostras',
            text: 'Boletim diário de acumulados de chuva em Rio das Ostras - RJ'
          });
        } else {
          handleCopy();
        }
      });
    } catch (err) {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-5xl max-h-[94vh] bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-sky-900/60 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-3.5 sm:p-4.5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-sky-950/50 shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Card Oficial de Acumulados de Chuva
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-950 text-cyan-300 border border-cyan-800/80">
                  Ultra-HD 4K
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold hidden sm:inline">
                  &bull; Apenas estações ativas
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden xs:block">
                Formato Story (9:16) e Feed Post (4:5) prontos para Instagram e WhatsApp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white text-xs font-semibold border border-slate-700 transition active:scale-95 cursor-pointer"
              title="Copiar imagem em alta resolução para colar no WhatsApp"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Copiar Imagem'}</span>
            </button>

            <button
              onClick={() => handleDownloadFormat('story')}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition active:scale-95 cursor-pointer"
              title="Baixar em formato Story / WhatsApp Status (9:16)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Story</span>
            </button>

            <button
              onClick={() => handleDownloadFormat('post')}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition active:scale-95 cursor-pointer"
              title="Baixar em formato Post Instagram (4:5)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Post</span>
            </button>

            <button 
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Settings Sidebar */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 p-4 sm:p-5 space-y-4 overflow-y-auto bg-slate-950/40">
            {/* Format Selector: Story (9:16) vs Post (4:5) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Formato da Imagem
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FORMATS.map(fmt => {
                  const Icon = fmt.icon;
                  const isSelected = selectedFormat === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      onClick={() => setSelectedFormat(fmt.id)}
                      className={`p-2.5 rounded-xl text-xs font-semibold transition cursor-pointer flex flex-col items-center justify-center text-center gap-1 border ${
                        isSelected
                          ? 'bg-sky-600 text-white border-cyan-400 shadow-md'
                          : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{fmt.label}</span>
                      <span className="text-[10px] opacity-75 font-normal">{fmt.res}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interval Selector: 6h, 12h, 24h, 36h strictly ordered */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Intervalo de Acumulado
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {INTERVALS.map(int => (
                  <button
                    key={int.id}
                    onClick={() => setSelectedInterval(int.id)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                      selectedInterval === int.id
                        ? 'bg-sky-600 text-white font-semibold shadow-md'
                        : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{int.label}</span>
                    {selectedInterval === int.id && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Stations Scope: Option to toggle only active vs all */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Filtro de Estações</span>
                <span className="text-[10px] text-cyan-400 font-mono font-semibold">
                  {onlyActive ? 'Apenas Ativas' : 'Todas'}
                </span>
              </label>
              <button
                type="button"
                onClick={() => setOnlyActive(!onlyActive)}
                className={`w-full p-2.5 rounded-xl text-xs flex items-center justify-between border transition cursor-pointer ${
                  onlyActive 
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-xs' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${onlyActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span className="font-semibold text-left">
                    {onlyActive ? 'Apenas estações ativas' : 'Exibir todas as estações'}
                  </span>
                </div>
                <div className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${onlyActive ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'}`}>
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </div>
              </button>
            </div>

            {/* Watermark / Signature */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
                Assinatura no Rodapé
              </label>
              <input
                type="text"
                value={watermark}
                onChange={(e) => setWatermark(e.target.value)}
                placeholder="@tempoemriodasostras"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono font-medium"
              />
              <span className="text-[11px] text-slate-400 block">
                Identificação do rodapé: <strong className="text-slate-300">{watermark}</strong>
              </span>
            </div>

            {/* Source Information */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
              <span className="font-semibold text-slate-300 block">Fontes dos Dados:</span>
              <span>Estações de cada bairro &bull; Rio das Ostras - RJ</span>
            </div>

            {/* Mobile Actions */}
            <div className="sm:hidden space-y-2 pt-2 border-t border-slate-800">
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 text-cyan-300 text-xs font-semibold border border-slate-700"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado para Área de Transferência' : 'Copiar Imagem'}</span>
              </button>

              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-semibold border border-slate-700"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartilhar</span>
              </button>
            </div>
          </div>

          {/* Live Preview Pane */}
          <div className="flex-1 bg-slate-950 p-4 sm:p-6 flex flex-col items-center justify-center overflow-y-auto">
            {previewDataUrl ? (
              <div className="space-y-3 max-w-[500px] w-full flex flex-col items-center">
                <div className={`rounded-2xl overflow-hidden shadow-2xl border border-sky-900/60 bg-[#020d20] ${
                  selectedFormat === 'story' ? 'max-h-[70vh] aspect-[9/16]' : 'max-h-[70vh] aspect-[4/5]'
                }`}>
                  <img 
                    src={previewDataUrl} 
                    alt="Card Oficial de Acumulados de Chuva"
                    className="w-full h-full object-contain rounded-2xl block"
                  />
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1 text-cyan-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    Ultra-HD 4K ({selectedFormat === 'story' ? '1080×1920' : '1080×1350'})
                  </span>
                  <span>&bull;</span>
                  <span>{selectedFormat === 'story' ? 'Story / Status' : 'Feed Post'}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-sm">
                Gerando imagem em alta resolução...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

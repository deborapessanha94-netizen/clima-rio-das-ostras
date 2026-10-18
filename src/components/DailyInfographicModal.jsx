import React, { useState, useEffect, useRef } from 'react';
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
  Calendar
} from 'lucide-react';
import { generateInfographicCanvas, formatStationDetailsForInfographic } from '../utils/infographicGenerator';

const INTERVALS = [
  { id: '24h', label: '24 Horas (Padrão Diário)' },
  { id: 'today', label: 'Hoje (Desde 00h)' },
  { id: '12h', label: '12 Horas' },
  { id: '36h', label: '36 Horas' },
  { id: '48h', label: '48 Horas' },
  { id: '6h', label: '6 Horas' }
];

export function DailyInfographicModal({ isOpen, onClose, stations, weatherData, lastUpdated }) {
  const [selectedInterval, setSelectedInterval] = useState('24h');
  const [filterActiveOnly, setFilterActiveOnly] = useState(true);
  const [watermark, setWatermark] = useState('Engmetclima');
  const [copied, setCopied] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState('');
  const [canvasRef, setCanvasRef] = useState(null);

  // Prepare items for infographic
  useEffect(() => {
    if (!isOpen) return;

    const items = stations.map(st => {
      const weather = weatherData[st.id];
      const current = weather?.current;
      const isInactive = weather?.status === 'offline';
      const fallbackToday = current?.rainToday ?? current?.rainAccumulated24h ?? 0;
      const rawWindows = current?.rainWindows || {};

      let value = 0;
      if (selectedInterval === 'today') {
        value = isInactive ? 0 : fallbackToday;
      } else {
        const winKey = `h${selectedInterval.replace('h', '')}`;
        value = isInactive ? 0 : (rawWindows[winKey] ?? fallbackToday);
      }

      return {
        station: st,
        value: typeof value === 'number' ? value : 0,
        isInactive,
        rainStartTime: current?.rainStartTime || null
      };
    });

    // Filter and sort: active stations first, sorted descending by accumulation
    let filtered = items;
    if (filterActiveOnly) {
      filtered = items.filter(i => !i.isInactive);
    }

    const sorted = [...filtered].sort((a, b) => {
      if (a.isInactive && !b.isInactive) return 1;
      if (!a.isInactive && b.isInactive) return -1;
      return b.value - a.value;
    });

    try {
      const canvas = generateInfographicCanvas({
        items: sorted,
        rainWindow: selectedInterval,
        watermark: watermark || 'Engmetclima',
        lastUpdated
      });
      setCanvasRef(canvas);
      setPreviewDataUrl(canvas.toDataURL('image/png'));
    } catch (err) {
      console.error('Error generating infographic preview:', err);
    }
  }, [isOpen, selectedInterval, filterActiveOnly, watermark, stations, weatherData, lastUpdated]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!canvasRef) return;
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = `acumulados-chuva-rio-das-ostras-${selectedInterval}-${dateStr}.png`;
    link.href = canvasRef.toDataURL('image/png');
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
          handleDownload();
        }
      });
    } catch (e) {
      handleDownload();
    }
  };

  const handleShare = async () => {
    if (!canvasRef) return;
    try {
      canvasRef.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `chuva-rio-das-ostras-${selectedInterval}.png`, { type: 'image/png' });
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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-5xl max-h-[92vh] bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-sky-900/60 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-sky-950/50">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Card Oficial de Acumulados de Chuva
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-950 text-cyan-300 border border-cyan-800/80">
                  Infográfico PNG
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gera imagem diária oficial pronta para baixar, compartilhar no WhatsApp e redes sociais
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white text-xs font-semibold border border-slate-700 transition active:scale-95 cursor-pointer"
              title="Copiar imagem para colar no WhatsApp"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Imagem'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-950 transition active:scale-95 cursor-pointer"
              title="Baixar imagem em alta resolução"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar PNG</span>
            </button>

            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Settings Sidebar */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 p-4 sm:p-5 space-y-5 overflow-y-auto bg-slate-950/40">
            {/* Interval Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Intervalo de Acumulado
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {INTERVALS.map(int => (
                  <button
                    key={int.id}
                    onClick={() => setSelectedInterval(int.id)}
                    className={`text-left px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-between ${
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

            {/* Inactive Stations Filter */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Filtro de Estações
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={filterActiveOnly}
                  onChange={(e) => setFilterActiveOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-500 focus:ring-sky-400 border-slate-700 bg-slate-800"
                />
                <span>Apenas estações ativas com dados</span>
              </label>
            </div>

            {/* Watermark / Attribution */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
                Assinatura / Rodapé
              </label>
              <input
                type="text"
                value={watermark}
                onChange={(e) => setWatermark(e.target.value)}
                placeholder="Ex: Engmetclima"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[11px] text-slate-500 block">
                Nome ou identificação exibida no canto inferior esquerdo do card.
              </span>
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
              <div className="space-y-3 max-w-[520px] w-full flex flex-col items-center">
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-sky-900/50 bg-[#020d20]">
                  <img 
                    src={previewDataUrl} 
                    alt="Card Oficial de Acumulados de Chuva"
                    className="w-full h-auto object-contain max-h-[68vh] rounded-2xl block"
                  />
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1 text-cyan-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    Alta resolução (1800px)
                  </span>
                  <span>&bull;</span>
                  <span>Formato ideal para WhatsApp e redes sociais</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-sm">
                Gerando pré-visualização do card...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, ExternalLink, RefreshCw, Globe, AlertCircle, ShieldCheck } from 'lucide-react';

export function EmbeddedStationModal({ station, onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  if (!station) return null;

  // For INEA 2241036, INEA provides a dedicated embeddable graphics page
  const embedUrl = station.id === 'inea-jundia'
    ? 'https://alertadecheias.inea.rj.gov.br/alertadecheias/graficos2241036.html'
    : station.externalUrl;

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-6xl h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-slate-800 border border-sky-200/60 dark:border-sky-800/60 flex items-center justify-center text-sky-600 dark:text-sky-400 flex-shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">
                  {station.code}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {station.name}
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  &bull; {station.network}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-md sm:max-w-xl">
                {station.externalUrl}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleReload}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              title="Recarregar página embutida"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {station.externalUrl && (
              <a
                href={station.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-xs transition"
                title="Abrir em nova aba do navegador"
              >
                <span>Abrir Direto</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition ml-1"
              title="Fechar visualizador"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded Iframe Container */}
        <div className="relative flex-1 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xs gap-3">
              <RefreshCw className="w-7 h-7 text-sky-600 animate-spin" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Carregando portal oficial embutido...
              </p>
            </div>
          )}

          {embedUrl ? (
            <iframe
              key={iframeKey}
              src={embedUrl}
              title={`Portal oficial - ${station.name}`}
              className="w-full h-full border-0"
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 p-6 text-center">
              <AlertCircle className="w-10 h-10 mb-2 text-slate-400" />
              <p className="text-sm font-semibold">URL oficial não configurada para esta estação.</p>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Página oficial embutida com segurança</span>
          </div>
          <div>
            Link de origem: <a href={station.externalUrl} target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 hover:underline font-mono">{station.externalUrl}</a>
          </div>
        </div>
      </div>
    </div>
  );
}

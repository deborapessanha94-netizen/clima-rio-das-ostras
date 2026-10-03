import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  ExternalLink, 
  Download, 
  Calendar, 
  ShieldAlert, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Waves, 
  PhoneCall, 
  Sparkles, 
  ChevronRight 
} from 'lucide-react';
import { RECENT_BULLETINS } from '../data/bulletins';

export function DailyBulletinsModal({ isOpen, onClose }) {
  const [selectedBulletin, setSelectedBulletin] = useState(RECENT_BULLETINS[0]);

  if (!isOpen) return null;

  const handleOpenPdf = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                  Boletins Hidrometeorológicos Diários &ndash; INEA
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60">
                  Alerta de Cheias RJ
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Análise oficial diária de previsão do tempo, níveis dos rios e riscos em Rio das Ostras
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a 
              href="https://alertadecheias.inea.rj.gov.br/analise.php" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
            >
              <span>Portal Oficial</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-slate-800 p-4 space-y-3 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
              <span>Edições Disponíveis</span>
              <Calendar className="w-3.5 h-3.5 text-sky-500" />
            </div>

            <div className="space-y-2">
              {RECENT_BULLETINS.map((b) => {
                const isSelected = selectedBulletin?.file === b.file;
                return (
                  <button
                    key={b.file}
                    onClick={() => setSelectedBulletin(b)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80 hover:border-sky-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                        isSelected 
                          ? 'bg-white/20 text-white' 
                          : b.status === 'Vigente' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' 
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {b.status}
                      </span>
                      <span className={`text-[11px] ${isSelected ? 'text-sky-100' : 'text-slate-400'}`}>
                        {b.date}
                      </span>
                    </div>

                    <div className="font-semibold text-xs leading-snug">
                      {b.title}
                    </div>

                    <div className="text-[10px] opacity-80 mt-1 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>Documento Oficial PDF</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Action & Preview Hub */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50/60 dark:bg-slate-950 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Highlight Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60">
                        {selectedBulletin.status} &bull; {selectedBulletin.date}
                      </span>
                      <span className="text-xs text-slate-400">INEA / SEDEC-RJ</span>
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                      {selectedBulletin.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {selectedBulletin.description}
                    </p>
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => handleOpenPdf(selectedBulletin.url)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-xs transition flex items-center justify-center gap-2 active:scale-95"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Abrir Boletim Oficial (PDF)</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </button>

                  <a
                    href={selectedBulletin.url}
                    download={selectedBulletin.file}
                    className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 active:scale-95"
                  >
                    <Download className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>Baixar Arquivo</span>
                  </a>
                </div>
              </div>

              {/* Scope & Station Status for Rio das Ostras */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 font-semibold text-xs mb-1">
                    <Waves className="w-4 h-4 text-cyan-600" />
                    <span>Bacia de Rio das Ostras</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Monitoramento contínuo das cotas do <strong>Rio Jundiá</strong> e drenagem da <strong>Lagoa de Iriry</strong> com telemetria automática 24 horas por dia.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-xs mb-1">
                    <PhoneCall className="w-4 h-4 text-amber-600" />
                    <span>Contatos de Emergência</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Defesa Civil de Rio das Ostras: <strong>199</strong> ou <strong>(22) 2760-8394</strong>.<br/>
                    Plantão INEA Alerta de Cheias: <strong>(21) 2334-9307</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Link to Official Page */}
            <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">
                  Deseja consultar o histórico completo de anos anteriores diretamente no portal do estado?
                </span>
              </div>
              <a
                href="https://alertadecheias.inea.rj.gov.br/analise.php"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 whitespace-nowrap"
              >
                <span>Acessar analise.php</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Boletins oficiais emitidos pelo Sistema Alerta de Cheias &ndash; INEA / RJ</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-200 dark:bg-zinc-800 hover:bg-neutral-300 dark:hover:bg-zinc-700 text-neutral-800 dark:text-zinc-200 font-medium transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

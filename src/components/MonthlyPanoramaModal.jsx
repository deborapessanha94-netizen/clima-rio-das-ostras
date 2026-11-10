import React, { useState } from 'react';
import { 
  X, 
  Film, 
  Download, 
  Copy, 
  Check, 
  CloudRain, 
  Wind, 
  Thermometer, 
  Waves, 
  Calendar, 
  Award,
  Sparkles,
  Play,
  Maximize2,
  Share2
} from 'lucide-react';

export function MonthlyPanoramaModal({ isOpen, onClose }) {
  const [activeFormat, setActiveFormat] = useState('reels'); // 'reels' | 'horizontal'
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const verticalVideoSrc = '/videos/panorama_outubro_2026_reels.mp4';
  const horizontalVideoSrc = '/videos/panorama_outubro_2026_horizontal.mp4';

  const currentSrc = activeFormat === 'reels' ? verticalVideoSrc : horizontalVideoSrc;

  const socialCaption = `📊 RETROSPECTIVA CLIMÁTICA • OUTUBRO/2026 EM RIO DAS OSTRAS 🌧️🌊

Confira como o clima se comportou em nosso município ao longo dos 31 dias de Outubro/2026, com dados consolidados de toda a rede oficial e particular de monitoramento!

🚨 DESTAQUES DO MÊS:
🌧️ Chuva Média da Rede: 243,3 mm (Mês extremamente úmido)
🌧️ Ponto Mais Chuvoso: Rocha Leão com incríveis 410,0 mm!
📅 Dias com Chuva Registrada: 25 de 31 dias (80% dos dias com precipitação)
⛈️ Dia Mais Chuvoso: 02/10/2026 (Média municipal de 48,0 mm e pico de 84,3 mm)
💨 Maior Rajada do Mês: 62,3 km/h na Praia da Tartaruga (26/10 às 10:00)
🌬️ Vento Médio: 16,6 km/h • Direção Predominante: Nordeste (NE)
🌡️ Temperaturas: Mínima de 18,4°C | Máxima de 32,6°C

📍 RANKING DOS ACUMULADOS POR BAIRRO/ESTAÇÃO:
1️⃣ Rocha Leão: 410,0 mm
2️⃣ Cantagalo: 191,7 mm
3️⃣ Praiamar: 177,3 mm
4️⃣ Praia da Tartaruga: 167,9 mm
5️⃣ Costazul: 131,3 mm

🌀 SISTEMAS METEOROLÓGICOS ATUANTES:
• ASAS (Alta Subtropical do Atlântico Sul): 12 dias
• Cavados Costeiros / Instabilidades Locais: 8 dias
• Cavados Costeiros / Convergência: 4 dias
• Frentes Frias Atuantes: 4 dias
• Circulação Marítima Pós-Frontal: 3 dias

Assista ao vídeo em alta definição e compartilhe com quem precisa acompanhar o clima em Rio das Ostras!

📍 Fontes: Estações Meteorológicas do Município
👉 Siga @tempoemriodasostras para alertas, radares e monitoramento em tempo real.

#RioDasOstras #ClimaRioDasOstras #TempoEmRioDasOstras #Chuva #Meteorologia #Outubro2026 #DefesaCivil #RegiaoDosLagos #PrevisaoDoTempo`;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(socialCaption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shadow-inner">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Panorama Mensal • Outubro/2026
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Vídeo Oficial
                </span>
              </div>
              <p className="text-xs text-sky-200/80">
                Retrospectiva animada dos dados meteorológicos de Rio das Ostras
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Format Selector & Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Formato:</span>
              <button
                onClick={() => setActiveFormat('reels')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeFormat === 'reels'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>📱 Vertical (9:16) Reels/Stories</span>
              </button>
              <button
                onClick={() => setActiveFormat('horizontal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeFormat === 'horizontal'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>💻 Horizontal (16:9) Feed/TV</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={currentSrc}
                download={activeFormat === 'reels' ? 'panorama_outubro_2026_reels.mp4' : 'panorama_outubro_2026_horizontal.mp4'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-xs cursor-pointer"
                title="Baixar vídeo em alta definição MP4"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar MP4 ({activeFormat === 'reels' ? 'Vertical' : 'Horizontal'})</span>
              </a>
            </div>
          </div>

          {/* Video Player Display */}
          <div className="flex flex-col items-center justify-center bg-slate-950 rounded-2xl p-4 sm:p-6 shadow-inner border border-slate-800">
            <div className={`relative overflow-hidden rounded-xl bg-black shadow-2xl ${
              activeFormat === 'reels' 
                ? 'w-full max-w-[340px] aspect-[9/16]' 
                : 'w-full max-w-[760px] aspect-[16/9]'
            }`}>
              <video
                key={currentSrc}
                src={currentSrc}
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-full object-contain"
              >
                Seu navegador não suporta a reprodução de vídeo MP4.
              </video>
            </div>
            <p className="mt-3 text-center text-xs text-slate-400">
              💡 Dica: O vídeo já está formatado com taxa de 30 FPS e resolução FullHD 1080p pronto para publicação direta.
            </p>
          </div>

          {/* Highlight Cards Grid */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-500" />
              Consolidação Oficial de Outubro/2026
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/40">
                <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 text-xs font-medium mb-1">
                  <CloudRain className="w-4 h-4" />
                  <span>Média da Rede</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                  243,3 <span className="text-xs font-semibold text-slate-500">mm</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  168% acima da normal
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40">
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-1">
                  <Award className="w-4 h-4" />
                  <span>Máx. Rocha Leão</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                  410,0 <span className="text-xs font-semibold text-slate-500">mm</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Maior acumulado do ano
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200/60 dark:border-cyan-800/40">
                <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 text-xs font-medium mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Dias c/ Chuva</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                  25 <span className="text-xs font-semibold text-slate-500">dias</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  80% dos dias do mês
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/40">
                <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 text-xs font-medium mb-1">
                  <Wind className="w-4 h-4" />
                  <span>Maior Rajada</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                  62,3 <span className="text-xs font-semibold text-slate-500">km/h</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  26/10 10:00 Tartaruga
                </p>
              </div>
            </div>
          </div>

          {/* Ranking & Rio Jundia Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stations Rain List */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-sky-500" />
                Acumulado por Estação no Mês
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-800/40">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">🥇 Rocha Leão</span>
                  <span className="text-xs font-bold font-mono text-sky-600 dark:text-sky-400">410,0 mm</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">🥈 Cantagalo</span>
                  <span className="text-xs font-bold font-mono text-sky-600 dark:text-sky-400">191,7 mm</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">🥉 Praiamar</span>
                  <span className="text-xs font-bold font-mono text-sky-600 dark:text-sky-400">177,3 mm</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">4️⃣ Praia da Tartaruga</span>
                  <span className="text-xs font-bold font-mono text-sky-600 dark:text-sky-400">167,9 mm</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">5️⃣ Costazul</span>
                  <span className="text-xs font-bold font-mono text-sky-600 dark:text-sky-400">131,3 mm</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-800/30">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">📊 Média Geral da Rede</span>
                  <span className="text-xs font-bold font-mono text-sky-700 dark:text-sky-300">243,3 mm</span>
                </div>
              </div>
            </div>

            {/* Synoptic Systems */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-teal-500" />
                  Sistemas Meteorológicos Atuantes
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Alta Subtropical (ASAS)</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">12 dias</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '38.7%' }} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-600 dark:text-slate-400">Cavado / Instab. Local</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">8 dias</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full rounded-full" style={{ width: '25.8%' }} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-600 dark:text-slate-400">Cavado / Convergência</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">4 dias</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: '12.9%' }} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-600 dark:text-slate-400">Frentes Frias Atuantes</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">4 dias</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '12.9%' }} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-600 dark:text-slate-400">Circulação Pós-Frontal</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">3 dias</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-teal-500 h-full rounded-full" style={{ width: '9.7%' }} />
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500">
                <span>Extremos Térmicos:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">18,4°C • 32,6°C</span>
              </div>
            </div>
          </div>

          {/* Social Media Caption Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-sky-500" />
                Texto Pronto para Postagem (Instagram / WhatsApp)
              </span>
              <button
                onClick={handleCopyCaption}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/60 hover:bg-sky-200 dark:hover:bg-sky-900 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={socialCaption}
              rows={5}
              className="w-full p-2.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-hidden resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span>Canal Oficial:</span>
            <strong className="text-slate-700 dark:text-slate-300 font-semibold">@tempoemriodasostras</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

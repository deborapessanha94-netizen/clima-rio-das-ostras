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
  Share2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Layers
} from 'lucide-react';

export function MonthlyPanoramaModal({ isOpen, onClose }) {
  // 'reels' | 'horizontal' | 'feed_slides' | 'stories_slides'
  const [activeFormat, setActiveFormat] = useState('reels');
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const verticalVideoSrc = '/videos/panorama_outubro_2026_reels.mp4?v=20261110_rural';
  const horizontalVideoSrc = '/videos/panorama_outubro_2026_horizontal.mp4?v=20261110';

  const slides = [
    { id: '01_panorama_destaques.png', label: '1. Abertura & 3 Grandes Números' },
    { id: '02_volume_total_chuva.png', label: '2. Volume Total de Chuva' },
    { id: '03_ranking_estacoes.png', label: '3. Ranking das Estações (Região Rural)' },
    { id: '04_ventos_e_temperaturas.png', label: '4. Ventos & Temperaturas' },
    { id: '05_sistemas_meteorologicos.png', label: '5. O Que Comandou o Tempo' },
    { id: '06_acompanhe_diariamente.png', label: '6. Divulgação Oficial & Siga o Canal' },
  ];

  const isVideo = activeFormat === 'reels' || activeFormat === 'horizontal';
  const currentVideoSrc = activeFormat === 'reels' ? verticalVideoSrc : horizontalVideoSrc;
  
  const currentImageSrc = activeFormat === 'feed_slides' 
    ? `/carrossel/feed/${slides[currentSlideIdx].id}?v=20261110_rural`
    : `/carrossel/stories/${slides[currentSlideIdx].id}?v=20261110_rural`;

  const currentDownloadHref = isVideo 
    ? currentVideoSrc 
    : currentImageSrc;

  const currentDownloadName = isVideo 
    ? (activeFormat === 'reels' ? 'panorama_outubro_2026_reels.mp4' : 'panorama_outubro_2026_horizontal.mp4')
    : (activeFormat === 'feed_slides' ? `feed_${slides[currentSlideIdx].id}` : `stories_${slides[currentSlideIdx].id}`);

  const socialCaption = `📊 RETROSPECTIVA CLIMÁTICA • OUTUBRO/2026 EM RIO DAS OSTRAS 🌧️🌊

Confira como o clima se comportou em nosso município ao longo dos 31 dias de Outubro/2026, com dados consolidados de toda a rede oficial e particular de monitoramento!

🚨 DESTAQUES DO MÊS:
🌧️ Volume Total de Chuva: Variou de 131,3 mm (orla) a 410,0 mm (região rural)
🏆 Recorde Municipal: Rocha Leão acumulou 410,0 mm (comprovando a forte retenção de chuva na região rural)!
📅 Frequência das Chuvas: Choveu em 25 dos 31 dias (80% do mês com chuva)
⛈️ Dia Mais Chuvoso: 02/10/2026 com volume de até 84,3 mm em apenas 24h
💨 Maior Rajada do Mês: 62,3 km/h na Praia da Tartaruga (26/10 às 10:00)
🌬️ Vento Médio: 16,6 km/h • Direção Predominante: Nordeste (NE)
🌡️ Temperaturas: Mínima de 18,4°C | Máxima de 32,6°C (Amplitude de 14,2°C)

📍 RANKING DOS ACUMULADOS TOTAIS POR BAIRRO/ESTAÇÃO:
1️⃣ Rocha Leão (Região Rural): 410,0 mm
2️⃣ Cantagalo (Zona Rural): 191,7 mm
3️⃣ Praiamar (Divisa Sul): 177,3 mm
4️⃣ Praia da Tartaruga (Centro / Defesa Civil): 167,9 mm
5️⃣ Costazul (Orla Marítima): 131,3 mm

🌀 SISTEMAS METEOROLÓGICOS ATUANTES:
• ASAS (Alta Subtropical do Atlântico Sul): 12 dias
• Cavados Costeiros / Instabilidades Locais: 8 dias
• Cavados Costeiros / Convergência: 4 dias
• Frentes Frias Atuantes: 4 dias
• Circulação Marítima Pós-Frontal: 3 dias

Assista ao vídeo e veja o carrossel em alta definição! Compartilhe com quem precisa acompanhar o clima em Rio das Ostras!

📍 Fontes: Estações Meteorológicas do Município
👉 Siga @tempoemriodasostras para alertas, previsões e monitoramento em tempo real.

#RioDasOstras #ClimaRioDasOstras #TempoEmRioDasOstras #Chuva #Meteorologia #Outubro2026 #DefesaCivil #RegiaoDosLagos #PrevisaoDoTempo`;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(socialCaption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIdx((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlideIdx((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
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
                  Oficial
                </span>
              </div>
              <p className="text-xs text-sky-200/80">
                Vídeos e lâminas gráficas prontas para publicação no Instagram (Feed & Stories)
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
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mr-1">Mídia:</span>
              
              <button
                onClick={() => setActiveFormat('reels')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeFormat === 'reels'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>📱 Vídeo Reels (9:16)</span>
              </button>

              <button
                onClick={() => setActiveFormat('feed_slides')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeFormat === 'feed_slides'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>📸 Post Feed (4:5)</span>
              </button>

              <button
                onClick={() => setActiveFormat('stories_slides')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeFormat === 'stories_slides'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>📱 Stories (9:16)</span>
              </button>

              <button
                onClick={() => setActiveFormat('horizontal')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeFormat === 'horizontal'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>💻 Vídeo 16:9</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={currentDownloadHref}
                download={currentDownloadName}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-xs cursor-pointer"
                title="Baixar arquivo em máxima qualidade"
              >
                <Download className="w-3.5 h-3.5" />
                <span>
                  {isVideo 
                    ? `Baixar MP4 (${activeFormat === 'reels' ? 'Reels' : '16:9'})` 
                    : `Baixar Lâmina ${currentSlideIdx + 1} (PNG)`}
                </span>
              </a>
            </div>
          </div>

          {/* Media Display Area (Video or Interactive Slide Gallery) */}
          <div className="flex flex-col items-center justify-center bg-slate-950 rounded-2xl p-4 sm:p-6 shadow-inner border border-slate-800">
            {isVideo ? (
              <div className={`relative overflow-hidden rounded-xl bg-black shadow-2xl ${
                activeFormat === 'reels' 
                  ? 'w-full max-w-[340px] aspect-[9/16]' 
                  : 'w-full max-w-[760px] aspect-[16/9]'
              }`}>
                <video
                  key={currentVideoSrc}
                  src={currentVideoSrc}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-contain"
                >
                  Seu navegador não suporta a reprodução de vídeo MP4.
                </video>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                {/* Slide Title Bar */}
                <div className="w-full max-w-[420px] flex items-center justify-between text-xs text-slate-300 mb-2 px-1">
                  <span className="font-semibold text-sky-400">
                    Lâmina {currentSlideIdx + 1} de {slides.length}
                  </span>
                  <span className="text-slate-400 truncate max-w-[220px]">
                    {slides[currentSlideIdx].label}
                  </span>
                </div>

                {/* Slide Preview with Navigation Chevrons */}
                <div className={`relative overflow-hidden rounded-xl bg-slate-900 shadow-2xl border border-slate-800 group ${
                  activeFormat === 'feed_slides' 
                    ? 'w-full max-w-[380px] aspect-[4/5]' 
                    : 'w-full max-w-[340px] aspect-[9/16]'
                }`}>
                  <img
                    key={currentImageSrc}
                    src={currentImageSrc}
                    alt={slides[currentSlideIdx].label}
                    className="w-full h-full object-contain"
                  />

                  {/* Previous button */}
                  <button
                    onClick={handlePrevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition cursor-pointer shadow-lg"
                    title="Lâmina anterior"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Next button */}
                  <button
                    onClick={handleNextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 transition cursor-pointer shadow-lg"
                    title="Próxima lâmina"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Dots indicator */}
                <div className="flex items-center gap-2 mt-3">
                  {slides.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => setCurrentSlideIdx(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        currentSlideIdx === idx 
                          ? 'w-6 bg-sky-500' 
                          : 'w-2 bg-slate-700 hover:bg-slate-600'
                      }`}
                      title={s.label}
                    />
                  ))}
                </div>
              </div>
            )}

            <p className="mt-3 text-center text-xs text-slate-400">
              {isVideo 
                ? '💡 Dica: O vídeo já está formatado com taxa de 30 FPS, sem áudio embutido, pronto para adicionar áudios em alta no Reels.'
                : activeFormat === 'feed_slides'
                  ? '💡 Proporção 4:5 (1080x1350): Padrão perfeito para Carrossel no Feed do Instagram sem cortes laterais ou verticais.'
                  : '💡 Proporção 9:16 (1080x1920): Padrão vertical completo para Stories sequenciais no Instagram.'}
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
                  <span>Volume Total</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                  131 a 410 <span className="text-xs font-semibold text-slate-500">mm</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Em todo o município
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
                  Região Rural • Recorde anual
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

          {/* Ranking & Synoptic Systems Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stations Rain List */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-sky-500" />
                Acumulado Total por Estação no Mês
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-800/40">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">🥇 Rocha Leão (Região Rural)</span>
                  <span className="text-xs font-bold font-mono text-sky-600 dark:text-sky-400">410,0 mm</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">🥈 Cantagalo (Zona Rural)</span>
                  <span className="text-xs font-bold font-mono text-sky-600 dark:text-sky-400">191,7 mm</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">🥉 Praiamar (Divisa Sul)</span>
                  <span className="text-xs font-bold font-mono text-sky-600 dark:text-sky-400">177,3 mm</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">4️⃣ Praia da Tartaruga (Centro)</span>
                  <span className="text-xs font-bold font-mono text-sky-600 dark:text-sky-400">167,9 mm</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">5️⃣ Costazul (Orla)</span>
                  <span className="text-xs font-bold font-mono text-sky-600 dark:text-sky-400">131,3 mm</span>
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
                    <span className="font-semibold text-slate-800 dark:text-slate-200">12 dias (38,7%)</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '38.7%' }} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-600 dark:text-slate-400">Cavado / Instab. Local</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">8 dias (25,8%)</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full rounded-full" style={{ width: '25.8%' }} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-600 dark:text-slate-400">Cavado / Convergência</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">4 dias (12,9%)</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: '12.9%' }} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-600 dark:text-slate-400">Frentes Frias Atuantes</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">4 dias (12,9%)</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '12.9%' }} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-600 dark:text-slate-400">Circulação Pós-Frontal</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">3 dias (9,7%)</span>
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
                Legenda Pronta para Postagem (Instagram / WhatsApp)
              </span>
              <button
                onClick={handleCopyCaption}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/60 hover:bg-sky-200 dark:hover:bg-sky-900 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Legenda'}</span>
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

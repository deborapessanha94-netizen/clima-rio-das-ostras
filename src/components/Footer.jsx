import React from 'react';
import { Download, ShieldCheck, ExternalLink, Heart } from 'lucide-react';

export function Footer({ stations, weatherData }) {
  const exportCSV = () => {
    const headers = [
      "ID",
      "Nome",
      "Bairro",
      "Categoria",
      "Tipo",
      "Latitude",
      "Longitude",
      "Altitude(m)",
      "Temperatura(C)",
      "Sensacao(C)",
      "Chuva_24h(mm)",
      "Chuva_Inst(mm/h)",
      "Vento(km/h)",
      "Direcao_Vento",
      "Umidade(%)",
      "Pressao(hPa)",
      "Alerta",
      "Horario_Leitura"
    ];

    const rows = stations.map(st => {
      const w = weatherData[st.id]?.current;
      const alert = weatherData[st.id]?.alert;
      return [
        st.id,
        `"${st.name}"`,
        `"${st.neighborhood}"`,
        st.category,
        st.type,
        st.lat,
        st.lng,
        st.altitude,
        w?.temp ?? '',
        w?.feelsLike ?? '',
        w?.rainAccumulated24h ?? '',
        w?.rain ?? '',
        w?.windSpeed ?? '',
        w?.windDirectionText ?? '',
        w?.humidity ?? '',
        w?.pressure ?? '',
        alert?.label ?? 'Normal',
        weatherData[st.id]?.timestamp ?? ''
      ].join(';');
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `clima_rio_das_ostras_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6">
        <div>
          <div className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1.5">
            <span>Sistema Meteorológico Integrado de Rio das Ostras - RJ</span>
          </div>
          <p className="mt-1 text-slate-400 max-w-xl">
            Monitoramento microclimático por bairros, integrando previsões meteorológicas em alta resolução (Open-Meteo), referências do CEMADEN, INMET e suporte da Defesa Civil Municipal.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold shadow-xs transition active:scale-95"
        >
          <Download className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span>Exportar Dados em CSV</span>
        </button>
      </div>

      <div className="py-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
        <div>
          Emergências em Rio das Ostras: Defesa Civil <strong>199</strong> ou <strong>(22) 2760-8394</strong> (24h)
        </div>
        <div className="flex items-center gap-1">
          Feito com <Heart className="w-3 h-3 text-red-500 fill-red-500" /> para os cidadãos e pesquisadores de Rio das Ostras
        </div>
      </div>
    </footer>
  );
}

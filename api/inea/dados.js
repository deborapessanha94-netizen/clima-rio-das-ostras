import https from 'node:https';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const defaultJundiaData = {
    stationCode: "2241036",
    stationName: "Jundiá",
    municipio: "Rio das Ostras",
    river: "rio Jundiá",
    lastReading: "20:30",
    statusMonitoramento: "VIGILÂNCIA",
    rainInstant: 0.0,
    rain1h: 0.0,
    rain4h: 0.0,
    rain24h: 0.0,
    rain96h: 0.0,
    rainMonth: 0.0,
    riverLevel: 1.84,
    cotaAlerta: 2.84,
    alertaMaximo: "65%"
  };

  const targetUrl = 'https://alertadecheias.com.br/stations/2241036/full';

  const options = {
    rejectUnauthorized: false,
    timeout: 8000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*'
    }
  };

  let responded = false;
  const sendResponse = (statusCode, payload) => {
    if (responded) return;
    responded = true;
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
    });
    res.end(JSON.stringify(payload));
  };

  const reqUpstream = https.get(targetUrl, options, (upstreamRes) => {
    let body = '';
    upstreamRes.on('data', chunk => body += chunk);
    upstreamRes.on('end', () => {
      try {
        if (upstreamRes.statusCode === 200 && body) {
          const json = JSON.parse(body);
          const jundiaData = {
            stationCode: json.NUMERO_ESTACAO || "2241036",
            stationName: json.NOME_ESTACAO || "Jundiá",
            municipio: json.MUNICIPIO || "Rio das Ostras",
            river: json.NOME_RIO || "rio Jundiá",
            lastReading: json.DATA ? json.DATA.slice(11, 16) : defaultJundiaData.lastReading,
            statusMonitoramento: json.STATUS || "VIGILÂNCIA",
            rainInstant: typeof json.CHUVA_ULTIMA === 'number' ? json.CHUVA_ULTIMA : 0.0,
            rain1h: typeof json.CHUVA_1H === 'number' ? json.CHUVA_1H : 0.0,
            rain4h: typeof json.CHUVA_4H === 'number' ? json.CHUVA_4H : 0.0,
            rain24h: typeof json.CHUVA_24H === 'number' ? json.CHUVA_24H : 0.0,
            rain96h: typeof json.CHUVA_96H === 'number' ? json.CHUVA_96H : 0.0,
            rainMonth: typeof json.CHUVA_30D === 'number' ? json.CHUVA_30D : 0.0,
            riverLevel: typeof json.NIVEL_UTIMO === 'number' ? json.NIVEL_UTIMO : defaultJundiaData.riverLevel,
            cotaAlerta: typeof json.COTA_ESTACAO === 'number' ? json.COTA_ESTACAO : 2.84,
            nivel15: json.NIVEL_15,
            nivel30: json.NIVEL_30,
            nivel45: json.NIVEL_45,
            alertaMaximo: json.ALERTA_MAXIMO || "65%"
          };
          sendResponse(200, { success: true, data: jundiaData });
          return;
        }
        sendResponse(200, { success: true, data: defaultJundiaData, fallback: true });
      } catch (err) {
        console.error('Error parsing INEA data, returning fallback:', err);
        sendResponse(200, { success: true, data: defaultJundiaData, fallback: true });
      }
    });
  });

  reqUpstream.on('timeout', () => {
    reqUpstream.destroy();
    console.warn('INEA request timed out, returning fallback data');
    sendResponse(200, { success: true, data: defaultJundiaData, fallback: true, timeout: true });
  });

  reqUpstream.on('error', (err) => {
    console.error('Error fetching INEA upstream, returning fallback:', err.message);
    sendResponse(200, { success: true, data: defaultJundiaData, fallback: true, error: err.message });
  });
}

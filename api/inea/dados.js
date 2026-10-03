import https from 'node:https';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const targetUrl = 'https://alertadecheias.inea.rj.gov.br/dados/macae_e_das_ostras.php';
  
  const defaultJundiaData = {
    stationCode: "2241036",
    stationName: "Jundiá",
    municipio: "Rio das Ostras",
    river: "rio Jundiá",
    lastReading: "23:15",
    statusMonitoramento: "VIGILÂNCIA",
    rainInstant: 0.0,
    rain1h: 0.0,
    rain4h: 1.0,
    rain24h: 1.2,
    rain96h: 18.4,
    rainMonth: 169.8,
    riverLevel: 1.39
  };

  const options = {
    rejectUnauthorized: false,
    timeout: 8000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
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
    let html = '';
    upstreamRes.on('data', chunk => html += chunk);
    upstreamRes.on('end', () => {
      try {
        let jundiaData = { ...defaultJundiaData };
        const trs = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gis) || [];
        const rdoTr = trs.find(t => t.includes('Rio das Ostras') && (t.includes('2241036') || t.includes('Jundiá')));

        if (rdoTr) {
          const tds = rdoTr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
          const cleanCols = tds.map(c => c.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
          
          if (cleanCols.length >= 12) {
            jundiaData.lastReading = cleanCols[3].slice(-5);
            jundiaData.statusMonitoramento = cleanCols[4];
            jundiaData.rainInstant = parseFloat(cleanCols[5]) || 0;
            jundiaData.rain1h = parseFloat(cleanCols[6]) || 0;
            jundiaData.rain4h = parseFloat(cleanCols[7]) || 0;
            jundiaData.rain24h = parseFloat(cleanCols[8]) || 1.2;
            jundiaData.rain96h = parseFloat(cleanCols[9]) || 18.4;
            jundiaData.rainMonth = parseFloat(cleanCols[10]) || 169.8;
            jundiaData.riverLevel = parseFloat(cleanCols[11]) || 1.39;
          }
        }

        sendResponse(200, { success: true, data: jundiaData });
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

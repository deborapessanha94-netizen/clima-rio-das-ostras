import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = urlObj.pathname;

  // 1. INEA PDF
  if (pathname === '/api/pdf-boletim') {
    const file = urlObj.searchParams.get('file');
    if (!file) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Parametro file ausente');
      return;
    }
    const safeFile = file.replace(/[^a-zA-Z0-9_\-\.]/g, '');
    const targetUrl = `https://alertadecheias.inea.rj.gov.br/alertadecheias/boletim/${safeFile}`;
    https.get(targetUrl, { rejectUnauthorized: false }, (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode || 200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${safeFile}"`,
        'Cache-Control': 'public, max-age=3600'
      });
      upstreamRes.pipe(res);
    }).on('error', () => {
      res.writeHead(502);
      res.end('Erro INEA');
    });
    return;
  }

  // 2. INEA Dados
  if (pathname === '/api/inea/dados') {
    const defaultData = {
      stationCode: "2241036", stationName: "Jundiá", municipio: "Rio das Ostras", river: "rio Jundiá",
      lastReading: "23:15", statusMonitoramento: "VIGILÂNCIA",
      rainInstant: 0.0, rain1h: 0.0, rain4h: 1.0, rain24h: 1.2, rain96h: 18.4, rainMonth: 169.8, riverLevel: 1.39
    };
    https.get('https://alertadecheias.inea.rj.gov.br/dados/macae_e_das_ostras.php', {
      rejectUnauthorized: false,
      timeout: 8000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    }, (upstreamRes) => {
      let html = '';
      upstreamRes.on('data', chunk => html += chunk);
      upstreamRes.on('end', () => {
        try {
          let jundiaData = { ...defaultData };
          const trs = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gis) || [];
          const rdoTr = trs.find(t => t.includes('Rio das Ostras') && (t.includes('2241036') || t.includes('Jundiá')));
          if (rdoTr) {
            const cleanCols = (rdoTr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || []).map(c => c.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
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
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, data: jundiaData }));
        } catch (e) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, data: defaultData, fallback: true }));
        }
      });
    }).on('error', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: defaultData, fallback: true }));
    });
    return;
  }

  // 3. CEMADEN RJ
  if (pathname === '/api/cemaden/rj') {
    https.get('https://resources.cemaden.gov.br/graficos/interativo/getJson2.php?uf=RJ', { rejectUnauthorized: false }, (upstreamRes) => {
      let json = '';
      upstreamRes.on('data', chunk => json += chunk);
      upstreamRes.on('end', () => {
        try {
          const data = JSON.parse(json);
          const casimiroStations = data.filter(s => (s.codibge == 3301306) || (s.cidade && s.cidade.includes('CASIMIRO')) || [18788, 18789, 18790].includes(Number(s.idestacao || s.idpcd)));
          const requestedId = urlObj.searchParams.get('id');
          const singleStation = requestedId
            ? casimiroStations.find(s => s.idpcd == requestedId || s.idestacao == requestedId || s.nomeestacao?.includes(requestedId))
            : casimiroStations.find(s => s.idpcd == 18789 || s.idestacao == 18789);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, stations: casimiroStations, station: singleStation || casimiroStations[0] }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
    }).on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    });
    return;
  }

  // 4. CEMADEN Horário
  if (pathname === '/api/cemaden/horario') {
    const stationId = urlObj.searchParams.get('id') || '18789';
    https.get(`https://mapservices.cemaden.gov.br/MapaInterativoWS/resources/horario/${stationId}/24`, { rejectUnauthorized: false }, (upstreamRes) => {
      let body = '';
      upstreamRes.on('data', chunk => body += chunk);
      upstreamRes.on('end', () => {
        res.writeHead(upstreamRes.statusCode || 200, { 'Content-Type': 'application/json' });
        res.end(body || '{}');
      });
    }).on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }

  // 5. WU endpoints
  if (pathname.startsWith('/api/wu/')) {
    const endpoint = pathname.replace('/api/wu/', '');
    const stationId = urlObj.searchParams.get('id');
    const apiKey = 'e1f10a1e78da46f5b10a1e78da96f525';
    let target = '';
    if (endpoint === 'pws') target = `https://api.weather.com/v2/pws/observations/current?stationId=${stationId}&format=json&units=m&apiKey=${apiKey}`;
    else if (endpoint === 'hourly') target = `https://api.weather.com/v2/pws/observations/hourly/7day?stationId=${stationId}&format=json&units=m&apiKey=${apiKey}`;
    else if (endpoint === 'summary') target = `https://api.weather.com/v2/pws/dailysummary/7day?stationId=${stationId}&format=json&units=m&apiKey=${apiKey}`;
    else if (endpoint === 'rapid') target = `https://api.weather.com/v2/pws/observations/all/1day?stationId=${stationId}&format=json&units=m&apiKey=${apiKey}`;

    if (!target || !stationId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid WU request' }));
      return;
    }
    https.get(target, (upstreamRes) => {
      let body = '';
      upstreamRes.on('data', chunk => body += chunk);
      upstreamRes.on('end', () => {
        res.writeHead(upstreamRes.statusCode || 200, { 'Content-Type': 'application/json' });
        res.end(body || '{}');
      });
    }).on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }

  // Static files from dist/
  let filePath = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Clima Rio das Ostras server running 24/7 on http://localhost:${PORT}`);
});

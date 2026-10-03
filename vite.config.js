import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import https from 'node:https';

function apiProxyPlugin() {
  return {
    name: 'api-proxy-plugin',
    configureServer(server) {
      // 1. INEA PDF Boletim proxy
      server.middlewares.use('/api/pdf-boletim', (req, res) => {
        try {
          const urlObj = new URL(req.url, 'http://localhost:3000');
          const file = urlObj.searchParams.get('file');
          if (!file) {
            res.statusCode = 400;
            res.end('Parametro file ausente');
            return;
          }

          const safeFile = file.replace(/[^a-zA-Z0-9_\-\.]/g, '');
          const targetUrl = `https://alertadecheias.inea.rj.gov.br/alertadecheias/boletim/${safeFile}`;

          https.get(targetUrl, { rejectUnauthorized: false }, (upstreamRes) => {
            if (upstreamRes.statusCode !== 200) {
              res.statusCode = upstreamRes.statusCode || 500;
              res.end(`Erro ao buscar PDF no INEA: ${upstreamRes.statusCode}`);
              return;
            }

            res.writeHead(200, {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `inline; filename="${safeFile}"`,
              'Cache-Control': 'public, max-age=3600',
              'Access-Control-Allow-Origin': '*'
            });

            upstreamRes.pipe(res);
          }).on('error', (err) => {
            console.error('Proxy request error:', err);
            res.statusCode = 502;
            res.end('Falha de comunicacao com servidor do INEA');
          });
        } catch (err) {
          console.error('Erro geral no proxy de PDF:', err);
          res.statusCode = 500;
          res.end('Erro interno no servidor');
        }
      });

      // 2. INEA Dados Telemétricos proxy (Rio Jundiá / Rio das Ostras)
      server.middlewares.use('/api/inea/dados', (req, res) => {
        const targetUrl = 'https://alertadecheias.inea.rj.gov.br/dados/macae_e_das_ostras.php';
        https.get(targetUrl, { rejectUnauthorized: false }, (upstreamRes) => {
          let html = '';
          upstreamRes.on('data', chunk => html += chunk);
          upstreamRes.on('end', () => {
            try {
              let jundiaData = {
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

              const trs = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gis) || [];
              const rdoTr = trs.find(t => t.includes('Rio das Ostras') && (t.includes('2241036') || t.includes('Jundiá')));

              if (rdoTr) {
                const tds = rdoTr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
                const cleanCols = tds.map(c => c.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
                
                // Typical cleanCols: ['Rio das Ostras', 'rio Jundiá', 'Jundiá', '01/10/2026 23:15', 'VIGILÂNCIA', '0', '0', '1', '1.2', '18.4', '169.8', '1.39', '1.39', '1.39', '1.4']
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

              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              });
              res.end(JSON.stringify({ success: true, data: jundiaData }));
            } catch (err) {
              console.error('Error parsing INEA data:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
        }).on('error', (err) => {
          console.error('Error fetching INEA upstream:', err);
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        });
      });

      // 3. CEMADEN PCD proxy (Casimiro de Abreu: 18788, 18789, 18790)
      server.middlewares.use('/api/cemaden/rj', (req, res) => {
        const targetUrl = 'https://resources.cemaden.gov.br/graficos/interativo/getJson2.php?uf=RJ';
        https.get(targetUrl, { rejectUnauthorized: false }, (upstreamRes) => {
          let json = '';
          upstreamRes.on('data', chunk => json += chunk);
          upstreamRes.on('end', () => {
            try {
              const data = JSON.parse(json);
              const casimiroStations = data.filter(s => 
                (s.codibge == 3301306) || 
                (s.cidade && s.cidade.includes('CASIMIRO')) ||
                [18788, 18789, 18790].includes(Number(s.idestacao || s.idpcd))
              );

              const urlObj = new URL(req.url, 'http://localhost');
              const requestedId = urlObj.searchParams.get('id');
              const singleStation = requestedId
                ? casimiroStations.find(s => s.idpcd == requestedId || s.idestacao == requestedId || s.nomeestacao?.includes(requestedId))
                : casimiroStations.find(s => s.idpcd == 18789 || s.idestacao == 18789);

              res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
              });
              res.end(JSON.stringify({ 
                success: true, 
                stations: casimiroStations,
                station: singleStation || casimiroStations[0]
              }));
            } catch (err) {
              console.error('Error parsing CEMADEN data:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
        }).on('error', (err) => {
          console.error('Error fetching CEMADEN upstream:', err);
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        });
      });

      // 4. Weather Underground PWS proxy (No _t param passed to api.weather.com)
      server.middlewares.use('/api/wu/pws', (req, res) => {
        try {
          const urlObj = new URL(req.url, 'http://localhost:3000');
          const stationId = urlObj.searchParams.get('id');
          if (!stationId) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing station id' }));
            return;
          }
          const apiKey = 'e1f10a1e78da46f5b10a1e78da96f525';
          const targetUrl = `https://api.weather.com/v2/pws/observations/current?stationId=${stationId}&format=json&units=m&apiKey=${apiKey}`;

          https.get(targetUrl, (upstreamRes) => {
            let body = '';
            upstreamRes.on('data', chunk => body += chunk);
            upstreamRes.on('end', () => {
              res.writeHead(upstreamRes.statusCode || 200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0'
              });
              res.end(body || '{}');
            });
          }).on('error', (err) => {
            console.error('Error fetching WU upstream:', err);
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          });
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });

      // 5. Weather Underground Hourly Observations proxy
      server.middlewares.use('/api/wu/hourly', (req, res) => {
        try {
          const urlObj = new URL(req.url, 'http://localhost:3000');
          const stationId = urlObj.searchParams.get('id');
          if (!stationId) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing station id' }));
            return;
          }
          const apiKey = 'e1f10a1e78da46f5b10a1e78da96f525';
          const targetUrl = `https://api.weather.com/v2/pws/observations/hourly/7day?stationId=${stationId}&format=json&units=m&apiKey=${apiKey}`;

          https.get(targetUrl, (upstreamRes) => {
            let body = '';
            upstreamRes.on('data', chunk => body += chunk);
            upstreamRes.on('end', () => {
              res.writeHead(upstreamRes.statusCode || 200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0'
              });
              res.end(body || '{}');
            });
          }).on('error', (err) => {
            console.error('Error fetching WU hourly upstream:', err);
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          });
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });

      // 6. Weather Underground Daily Summary proxy
      server.middlewares.use('/api/wu/summary', (req, res) => {
        try {
          const urlObj = new URL(req.url, 'http://localhost:3000');
          const stationId = urlObj.searchParams.get('id');
          if (!stationId) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing station id' }));
            return;
          }
          const apiKey = 'e1f10a1e78da46f5b10a1e78da96f525';
          const targetUrl = `https://api.weather.com/v2/pws/dailysummary/7day?stationId=${stationId}&format=json&units=m&apiKey=${apiKey}`;

          https.get(targetUrl, (upstreamRes) => {
            let body = '';
            upstreamRes.on('data', chunk => body += chunk);
            upstreamRes.on('end', () => {
              res.writeHead(upstreamRes.statusCode || 200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0'
              });
              res.end(body || '{}');
            });
          }).on('error', (err) => {
            console.error('Error fetching WU summary upstream:', err);
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          });
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });

      // 7. Weather Underground 1-Day Rapid Observations proxy (for exact rain start time)
      server.middlewares.use('/api/wu/rapid', (req, res) => {
        try {
          const urlObj = new URL(req.url, 'http://localhost:3000');
          const stationId = urlObj.searchParams.get('id');
          if (!stationId) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing station id' }));
            return;
          }
          const apiKey = 'e1f10a1e78da46f5b10a1e78da96f525';
          const targetUrl = `https://api.weather.com/v2/pws/observations/all/1day?stationId=${stationId}&format=json&units=m&apiKey=${apiKey}`;

          https.get(targetUrl, (upstreamRes) => {
            let body = '';
            upstreamRes.on('data', chunk => body += chunk);
            upstreamRes.on('end', () => {
              res.writeHead(upstreamRes.statusCode || 200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0'
              });
              res.end(body || '{}');
            });
          }).on('error', (err) => {
            console.error('Error fetching WU rapid upstream:', err);
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          });
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });

      // 8. CEMADEN Hourly History proxy (for exact rain start hour)
      server.middlewares.use('/api/cemaden/horario', (req, res) => {
        try {
          const urlObj = new URL(req.url, 'http://localhost:3000');
          const stationId = urlObj.searchParams.get('id') || '18789';
          const targetUrl = `https://mapservices.cemaden.gov.br/MapaInterativoWS/resources/horario/${stationId}/24`;

          https.get(targetUrl, { rejectUnauthorized: false }, (upstreamRes) => {
            let body = '';
            upstreamRes.on('data', chunk => body += chunk);
            upstreamRes.on('end', () => {
              res.writeHead(upstreamRes.statusCode || 200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0'
              });
              res.end(body || '{}');
            });
          }).on('error', (err) => {
            console.error('Error fetching CEMADEN horario upstream:', err);
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
          });
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), apiProxyPlugin()],
  server: {
    port: 3000,
    open: false,
    host: true,
    allowedHosts: true
  }
});

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
        https.get(targetUrl, { rejectUnauthorized: false, timeout: 8000 }, (upstreamRes) => {
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

                res.writeHead(200, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
                });
                res.end(JSON.stringify({ success: true, data: jundiaData }));
                return;
              }
              res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(JSON.stringify({ success: true, data: defaultJundiaData, fallback: true }));
            } catch (err) {
              console.error('Error parsing INEA data:', err);
              res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(JSON.stringify({ success: true, data: defaultJundiaData, fallback: true }));
            }
          });
        }).on('error', (err) => {
          console.error('Error fetching INEA upstream:', err);
          res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ success: true, data: defaultJundiaData, fallback: true, error: err.message }));
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

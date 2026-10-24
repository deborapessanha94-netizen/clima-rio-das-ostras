import https from 'node:https';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const urlObj = new URL(req.url, 'http://localhost');
    const stationId = req.query?.id || urlObj.searchParams.get('id') || '18789';
    const targetUrl = `https://mapservices.cemaden.gov.br/MapaInterativoWS/resources/horario/${stationId}/24`;

    const request = https.get(targetUrl, { rejectUnauthorized: false, timeout: 6000 }, (upstreamRes) => {
      let body = '';
      upstreamRes.on('data', chunk => body += chunk);
      upstreamRes.on('end', () => {
        let validJson = body;
        if (upstreamRes.statusCode !== 200 || !body || body.includes('<html') || body.includes('Service Unavailable')) {
          validJson = JSON.stringify({ horarios: [], acumulados: [] });
        }
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
        res.end(validJson);
      });
    });

    request.on('error', (err) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      });
      res.end(JSON.stringify({ horarios: [], acumulados: [] }));
    });

    request.on('timeout', () => {
      request.destroy();
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ horarios: [], acumulados: [] }));
    });
  } catch (err) {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ horarios: [], acumulados: [] }));
  }
}

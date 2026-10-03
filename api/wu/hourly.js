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
    const stationId = req.query?.id || urlObj.searchParams.get('id');
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
}

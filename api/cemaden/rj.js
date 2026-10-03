import https from 'node:https';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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
        const requestedId = req.query?.id || urlObj.searchParams.get('id');
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
}

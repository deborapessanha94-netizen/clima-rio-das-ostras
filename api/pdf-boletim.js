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
    const file = req.query?.file || urlObj.searchParams.get('file');
    if (!file) {
      res.statusCode = 400;
      res.end('Parametro file ausente');
      return;
    }

    const safeFile = String(file).replace(/[^a-zA-Z0-9_\-\.]/g, '');
    const targetUrl = `https://alertadecheias.inea.rj.gov.br/alertadecheias/boletim/${safeFile}`;

    const options = {
      rejectUnauthorized: false,
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };

    const reqUpstream = https.get(targetUrl, options, (upstreamRes) => {
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
    });

    reqUpstream.on('timeout', () => {
      reqUpstream.destroy();
      res.statusCode = 504;
      res.end('Timeout ao consultar servidor do INEA');
    });

    reqUpstream.on('error', (err) => {
      console.error('Proxy request error:', err);
      res.statusCode = 502;
      res.end('Falha de comunicacao com servidor do INEA');
    });
  } catch (err) {
    console.error('Erro geral no proxy de PDF:', err);
    res.statusCode = 500;
    res.end('Erro interno no servidor');
  }
}

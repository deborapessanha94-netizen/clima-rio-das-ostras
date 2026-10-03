const apiKey = 'e1f10a1e78da46f5b10a1e78da96f525';

const wuStations = ['IRIODA15', 'IRIODA16', 'IRIODA6', 'IRIODA5', 'ICASIM5'];

async function checkWu() {
  console.log('--- WUNDERGROUND CURRENT OBSERVATIONS ---');
  for (const st of wuStations) {
    try {
      const url = `https://api.weather.com/v2/pws/observations/current?stationId=${st}&format=json&units=m&apiKey=${apiKey}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(`Station ${st}: HTTP ${res.status}`);
      if (res.status === 200) {
        const data = await res.json();
        const obs = data.observations?.[0];
        console.log(`  Name: ${obs?.stationID}, Time: ${obs?.obsTimeLocal} (${obs?.obsTimeUtc})`);
        console.log(`  Temp: ${obs?.metric?.temp}°C, Humidity: ${obs?.humidity}%, PrecipTotal: ${obs?.metric?.precipTotal}mm, PrecipRate: ${obs?.metric?.precipRate}mm/h`);
        console.log(`  Wind: ${obs?.metric?.windSpeed}km/h (Gust: ${obs?.metric?.windGust}), Pressure: ${obs?.metric?.pressure}hPa`);
        console.log(`  qcStatus: ${obs?.qcStatus}, Lat: ${obs?.lat}, Lon: ${obs?.lon}, Elev: ${obs?.metric?.elev}`);
      } else if (res.status === 204) {
        console.log(`  No current observation. Checking recent history...`);
        // Let's check 7 day summary or 1 day hourly
        const histUrl = `https://api.weather.com/v2/pws/observations/hourly/7day?stationId=${st}&format=json&units=m&apiKey=${apiKey}`;
        const hRes = await fetch(histUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        console.log(`  Hist HTTP ${hRes.status}`);
        if (hRes.status === 200) {
          const hData = await hRes.json();
          const lastObs = hData.observations?.[hData.observations.length - 1];
          console.log(`  Last hourly obs: ${lastObs?.obsTimeLocal}, Temp: ${lastObs?.metric?.temp}°C`);
        } else {
          // Try scraping or checking HTML
          const pageRes = await fetch(`https://www.wunderground.com/dashboard/pws/${st}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          const text = await pageRes.text();
          const title = text.match(/<title>([^<]+)<\/title>/)?.[1];
          const isOffline = text.includes('Offline') || text.includes('OFFLINE');
          const isOnline = text.includes('Online') || text.includes('ONLINE');
          console.log(`  HTML Title: ${title}, Online: ${isOnline}, Offline: ${isOffline}`);
        }
      } else {
        const body = await res.text();
        console.log(`  Error body: ${body.substring(0, 200)}`);
      }
    } catch (e) {
      console.error(`  Failed ${st}:`, e.message);
    }
  }
}

async function checkCemaden() {
  console.log('\n--- CEMADEN PCD 18789 ---');
  try {
    const url = 'https://resources.cemaden.gov.br/graficos/interativo/grafico_CEMADEN.php?idpcd=18789&uf=RJ';
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    console.log(`CEMADEN Page HTTP ${res.status}`);
    const html = await res.text();
    // Look for station name, city, coordinates, or data
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    console.log(`CEMADEN Title: ${titleMatch ? titleMatch[1].trim() : 'N/A'}`);
    
    // Look for station info in HTML
    const municipioMatch = html.match(/Munic[íi]pio:[^<]*/gi);
    console.log(`Municipio matches:`, municipioMatch);
    const estacaoMatch = html.match(/Esta[çc][ãa]o:[^<]*/gi);
    console.log(`Estacao matches:`, estacaoMatch);

    // Look for data table or script sources
    const scripts = html.match(/<script[^>]*src=["']([^"']+)["']/gi);
    console.log('Scripts:', scripts?.slice(0, 10));

    // Look for ajax or data fetching urls
    const ajaxUrls = html.match(/url\s*:\s*["']([^"']+)["']/gi);
    console.log('Ajax URLs:', ajaxUrls);

    // Look for data embedded in script tags
    const inlineData = html.match(/series\s*:\s*\[.*?\]/s);
    if (inlineData) {
      console.log('Found series data in page! Length:', inlineData[0].length);
      console.log(inlineData[0].substring(0, 300));
    }
    
    // Also test getDados.php or similar
    const getUrls = [
      'https://resources.cemaden.gov.br/graficos/interativo/getDados.php?idpcd=18789',
      'https://resources.cemaden.gov.br/graficos/interativo/getGrafico.php?idpcd=18789&uf=RJ',
      'https://resources.cemaden.gov.br/graficos/interativo/getDadosCEMADEN.php?idpcd=18789'
    ];
    for (const u of getUrls) {
      try {
        const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        console.log(`Probe ${u} -> HTTP ${r.status}`);
        if (r.status === 200) {
          const t = await r.text();
          console.log(`  Sample (200 bytes): ${t.substring(0, 200)}`);
        }
      } catch (err) {}
    }
  } catch (e) {
    console.error('CEMADEN error:', e.message);
  }
}

async function checkInea() {
  console.log('\n--- INEA ALERTA DE CHEIAS ---');
  try {
    const url = 'https://alertadecheias.inea.rj.gov.br/dados/macae_e_das_ostras.php';
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    console.log(`INEA HTTP ${res.status}`);
    const html = await res.text();
    // Search for Rio das Ostras or station codes
    const rdoMatches = html.match(/Rio das Ostras[^<]*/gi);
    console.log('RDO in INEA:', rdoMatches);
    const tableRows = html.match(/<tr[^>]*>.*?<\/tr>/gis);
    console.log(`Found ${tableRows ? tableRows.length : 0} table rows`);
    if (tableRows) {
      for (const row of tableRows) {
        if (row.toLowerCase().includes('ostras') || row.toLowerCase().includes('jundi') || row.toLowerCase().includes('2241036') || row.toLowerCase().includes('ro-0')) {
          console.log('Relevant INEA row:', row.replace(/\s+/g, ' '));
        }
      }
    }
  } catch (e) {
    console.error('INEA error:', e.message);
  }
}

async function main() {
  await checkWu();
  await checkCemaden();
  await checkInea();
}

main();

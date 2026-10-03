process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function checkRealData() {
  console.log('=== CHECKING INEA RIO JUNDIA ===');
  try {
    const res = await fetch('https://alertadecheias.inea.rj.gov.br/dados/macae_e_das_ostras.php');
    const html = await res.text();
    const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    for (const r of rows) {
      if (r[1].includes('Jundiá') || r[1].includes('Rio das Ostras')) {
        const tds = [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(td => td[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
        console.log('INEA Rio Jundiá Row:', tds);
      }
    }
  } catch (e) {
    console.error('INEA error:', e.message);
  }

  console.log('\n=== CHECKING WUNDERGROUND STATIONS ===');
  const stations = ['IRIODA16', 'IRIODA6', 'IRIODA5', 'IRIODA15'];
  for (const st of stations) {
    try {
      const res = await fetch('https://www.wunderground.com/dashboard/pws/' + st, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const html = await res.text();
      
      const isOffline = html.includes('Offline') || html.includes('station-offline') || html.includes('This station is currently offline');
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
      
      // Look for latest observations JSON or text in the page
      const currentConditionsMatch = html.match(/lib-history-summary[\s\S]*?<\/div>/i);
      
      // Let's also check if WU has an API response embedded or if it says offline
      const offlineNotice = html.match(/station is currently offline|has not reported since/i);
      
      // Look for temperature and rain values
      const temps = [...html.matchAll(/class="wu-value wu-value-to"[^>]*>([-\d.]+)</g)].map(m => m[1]);
      const labels = [...html.matchAll(/class="wu-label"[^>]*>([^<]+)</g)].map(m => m[1].trim());

      console.log(`\n--- Station ${st} ---`);
      console.log('Title:', titleMatch);
      console.log('Contains offline text:', isOffline, offlineNotice ? offlineNotice[0] : 'no');
      console.log('Sample wu-values found:', temps.slice(0, 10));
      console.log('Sample wu-labels found:', labels.slice(0, 10));

      // Let's search for "offline" occurrences in the body
      const offlineMatches = [...html.matchAll(/.{0,50}offline.{0,50}/gi)].map(m => m[0].replace(/\s+/g, ' '));
      if (offlineMatches.length > 0) {
        console.log('Offline text snippets:', offlineMatches.slice(0, 3));
      }
    } catch (e) {
      console.error(st, 'err:', e.message);
    }
  }
}

checkRealData();

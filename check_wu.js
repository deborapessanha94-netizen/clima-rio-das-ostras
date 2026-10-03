const https = require('https');

function checkStation(id) {
  return new Promise((resolve) => {
    https.get(`https://www.wunderground.com/dashboard/pws/${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`=== HTML for ${id} (status: ${res.statusCode}) ===`);
        // Search for station metadata or json state
        const jsonMatch = data.match(/<script id=\"app-root-state\"[^>]*>(.*?)<\/script>/s);
        if (jsonMatch) {
          console.log(`Found app-root-state for ${id}!`);
          try {
            const parsed = JSON.parse(jsonMatch[1].replace(/&q;/g, '"'));
            console.log(JSON.stringify(parsed, null, 2).substring(0, 500));
          } catch (e) {
            console.log('Error parsing state:', e.message);
          }
        } else {
          // Look for title or status text
          const title = data.match(/<title>([^<]+)<\/title>/);
          console.log('Title:', title ? title[1] : 'No title');
          // Check for "Offline" or "Online"
          const hasOnline = data.includes('Online');
          const hasOffline = data.includes('Offline');
          console.log(`hasOnline: ${hasOnline}, hasOffline: ${hasOffline}`);
          
          // Let's search for temperature in page
          const tempMatches = data.match(/(\d{1,2}\.?\d?)\s*°/g);
          console.log('Temps found:', tempMatches ? tempMatches.slice(0, 10) : 'none');
        }
        resolve();
      });
    }).on('error', err => {
      console.error(id, err);
      resolve();
    });
  });
}

async function run() {
  await checkStation('IRIODA5');
  await checkStation('ICASIM5');
}
run();

/**
 * Utility to generate ultra high-resolution Infographic Poster Images for daily rainfall accumulations.
 * Supports Instagram Story / WhatsApp Status (9:16) and Instagram Feed Post (4:5).
 * Features LARGE, BOLD, high-contrast poster typography matching the reference image.
 */

export function formatStationDetailsForInfographic(station) {
  let name = station.neighborhood?.split('/')[0]?.trim() || station.name;
  let code = station.code || station.id;

  if (station.id === 'IRIODA17') {
    name = 'Defesa Civil';
    code = 'IRIODA17';
  } else if (station.id === 'IRIODA15') {
    name = 'Rocha Leão / REBIO União';
    code = 'IRIODA15';
  } else if (station.id === 'IRIODA16') {
    name = 'Cantagalo / Extensão do Bosque';
    code = 'IRIODA16';
  } else if (station.id === 'IRIODA6') {
    name = 'Escola Jacinto';
    code = 'IRIODA6';
  } else if (station.id === 'ICASIM5') {
    name = 'Barra de São João (Divisa)';
    code = 'ICASIM5';
  } else if (station.id === 'inea-jundia') {
    name = 'Jundiá';
    code = 'INEA 2241036';
  } else if (station.id === 'cemaden-18788') {
    name = 'Palmital (G2-01A)';
    code = 'CEMADEN 18788';
  } else if (station.id === 'cemaden-18790') {
    name = 'Palmital (G2-02A)';
    code = 'CEMADEN 18790';
  } else if (station.id === 'cemaden-18789') {
    name = 'Palmital (G2-03A)';
    code = 'CEMADEN 18789';
  } else if (station.id === 'IRIODA5') {
    name = 'Parque dos Pássaros';
    code = 'IRIODA5';
  }

  return { name, code, network: station.network };
}

export function generateInfographicCanvas({
  items,
  rainWindow = '24h',
  watermark = 'tempo@tempoemriodasostras',
  customTitle = 'ACUMULADOS DE',
  customSubtitle = 'Estações com maiores registros',
  lastUpdated = '',
  format = 'post' // 'story' (9:16) | 'post' (4:5)
}) {
  const canvas = document.createElement('canvas');
  const isStory = format === 'story';

  // Base dimensions:
  // Story: 1080 x 1920 (9:16)
  // Post: 1080 x 1350 (4:5 portrait)
  const width = 1080;
  const height = isStory ? 1920 : 1350;

  // Ultra-crisp Retina 2x scale (Story exports at 2160x3840, Post at 2160x2700)
  const dpr = 2;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // 1. Deep Midnight Navy Gradient Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#03122c');
  bgGrad.addColorStop(0.4, '#020d20');
  bgGrad.addColorStop(1, '#010814');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle Topographic Contour Wave Lines in Background
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(0, height * 0.12);
  ctx.bezierCurveTo(width * 0.3, height * 0.04, width * 0.7, height * 0.22, width, height * 0.1);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, height * 0.4);
  ctx.bezierCurveTo(width * 0.25, height * 0.52, width * 0.75, height * 0.3, width, height * 0.46);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, height * 0.76);
  ctx.bezierCurveTo(width * 0.4, height * 0.65, width * 0.6, height * 0.88, width, height * 0.74);
  ctx.stroke();

  // 3. Header Section
  const leftMargin = 60;
  const rightMargin = width - 60;
  const topPadding = isStory ? 130 : 70;

  // Vertical Cyan Bar
  const cyanBarWidth = isStory ? 11 : 9;
  const cyanBarHeight = isStory ? 130 : 110;
  ctx.fillStyle = '#00e5ff';
  ctx.beginPath();
  ctx.roundRect(leftMargin, topPadding, cyanBarWidth, cyanBarHeight, [5, 5, 5, 5]);
  ctx.fill();

  // Title Line 1: ACUMULADOS DE (Large, Bold White)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = isStory 
    ? '900 56px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    : '900 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(customTitle, leftMargin + cyanBarWidth + 24, isStory ? topPadding + 46 : topPadding + 42);

  // Title Line 2: CHUVA (Giant, Bold Cyan)
  ctx.fillStyle = '#38bdf8';
  ctx.font = isStory 
    ? '900 98px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    : '900 86px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('CHUVA', leftMargin + cyanBarWidth + 24, isStory ? topPadding + 124 : topPadding + 110);

  // Subtitle: Estações com maiores registros (Large, Clear)
  const subtitleY = isStory ? topPadding + 185 : topPadding + 160;
  ctx.fillStyle = '#cbd5e1';
  ctx.font = isStory 
    ? '500 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    : '500 25px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(customSubtitle, leftMargin, subtitleY);

  // Date, Time & Window Tag on Right of Header
  const dateStr = new Date().toLocaleDateString('pt-BR');
  const timeStr = lastUpdated || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const windowLabel = rainWindow === 'today' ? 'Hoje' : rainWindow.toUpperCase();
  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.font = isStory 
    ? '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    : '600 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`${dateStr} • ${timeStr} • Acumulado ${windowLabel}`, rightMargin, subtitleY);

  // Horizontal Thin Divider
  const dividerY = subtitleY + (isStory ? 28 : 22);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(leftMargin, dividerY);
  ctx.lineTo(rightMargin, dividerY);
  ctx.stroke();

  // 4. Station Rows (Active Stations Only)
  const rowsStartY = dividerY + (isStory ? 40 : 30);
  const footerY = isStory ? height - 120 : height - 75;
  const availableHeight = footerY - rowsStartY - 25;
  
  const rowCount = Math.max(items.length, 1);
  const rowSpacing = Math.min(
    Math.floor(availableHeight / rowCount), 
    isStory ? 180 : 145
  );

  const maxVal = Math.max(...items.map(i => i.value), 5);
  const barStartX = 390;
  const maxBarWidth = isStory ? 270 : 255;

  items.forEach((item, idx) => {
    const rowY = rowsStartY + (idx * rowSpacing);
    const centerY = rowY + (rowSpacing / 2);
    const { name, code, network } = formatStationDetailsForInfographic(item.station || item);

    // Left Column: Station Name (LARGE BOLD WHITE)
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#ffffff';

    // Auto-fit station name font to ensure it doesn't overlap the bar
    let nameFontSize = isStory ? 32 : 28;
    ctx.font = `bold ${nameFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    while (nameFontSize > 20 && ctx.measureText(name).width > (barStartX - leftMargin - 15)) {
      nameFontSize -= 1;
      ctx.font = `bold ${nameFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    }
    ctx.fillText(name, leftMargin, centerY - (isStory ? 18 : 14));

    // Left Column: Code Badge (Pill with cyan border & large bold cyan text)
    const badgeFontSize = isStory ? 17 : 15;
    ctx.font = `bold ${badgeFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    const codeTextWidth = ctx.measureText(code).width;
    const badgeW = codeTextWidth + 22;
    const badgeH = isStory ? 32 : 28;
    const badgeY = centerY - (badgeH / 2) + (isStory ? 10 : 8);

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = 'rgba(2, 132, 199, 0.18)';
    ctx.beginPath();
    ctx.roundRect(leftMargin, badgeY, badgeW, badgeH, [7, 7, 7, 7]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.textBaseline = 'middle';
    ctx.fillText(code, leftMargin + 11, badgeY + (badgeH / 2));

    // Left Column: Network Subtitle (Clear, readable)
    ctx.fillStyle = '#94a3b8';
    ctx.textBaseline = 'alphabetic';
    ctx.font = isStory 
      ? '500 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      : '500 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(network, leftMargin, centerY + (isStory ? 56 : 46));

    // Center Column: Rounded Blue Progress Bar & Value (LARGE & THICK)
    const barRatio = Math.min(Math.max(item.value / maxVal, 0), 1);
    const barW = Math.max(barRatio * maxBarWidth, item.value > 0 ? 44 : 0);
    const barH = isStory ? 48 : 40;
    const barY = centerY - (barH / 2);
    const pillRadius = barH / 2;

    if (barW > 0) {
      // Vibrant Electric Blue Pill Bar
      const barGrad = ctx.createLinearGradient(barStartX, 0, barStartX + barW, 0);
      barGrad.addColorStop(0, '#1d4ed8');
      barGrad.addColorStop(0.5, '#1e88e5');
      barGrad.addColorStop(1, '#00b0ff');
      ctx.fillStyle = barGrad;
      ctx.beginPath();
      ctx.roundRect(barStartX, barY, barW, barH, [pillRadius, pillRadius, pillRadius, pillRadius]);
      ctx.fill();
    }

    // Rain Value Text (LARGE BOLD WHITE - Placed right next to bar)
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = isStory 
      ? '900 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      : '900 29px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const labelX = barStartX + barW + (isStory ? 18 : 15);
    ctx.fillText(`${item.value.toFixed(1)} mm`, labelX, centerY);

    // Right Column: Rain Start Pill Badge (Large, Clear)
    const rightPillW = isStory ? 230 : 205;
    const rightPillH = isStory ? 46 : 38;
    const rightPillX = rightMargin - rightPillW;
    const rightPillY = centerY - (rightPillH / 2);

    let rainStartText = '';
    if (item.rainStartTime && item.rainStartTime !== '--') {
      rainStartText = `início às ${item.rainStartTime}`;
    } else if (item.value > 0) {
      rainStartText = 'com chuva';
    } else {
      rainStartText = 'sem chuva hoje';
    }

    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = 'rgba(3, 105, 161, 0.16)';
    ctx.beginPath();
    ctx.roundRect(rightPillX, rightPillY, rightPillW, rightPillH, [8, 8, 8, 8]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = isStory 
      ? '600 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      : '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(rainStartText, rightPillX + (rightPillW / 2), centerY);
  });

  // 5. Bottom Footer (Large, Legible)
  // Cyan Accent Dash
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = isStory ? 4 : 3.5;
  ctx.beginPath();
  ctx.moveTo(leftMargin, footerY);
  ctx.lineTo(leftMargin + 48, footerY);
  ctx.stroke();

  // Signature / Watermark text: tempo@tempoemriodasostras (Bold, White/Silver)
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#cbd5e1';
  ctx.font = isStory 
    ? 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    : 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(watermark, leftMargin + 62, footerY);

  // Right footer: Fontes das estações de cada bairro (Clear Slate)
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#94a3b8';
  ctx.font = isStory 
    ? '500 19px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    : '500 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Fontes: Estações de cada bairro • Rio das Ostras - RJ', rightMargin, footerY);

  return canvas;
}

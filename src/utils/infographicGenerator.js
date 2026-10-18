/**
 * Utility to generate ultra high-resolution Infographic Poster Images for daily rainfall accumulations.
 * Supports Instagram Story / WhatsApp Status (9:16) and Instagram Feed Post (4:5).
 * Matches the official tempo@tempoemriodasostras / Clima Rio das Ostras dark blue visual style.
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
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(0, height * 0.12);
  ctx.bezierCurveTo(width * 0.3, height * 0.04, width * 0.7, height * 0.22, width, height * 0.1);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, height * 0.4);
  ctx.bezierCurveTo(width * 0.25, height * 0.5, width * 0.75, height * 0.3, width, height * 0.45);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, height * 0.75);
  ctx.bezierCurveTo(width * 0.4, height * 0.65, width * 0.6, height * 0.85, width, height * 0.72);
  ctx.stroke();

  // 3. Header Section
  const leftMargin = 70;
  const rightMargin = width - 70;
  const topPadding = isStory ? 140 : 80;

  // Vertical Cyan Bar
  const barHeight = isStory ? 95 : 85;
  ctx.fillStyle = '#00e5ff';
  ctx.beginPath();
  ctx.roundRect(leftMargin, topPadding, 8, barHeight, [4, 4, 4, 4]);
  ctx.fill();

  // Title Line 1: ACUMULADOS DE
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = isStory 
    ? 'bold 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    : 'bold 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(customTitle, leftMargin + 26, isStory ? topPadding + 38 : topPadding + 36);

  // Title Line 2: CHUVA
  ctx.fillStyle = '#38bdf8';
  ctx.font = isStory 
    ? '900 64px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    : '900 56px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('CHUVA', leftMargin + 26, isStory ? topPadding + 98 : topPadding + 90);

  // Subtitle: Estações com maiores registros
  const subtitleY = isStory ? topPadding + 155 : topPadding + 138;
  ctx.fillStyle = '#cbd5e1';
  ctx.font = isStory 
    ? '400 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    : '400 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(customSubtitle, leftMargin, subtitleY);

  // Date, Time & Window Tag on Right of Header
  const dateStr = new Date().toLocaleDateString('pt-BR');
  const timeStr = lastUpdated || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const windowLabel = rainWindow === 'today' ? 'Hoje' : rainWindow.toUpperCase();
  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.font = isStory 
    ? '500 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    : '500 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`${dateStr} • ${timeStr} • Acumulado ${windowLabel}`, rightMargin, subtitleY);

  // Horizontal Thin Divider
  const dividerY = isStory ? topPadding + 180 : topPadding + 158;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(leftMargin, dividerY);
  ctx.lineTo(rightMargin, dividerY);
  ctx.stroke();

  // 4. Station Rows (Active Stations Only)
  // Calculate dynamic vertical row distribution
  const rowsStartY = dividerY + (isStory ? 45 : 35);
  const footerY = isStory ? height - 120 : height - 75;
  const availableHeight = footerY - rowsStartY - 30;
  
  const rowCount = Math.max(items.length, 1);
  const rowSpacing = Math.min(
    Math.floor(availableHeight / rowCount), 
    isStory ? 155 : 130
  );

  const maxVal = Math.max(...items.map(i => i.value), 5);
  const barStartX = 400;
  const maxBarWidth = 300;

  items.forEach((item, idx) => {
    const rowY = rowsStartY + (idx * rowSpacing);
    const { name, code, network } = formatStationDetailsForInfographic(item.station || item);

    // Left Column: Station Name
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = isStory 
      ? 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      : 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(name, leftMargin, isStory ? rowY + 28 : rowY + 24);

    // Left Column: Code Badge (Pill with cyan border)
    ctx.font = isStory 
      ? 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      : 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const codeTextWidth = ctx.measureText(code).width;
    const badgeW = Math.max(codeTextWidth + 18, 76);
    const badgeH = isStory ? 24 : 22;
    const badgeY = isStory ? rowY + 42 : rowY + 36;

    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.2;
    ctx.fillStyle = 'rgba(2, 132, 199, 0.15)';
    ctx.beginPath();
    ctx.roundRect(leftMargin, badgeY, badgeW, badgeH, [5, 5, 5, 5]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(code, leftMargin + 9, badgeY + (isStory ? 16 : 15));

    // Left Column: Network Subtitle
    ctx.fillStyle = '#64748b';
    ctx.font = isStory 
      ? '500 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      : '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(network, leftMargin, isStory ? rowY + 92 : rowY + 80);

    // Center Column: Rounded Blue Progress Bar & Value
    const barRatio = Math.min(Math.max(item.value / maxVal, 0), 1);
    const barW = Math.max(barRatio * maxBarWidth, item.value > 0 ? 36 : 0);
    const barH = isStory ? 34 : 30;
    const barY = isStory ? rowY + 36 : rowY + 30;
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

    // Rain Value Text (placed right after bar)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = isStory 
      ? 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      : 'bold 21px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const labelX = barStartX + barW + (isStory ? 16 : 14);
    ctx.fillText(`${item.value.toFixed(1)} mm`, labelX, isStory ? rowY + 60 : rowY + 52);

    // Right Column: Rain Start Pill Badge
    const rightPillW = isStory ? 200 : 185;
    const rightPillH = isStory ? 34 : 30;
    const rightPillX = rightMargin - rightPillW;
    const rightPillY = isStory ? rowY + 36 : rowY + 30;

    let rainStartText = '';
    if (item.rainStartTime && item.rainStartTime !== '--') {
      rainStartText = `início às ${item.rainStartTime}`;
    } else if (item.value > 0) {
      rainStartText = 'com chuva';
    } else {
      rainStartText = 'sem chuva hoje';
    }

    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 1.2;
    ctx.fillStyle = 'rgba(3, 105, 161, 0.14)';
    ctx.beginPath();
    ctx.roundRect(rightPillX, rightPillY, rightPillW, rightPillH, [7, 7, 7, 7]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = isStory 
      ? '500 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      : '500 13.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(rainStartText, rightPillX + (rightPillW / 2), isStory ? rightPillY + 22 : rightPillY + 20);
  });

  // 5. Bottom Footer
  // Cyan Accent Dash
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(leftMargin, footerY);
  ctx.lineTo(leftMargin + 40, footerY);
  ctx.stroke();

  // Signature / Watermark text: tempo@tempoemriodasostras
  ctx.textAlign = 'left';
  ctx.fillStyle = '#94a3b8';
  ctx.font = isStory 
    ? 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    : 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(watermark, leftMargin + 52, isStory ? footerY + 6 : footerY + 5);

  // Right footer: Fontes das estações de cada bairro
  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.font = isStory 
    ? '500 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    : '500 13.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Fontes: Estações de cada bairro • Rio das Ostras - RJ', rightMargin, isStory ? footerY + 6 : footerY + 5);

  return canvas;
}

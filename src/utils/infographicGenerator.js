/**
 * Utility to generate high-resolution Infographic Poster Images for daily rainfall accumulations.
 * Matches the official Engmetclima / Clima Rio das Ostras dark blue visual style.
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
  watermark = 'Engmetclima',
  customTitle = 'ACUMULADOS DE',
  customSubtitle = 'Estações com maiores registros',
  lastUpdated = ''
}) {
  const canvas = document.createElement('canvas');
  const width = 900;
  const topPadding = 185;
  const rowHeight = 96;
  const bottomPadding = 80;
  const height = topPadding + (items.length * rowHeight) + bottomPadding;

  const dpr = 2; // High-resolution Retina export (1800 x height*2)
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // 1. Deep Midnight Navy Gradient Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#03122c');
  bgGrad.addColorStop(0.5, '#020d20');
  bgGrad.addColorStop(1, '#010814');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle Topographic Contour Wave Lines in Background
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(0, height * 0.15);
  ctx.bezierCurveTo(width * 0.3, height * 0.05, width * 0.7, height * 0.25, width, height * 0.12);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, height * 0.45);
  ctx.bezierCurveTo(width * 0.25, height * 0.55, width * 0.75, height * 0.35, width, height * 0.5);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, height * 0.78);
  ctx.bezierCurveTo(width * 0.4, height * 0.7, width * 0.6, height * 0.88, width, height * 0.75);
  ctx.stroke();

  // 3. Top Header
  // Vertical Cyan Bar
  ctx.fillStyle = '#00e5ff';
  ctx.beginPath();
  ctx.roundRect(50, 42, 6, 76, [3, 3, 3, 3]);
  ctx.fill();

  // Title Line 1: ACUMULADOS DE
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(customTitle, 72, 70);

  // Title Line 2: CHUVA
  ctx.fillStyle = '#38bdf8';
  ctx.font = '900 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('CHUVA', 72, 116);

  // Subtitle: Estações com maiores registros
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '400 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(customSubtitle, 50, 160);

  // Date & Window Tag on Right of Header
  const dateStr = new Date().toLocaleDateString('pt-BR');
  const timeStr = lastUpdated || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const windowLabel = rainWindow === 'today' ? 'Hoje' : rainWindow.toUpperCase();
  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`${dateStr} • ${timeStr} • Acumulado ${windowLabel}`, width - 50, 160);

  // Horizontal Thin Divider
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, 178);
  ctx.lineTo(width - 50, 178);
  ctx.stroke();

  // 4. Station Rows
  const maxVal = Math.max(...items.map(i => i.value), 5);
  const barStartX = 320;
  const maxBarWidth = 250;

  items.forEach((item, idx) => {
    const y = topPadding + (idx * rowHeight);
    const { name, code, network } = formatStationDetailsForInfographic(item.station || item);

    // Left Column: Station Name
    ctx.textAlign = 'left';
    ctx.fillStyle = item.isInactive ? '#94a3b8' : '#ffffff';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(name, 50, y + 20);

    // Left Column: Code Badge (Pill with cyan border)
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const codeTextWidth = ctx.measureText(code).width;
    const badgeW = Math.max(codeTextWidth + 16, 68);
    const badgeH = 20;
    const badgeX = 50;
    const badgeY = y + 29;

    ctx.strokeStyle = item.isInactive ? '#475569' : '#0284c7';
    ctx.lineWidth = 1.2;
    ctx.fillStyle = item.isInactive ? 'rgba(71, 85, 105, 0.15)' : 'rgba(2, 132, 199, 0.12)';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, [5, 5, 5, 5]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = item.isInactive ? '#94a3b8' : '#38bdf8';
    ctx.fillText(code, badgeX + 8, badgeY + 14);

    // Left Column: Network Subtitle
    ctx.fillStyle = '#64748b';
    ctx.font = '500 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(network, 50, y + 66);

    // Center Column: Rounded Blue Bar & Value
    if (!item.isInactive) {
      const barRatio = Math.min(Math.max(item.value / maxVal, 0), 1);
      const barW = Math.max(barRatio * maxBarWidth, item.value > 0 ? 32 : 0);
      const barH = 26;
      const barY = y + 26;

      if (barW > 0) {
        // Electric Blue Pill Bar
        const barGrad = ctx.createLinearGradient(barStartX, 0, barStartX + barW, 0);
        barGrad.addColorStop(0, '#1d4ed8');
        barGrad.addColorStop(0.5, '#1e88e5');
        barGrad.addColorStop(1, '#00b0ff');
        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(barStartX, barY, barW, barH, [13, 13, 13, 13]);
        ctx.fill();
      }

      // Rain Value Text (placed right after bar)
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const labelX = barStartX + barW + 14;
      ctx.fillText(`${item.value.toFixed(1)} mm`, labelX, y + 46);
    } else {
      // Inactive Sensor text
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748b';
      ctx.font = 'italic 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Sensor Inativo', barStartX + 10, y + 45);
    }

    // Right Column: Rain Start Pill Badge
    const rightPillW = 168;
    const rightPillH = 28;
    const rightPillX = width - 50 - rightPillW;
    const rightPillY = y + 25;

    let rainStartText = '';
    if (item.isInactive) {
      rainStartText = 'sem sinal';
    } else if (item.rainStartTime && item.rainStartTime !== '--') {
      rainStartText = `início às ${item.rainStartTime}`;
    } else if (item.value > 0) {
      rainStartText = 'com chuva';
    } else {
      rainStartText = 'sem chuva hoje';
    }

    ctx.strokeStyle = item.isInactive ? '#334155' : '#0369a1';
    ctx.lineWidth = 1.2;
    ctx.fillStyle = item.isInactive ? 'rgba(51, 65, 85, 0.15)' : 'rgba(3, 105, 161, 0.12)';
    ctx.beginPath();
    ctx.roundRect(rightPillX, rightPillY, rightPillW, rightPillH, [7, 7, 7, 7]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = item.isInactive ? '#64748b' : '#38bdf8';
    ctx.font = '500 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(rainStartText, rightPillX + (rightPillW / 2), rightPillY + 18);
  });

  // 5. Bottom Footer
  const footerY = topPadding + (items.length * rowHeight) + 24;

  // Cyan Accent Dash
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(50, footerY + 12);
  ctx.lineTo(85, footerY + 12);
  ctx.stroke();

  // Watermark text
  ctx.textAlign = 'left';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(watermark, 96, footerY + 16);

  // Right side footer text
  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Fontes: WU • INEA • CEMADEN | Rio das Ostras - RJ', width - 50, footerY + 16);

  return canvas;
}

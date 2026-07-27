import { StrategyType } from '../types';

export interface SamplePreset {
  id: string;
  name: string;
  symbol: string;
  strategy: StrategyType;
  description: string;
  h4DataUrl: string;
  h1DataUrl: string;
  m15DataUrl: string;
}

// Function to generate realistic candlestick chart SVG data URLs for instant demos
function generateCandlestickChartSvg(title: string, timeframe: string, pair: string, trend: 'bull' | 'bear'): string {
  const isGold = pair.includes('XAU');
  const isBtc = pair.includes('BTC');
  const basePrice = isGold ? 2380 : isBtc ? 64200 : 1.0850;
  const spread = isGold ? 15 : isBtc ? 800 : 0.0060;

  const width = 800;
  const height = 450;
  const candlesCount = 28;
  const candleWidth = 18;
  const gap = 8;
  const startX = 60;

  let currentPrice = trend === 'bull' ? basePrice - spread * 0.8 : basePrice + spread * 0.8;
  const candles: Array<{ x: number; open: number; close: number; high: number; low: number; isGreen: boolean }> = [];

  for (let i = 0; i < candlesCount; i++) {
    const change = (Math.random() - (trend === 'bull' ? 0.38 : 0.62)) * (spread / 10);
    const open = currentPrice;
    let close = open + change;
    if (i === candlesCount - 1) { // Make last candle dramatic
      close = open + (trend === 'bull' ? spread * 0.3 : -spread * 0.3);
    }
    const high = Math.max(open, close) + Math.random() * (spread / 20);
    const low = Math.min(open, close) - Math.random() * (spread / 20);
    
    candles.push({
      x: startX + i * (candleWidth + gap),
      open,
      close,
      high,
      low,
      isGreen: close >= open,
    });
    currentPrice = close;
  }

  // Calculate min and max for scaling Y
  const allLows = candles.map(c => c.low);
  const allHighs = candles.map(c => c.high);
  const minP = Math.min(...allLows) - spread * 0.1;
  const maxP = Math.max(...allHighs) + spread * 0.1;

  const getY = (price: number) => {
    return height - 60 - ((price - minP) / (maxP - minP)) * (height - 110);
  };

  const candleNodes = candles.map((c) => {
    const yOpen = getY(c.open);
    const yClose = getY(c.close);
    const yHigh = getY(c.high);
    const yLow = getY(c.low);
    const top = Math.min(yOpen, yClose);
    const bodyHeight = Math.max(Math.abs(yOpen - yClose), 2);
    const color = c.isGreen ? '#10B981' : '#EF4444';
    const fill = c.isGreen ? '#10B981' : '#EF4444';

    return `
      <!-- Wick -->
      <line x1="${c.x + candleWidth / 2}" y1="${yHigh}" x2="${c.x + candleWidth / 2}" y2="${yLow}" stroke="${color}" stroke-width="1.5"/>
      <!-- Body -->
      <rect x="${c.x}" y="${top}" width="${candleWidth}" height="${bodyHeight}" rx="2" fill="${fill}" stroke="${color}"/>
    `;
  }).join('');

  // Draw Grid lines & Price Labels
  const gridLinesCount = 5;
  let gridSvg = '';
  for (let i = 0; i <= gridLinesCount; i++) {
    const p = minP + (i / gridLinesCount) * (maxP - minP);
    const y = getY(p);
    gridSvg += `
      <line x1="50" y1="${y}" x2="${width - 70}" y2="${y}" stroke="#334155" stroke-dasharray="4,4" stroke-width="1" opacity="0.4"/>
      <text x="${width - 65}" y="${y + 4}" fill="#94A3B8" font-size="11" font-family="monospace">${p.toFixed(isGold ? 2 : isBtc ? 0 : 4)}</text>
    `;
  }

  // Highlight key zones (SMC OB / FVG)
  const obYMin = getY(trend === 'bull' ? minP + (maxP - minP) * 0.35 : minP + (maxP - minP) * 0.65);
  const obYMax = getY(trend === 'bull' ? minP + (maxP - minP) * 0.25 : minP + (maxP - minP) * 0.75);
  const obTop = Math.min(obYMin, obYMax);
  const obHeight = Math.abs(obYMin - obYMax);

  const zoneSvg = `
    <!-- Order Block Zone -->
    <rect x="180" y="${obTop}" width="${width - 250}" height="${obHeight}" fill="${trend === 'bull' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}" stroke="${trend === 'bull' ? '#10B981' : '#EF4444'}" stroke-dasharray="3,3" stroke-width="1.5" rx="4"/>
    <text x="190" y="${obTop + 16}" fill="${trend === 'bull' ? '#34D399' : '#F87171'}" font-size="11" font-weight="bold" font-family="sans-serif">${timeframe} ${trend === 'bull' ? 'Bullish OB / Demand Zone' : 'Bearish OB / Supply Zone'}</text>
  `;

  const svgStr = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="background-color: #0F172A;">
      <rect width="100%" height="100%" fill="#0F172A"/>
      
      <!-- Top Title Header -->
      <rect x="0" y="0" width="100%" height="45" fill="#1E293B"/>
      <text x="20" y="28" fill="#F8FAFC" font-size="15" font-weight="bold" font-family="sans-serif">${pair} • ${timeframe} • ${title}</text>
      <text x="${width - 150}" y="28" fill="#38BDF8" font-size="13" font-weight="600" font-family="sans-serif">${trend === 'bull' ? '▲ BULLISH BIAS' : '▼ BEARISH BIAS'}</text>

      <!-- Watermark -->
      <text x="${width / 2 - 120}" y="${height / 2 + 10}" fill="#334155" font-size="32" font-weight="bold" opacity="0.3" font-family="sans-serif">${pair} ${timeframe}</text>

      <!-- Grids & Prices -->
      ${gridSvg}

      <!-- Order Block & FVGs -->
      ${zoneSvg}

      <!-- Candlesticks -->
      ${candleNodes}

      <!-- Indicator line (EMA 20) -->
      <path d="M 60 ${height - 120} Q 300 ${height - 180}, 500 ${height - (trend === 'bull' ? 240 : 120)} T ${width - 80} ${getY(candles[candles.length - 1].close)}" fill="none" stroke="#38BDF8" stroke-width="2" opacity="0.8"/>
    </svg>
  `;

  const encoded = encodeURIComponent(svgStr)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');

  return `data:image/svg+xml;utf8,${encoded}`;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: 'gold_smc_buy',
    name: 'XAUUSD (ทองคำ) - SMC Buy Setup',
    symbol: 'XAU/USD',
    strategy: 'SMC',
    description: 'ตัวอย่างทองคำ TF H4 เป็น Trend ขาขึ้น, H1 ดึงกลับมาซับ Liquidity Sweep และ M15 เกิด ChoCH สร้าง FVG Demand Zone',
    h4DataUrl: generateCandlestickChartSvg('Higher Timeframe Structure', 'H4', 'XAUUSD', 'bull'),
    h1DataUrl: generateCandlestickChartSvg('Liquidity Sweep & FVG', 'H1', 'XAUUSD', 'bull'),
    m15DataUrl: generateCandlestickChartSvg('Lower TF Refined Entry Zone', 'M15', 'XAUUSD', 'bull'),
  },
  {
    id: 'eurusd_pa_sell',
    name: 'EURUSD - Price Action Double Top Breakout',
    symbol: 'EUR/USD',
    strategy: 'PRICE_ACTION',
    description: 'ตัวอย่าง EURUSD เกิดรูปแบบ Double Top บน H4 Breakout Neckline ใน H1 และเกิด Pullback Retest ใน M15',
    h4DataUrl: generateCandlestickChartSvg('Macro Key Resistance Level', 'H4', 'EURUSD', 'bear'),
    h1DataUrl: generateCandlestickChartSvg('Double Top Neckline Break', 'H1', 'EURUSD', 'bear'),
    m15DataUrl: generateCandlestickChartSvg('Neckline Retest & Pinbar Entry', 'M15', 'EURUSD', 'bear'),
  },
  {
    id: 'btcusd_ict_silverbullet',
    name: 'BTCUSD (Bitcoin) - ICT Silver Bullet & OTE',
    symbol: 'BTC/USD',
    strategy: 'ICT',
    description: 'ตัวอย่าง Bitcoin ช่วง Killzone เกิด Judas Swing กวาด Liquidity ก่อนเกิด Displacement ทะลุ FVG ปรับฐานเข้าโซน OTE 70.5%',
    h4DataUrl: generateCandlestickChartSvg('Macro Liquidity Voids & Bias', 'H4', 'BTCUSD', 'bull'),
    h1DataUrl: generateCandlestickChartSvg('Judas Swing & FVG Displacement', 'H1', 'BTCUSD', 'bull'),
    m15DataUrl: generateCandlestickChartSvg('OTE 70.5% Fib Alignment', 'M15', 'BTCUSD', 'bull'),
  },
];

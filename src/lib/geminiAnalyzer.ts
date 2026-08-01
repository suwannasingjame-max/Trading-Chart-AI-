import { GoogleGenAI, Type } from '@google/genai';
import { ChartImageInput, StrategyType, AnalysisMode, AnalysisResult } from '../types';

/**
 * Compresses base64 data URLs to optimal resolution for AI Vision processing.
 * Reduces 10MB+ TradingView/MetaTrader screenshots down to ~200-400KB JPEGs.
 */
export async function compressImageDataUrl(
  dataUrl: string,
  maxDimension = 1600,
  quality = 0.85
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image')) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.onerror = () => {
      resolve(dataUrl);
    };
    img.src = dataUrl;
  });
}

/**
 * Compresses all uploaded chart images concurrently
 */
export async function compressAllChartImages(images: ChartImageInput): Promise<ChartImageInput> {
  const [h4Image, h1Image, m30Image, m15Image, m5Image, m1Image] = await Promise.all([
    images.h4Image ? compressImageDataUrl(images.h4Image) : Promise.resolve(null),
    images.h1Image ? compressImageDataUrl(images.h1Image) : Promise.resolve(null),
    images.m30Image ? compressImageDataUrl(images.m30Image) : Promise.resolve(null),
    images.m15Image ? compressImageDataUrl(images.m15Image) : Promise.resolve(null),
    images.m5Image ? compressImageDataUrl(images.m5Image) : Promise.resolve(null),
    images.m1Image ? compressImageDataUrl(images.m1Image) : Promise.resolve(null),
  ]);

  return { h4Image, h1Image, m30Image, m15Image, m5Image, m1Image };
}

/**
 * Performs client-side Gemini AI analysis using the user's API key.
 * Used as primary/fallback mechanism when hosted on static platforms like Vercel.
 */
export async function runClientGeminiAnalysis(params: {
  images: ChartImageInput;
  strategy: StrategyType;
  analysisMode: AnalysisMode;
  customNotes?: string;
  apiKey: string;
}): Promise<AnalysisResult> {
  const { images, strategy, analysisMode, customNotes = '', apiKey } = params;

  if (!apiKey || !apiKey.trim()) {
    throw new Error('กรุณาระบุ Google Gemini API Key ในช่องตั้งค่าหน้าเว็บ');
  }

  const isScalpMode = analysisMode === 'SCALPING';

  const strategyGuide: Record<string, string> = {
    SMC: `เน้นวิเคราะห์ Smart Money Concepts (SMC) ขั้นสูงแม่นยำสูง:
- ${isScalpMode ? 'TF H4, H1, M30' : 'TF H4'}: ระบุ HTF Market Structure (Major Higher High / Higher Low / Lower High / Lower Low), HTF Bias, Major Unmitigated Order Block (OB), Key Supply/Demand Zone, และ Liquidity Pools (Equal Highs/Lows, Buy-side / Sell-side Liquidity BSL/SSL).
- ${isScalpMode ? 'TF M15, M5' : 'TF H1'}: ระบุ Inducement (IDM), Fair Value Gap (FVG), Change of Character (ChoCH), Break of Structure (BoS), Liquidity Sweep (กวาดไส้เทียนล่อเม่า) และ Premium vs. Discount Pricing Array.
- ${isScalpMode ? 'TF M1' : 'TF M15'}: ค้นหาจุดเข้าเทรด Sniper Trigger M1/M15 (Micro OB + FVG Imbalance fill, M1 ChoCH, Rejection Wick Spike) พร้อมคำนวณ Entry, SL ที่วางปลอดภัยพ้นโครงสร้างสำคัญ + Buffer และ TP1 (Local Liquidity), TP2 (Major Level), TP3 (Extended Target).`,

    PRICE_ACTION: `เน้นวิเคราะห์ Classic Price Action & Micro Candlestick Geometry ขั้นสูง:
- ${isScalpMode ? 'TF H4, H1, M30' : 'TF H4'}: สแกนแนวรับแนวต้านระดับสถาบัน (Key Horizontal S/R & Flip Zones), Dominant Trendline & Channel.
- ${isScalpMode ? 'TF M15, M5' : 'TF H1'}: สแกนรูปแบบกราฟ (Chart Patterns: Head & Shoulders, Double/Triple Top-Bottom, Ascending/Descending Triangles, Flags, Pennants) และ Candlestick Rejection Patterns (Pinbar wicks >= 60%, Bullish/Bearish Engulfing, Inside Bar Breakout).
- ${isScalpMode ? 'TF M1' : 'TF M15'}: ค้นหาจุดเข้า Breakout & Retest หรือ Bounce จาก Key Level พร้อม Entry, SL (เลยไส้แท่งเทียนกลับตัว) และ TP1, TP2, TP3.`,

    ICT: `เน้นวิเคราะห์ Inner Circle Trader (ICT Methodology) แม่นยำระดับอัลกอริทึม:
- ${isScalpMode ? 'TF H4, H1, M30' : 'TF H4'}: HTF Daily/H4 Bias, Liquidity Voids, Equilibrium, BSL/SSL Sweeps.
- ${isScalpMode ? 'TF M15, M5' : 'TF H1'}: Power of 3 (AMD: Accumulation -> Manipulation/Judas Swing -> Distribution), Kill Zone Sessions (London / NY Killzones), Fair Value Gap (FVG), Displacement.
- ${isScalpMode ? 'TF M1' : 'TF M15'}: Optimal Trade Entry (OTE - 61.8% ถึง 79% Fibonacci Level), ICT Silver Bullet Setup, Displacement Confirmation, Entry M1, SL, TP.`,

    SUPPLY_DEMAND: `เน้นวิเคราะห์ Supply & Demand Imbalance & Institutional Order Flow:
- ${isScalpMode ? 'TF H4, H1, M30' : 'TF H4'}: Fresh Unmitigated Supply & Demand Zones (Rally-Base-Drop, Drop-Base-Rally, Rally-Base-Rally, Drop-Base-Drop).
- ${isScalpMode ? 'TF M15, M5' : 'TF H1'}: ประเมิน Zone Quality Score (ความสดใหม่ Freshness, ความรุนแรงในการออกจากโซน Departure Strength, แท่งกักตัว Time at Base), Swap/Flip Zones.
- ${isScalpMode ? 'TF M1' : 'TF M15'}: Zone Tap & Micro Rejection M1/M15, Entry ที่ขอบโซน (Zone Margin), SL วางเลยขอบโซน + ATR Buffer, TP ที่ opposing fresh zone.`,

    BREAKOUT_TREND: `เน้นวิเคราะห์ Trend Following & Momentum Breakout Strategy:
- ${isScalpMode ? 'TF H4, H1, M30' : 'TF H4'}: Directional Momentum, Exponential Moving Averages Alignment (EMA 20/50/200), Higher Highs / Lower Lows Sequence.
- ${isScalpMode ? 'TF M15, M5' : 'TF H1'}: Volatility Compression / Consolidation Box, Key Resistance/Support Trigger Line.
- ${isScalpMode ? 'TF M1' : 'TF M15'}: High Volume Expansion / Breakout Confirmation, Pullback Retest M1, Entry, SL, TP1, TP2, TP3.`,

    HARMONIC: `เน้นวิเคราะห์ Harmonic Patterns & Precise Fibonacci Ratios:
- ${isScalpMode ? 'TF H4, H1, M30' : 'TF H4'}: Macro Trend & Primary Fibonacci Retracement / Extension Array.
- ${isScalpMode ? 'TF M15, M5' : 'TF H1'}: Potential Reversal Zone (PRZ), Harmonic Structure (Gartley, Bat, Butterfly, Crab, Deep Crab, ABCD Pattern).
- ${isScalpMode ? 'TF M1' : 'TF M15'}: Reversal Candlestick Trigger at PRZ D-Point, Entry M1, SL (Beyond Point X), TP1 (38.2% Fib), TP2 (61.8% Fib), TP3 (100% Fib).`,
  };

  const parts: any[] = [];

  const appendImagePart = (dataUrl: string | null, label: string) => {
    if (!dataUrl) return;
    const matches = dataUrl.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
    if (matches) {
      parts.push({
        inlineData: { mimeType: matches[1], data: matches[2] },
      });
      parts.push({ text: label });
    }
  };

  appendImagePart(images.h4Image, 'ภาพกราฟ Timeframe H4 (Macro Structure & Trend ใหญ่ภาพกว้าง):');
  appendImagePart(images.h1Image, 'ภาพกราฟ Timeframe H1 (Primary Trend & Major Level):');
  appendImagePart(images.m30Image, 'ภาพกราฟ Timeframe M30 (Key Supply / Demand Zone คุมราคา):');
  appendImagePart(images.m15Image, 'ภาพกราฟ Timeframe M15 (Intermediate Pullback & Setup Zone):');
  appendImagePart(images.m5Image, 'ภาพกราฟ Timeframe M5 (Micro Structure Trigger Zone):');
  appendImagePart(images.m1Image, 'ภาพกราฟ Timeframe M1 (Sniper Trigger M1 - สแกนจุดเข้า/แท่งกลับตัว):');

  const modeHeaderPrompt = isScalpMode
    ? `คุณกำลังวิเคราะห์ในโหมดพิเศษ "เทรดสายซิ่ง M1 Scalping (6 Timeframes: H4, H1, M30, M15, M5, M1)"
เน้นหาจุดเข้าสไนเปอร์กรอบ M1 ที่ SL แคบมากๆ (โดนลากน้อยมาก) แต่ได้ Risk:Reward (R:R) สูง 1:3 ถึง 1:10+
- อิงกรอบใหญ่ H4/H1/M30 เพื่อหา Directional Bias & Key Supply/Demand Zone
- สแกนดูจุดเด้ง Rejection Spike / Micro ChoCH / M1 Order Block / M1 FVG`
    : `คุณกำลังวิเคราะห์ในโหมดมาตรฐาน Multi-timeframe (H4, H1, M15)`;

  const systemPrompt = `คุณคือ Pro Senior Financial Trading Analyst และ AI Trading Expert ผู้เชี่ยวชาญระดับสถาบัน (Institutional Multi-Timeframe Quant Analyst).
หน้าที่ของคุณคือ ${modeHeaderPrompt} ด้วยระบบการเทรด "${strategy}" ตามหลักเกณฑ์ที่แม่นยำสูงสไตล์มืออาชีพ:

${strategyGuide[strategy] || strategyGuide['SMC']}

${customNotes ? `คำแนะนำ/หมายเหตุเพิ่มเติมจากผู้ใช้งาน: "${customNotes}"` : ''}

กฎเหล็ก 8 ข้อเพื่อความแม่นยำสูงสุด (Institutional Precision Protocol):
1. อ่านตัวเลหากข้อความแกน Y (Price Scale) และแกน X (Time/Date Scale) จากรูปภาพกราฟให้ละเอียดสมจริงที่สุด
2. ตรวจสอบชื่อสินทรัพย์/คู่เงิน (เช่น XAU/USD, EUR/USD, BTC/USDT) จากส่วนหัวหรือ watermark บนกราฟ ถ้าไม่มีให้ระบุตามลักษณะทรงกราฟ
3. การตัดสินใจเลือกสัญญาณ (Signal Decision):
   - ตอบ "BUY" เมื่อโครงสร้างกราฟ Higher Timeframe ขาขึ้นชัดเจน หรือมีการกวาด Liquidity Sweep ที่แนวรับ/Demand Zone สำเร็จพร้อมแท่งเทียนกลับตัว
   - ตอบ "SELL" เมื่อโครงสร้างกราฟ Higher Timeframe ขาลงชัดเจน หรือมีการกวาด Liquidity Sweep ที่แนวต้าน/Supply Zone สำเร็จพร้อมแท่งเทียนกลับตัว
   - ตอบ "NO_TRADE" หากกราฟอยู่ในสภาวะ Sideways ไร้ทิศทาง หรือสัญญาณขัดแย้งกัน
4. คำนวณจุดเทรดอย่างแม่นยำสูงสุดตามโครงสร้างราคาจริง:
   - Entry Price: จุดเข้าเทรดที่ได้เปรียบที่สุด
   - Stop Loss (SL): วางจุดตัดขาดทุนพ้นโครงสร้างราคาพ้น Swing High/Low + Buffer
   - Take Profit 1, 2, 3 (TP1, TP2, TP3)
   - Risk:Reward Ratio (R:R): ต้องสอดคล้องกับระยะ SL และ TP จริง
5. คำนวณคะแนนความมั่นใจ (confidenceScore 0-100%)
6. สร้าง "ตารางสรุปเงื่อนไขและเหตุผลประกอบการตัดสินใจ" (Summary Conditions) แจกแจงทีละขั้นตอนอย่างเป็นระบบ
7. ระบุสถานการณ์ที่แผนเทรดนี้จะยกเลิก (invalidationScenario) และแนวทางการบริหารออเดอร์ (tradeManagement)
8. คำนวณพิกัด visual overlayCoords (0-100%) บนภาพกราฟให้ตรงกับระดับราคา Entry, SL, TP1, TP2, TP3

โปรดส่งออกผลลัพธ์เป็น JSON ภาษาไทยตามโครงสร้างนี้อย่างเคร่งครัด:`;

  parts.push({ text: systemPrompt });

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      symbol: { type: Type.STRING, description: 'ชื่อคู่เงิน/สินทรัพย์ เช่น XAU/USD (ทองคำ), EUR/USD, BTC/USDT' },
      signal: { type: Type.STRING, description: 'สัญญาณเทรด: BUY, SELL, หรือ NO_TRADE' },
      confidenceScore: { type: Type.NUMBER, description: 'คะแนนความมั่นใจ 0-100%' },
      overallReasoning: { type: Type.STRING, description: 'สรุปเหตุผลหลักสั้นๆ ชัดเจน ภาษาไทย' },
      marketStructure: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            timeframe: { type: Type.STRING, description: isScalpMode ? 'H4, M30, M15, M5, หรือ M1' : 'H4, H1, หรือ M15' },
            trend: { type: Type.STRING, description: 'Bullish, Bearish, หรือ Sideways / Ranging' },
            summary: { type: Type.STRING, description: 'คำอธิบายโครงสร้างราคาใน TF นี้' },
            keyLevel: { type: Type.STRING, description: 'ระดับราคาสำคัญใน TF นี้' },
          },
          required: ['timeframe', 'trend', 'summary', 'keyLevel'],
        },
      },
      tradeSetup: {
        type: Type.OBJECT,
        properties: {
          entryType: { type: Type.STRING, description: 'Limit Order, Market Execution, หรือ Stop Order' },
          entryPrice: { type: Type.STRING, description: 'ราคาเข้าเทรด เช่น 2385.50' },
          entryPriceValue: { type: Type.NUMBER, description: 'ตัวเลขราคาเข้าเทรด' },
          stopLoss: { type: Type.STRING, description: 'ราคาตัดขาดทุน Stop Loss เช่น 2380.00' },
          stopLossValue: { type: Type.NUMBER, description: 'ตัวเลขราคา SL' },
          takeProfit1: { type: Type.STRING, description: 'ราคาทำกำไร TP1 เช่น 2394.00' },
          takeProfit1Value: { type: Type.NUMBER, description: 'ตัวเลขราคา TP1' },
          takeProfit2: { type: Type.STRING, description: 'ราคาทำกำไร TP2 เช่น 2402.00' },
          takeProfit2Value: { type: Type.NUMBER, description: 'ตัวเลขราคา TP2' },
          takeProfit3: { type: Type.STRING, description: 'ราคาทำกำไร TP3 เช่น 2415.00' },
          takeProfit3Value: { type: Type.NUMBER, description: 'ตัวเลขราคา TP3' },
          riskRewardRatio: { type: Type.STRING, description: 'อัตรา Risk:Reward เช่น 1 : 3.2' },
          estimatedPipsSL: { type: Type.NUMBER, description: 'ระยะ SL ในหน่วย Pips / Points' },
          recommendedRiskPercent: { type: Type.STRING, description: 'เปอร์เซ็นต์ความเสี่ยงที่แนะนำต่อไม้ เช่น 1% - 2%' },
        },
        required: [
          'entryType', 'entryPrice', 'entryPriceValue',
          'stopLoss', 'stopLossValue',
          'takeProfit1', 'takeProfit1Value',
          'takeProfit2', 'takeProfit2Value',
          'takeProfit3', 'takeProfit3Value',
          'riskRewardRatio', 'estimatedPipsSL', 'recommendedRiskPercent'
        ],
      },
      confluences: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'รายการเหตุผลซัพพอร์ต (Confluence points) ภาษาไทย',
      },
      summaryConditions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            step: { type: Type.NUMBER, description: 'ลำดับขั้นตอน 1, 2, 3...' },
            topic: { type: Type.STRING, description: 'หัวข้อการตรวจสอบเงื่อนไข' },
            conditionMet: { type: Type.BOOLEAN, description: 'เงื่อนไขผ่านหรือไม่ true/false' },
            timeframe: { type: Type.STRING, description: 'H4, H1, M15 หรือ All' },
            details: { type: Type.STRING, description: 'คำอธิบายเงื่อนไขละเอียด ภาษาไทย' },
            ruleType: { type: Type.STRING, description: 'ประเภทกฎ เช่น Higher TF Bias, Liquidity, Trigger' },
          },
          required: ['step', 'topic', 'conditionMet', 'timeframe', 'details', 'ruleType'],
        },
      },
      invalidationScenario: { type: Type.STRING, description: 'สถานการณ์ที่ทำให้แผนเทรดนี้โมฆะ' },
      tradeManagement: { type: Type.STRING, description: 'กลยุทธ์การบริหารความเสี่ยงและจัดการออเดอร์' },
      overlayCoords: {
        type: Type.OBJECT,
        properties: {
          entryYPercent: { type: Type.NUMBER, description: 'ตำแหน่ง Y% ของ Entry บนกราฟ (0=บนสุด, 100=ล่างสุด)' },
          slYPercent: { type: Type.NUMBER, description: 'ตำแหน่ง Y% ของ SL บนกราฟ (0-100)' },
          tp1YPercent: { type: Type.NUMBER, description: 'ตำแหน่ง Y% ของ TP1 บนกราฟ (0-100)' },
          tp2YPercent: { type: Type.NUMBER, description: 'ตำแหน่ง Y% ของ TP2 บนกราฟ (0-100)' },
          tp3YPercent: { type: Type.NUMBER, description: 'ตำแหน่ง Y% ของ TP3 บนกราฟ (0-100)' },
          keyZones: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, description: 'ORDER_BLOCK, FVG, DEMAND, SUPPLY, หรือ LIQUIDITY_SWEEP' },
                label: { type: Type.STRING },
                topYPercent: { type: Type.NUMBER },
                bottomYPercent: { type: Type.NUMBER },
                color: { type: Type.STRING },
              },
              required: ['id', 'type', 'label', 'topYPercent', 'bottomYPercent', 'color'],
            },
          },
        },
        required: ['entryYPercent', 'slYPercent', 'tp1YPercent', 'tp2YPercent', 'tp3YPercent', 'keyZones'],
      },
    },
    required: [
      'symbol', 'signal', 'confidenceScore', 'overallReasoning',
      'marketStructure', 'tradeSetup', 'confluences',
      'summaryConditions', 'invalidationScenario', 'tradeManagement', 'overlayCoords'
    ],
  };

  const ai = new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  let result: any;
  try {
    result = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema as any,
        temperature: 0.2,
      },
    });
  } catch (primaryErr: any) {
    console.warn('Client primary model error, falling back to gemini-flash-latest:', primaryErr?.message);
    result = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema as any,
        temperature: 0.2,
      },
    });
  }

  const responseText = result.text;
  if (!responseText) {
    throw new Error('ไม่ได้รับผลตอบกลับจาก Google Gemini API');
  }

  const parsedData = JSON.parse(responseText);

  const finalResult: AnalysisResult = {
    id: 'analysis_' + Date.now(),
    timestamp: new Date().toISOString(),
    strategyUsed: strategy,
    analysisMode,
    images,
    symbol: parsedData.symbol || 'XAU/USD',
    signal: parsedData.signal || 'NO_TRADE',
    confidenceScore: parsedData.confidenceScore || 80,
    overallReasoning: parsedData.overallReasoning || 'วิเคราะห์สำเร็จตามโครงสร้างกราฟ',
    marketStructure: parsedData.marketStructure || [],
    tradeSetup: parsedData.tradeSetup,
    confluences: parsedData.confluences || [],
    summaryConditions: parsedData.summaryConditions || [],
    invalidationScenario: parsedData.invalidationScenario || '',
    tradeManagement: parsedData.tradeManagement || '',
    overlayCoords: parsedData.overlayCoords,
  };

  return finalResult;
}

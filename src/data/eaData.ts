export interface EAProduct {
  id: string;
  name: string;
  tagline: string;
  category: 'GOLD' | 'FOREX' | 'CRYPTO' | 'AI_AUTO';
  platform: ('MT4' | 'MT5')[];
  version: string;
  rating: number;
  reviewCount: number;
  monthlyRoi: string;
  winRate: number;
  maxDrawdown: string;
  backtestPeriod: string;
  recommendedDeposit: string;
  priceMonthly: number; // THB
  priceLifetime: number; // THB
  isHot?: boolean;
  isNew?: boolean;
  isRecommended?: boolean;
  description: string;
  features: string[];
  suitableFor: string;
  strategyType: string; // SMC, Supply & Demand, Grid, Trend, etc.
}

export const EA_PRODUCTS: EAProduct[] = [
  {
    id: 'ea_gold_hunter_pro',
    name: 'Gold Hunter SMC Pro EA',
    tagline: 'หุ่นยนต์เทรดทองคำ XAU/USD ระบบ Smart Money Concept อัตโนมัติ 100%',
    category: 'GOLD',
    platform: ['MT4', 'MT5'],
    version: 'v4.2.0',
    rating: 4.9,
    reviewCount: 128,
    monthlyRoi: '15% - 30%',
    winRate: 84.2,
    maxDrawdown: '6.5%',
    backtestPeriod: '2021 - 2026 (99.9% Tick Data)',
    recommendedDeposit: '$500 USD (0.01 Lot)',
    priceMonthly: 1290,
    priceLifetime: 4990,
    isHot: true,
    isRecommended: true,
    strategyType: 'Smart Money Concept (SMC)',
    description: 'สุดยอด EA เทรดทองคำที่ออกแบบมาเพื่อสแกนหา Liquidity Sweep, FVG Fill และ Order Block ในกราฟทองคำ XAU/USD โดยเฉพาะ พร้อมระบบคัดกรองข่าวสถาบัน (News Filter) และการตัดขาดทุนอย่างสมบูรณ์แบบ',
    features: [
      'ตรวจจับ Liquidity Sweep & FVG อัตโนมัติ 24/7',
      'ระบบควบคุมความเสี่ยงอัตโนมัติ (Auto Money Management)',
      'ตัวกรองข่าวเศรษฐกิจรุนแรง (High Impact News Filter)',
      'ระบบขยับ SL มาบังทุน (Breakeven - BE) + Trailing Stop',
      'แบ่งปิดทำกำไร 4 ระดับ (TP1 500p, TP2 1000p, TP3 1500p, TP4 2000p)',
      'ส่งแจ้งเตือนเข้า Telegram พร้อมรูปภาพสัญญาณเทรด'
    ],
    suitableFor: 'นักเทรดที่ชอบรัน EA ทองคำ เสี่ยงต่ำถึงปานกลาง ไม่มาติงเกล'
  },
  {
    id: 'ea_ai_autotrader',
    name: 'Trading Chart AI Connector EA',
    tagline: 'เชื่อมต่อสัญญาณเทรด AI จากเว็บแอปฯ เข้าพอร์ต MT4/MT5 และเปิดออเดอร์อัตโนมัติ',
    category: 'AI_AUTO',
    platform: ['MT4', 'MT5'],
    version: 'v2.1.0',
    rating: 5.0,
    reviewCount: 94,
    monthlyRoi: '18% - 35%',
    winRate: 86.8,
    maxDrawdown: '5.2%',
    backtestPeriod: 'Live Forward Test 2025 - 2026',
    recommendedDeposit: '$300 USD',
    priceMonthly: 1590,
    priceLifetime: 5990,
    isHot: true,
    isNew: true,
    strategyType: 'AI Signal Auto-Execution',
    description: 'EA พิเศษที่ออกแบบมาเพื่อทำงานร่วมกับระบบวิเคราะห์ AI ในแอปพลิเคชันนี้โดยเฉพาะ! เมื่อคุณกดยืนยันสัญญาณ หรือตั้งค่าสัญญาณ AI ให้ทำงานแบบอัตโนมัติ สัญญาณจะส่งเข้าพอร์ต MT4/MT5 ของคุณทันที',
    features: [
      'เชื่อมต่อแบบ Real-Time ด้วย WebHook Secure API',
      'เปิดออเดอร์ตามราคา Entry, SL, TP1-TP4 ของ AI ทันที',
      'คำนวณ Lot Size อัตโนมัติจาก % ความเสี่ยงที่ตั้งไว้',
      'รองรับทุกคู่เงิน (XAUUSD, EURUSD, GBPUSD, BTCUSD)',
      'ระบบแจ้งเตือนการเปิด-ปิดออเดอร์เข้า Line และ Telegram',
      'สามารถตั้งค่าอนุญาตให้ AI รันแทนได้ตลอด 24 ชั่วโมง'
    ],
    suitableFor: 'ผู้ใช้งานโปรแกรมวิเคราะห์ AI ที่ต้องการให้ระบบเปิดออเดอร์ในพอร์ตจริงอัตโนมัติ'
  },
  {
    id: 'ea_trend_master_forex',
    name: 'Trend Master Multi-Forex EA',
    tagline: 'ระบบเทรดตามเทรนด์กรอบใหญ่ สำหรับคู่เงินหลัก (EURUSD, GBPUSD, USDJPY)',
    category: 'FOREX',
    platform: ['MT4', 'MT5'],
    version: 'v3.5.1',
    rating: 4.8,
    reviewCount: 82,
    monthlyRoi: '10% - 20%',
    winRate: 79.5,
    maxDrawdown: '4.8%',
    backtestPeriod: '2019 - 2026 (Multi-Currency Validation)',
    recommendedDeposit: '$300 USD',
    priceMonthly: 990,
    priceLifetime: 3490,
    strategyType: 'Supply & Demand + Trend Following',
    description: 'EA สายปลอดภัยสำหรับเทรดคู่เงิน Forex หลัก เน้นเก็บกำไรระยะยาว กราฟนิ่ง Drawdown ต่ำมาก เหมาะสำหรับการพอร์ตเติบโตแบบยั่งยืน (Compound Growth)',
    features: [
      'รองรับการเทรดพร้อมกัน 6 คู่เงินหลักในบัญชีเดียว',
      'คำนวณ Correlation ป้องกันการถือออเดอร์ทับซ้อนซ้ำกัน',
      'ไม่ใช้ Martingale หรือ Grid เสี่ยงสูง มี Stop Loss ชัดเจนทุกไม้',
      'รองรับการผ่านกองทุนสอบ Prop Firm (FTMO, MFF, FundedNext)',
      'รายงานสถิติประสิทธิภาพผ่านแดชบอร์ดในกราฟ'
    ],
    suitableFor: 'นักเทรด Forex สายปลอดภัย ต้องการถือยาว พอร์ตพุ่งสม่ำเสมอ'
  },
  {
    id: 'ea_crypto_grid_sniper',
    name: 'Crypto Grid Sniper EA',
    tagline: 'สไนเปอร์เทรดคริปโต BTC/USD & ETH/USD จับจังหวะเหวี่ยงในตลาด 24/7',
    category: 'CRYPTO',
    platform: ['MT5'],
    version: 'v1.8.0',
    rating: 4.7,
    reviewCount: 61,
    monthlyRoi: '20% - 45%',
    winRate: 81.0,
    maxDrawdown: '9.8%',
    backtestPeriod: '2022 - 2026 Crypto Volatility Test',
    recommendedDeposit: '$1,000 USD',
    priceMonthly: 1490,
    priceLifetime: 5490,
    isNew: true,
    strategyType: 'Dynamic Volatility Grid',
    description: 'หุ่นยนต์เทรดบิตคอยน์และคริปโตที่รับมือกับความผันผวนสูงได้เป็นอย่างดี ปรับระยะกริดและจุดทำกำไรตามค่า ATR (Average True Range) แบบเรียลไทม์',
    features: [
      'ปรับยืดหยุ่นตามความผันผวนของ Bitcoin และ Ethereum',
      'ระบบสแกนวอลุ่มฝั่ง Buy/Sell ป้องกันการติดลากช่วงข่าว',
      'เปิด-ปิดออเดอร์ตลอด 24 ชม. ไม่มีวันหยุดเสาร์-อาทิตย์',
      'ระบบตัดขาดทุนรวมทั้งพอร์ต (Equity Hard Stop Protection)',
      'ตั้งค่ากำไรเป้าหมายรายวัน (Daily Profit Target)'
    ],
    suitableFor: 'นักเทรดคริปโตที่ต้องการสร้างกระแสเงินสดรายวันตลอด 24 ชั่วโมง'
  },
  {
    id: 'ea_harmonic_scalper',
    name: 'Harmonic Pattern Scalper EA',
    tagline: 'สแกนรูปแบบราคา Harmonic (Gartley, Butterfly, Bat) สเกลปิ้งสั้นเก็บกำไรไว',
    category: 'GOLD',
    platform: ['MT4', 'MT5'],
    version: 'v2.8.0',
    rating: 4.8,
    reviewCount: 73,
    monthlyRoi: '12% - 25%',
    winRate: 82.5,
    maxDrawdown: '7.1%',
    backtestPeriod: '2020 - 2026 Tick Data',
    recommendedDeposit: '$500 USD',
    priceMonthly: 1190,
    priceLifetime: 4290,
    strategyType: 'Harmonic Pattern Detection',
    description: 'ตรวจหาแพตเทิร์น Harmonic และ PRZ (Potential Reversal Zone) อัตโนมัติด้วยอัตราส่วน Fibonacci ที่แม่นยำ พร้อมเข้าออเดอร์ทันทีเมื่อเกิด Reversal Confirmation',
    features: [
      'สแกนรูปแบบ Gartley, Bat, Butterfly, Crab, Cypher อัตโนมัติ',
      'วัดโซน PRZ ด้วยคำนวณ Fibonacci Retracement ละเอียดระดับมิลลิวินาที',
      'มีค่า R:R ไม่ต่ำกว่า 1:2.5 ทุกสัญญาณ',
      'ระบบควบคุมสเปรด (Spread Filter) ไม่เปิดออเดอร์ตอนสเปรดถ่าง',
      'แสดงกราฟิกแพตเทิร์นสีสวยงามบนหน้าจอกราฟ'
    ],
    suitableFor: 'นักเทรดสายเทคนิคอลที่ชอบแพตเทิร์น Harmonic สะสมกำไรเร็ว'
  }
];

import { SubscriptionPricingTier } from '../types';

export const PRICING_TIERS: SubscriptionPricingTier[] = [
  {
    id: 'FREE',
    name: 'สมาชิกระดับทั่วไป (Free)',
    priceThb: 0,
    priceUsd: 0,
    period: 'ตลอดชีพ',
    description: 'ใช้งานฟรีครบทุกฟีเจอร์ระดับ Pro VIP ไม่จำกัดจำนวนครั้ง',
    features: [
      'วิเคราะห์กราฟด้วย AI ไม่จำกัดจำนวนครั้ง (ใช้งานฟรี 🎉)',
      'ปลดล็อกครบทั้ง 6 ระบบเทรด (SMC, ICT, Price Action, Supply/Demand, Breakout, Harmonic)',
      'ประมวลผลเร็วด้วย Gemini 3.6 Flash Server',
      'วาดเส้น Entry, SL, TP1, TP2, TP3 และกล่อง OB/FVG ซ้อนบนกราฟ HD',
      'เครื่องมือ Live Risk:Reward Fine-Tuner & Position Size Calculator',
      'ส่งออกและดาวน์โหลดภาพกราฟพร้อมเส้นวิเคราะห์ความละเอียดสูง',
      'รับอัปเดตโมเดล AI เทรดดิ้งเวอร์ชันใหม่ล่าสุดก่อนใคร',
    ],
  },
  {
    id: 'PRO_MONTHLY',
    name: 'สมาชิก Pro VIP (รายเดือน)',
    priceThb: 590,
    priceUsd: 19,
    period: '/ เดือน',
    badge: 'ยังไม่เปิดรับ 🔒',
    isPopular: false,
    description: 'สำหรับนักเทรดจริงจังที่ต้องการวิเคราะห์ไม่จำกัด พร้อมทุกระบบการเทรด (เร็วๆ นี้)',
    features: [
      'วิเคราะห์กราฟด้วย AI ไม่จำกัดจำนวนครั้ง (Unlimited)',
      'ปลดล็อกครบทั้ง 6 ระบบเทรด (SMC, ICT, Price Action, Supply/Demand, Breakout, Harmonic)',
      'ประมวลผลเร็วพิเศษด้วย Gemini 3.6 Flash Priority Server',
      'วาดเส้น Entry, SL, TP1, TP2, TP3 และกล่อง OB/FVG ซ้อนบนกราฟ HD',
      'เครื่องมือ Live Risk:Reward Fine-Tuner & Position Size Calculator',
      'ส่งออกและดาวน์โหลดภาพกราฟพร้อมเส้นวิเคราะห์ความละเอียดสูง',
      'รับอัปเดตโมเดล AI เทรดดิ้งเวอร์ชันใหม่ล่าสุดก่อนใคร',
    ],
  },
];

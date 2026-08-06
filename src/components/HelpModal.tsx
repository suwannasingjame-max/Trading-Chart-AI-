import React from 'react';
import { HelpCircle, X, CheckCircle2, ShieldAlert, Sparkles, Target, BookOpen } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#090514]/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-[#180e35] via-[#120a2a] to-[#1c0f3c] border-2 border-yellow-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh] text-slate-100 space-y-4 overflow-y-auto relative">
        {/* Ambient top glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-3 border-b border-yellow-500/30 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-yellow-400 text-purple-950 font-black shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base text-slate-100">
              คู่มือการใช้งาน Trading Chart AI Analyzer
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-yellow-300 border border-purple-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs leading-relaxed relative z-10">
          {/* Step 1 */}
          <div className="bg-purple-950/60 p-4 rounded-xl border border-yellow-500/30 space-y-1.5">
            <h4 className="font-black text-sm text-yellow-300 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-yellow-400 text-purple-950 text-xs font-black shadow-sm">
                1
              </span>
              การเตรียมภาพกราฟ Multi-Timeframe (H4, H1, M15, M5, M1)
            </h4>
            <p className="text-yellow-100/90">
              เพื่อผลการวิเคราะห์ที่แม่นยำที่สุด แนะนำให้แคปหน้าจอกราฟจาก TradingView หรือ MetaTrader ในสินทรัพย์เดียวกัน:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-200 pl-2">
              <li><strong className="text-yellow-300">TF H4:</strong> แสดงภาพรวมโครงสร้างราคาใหญ่ (Higher Timeframe Trend) และแนวรับแนวต้านหลัก</li>
              <li><strong className="text-yellow-300">TF H1 / M30:</strong> แสดงการเกิด Liquidity Sweep, Order Block (OB), FVG หรือรูปแบบราคา</li>
              <li><strong className="text-yellow-300">TF M15 / M5 / M1:</strong> แสดงแท่งเทียนจุดเข้าสัญญาณสไนเปอร์ (Entry Trigger) และโซนตัดขาดทุน (SL) คมกริบ</li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="bg-purple-950/60 p-4 rounded-xl border border-yellow-500/30 space-y-1.5">
            <h4 className="font-black text-sm text-yellow-300 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-yellow-400 text-purple-950 text-xs font-black shadow-sm">
                2
              </span>
              การเลือกระบบการเทรด (Trading System) & โหมดวิเคราะห์
            </h4>
            <p className="text-yellow-100/90">
              เลือกระบบที่ต้องการให้ AI ตรวจเช็ค (SMC, Price Action, ICT, Supply & Demand) และเลือกโหมด:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-200 pl-2">
              <li><strong className="text-yellow-300">🎯 โหมดมาตรฐาน (H4, H1, M15):</strong> วิเคราะห์โครงสร้างหลัก มั่นคง ปลอดภัย</li>
              <li><strong className="text-yellow-300">⚡ โหมดเทรดสายซิ่ง (6-Timeframe H4-M1):</strong> วิเคราะห์เจาะลึก M1 หาจุดเข้าสไนเปอร์ SL แคบ โดนลากน้อย</li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="bg-purple-950/60 p-4 rounded-xl border border-yellow-500/30 space-y-1.5">
            <h4 className="font-black text-sm text-yellow-300 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-yellow-400 text-purple-950 text-xs font-black shadow-sm">
                3
              </span>
              การนำผลวิเคราะห์ไปใช้งาน
            </h4>
            <p className="text-yellow-100/90">
              หลัง AI วิเคราะห์เสร็จสิ้น คุณจะได้รับ:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-200 pl-2">
              <li><strong className="text-yellow-300">เส้นระดับราคาซื้อขายบนกราฟ:</strong> Entry, SL, TP1, TP2, TP3 ที่วาดซ้อนบนภาพ M1/M15 ทันที</li>
              <li><strong className="text-yellow-300">ตารางสรุปเงื่อนไข:</strong> ตรวจสอบว่าเงื่อนไขแต่ละข้อผ่านตามกฎระบบหรือไม่</li>
              <li><strong className="text-yellow-300">ปุ่มคัดลอกจุดเข้า MT4/MT5:</strong> กดคัดลอกค่าราคาไปตั้ง pending order ได้ทันที</li>
            </ul>
          </div>
        </div>

        <div className="pt-3 border-t border-yellow-500/30 text-center relative z-10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black text-xs shadow-lg transition border border-yellow-300"
          >
            เข้าใจแล้ว เริ่มต้นใช้งาน
          </button>
        </div>
      </div>
    </div>
  );
};


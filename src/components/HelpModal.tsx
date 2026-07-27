import React from 'react';
import { HelpCircle, X, CheckCircle2, ShieldAlert, Sparkles, Target } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh] text-slate-200 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-slate-100">
              คู่มือการใช้งาน Trading Chart AI Analyzer
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs leading-relaxed">
          {/* Step 1 */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-1.5">
            <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 text-[11px]">
                1
              </span>
              การเตรียมภาพกราฟ 3 Timeframe (H4, H1, M15)
            </h4>
            <p className="text-slate-300">
              เพื่อผลการวิเคราะห์ที่แม่นยำที่สุด แนะนำให้แคปหน้าจอกราฟจาก TradingView หรือ MetaTrader ในสินทรัพย์เดียวกัน โดยแบ่งเป็น 3 กรอบเวลา:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
              <li><strong className="text-slate-200">TF H4:</strong> แสดงภาพรวมโครงสร้างราคาใหญ่ (Higher Timeframe Trend) และแนวรับแนวต้านหลัก</li>
              <li><strong className="text-slate-200">TF H1:</strong> แสดงการเกิด Liquidity Sweep, Order Block (OB), FVG หรือรูปแบบราคา</li>
              <li><strong className="text-slate-200">TF M15:</strong> แสดงแท่งเทียนจุดเข้าสัญญาณ (Entry Trigger) และโซนตัดขาดทุน (SL)</li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-1.5">
            <h4 className="font-bold text-sm text-blue-400 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 text-[11px]">
                2
              </span>
              การเลือกระบบการเทรด (Trading System)
            </h4>
            <p className="text-slate-300">
              คุณสามารถเลือกระบบที่ต้องการให้ AI ใช้ในการตรวจเช็คได้ เช่น:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
              <li><strong className="text-slate-200">SMC:</strong> ค้นหา Order Block, Fair Value Gap (FVG), ChoCH และ Liquidity Sweep</li>
              <li><strong className="text-slate-200">Price Action:</strong> ค้นหา Chart Patterns, Trendline Breakout และ Pinbar</li>
              <li><strong className="text-slate-200">ICT:</strong> ค้นหา Power of 3 (AMD), Judas Swing และโซน OTE 70.5%</li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-1.5">
            <h4 className="font-bold text-sm text-purple-400 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 text-[11px]">
                3
              </span>
              การนำผลวิเคราะห์ไปใช้งาน
            </h4>
            <p className="text-slate-300">
              หลัง AI วิเคราะห์เสร็จสิ้น คุณจะได้รับ:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
              <li><strong className="text-slate-200">เส้นระดับราคาซื้อขายบนกราฟ:</strong> Entry, SL, TP1, TP2, TP3 ที่วาดซ้อนบนภาพ M15 ทันที</li>
              <li><strong className="text-slate-200">ตารางสรุปเงื่อนไข:</strong> ตรวจสอบว่าเงื่อนไขแต่ละข้อผ่านตามกฎระบบหรือไม่</li>
              <li><strong className="text-slate-200">ปุ่มคัดลอกจุดเข้า MT4/MT5:</strong> กดคัดลอกค่าราคาไปตั้ง pending order ได้ทันที</li>
            </ul>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition"
          >
            เข้าใจแล้ว เริ่มต้นใช้งาน
          </button>
        </div>
      </div>
    </div>
  );
};

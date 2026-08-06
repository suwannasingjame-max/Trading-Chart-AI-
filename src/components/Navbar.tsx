import React from 'react';
import { UserProfile } from '../types';
import { TrendingUp, History, Sparkles, HelpCircle, User, BarChart2, Compass, Key, Crown } from 'lucide-react';

interface NavbarProps {
  onOpenHistory: () => void;
  onOpenHelp: () => void;
  onOpenAdmin: () => void;
  onOpenEaStore: () => void;
  onOpenPositionAudit: () => void;
  onOpenDailyAnalysis: () => void;
  onOpenPasscode: () => void;
  onOpenTradingView: () => void;
  historyCount: number;
  user: UserProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenHistory,
  onOpenHelp,
  onOpenAdmin,
  onOpenEaStore,
  onOpenPositionAudit,
  onOpenDailyAnalysis,
  onOpenPasscode,
  onOpenTradingView,
  historyCount,
  user,
}) => {
  const isVip = !!user.activatedPasscode || user.plan !== 'FREE';

  return (
    <header className="sticky top-0 z-40 bg-[#0f0a1c]/95 backdrop-blur-md border-b-2 border-yellow-500/40 text-slate-100 px-4 lg:px-8 py-3.5 shadow-2xl shadow-purple-950/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div 
            onClick={onOpenAdmin}
            className="h-10 w-10 rounded-xl bg-yellow-400 p-0.5 shadow-md shadow-yellow-500/30 flex items-center justify-center cursor-pointer select-none"
            title="Trading Chart AI"
          >
            <div className="h-full w-full bg-[#0b0718] rounded-[10px] flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-yellow-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-100 flex items-center gap-2">
                <span>Trading Chart AI Analyzer</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-yellow-400 text-purple-950 border border-yellow-300 shadow-sm">
                <Sparkles className="w-3 h-3 text-purple-950" /> 3-TF AI
              </span>
            </div>
            <p className="text-xs text-yellow-200/80 hidden sm:block font-medium">
              วิเคราะห์กราฟ Multi-Timeframe (H4, H1, M15, M5, M1) คำนวณจุดเข้า Entry / SL / TP
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* TradingView Live Chart Button */}
          <button
            onClick={onOpenTradingView}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black text-xs transition border border-yellow-300 shadow-md"
            title="เปิดดูกราฟสด TradingView (FPMARKETS:XAUUSD)"
          >
            <TrendingUp className="w-4 h-4 text-purple-950" />
            <span className="hidden sm:inline">📈 กราฟสด TradingView</span>
            <span className="sm:hidden">กราฟสด</span>
          </button>

          {/* Passcode / VIP Key Button */}
          <button
            onClick={onOpenPasscode}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black text-xs transition border shadow-md ${
              isVip
                ? 'bg-yellow-400 text-purple-950 border-yellow-300 shadow-yellow-500/30'
                : 'bg-purple-950/90 hover:bg-purple-900 text-yellow-300 border-yellow-500/50'
            }`}
            title="กรอก Passcode หรือ VIP License Key"
          >
            {isVip ? (
              <Crown className="w-4 h-4 text-purple-950 animate-pulse" />
            ) : (
              <Key className="w-4 h-4 text-yellow-400" />
            )}
            <span className="hidden sm:inline">
              {isVip ? `VIP Active (${user.activatedPasscode || user.plan})` : '🔑 VIP Key'}
            </span>
            <span className="sm:hidden">
              {isVip ? 'VIP' : 'VIP Key'}
            </span>
          </button>

          {/* Daily Market Analysis Button */}
          <button
            onClick={onOpenDailyAnalysis}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-950/90 hover:bg-purple-900 text-yellow-300 font-bold text-xs transition border border-yellow-500/40 shadow-md"
            title="วิเคราะห์สภาวะตลาดประจำวัน & หน้าเทรดที่ได้เปรียบ"
          >
            <Compass className="w-4 h-4 text-yellow-400" />
            <span className="hidden sm:inline">สภาวะตลาดประจำวัน</span>
            <span className="sm:hidden">สภาวะตลาด</span>
          </button>

          {/* Active Order Audit Button */}
          <button
            onClick={onOpenPositionAudit}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-950/90 hover:bg-purple-900 text-yellow-200 font-bold text-xs transition border border-purple-800 shadow-md"
            title="วิเคราะห์ออเดอร์ที่เปิดอยู่"
          >
            <BarChart2 className="w-4 h-4 text-yellow-400" />
            <span className="hidden sm:inline">วิเคราะห์ออเดอร์</span>
            <span className="sm:hidden">ออเดอร์</span>
          </button>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-950/90 hover:bg-purple-900 text-yellow-200 text-xs font-bold transition border border-purple-800"
            title="ประวัติการวิเคราะห์"
          >
            <History className="w-4 h-4 text-yellow-400" />
            <span className="hidden lg:inline">ประวัติ</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-yellow-400 text-purple-950">
                {historyCount}
              </span>
            )}
          </button>

          {/* Help Button */}
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-yellow-300 text-xs font-bold transition border border-purple-700"
            title="คู่มือการใช้งาน"
          >
            <HelpCircle className="w-4 h-4 text-yellow-400" />
            <span className="hidden lg:inline">วิธีใช้</span>
          </button>
        </div>
      </div>
    </header>
  );
};


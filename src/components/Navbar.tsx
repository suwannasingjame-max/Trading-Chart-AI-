import React from 'react';
import { UserProfile } from '../types';
import { TrendingUp, History, Sparkles, HelpCircle, User, BarChart2, Compass } from 'lucide-react';

interface NavbarProps {
  onOpenHistory: () => void;
  onOpenHelp: () => void;
  onOpenAdmin: () => void;
  onOpenEaStore: () => void;
  onOpenPositionAudit: () => void;
  onOpenDailyAnalysis: () => void;
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
  historyCount,
  user,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 lg:px-8 py-3.5 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div 
            onClick={onOpenAdmin}
            className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-md shadow-emerald-950/40 flex items-center justify-center cursor-pointer select-none"
            title="Trading Chart AI"
          >
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold bg-gradient-to-r from-slate-100 via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                Trading Chart AI Analyzer
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-3 h-3" /> 3-TF AI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              วิเคราะห์กราฟ 3 TF (H4, H1, M15) ด้วย AI คำนวณจุดเข้า Entry / SL / TP
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Daily Market Analysis Button */}
          <button
            onClick={onOpenDailyAnalysis}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 text-emerald-300 font-bold text-xs transition border border-emerald-500/40 shadow-sm"
            title="วิเคราะห์สภาวะตลาดประจำวัน & หน้าเทรดที่ได้เปรียบ"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">สภาวะตลาดประจำวัน</span>
            <span className="sm:hidden">สภาวะตลาด</span>
          </button>

          {/* Active Order Audit Button */}
          <button
            onClick={onOpenPositionAudit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-emerald-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 text-cyan-300 font-bold text-xs transition border border-cyan-500/40 shadow-sm"
            title="วิเคราะห์ออเดอร์ที่เปิดอยู่"
          >
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">วิเคราะห์ออเดอร์</span>
            <span className="sm:hidden">วิเคราะห์ออเดอร์</span>
          </button>


          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition border border-slate-700/60"
            title="ประวัติการวิเคราะห์"
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span className="hidden lg:inline">ประวัติ</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-cyan-500 text-slate-950">
                {historyCount}
              </span>
            )}
          </button>

          {/* Help Button */}
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition border border-slate-700/60"
            title="คู่มือการใช้งาน"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span className="hidden lg:inline">วิธีใช้</span>
          </button>
        </div>
      </div>
    </header>
  );
};


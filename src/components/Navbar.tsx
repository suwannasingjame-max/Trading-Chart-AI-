import React from 'react';
import { UserProfile } from '../types';
import { TrendingUp, History, Sparkles, HelpCircle, Crown, User, Bot, ShoppingBag } from 'lucide-react';

interface NavbarProps {
  onOpenHistory: () => void;
  onOpenHelp: () => void;
  onOpenSubscription: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenEaStore: () => void;
  historyCount: number;
  user: UserProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenHistory,
  onOpenHelp,
  onOpenSubscription,
  onOpenAuth,
  onOpenAdmin,
  onOpenEaStore,
  historyCount,
  user,
}) => {
  const isPro = user.plan !== 'FREE';

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

        {/* Action Buttons & Membership Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Membership Badge / Quota Tracker */}
          <button
            onClick={onOpenSubscription}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm border ${
              isPro
                ? 'bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-300 border-amber-500/40 hover:border-amber-400'
                : 'bg-slate-800 text-slate-300 border-slate-700/80 hover:bg-slate-750'
            }`}
            title="จัดการแผนสมาชิก"
          >
            <Crown className={`w-3.5 h-3.5 ${isPro ? 'text-amber-400 fill-amber-400/20' : 'text-slate-400'}`} />
            <span>
              {isPro ? (
                'PRO VIP'
              ) : (
                <span className="flex items-center gap-1">
                  <span>FREE</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                    ไม่จำกัด
                  </span>
                </span>
              )}
            </span>
          </button>

          {/* Upgrade Button if Free */}
          {!isPro && (
            <button
              onClick={onOpenSubscription}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs transition shadow-md shadow-emerald-950/40"
            >
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
              <span>สมัครสมาชิก VIP</span>
            </button>
          )}

          {/* EA Store Button */}
          <button
            onClick={onOpenEaStore}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 text-emerald-300 font-bold text-xs transition border border-emerald-500/40 shadow-sm"
            title="ร้านค้า EA Trading Bots"
          >
            <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="inline">ร้านค้า EA</span>
            <span className="px-1 py-0.2 text-[9px] font-black rounded-full bg-gradient-to-r from-red-500 to-amber-500 text-slate-950">
              HOT
            </span>
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

          {/* User Profile / Auth Button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition border border-slate-700/60"
            title="โปรไฟล์ผู้ใช้"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
              {user.isLoggedIn ? user.name.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
            </div>
            <span className="hidden md:inline font-semibold">
              {user.isLoggedIn ? user.name : 'เข้าสู่ระบบ'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};


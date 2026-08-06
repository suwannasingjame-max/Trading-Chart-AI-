import React from 'react';
import { StrategyType } from '../types';
import { Crosshair, CheckCircle2 } from 'lucide-react';

interface StrategySelectorProps {
  selectedStrategy: StrategyType;
  onSelectStrategy: (strategy: StrategyType) => void;
}

interface StrategyOption {
  id: StrategyType;
  name: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  focusPoints: string[];
  colorTheme: string;
}

const STRATEGIES: StrategyOption[] = [
  {
    id: 'SMC',
    name: 'Smart Money Concepts (SMC)',
    badge: 'ระบบหลัก (Active)',
    icon: Crosshair,
    description: 'วิเคราะห์การล่า Liquidity, Order Block (OB), Fair Value Gap (FVG) และการเกิด ChoCH / BoS',
    focusPoints: ['Higher TF Bias (H4)', 'Liquidity Sweep & Inducement (H1)', 'ChoCH + Refined OB Entry (M15)'],
    colorTheme: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400',
  },
];

export const StrategySelector: React.FC<StrategySelectorProps> = ({
  selectedStrategy,
  onSelectStrategy,
}) => {
  return (
    <div className="bg-gradient-to-br from-[#180e35] via-[#120a2a] to-[#1c0f3c] rounded-2xl p-5 border-2 border-yellow-500/40 shadow-2xl backdrop-blur-sm relative overflow-hidden">
      {/* Decorative ambient yellow glow */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-yellow-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3.5 relative z-10">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-yellow-400 text-purple-950 text-xs font-black shadow-md shadow-yellow-500/30">
              1
            </span>
            ระบบการเทรดที่ใช้สำหรับการวิเคราะห์ (Trading System)
          </h2>
          <p className="text-xs text-yellow-200/90 mt-1">
            ระบบตั้งค่าเริ่มต้นโดยเน้นโครงสร้างราคา Smart Money Concepts (SMC) เป็นหลัก
          </p>
        </div>
      </div>

      <div className="w-full relative z-10">
        {STRATEGIES.map((strat) => {
          const Icon = strat.icon;
          const isSelected = selectedStrategy === strat.id || true;

          return (
            <button
              key={strat.id}
              type="button"
              onClick={() => onSelectStrategy(strat.id)}
              className={`w-full text-left p-4.5 rounded-xl transition-all duration-200 border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isSelected
                  ? `bg-gradient-to-r from-purple-900/90 via-purple-950/90 to-amber-950/40 shadow-xl shadow-purple-950/80 border-yellow-400 ring-2 ring-yellow-400/40`
                  : 'bg-purple-950/60 border-purple-800 text-slate-300'
              }`}
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-yellow-400 text-purple-950 border border-yellow-300 shadow-lg shadow-yellow-500/20 font-black">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-slate-100">{strat.name}</span>
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-yellow-400 text-purple-950 border border-yellow-300 flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3 h-3 text-purple-950" />
                        {strat.badge}
                      </span>
                    </div>
                    <p className="text-xs text-purple-100/90 leading-relaxed mt-1">{strat.description}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 sm:pt-0 sm:pl-4 sm:border-l-2 border-yellow-500/30 text-xs text-purple-200 shrink-0 space-y-1.5">
                <span className="text-[10px] font-bold text-yellow-300 uppercase tracking-wider block mb-1">
                  หัวข้อวิเคราะห์หลัก:
                </span>
                {strat.focusPoints.map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-sm shadow-yellow-400" />
                    <span className="font-semibold text-yellow-100">{pt}</span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};


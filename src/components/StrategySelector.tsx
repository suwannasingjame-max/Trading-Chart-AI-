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
    <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold">
              1
            </span>
            ระบบการเทรดที่ใช้สำหรับการวิเคราะห์ (Trading System)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ระบบตั้งค่าเริ่มต้นโดยเน้นโครงสร้างราคา Smart Money Concepts (SMC) เป็นหลัก
          </p>
        </div>
      </div>

      <div className="w-full">
        {STRATEGIES.map((strat) => {
          const Icon = strat.icon;
          const isSelected = selectedStrategy === strat.id || true;

          return (
            <button
              key={strat.id}
              type="button"
              onClick={() => onSelectStrategy(strat.id)}
              className={`w-full text-left p-4.5 rounded-xl transition-all duration-200 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isSelected
                  ? `bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-slate-900 shadow-lg shadow-black/40 border-emerald-500/50 ring-1 ring-emerald-500/30`
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
              }`}
            >
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-slate-100">{strat.name}</span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {strat.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">{strat.description}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 sm:pt-0 sm:pl-4 sm:border-l border-slate-700/50 text-xs text-slate-300 shrink-0 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  หัวข้อวิเคราะห์หลัก:
                </span>
                {strat.focusPoints.map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                    <span className="font-medium text-slate-200">{pt}</span>
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


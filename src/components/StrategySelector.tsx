import React from 'react';
import { StrategyType } from '../types';
import { ShieldCheck, Target, Crosshair, Zap, Compass, Activity, Info } from 'lucide-react';

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
    badge: 'ยอดนิยมสถาบัน',
    icon: Crosshair,
    description: 'วิเคราะห์การล่า Liquidity, Order Block (OB), Fair Value Gap (FVG) และการเกิด ChoCH / BoS',
    focusPoints: ['Higher TF Bias (H4)', 'Liquidity Sweep & Inducement (H1)', 'ChoCH + Refined OB Entry (M15)'],
    colorTheme: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400',
  },
  {
    id: 'PRICE_ACTION',
    name: 'Classic Price Action',
    badge: 'สายคลาสสิก',
    icon: Target,
    description: 'วิเคราะห์แนวรับแนวต้านสำคัญ รูปแบบแท่งเทียน Pinbar/Engulfing และ Chart Patterns',
    focusPoints: ['Key Support & Resistance', 'Double Top/Bottom, Triangles', 'Breakout & Retest Confirmation'],
    colorTheme: 'from-blue-500/20 to-indigo-500/10 border-blue-500/40 text-blue-400',
  },
  {
    id: 'ICT',
    name: 'ICT Methodology',
    badge: 'Inner Circle Trader',
    icon: Zap,
    description: 'วิเคราะห์ Power of 3 (AMD), Judas Swing, Liquidity Void และ Silver Bullet Zone',
    focusPoints: ['Kill Zone Timeframe', 'Optimal Trade Entry (OTE 70.5%)', 'Displacement & FVG Fill'],
    colorTheme: 'from-purple-500/20 to-pink-500/10 border-purple-500/40 text-purple-400',
  },
  {
    id: 'SUPPLY_DEMAND',
    name: 'Supply & Demand Imbalance',
    badge: 'โซนอุปสงค์/อุปทาน',
    icon: Compass,
    description: 'เน้นหา Fresh Supply/Demand Zones, Rally-Base-Drop (RBD) และ Zone Flip Levels',
    focusPoints: ['Rally-Base-Drop / Drop-Base-Rally', 'Zone Quality & Freshness Score', 'In-Zone Buffer SL'],
    colorTheme: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-400',
  },
  {
    id: 'BREAKOUT_TREND',
    name: 'Breakout & Trend Following',
    badge: 'เทรดตามเทรนด์',
    icon: Activity,
    description: 'เน้นหาจังหวะทะลุกรอบ Consolidation / Channel และการย่อทดสอบ (Pullback Retest)',
    focusPoints: ['Directional Momentum (H4)', 'Key Range Breakout (H1)', 'Volume / EMA Retest Trigger (M15)'],
    colorTheme: 'from-cyan-500/20 to-sky-500/10 border-cyan-500/40 text-cyan-400',
  },
  {
    id: 'HARMONIC',
    name: 'Harmonic & Fibonacci',
    badge: 'โครงสร้างเรขาคณิต',
    icon: ShieldCheck,
    description: 'วิเคราะห์รูปแบบ Harmonic (Gartley, Bat, Butterfly) และ Potential Reversal Zone (PRZ)',
    focusPoints: ['Macro Fib Retracement', 'PRZ Alignment Zone', 'Reversal Candlestick Confirmation'],
    colorTheme: 'from-rose-500/20 to-red-500/10 border-rose-500/40 text-rose-400',
  },
];

export const StrategySelector: React.FC<StrategySelectorProps> = ({
  selectedStrategy,
  onSelectStrategy,
}) => {
  return (
    <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold">
              1
            </span>
            เลือกระบบการเทรดที่ต้องการให้ AI วิเคราะห์
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            AI จะใช้อัลกอริทึมและเงื่อนไขเทคนิคตามระบบที่คุณเลือก เพื่อค้นหาจุดเข้า Entry, SL และ TP
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {STRATEGIES.map((strat) => {
          const Icon = strat.icon;
          const isSelected = selectedStrategy === strat.id;

          return (
            <button
              key={strat.id}
              onClick={() => onSelectStrategy(strat.id)}
              className={`relative text-left p-4 rounded-xl transition-all duration-200 border flex flex-col justify-between ${
                isSelected
                  ? `bg-gradient-to-br ${strat.colorTheme} shadow-md shadow-black/40 ring-2 ring-emerald-500/50 scale-[1.01]`
                  : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-300 opacity-85 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700/50 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-slate-100">{strat.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-700/40 text-slate-400 border-slate-600/40'
                    }`}
                  >
                    {strat.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">{strat.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-700/40 text-[11px] text-slate-400 space-y-1">
                {strat.focusPoints.map((pt, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    <span>{pt}</span>
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

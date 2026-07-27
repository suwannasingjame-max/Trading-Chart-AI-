import React, { useState } from 'react';
import { TradeSetup } from '../types';
import { Calculator, DollarSign, Percent, ShieldCheck, HelpCircle } from 'lucide-react';

interface PositionSizeCalculatorProps {
  tradeSetup: TradeSetup;
  symbol: string;
}

export const PositionSizeCalculator: React.FC<PositionSizeCalculatorProps> = ({ tradeSetup, symbol }) => {
  const [accountBalance, setAccountBalance] = useState<number>(1000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);

  const isGold = symbol.toLowerCase().includes('xau') || symbol.toLowerCase().includes('gold');
  const isCrypto = symbol.toLowerCase().includes('btc') || symbol.toLowerCase().includes('eth');

  // SL Pips calculation
  const slPips = tradeSetup.estimatedPipsSL || 30;

  // Dollar Risk Amount
  const dollarRisk = (accountBalance * riskPercent) / 100;

  // Lot Size calculation
  // For Gold: 1 Standard Lot = $10 per $1 price move ($1 = 100 pips/points)
  // For Forex standard pair: 1 Standard Lot = $10 per pip
  // For Crypto: Dollar Risk / SL price distance
  let calculatedLots = 0;
  if (isGold) {
    // In Gold 1 Lot = $10 per 1.00 move (100 pips)
    calculatedLots = dollarRisk / (slPips * 1.0);
  } else if (isCrypto) {
    calculatedLots = dollarRisk / Math.max(slPips, 1);
  } else {
    // Forex Standard Pairs
    calculatedLots = dollarRisk / (slPips * 10);
  }

  const finalLots = Math.max(calculatedLots, 0.01).toFixed(2);

  return (
    <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold">
            5
          </span>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            คำนวณขนาดออเดอร์ (Lot Size & Risk Sizing Calculator)
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Account Balance Input */}
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
          <label className="text-xs font-medium text-slate-300 block">
            เงินทุนในพอร์ต (Account Balance - USD):
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              value={accountBalance}
              onChange={(e) => setAccountBalance(Math.max(parseFloat(e.target.value) || 0, 1))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-100 text-sm font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>
          {/* Quick presets */}
          <div className="flex gap-1.5 pt-1">
            {[500, 1000, 5000, 10000].map((amt) => (
              <button
                key={amt}
                onClick={() => setAccountBalance(amt)}
                className="px-2 py-0.5 rounded text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold"
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Percentage Input */}
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
          <label className="text-xs font-medium text-slate-300 block">
            เปอร์เซ็นต์ความเสี่ยงต่อไม้ (% Risk):
          </label>
          <div className="relative">
            <Percent className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              step="0.5"
              min="0.1"
              max="10"
              value={riskPercent}
              onChange={(e) => setRiskPercent(Math.max(parseFloat(e.target.value) || 0, 0.1))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-100 text-sm font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>
          {/* Quick presets */}
          <div className="flex gap-1.5 pt-1">
            {[0.5, 1.0, 2.0, 3.0].map((r) => (
              <button
                key={r}
                onClick={() => setRiskPercent(r)}
                className="px-2 py-0.5 rounded text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold"
              >
                {r}%
              </button>
            ))}
          </div>
        </div>

        {/* Result Card */}
        <div className="bg-gradient-to-br from-emerald-950/60 to-teal-950/40 p-4 rounded-xl border border-emerald-500/40 flex flex-col justify-between shadow-lg">
          <div>
            <span className="text-xs font-bold text-emerald-400 block uppercase tracking-wider mb-1">
              ขนาด Lot ที่แนะนำ (Recommended Lot Size)
            </span>
            <div className="text-2xl font-black text-emerald-300 flex items-baseline gap-2">
              <span>{finalLots} Lots</span>
              <span className="text-xs text-slate-300 font-normal">(SL ~{slPips.toFixed(1)} pips)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-500/20 text-xs text-slate-300 flex items-center justify-between">
            <span>จำนวนเงินยอมขาดทุน:</span>
            <span className="font-bold text-red-400">-${dollarRisk.toFixed(2)} USD</span>
          </div>
        </div>
      </div>
    </div>
  );
};

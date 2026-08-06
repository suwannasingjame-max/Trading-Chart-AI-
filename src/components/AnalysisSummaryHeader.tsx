import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { TrendingUp, TrendingDown, ShieldAlert, Copy, Check, Target, DollarSign, Award, AlertCircle } from 'lucide-react';

interface AnalysisSummaryHeaderProps {
  result: AnalysisResult;
}

export const AnalysisSummaryHeader: React.FC<AnalysisSummaryHeaderProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const { signal, confidenceScore, symbol, strategyUsed, tradeSetup, overallReasoning, invalidationScenario, tradeManagement } = result;

  const isBuy = signal === 'BUY';
  const isSell = signal === 'SELL';
  const isNoTrade = signal === 'NO_TRADE';

  const handleCopySetup = () => {
    const textToCopy = `📊 AI Trading Signal: ${symbol} (${strategyUsed})
──────────────────────────────
🎯 Signal: ${signal} (${confidenceScore}% Confidence)
📈 Entry: ${tradeSetup.entryPrice} (${tradeSetup.entryType})
🛑 Stop Loss (SL): ${tradeSetup.stopLoss}
🎯 Take Profit 1: ${tradeSetup.takeProfit1}
🎯 Take Profit 2: ${tradeSetup.takeProfit2}
🎯 Take Profit 3: ${tradeSetup.takeProfit3}
⚖️ Risk:Reward: ${tradeSetup.riskRewardRatio} (SL: ~${tradeSetup.estimatedPipsSL} pips)
💡 Reason: ${overallReasoning}
⚠️ Invalidation: ${invalidationScenario}
──────────────────────────────
Analyzed with Trading Chart AI Analyzer`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-gradient-to-br from-[#180e35] via-[#120a2a] to-[#1c0f3c] rounded-2xl p-6 border-2 border-yellow-500/40 shadow-2xl relative overflow-hidden backdrop-blur-sm">
      {/* Background Glow */}
      <div
        className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isBuy ? 'bg-yellow-400' : isSell ? 'bg-red-500' : 'bg-purple-500'
        }`}
      />

      <div className="relative z-10 space-y-6">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-yellow-500/30">
          <div className="flex items-center gap-4">
            {/* Signal Badge Icon */}
            <div
              className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-xl border shrink-0 ${
                isBuy
                  ? 'bg-yellow-400 text-purple-950 border-yellow-300 shadow-yellow-500/30'
                  : isSell
                  ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-red-950/50'
                  : 'bg-purple-900/40 border-yellow-500/40 text-yellow-300 shadow-purple-950/50'
              }`}
            >
              {isBuy ? (
                <TrendingUp className="w-9 h-9" />
              ) : isSell ? (
                <TrendingDown className="w-9 h-9" />
              ) : (
                <ShieldAlert className="w-9 h-9" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider border shadow-sm ${
                    isBuy
                      ? 'bg-yellow-400 text-purple-950 border-yellow-300'
                      : isSell
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : 'bg-purple-900/60 text-yellow-300 border-yellow-500/40'
                  }`}
                >
                  {signal === 'BUY' ? '🟢 BUY SETUP' : signal === 'SELL' ? '🔴 SELL SETUP' : '🟡 NO TRADE / WAIT'}
                </span>
                <span className="text-xs text-yellow-300 font-bold bg-purple-950/90 px-3 py-1 rounded-full border border-yellow-500/30">
                  {symbol}
                </span>
                <span className="text-xs text-yellow-200/80 bg-purple-900/60 px-2.5 py-1 rounded-full border border-purple-700">
                  ระบบ: {strategyUsed}
                </span>
                {result.analysisMode === 'SCALPING' && (
                  <span className="text-xs font-black text-purple-950 bg-yellow-400 px-2.5 py-1 rounded-full border border-yellow-300 flex items-center gap-1 shadow-sm">
                    ⚡ สัญญาณสายซิ่ง M1 (Scalper Bounce)
                  </span>
                )}
              </div>

              <h2 className="text-xl font-black text-slate-100 mt-2">
                {isBuy
                  ? `วิเคราะห์พบสัญญาณซื้อ (BUY) ใน ${symbol}`
                  : isSell
                  ? `วิเคราะห์พบสัญญาณขาย (SELL) ใน ${symbol}`
                  : `ตลาดอยู่ในสภาวะเสี่ยงสูง แนะนำให้ชะลอการเทรด (WAIT)`}
              </h2>
            </div>
          </div>

          {/* Confidence Score & Copy Button */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Confidence Score Gauge */}
            <div className="bg-purple-950/90 px-4 py-2.5 rounded-xl border border-yellow-500/40 text-center shadow-md">
              <span className="text-[10px] text-yellow-300/80 block font-bold uppercase tracking-wider">
                AI Confidence
              </span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-xl font-black text-yellow-300">{confidenceScore}%</span>
                <Award className="w-4 h-4 text-yellow-400" />
              </div>
            </div>

            <button
              onClick={handleCopySetup}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black transition shadow-lg border ${
                copied
                  ? 'bg-yellow-400 text-purple-950 border-yellow-300'
                  : 'bg-yellow-400 hover:bg-yellow-300 text-purple-950 border-yellow-300 shadow-yellow-500/30'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-purple-950" /> : <Copy className="w-4 h-4 text-purple-950" />}
              <span>{copied ? 'คัดลอกเรียบร้อย!' : 'คัดลอกจุดเข้า MT4/MT5'}</span>
            </button>
          </div>
        </div>

        {/* Overall Reason */}
        <div className="bg-purple-950/60 p-4 rounded-xl border border-yellow-500/30">
          <p className="text-sm text-slate-100 leading-relaxed font-medium">
            <span className="text-yellow-300 font-black">💡 สรุปวิเคราะห์ AI:</span> {overallReasoning}
          </p>
        </div>

        {/* Key Trading Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-purple-950/80 p-3.5 rounded-xl border border-yellow-500/30">
            <span className="text-[11px] text-yellow-300/80 block font-bold">ประเภทคำสั่ง</span>
            <span className="text-sm font-bold text-slate-100">{tradeSetup.entryType}</span>
          </div>

          <div className="bg-yellow-400 p-3.5 rounded-xl border border-yellow-300 shadow-md">
            <span className="text-[11px] text-purple-950 block font-black">จุดเข้า Entry</span>
            <span className="text-base font-black text-purple-950">{tradeSetup.entryPrice}</span>
          </div>

          <div className="bg-red-950/60 p-3.5 rounded-xl border border-red-500/40">
            <span className="text-[11px] text-red-300 block font-bold">ตัดขาดทุน (SL)</span>
            <span className="text-base font-black text-red-300">{tradeSetup.stopLoss}</span>
          </div>

          <div className="bg-purple-900/60 p-3.5 rounded-xl border border-yellow-500/40">
            <span className="text-[11px] text-yellow-300 block font-bold">ทำกำไร (TP1)</span>
            <span className="text-base font-black text-yellow-300">{tradeSetup.takeProfit1}</span>
          </div>

          <div className="bg-purple-950/80 p-3.5 rounded-xl border border-purple-800">
            <span className="text-[11px] text-yellow-200/80 block font-bold">ทำกำไร (TP2 / TP3)</span>
            <span className="text-sm font-bold text-yellow-200">{tradeSetup.takeProfit2} / {tradeSetup.takeProfit3}</span>
          </div>

          <div className="bg-yellow-500/20 p-3.5 rounded-xl border border-yellow-500/40">
            <span className="text-[11px] text-yellow-300 block font-bold">Risk : Reward</span>
            <span className="text-base font-black text-yellow-300">{tradeSetup.riskRewardRatio}</span>
          </div>
        </div>

        {/* Confluence Badges */}
        {result.confluences && result.confluences.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 block">
              ปัจจัยสนับสนุนการเข้าเทรด (Confluence Points):
            </span>
            <div className="flex flex-wrap gap-2">
              {result.confluences.map((conf, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium px-3 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700/80 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {conf}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Invalidation & Management Footer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="bg-red-950/20 p-3.5 rounded-xl border border-red-500/20 text-xs">
            <span className="font-bold text-red-400 flex items-center gap-1 mb-1">
              <AlertCircle className="w-3.5 h-3.5" /> เงื่อนไขยกเลิกแผน (Invalidation):
            </span>
            <p className="text-slate-300 leading-relaxed">{invalidationScenario}</p>
          </div>

          <div className="bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-500/20 text-xs">
            <span className="font-bold text-emerald-400 flex items-center gap-1 mb-1">
              <Target className="w-3.5 h-3.5" /> การบริหารความเสี่ยง (Trade Management):
            </span>
            <p className="text-slate-300 leading-relaxed">{tradeManagement}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

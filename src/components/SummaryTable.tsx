import React from 'react';
import { AnalysisResult, SummaryConditionRow } from '../types';
import { CheckCircle2, XCircle, FileText, CheckSquare, Layers, HelpCircle, ArrowRight } from 'lucide-react';

interface SummaryTableProps {
  result: AnalysisResult;
}

export const SummaryTable: React.FC<SummaryTableProps> = ({ result }) => {
  const { summaryConditions, marketStructure, strategyUsed, signal } = result;

  const totalPassed = summaryConditions.filter((c) => c.conditionMet).length;
  const passRate = summaryConditions.length > 0 ? Math.round((totalPassed / summaryConditions.length) * 100) : 0;

  return (
    <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold">
              4
            </span>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              ตารางสรุปเงื่อนไขและเหตุผลประกอบการตัดสินใจ
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            การตรวจสอบตามเช็คลิสต์ระบบ {strategyUsed} แยกตามลำดับขั้นตอนและ Multi-timeframe Alignment
          </p>
        </div>

        {/* Pass Rate Indicator */}
        <div className="flex items-center gap-2 bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-700">
          <span className="text-xs text-slate-400 font-medium">เงื่อนไขผ่าน:</span>
          <span className="text-sm font-extrabold text-emerald-400">
            {totalPassed} / {summaryConditions.length} ({passRate}%)
          </span>
        </div>
      </div>

      {/* Multi-Timeframe Alignment Flow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {marketStructure.map((tf, index) => {
          const isBull = tf.trend.toLowerCase().includes('bull');
          const isBear = tf.trend.toLowerCase().includes('bear');

          return (
            <div
              key={tf.timeframe}
              className={`p-4 rounded-xl border relative transition ${
                isBull
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : isBear
                  ? 'bg-red-950/20 border-red-500/30'
                  : 'bg-slate-800/40 border-slate-700/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                  {tf.timeframe}
                </span>
                <span
                  className={`text-xs font-bold ${
                    isBull ? 'text-emerald-400' : isBear ? 'text-red-400' : 'text-slate-400'
                  }`}
                >
                  {tf.trend}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium mb-2">{tf.summary}</p>
              <div className="pt-2 border-t border-slate-700/40 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">โซนสำคัญ:</span> {tf.keyLevel}
              </div>
            </div>
          );
        })}
      </div>

      {/* Structured Decision Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 shadow-inner">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-800/80 text-slate-300 font-bold border-b border-slate-700/80">
              <th className="p-3 text-center w-12">ลำดับ</th>
              <th className="p-3 w-48">หัวข้อการตรวจสอบ (Rule)</th>
              <th className="p-3 text-center w-28">TF</th>
              <th className="p-3 text-center w-28">ผลลัพธ์</th>
              <th className="p-3">เหตุผลและคำอธิบายวิเคราะห์รายละเอียด</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {summaryConditions.map((cond, idx) => (
              <tr
                key={idx}
                className={`transition hover:bg-slate-800/40 ${
                  cond.conditionMet ? 'bg-slate-900/30' : 'bg-red-950/10'
                }`}
              >
                {/* Step Number */}
                <td className="p-3 text-center font-bold text-slate-400">{cond.step}</td>

                {/* Topic / Rule */}
                <td className="p-3 font-semibold text-slate-100">
                  <div>{cond.topic}</div>
                  <span className="text-[10px] text-slate-500 font-normal">{cond.ruleType}</span>
                </td>

                {/* Timeframe */}
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
                    {cond.timeframe}
                  </span>
                </td>

                {/* Condition Met Status */}
                <td className="p-3 text-center">
                  {cond.conditionMet ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ผ่าน
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/30">
                      <XCircle className="w-3.5 h-3.5" /> ไม่ผ่าน
                    </span>
                  )}
                </td>

                {/* Detailed Reason */}
                <td className="p-3 text-slate-300 leading-relaxed font-normal">
                  {cond.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React from 'react';
import { AnalysisResult } from '../types';
import { History, X, Trash2, ArrowUpRight, TrendingUp, TrendingDown, ShieldAlert } from 'lucide-react';

interface AnalysisHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: AnalysisResult[];
  onSelectHistoryItem: (item: AnalysisResult) => void;
  onClearHistory: () => void;
}

export const AnalysisHistoryModal: React.FC<AnalysisHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-base text-slate-100">
              ประวัติการวิเคราะห์กราฟ ({history.length})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/20 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> ล้างประวัติ
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              ยังไม่มีประวัติการวิเคราะห์กราฟ
            </div>
          ) : (
            history.map((item) => {
              const isBuy = item.signal === 'BUY';
              const isSell = item.signal === 'SELL';

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectHistoryItem(item);
                    onClose();
                  }}
                  className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl border ${
                        isBuy
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : isSell
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {isBuy ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{item.symbol}</span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                            isBuy ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {item.signal}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ({item.strategyUsed})
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {item.overallReasoning}
                      </p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {new Date(item.timestamp).toLocaleString('th-TH')}
                      </span>
                    </div>
                  </div>

                  <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

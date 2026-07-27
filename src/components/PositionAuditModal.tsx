import React, { useState, useRef } from 'react';
import { PositionAuditResult, PositionAuditRequest } from '../types';
import {
  X,
  Upload,
  Image as ImageIcon,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Zap,
  Clock,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  BarChart2,
  FileText,
  DollarSign,
  Layers,
  ChevronRight,
  Sliders,
  Flame
} from 'lucide-react';

interface PositionAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PositionAuditModal: React.FC<PositionAuditModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [chartImage, setChartImage] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [symbol, setSymbol] = useState<string>('XAU/USD (Gold)');
  const [timeframe, setTimeframe] = useState<string>('M15');
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [currentPrice, setCurrentPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<PositionAuditResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น (JPG, PNG, WEBP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setChartImage(reader.result as string);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmitAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chartImage) {
      setErrorMsg('กรุณาอัปโหลดหรือแนบรูปภาพกราฟออเดอร์ที่ต้องการวิเคราะห์');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const payload: PositionAuditRequest = {
        chartImage,
        orderType,
        timeframe,
        symbol,
        entryPrice,
        currentPrice,
        stopLoss,
        takeProfit,
        notes,
      };

      const response = await fetch('/api/audit-position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errText = 'การวิเคราะห์ออเดอร์ล้มเหลว';
        try {
          const errData = await response.json();
          errText = errData.error || errText;
        } catch {
          errText = `เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ (${response.status})`;
        }
        throw new Error(errText);
      }

      const data: PositionAuditResult = await response.json();
      setAuditResult(data);
    } catch (err: any) {
      console.error('Audit submit error:', err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดระหว่างการวิเคราะห์ออเดอร์ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAuditResult(null);
    setErrorMsg(null);
  };

  const timeframesList = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'];
  const symbolsList = ['XAU/USD (Gold)', 'EUR/USD', 'GBP/USD', 'BTC/USD', 'USD/JPY'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-100">
        
        {/* HEADER BAR */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-emerald-500 to-amber-500 p-0.5 shadow-lg shadow-cyan-950/50 flex items-center justify-center">
              <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-100">
                  วิเคราะห์ออเดอร์ที่เปิดอยู่ (Active Position Audit)
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI TRADE REVIEW
                </span>
              </div>
              <p className="text-xs text-slate-400">
                แนบรูปภาพกราฟออเดอร์ที่คุณเข้าเทรด TF ไหนก็ได้ AI จะช่วยประเมินสถานะกราฟ ข้อควรระวัง และแนะนำว่าจะถือต่อ/บังทุน/หรือปิดออเดอร์
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY CONTENT */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* STATE 1: AUDIT INPUT FORM */}
          {!auditResult && (
            <form onSubmit={handleSubmitAudit} className="space-y-6">
              
              {/* IMAGE UPLOAD AREA */}
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-2 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  อัปโหลดรูปภาพกราฟที่เข้าออเดอร์ (TF ไหนก็ได้): <span className="text-red-400">*</span>
                </label>

                {chartImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-emerald-500/50 bg-slate-950 p-2 group">
                    <img
                      src={chartImage}
                      alt="Uploaded Order Chart"
                      className="w-full max-h-72 object-contain rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setChartImage(null)}
                      className="absolute top-4 right-4 bg-red-600/90 hover:bg-red-500 text-white p-2 rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      <span>เปลี่ยนรูปภาพ</span>
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-emerald-500/70 bg-slate-950/60 hover:bg-slate-950 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition group flex flex-col items-center justify-center space-y-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 group-hover:bg-emerald-500/20 text-slate-400 group-hover:text-emerald-400 border border-slate-700/60 group-hover:border-emerald-500/40 flex items-center justify-center transition shadow-md">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-200 group-hover:text-emerald-300">
                        คลิกเพื่อเลือกไฟล์ หรือลากรูปภาพมาวางที่นี่
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        รองรับแคปหน้าจอกราฟจาก TradingView, MT4, MT5 (ทุก Timeframe)
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageUpload(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              {/* ORDER DETAILS GRID */}
              <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  ข้อมูลรายละเอียดออเดอร์ที่เปิดอยู่ (ช่วยให้ AI วิเคราะห์แม่นยำยิ่งขึ้น)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Order Direction */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">
                      ประเภทออเดอร์ (Direction):
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setOrderType('BUY')}
                        className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition border ${
                          orderType === 'BUY'
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-950/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span>BUY (ฝั่งซื้อ)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setOrderType('SELL')}
                        className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition border ${
                          orderType === 'SELL'
                            ? 'bg-rose-500 text-slate-950 border-rose-400 shadow-md shadow-rose-950/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <TrendingDown className="w-4 h-4" />
                        <span>SELL (ฝั่งขาย)</span>
                      </button>
                    </div>
                  </div>

                  {/* Asset / Symbol */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">
                      สินทรัพย์ / คู่เงิน (Symbol):
                    </label>
                    <input
                      type="text"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value)}
                      placeholder="เช่น XAU/USD, EUR/USD, BTC/USD"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {symbolsList.map((sym) => (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => setSymbol(sym)}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition ${
                            symbol === sym
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {sym}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timeframe Selector */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5">
                      Timeframe ที่ใช้ดูกราฟ:
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {timeframesList.map((tf) => (
                        <button
                          key={tf}
                          type="button"
                          onClick={() => setTimeframe(tf)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                            timeframe === tf
                              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Entry Price & Current Price Inputs */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">
                        ราคาจุดเข้า (Entry):
                      </label>
                      <input
                        type="text"
                        value={entryPrice}
                        onChange={(e) => setEntryPrice(e.target.value)}
                        placeholder="เช่น 2385.50"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">
                        ราคาปัจจุบัน (Current):
                      </label>
                      <input
                        type="text"
                        value={currentPrice}
                        onChange={(e) => setCurrentPrice(e.target.value)}
                        placeholder="เช่น 2390.20"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {/* SL / TP Optional Inputs */}
                  <div className="grid grid-cols-2 gap-2 md:col-span-2">
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">
                        Stop Loss (ถ้ามี):
                      </label>
                      <input
                        type="text"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(e.target.value)}
                        placeholder="เช่น 2380.00"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">
                        Take Profit (ถ้ามี):
                      </label>
                      <input
                        type="text"
                        value={takeProfit}
                        onChange={(e) => setTakeProfit(e.target.value)}
                        placeholder="เช่น 2400.00"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Notes / Reason */}
                  <div className="md:col-span-2">
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      เหตุผลที่เข้า หรือหมายเหตุเพิ่มเติม (Optional):
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      placeholder="เช่น เข้าเพราะเห็น FVG M15 ย่อลงมาเทส Demand Zone แล้วมีแท่ง Rejection"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message Alert */}
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-2xl font-black text-sm transition shadow-xl flex items-center justify-center gap-2 ${
                  isLoading
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 shadow-cyan-950/50'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
                    <span>AI กำลังวิเคราะห์โครงสร้างกราฟและประเมินออเดอร์...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-slate-950" />
                    <span>เริ่มวิเคราะห์ออเดอร์ด้วย AI ทันที</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STATE 2: AUDIT RESULT DISPLAY */}
          {auditResult && (
            <div className="space-y-6">
              
              {/* MAIN RECOMMENDATION CARD */}
              <div
                className={`p-6 rounded-3xl border shadow-xl relative overflow-hidden ${
                  auditResult.recommendation === 'HOLD'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100 shadow-emerald-950/20'
                    : auditResult.recommendation === 'PARTIAL_CLOSE'
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-100 shadow-amber-950/20'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-100 shadow-rose-950/20'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        auditResult.recommendation === 'HOLD'
                          ? 'bg-emerald-500 text-slate-950'
                          : auditResult.recommendation === 'PARTIAL_CLOSE'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-rose-500 text-slate-950'
                      }`}
                    >
                      {auditResult.recommendation === 'HOLD' ? (
                        <CheckCircle2 className="w-7 h-7" />
                      ) : auditResult.recommendation === 'PARTIAL_CLOSE' ? (
                        <ShieldAlert className="w-7 h-7" />
                      ) : (
                        <AlertTriangle className="w-7 h-7" />
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider opacity-80 block">
                        ผลการประเมินจาก AI (AUDIT RECOMMENDATION):
                      </span>
                      <h3 className="text-lg sm:text-xl font-black">
                        {auditResult.recommendationTitle}
                      </h3>
                    </div>
                  </div>

                  {/* Quality Score Badge */}
                  <div className="bg-slate-950/80 p-3 rounded-2xl border border-white/10 text-center shrink-0 min-w-[130px]">
                    <span className="text-[10px] text-slate-400 block font-medium">
                      คะแนนความสมบูรณ์จุดเข้า
                    </span>
                    <span className="text-xl font-black text-amber-400">
                      {auditResult.qualityScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                    </span>
                  </div>
                </div>

                {/* Summary Description */}
                <p className="mt-4 text-xs sm:text-sm leading-relaxed opacity-90">
                  {auditResult.recommendationSummary}
                </p>
              </div>

              {/* STRUCTURE ANALYSIS CARD */}
              <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <BarChart2 className="w-4 h-4 text-cyan-400" />
                  การวิเคราะห์สภาวะกราฟปัจจุบัน (Chart & Market Structure Review):
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {auditResult.structureAnalysis}
                </p>
              </div>

              {/* CAUTION POINTS & RISK WARNINGS */}
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-amber-300 flex items-center gap-2 border-b border-amber-500/20 pb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  จุดข้อควรระวังสำคัญ (Caution Points & Risk Factors):
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {auditResult.cautionPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-950/50 p-2.5 rounded-xl border border-amber-500/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* MANAGEMENT ADVICE & ADJUSTMENTS */}
              <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  คำแนะนำการบริหารจัดการออเดอร์ (Actionable Trade Management):
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                  {auditResult.managementAdvice}
                </p>

                {/* Target Adjustments Table */}
                {auditResult.targetAdjustment && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">SL แนะนำปรับใหม่</span>
                      <span className="text-xs font-bold text-rose-400">
                        {auditResult.targetAdjustment.suggestedSl || '-'}
                      </span>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">TP แนะนำปรับใหม่</span>
                      <span className="text-xs font-bold text-emerald-400">
                        {auditResult.targetAdjustment.suggestedTp || '-'}
                      </span>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">ระยะ Trailing Stop</span>
                      <span className="text-xs font-bold text-cyan-300">
                        {auditResult.targetAdjustment.trailingStopPips || '-'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* CHART PREVIEW IF AVAILABLE */}
              {chartImage && (
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3">
                  <span className="text-[11px] font-bold text-slate-400 mb-2 block">
                    รูปภาพกราฟที่ใช้ในการวิเคราะห์ครั้งนี้ ({auditResult.timeframe}):
                  </span>
                  <img
                    src={chartImage}
                    alt="Audited Chart"
                    className="w-full max-h-80 object-contain rounded-xl border border-slate-800"
                  />
                </div>
              )}

              {/* RESET BUTTON */}
              <button
                onClick={handleReset}
                className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span>วิเคราะห์ออเดอร์ถัดไป (Analyze Another Position)</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

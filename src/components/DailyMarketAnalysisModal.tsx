import React, { useState, useRef } from 'react';
import { DailyMarketAnalysisResult, UserProfile } from '../types';
import { compressImageDataUrl } from '../lib/geminiAnalyzer';
import {
  X,
  Upload,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  Compass,
  Zap,
  AlertTriangle,
  ShieldAlert,
  Target,
  Layers,
  CheckCircle2,
  Sparkles,
  BarChart,
  DollarSign,
  Globe,
  Clock,
  Flame,
  CandlestickChart,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

interface DailyMarketAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const DailyMarketAnalysisModal: React.FC<DailyMarketAnalysisModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [symbol, setSymbol] = useState<string>('XAU/USD (Gold)');
  const [customSymbol, setCustomSymbol] = useState<string>('');
  const [chartImage, setChartImage] = useState<string | null>(null);
  const [customNotes, setCustomNotes] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<DailyMarketAnalysisResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg('ขนาดไฟล์รูปภาพเกิน 8MB กรุณาเลือกรูปอื่น');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setChartImage(reader.result as string);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setChartImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const activeSymbol = symbol === 'CUSTOM' ? (customSymbol.trim() || 'Custom Asset') : symbol;

    try {
      const compressedImage = chartImage ? await compressImageDataUrl(chartImage) : null;

      const response = await fetch('/api/daily-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: activeSymbol,
          chartImageBase64: compressedImage,
          customNotes,
          customApiKey: user?.apiKey,
        }),
      });

      if (!response.ok) {
        let errText = 'เกิดข้อผิดพลาดในการประเมินสภาวะตลาดประจำวัน';
        try {
          const errData = await response.json();
          errText = errData.error || errText;
        } catch {}
        throw new Error(errText);
      }

      const data: DailyMarketAnalysisResult = await response.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error('Daily analysis error:', err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดระหว่างการวิเคราะห์ตลาด');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setErrorMsg(null);
  };

  const presetSymbols = [
    'XAU/USD (Gold)',
    'EUR/USD',
    'GBP/USD',
    'BTC/USD',
    'USD/JPY',
    'USOIL (Crude Oil)',
    'CUSTOM'
  ];

  const getMarketConditionBadge = (cond: string) => {
    switch (cond) {
      case 'STRONG_UPTREND':
        return {
          label: '📈 เทรนด์ขาขึ้นแข็งแกร่ง (Strong Uptrend)',
          bgColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          icon: <TrendingUp className="w-4 h-4 text-emerald-400" />
        };
      case 'STRONG_DOWNTREND':
        return {
          label: '📉 เทรนด์ขาลงแข็งแกร่ง (Strong Downtrend)',
          bgColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          icon: <TrendingDown className="w-4 h-4 text-rose-400" />
        };
      case 'SIDEWAYS_RANGE':
        return {
          label: '↔️ ไซด์เวย์สะสมราคา (Sideways Ranging)',
          bgColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          icon: <Activity className="w-4 h-4 text-amber-400" />
        };
      case 'SIDEWAYS_VOLATILE':
        return {
          label: '⚡ ไซด์เวย์ผันผวนสูง (High Volatility Choppy)',
          bgColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          icon: <Zap className="w-4 h-4 text-purple-400" />
        };
      case 'BREAKOUT_PENDING':
        return {
          label: '💣 จ่ออัดตัวรอเบรกเอาต์ (Breakout Compression)',
          bgColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          icon: <Sparkles className="w-4 h-4 text-cyan-400" />
        };
      default:
        return {
          label: '📊 สภาวะตลาดทั่วไป',
          bgColor: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: <Compass className="w-4 h-4 text-slate-400" />
        };
    }
  };

  const getPreferredSideCard = (side: string) => {
    switch (side) {
      case 'BUY_ADVANTAGE':
        return {
          title: '🟢 ฝั่ง BUY ได้เปรียบตลาดสูง (Bullish Advantage)',
          subtitle: 'เน้นตั้งรับย่อ BUY ตามเทรนด์หลัก ได้เปรียบทั้ง R:R และโอกาสชนะสูง',
          gradient: 'from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-500/50 shadow-emerald-950/40',
          textColor: 'text-emerald-300',
          badge: 'bg-emerald-500 text-slate-950 font-black'
        };
      case 'SELL_ADVANTAGE':
        return {
          title: '🔴 ฝั่ง SELL ได้เปรียบตลาดสูง (Bearish Advantage)',
          subtitle: 'เน้นเด้ง SELL บริเวณ Supply Zone หรือแนวต้านหลัก ได้เปรียบทางสถิติ',
          gradient: 'from-rose-950/80 via-slate-900 to-slate-950 border-rose-500/50 shadow-rose-950/40',
          textColor: 'text-rose-300',
          badge: 'bg-rose-500 text-slate-950 font-black'
        };
      case 'BOTH_SIDES_RANGE':
        return {
          title: '🔄 ได้เปรียบทั้งสองฝั่งในกรอบ (Range Trading)',
          subtitle: 'ซื้อแนวรับ ขายแนวต้าน เล่นตามกรอบ Sideways รอรักษาระยะเข้า-ออกชัดเจน',
          gradient: 'from-cyan-950/80 via-slate-900 to-slate-950 border-cyan-500/50 shadow-cyan-950/40',
          textColor: 'text-cyan-300',
          badge: 'bg-cyan-500 text-slate-950 font-black'
        };
      case 'WAIT_SIDEWAYS':
      default:
        return {
          title: '⚠️ แนะนำชะลอการเทรด / ตลาดไร้ทิศทาง (Wait & See)',
          subtitle: 'ตลาดผันผวนไร้โครงสร้างชัดเจน แนะนำรอให้เกิด Breakout ยืนยันฝั่งก่อนเข้า',
          gradient: 'from-amber-950/80 via-slate-900 to-slate-950 border-amber-500/50 shadow-amber-950/40',
          textColor: 'text-amber-300',
          badge: 'bg-amber-500 text-slate-950 font-black'
        };
    }
  };

  const getSentimentBadge = (sentiment?: string) => {
    switch (sentiment) {
      case 'BULLISH':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold text-[10px]">Bullish Catalyst 🟢</span>;
      case 'BEARISH':
        return <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold text-[10px]">Bearish Catalyst 🔴</span>;
      default:
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold text-[10px]">Neutral Sentiment ⚪</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-500 text-slate-950 shadow-md">
              <Compass className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                วิเคราะห์สภาวะตลาด & หน้าเทรดประจำวัน
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                  Daily Intelligence
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                ประเมินข่าวสาร มหภาค วอลุ่มการเทรด ช่วงเวลา รูปแบบแท่งเทียน & แพทเทิร์นอัตโนมัติ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          
          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!analysisResult ? (
            /* INPUT FORM */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Asset Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-cyan-400" />
                  เลือกสินทรัพย์ที่ต้องการให้ AI รวบรวมข้อมูลและวิเคราะห์สภาวะตลาด:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {presetSymbols.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setSymbol(item)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition border text-center ${
                        symbol === item
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-md shadow-cyan-950/50'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-800'
                      }`}
                    >
                      {item === 'CUSTOM' ? 'กำหนดเอง...' : item}
                    </button>
                  ))}
                </div>

                {symbol === 'CUSTOM' && (
                  <input
                    type="text"
                    value={customSymbol}
                    onChange={(e) => setCustomSymbol(e.target.value)}
                    placeholder="ระบุชื่อคู่เงิน เช่น AUD/CAD, US30, NVDA"
                    className="w-full mt-2 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                )}
              </div>

              {/* Optional Chart Upload (D1 / H4 / H1) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    แนบรูปภาพกราฟ (ออปชั่นเสริม - AI สแกนผสานวิเคราะห์เพิ่ม):
                  </span>
                  <span className="text-[10px] text-cyan-400 font-normal">
                    (หากไม่แนบ AI จะใช้วิเคราะห์อัตโนมัติ)
                  </span>
                </label>

                {chartImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-2 group">
                    <img
                      src={chartImage}
                      alt="Uploaded Market Chart"
                      className="w-full max-h-56 object-contain rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-4 right-4 bg-rose-600/90 hover:bg-rose-600 text-white p-2 rounded-xl text-xs shadow-lg backdrop-blur-sm transition flex items-center gap-1"
                    >
                      <X className="w-4 h-4" /> ลบรูปภาพ
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 text-center bg-slate-950/60 hover:bg-slate-950 transition cursor-pointer group"
                  >
                    <Upload className="w-8 h-8 mx-auto text-slate-500 group-hover:text-cyan-400 transition mb-2" />
                    <p className="text-xs font-medium text-slate-300">
                      คลิกเพื่ออัปโหลดรูปภาพกราฟ (D1, H4, H1) หากต้องการวิเคราะห์ร่วมกับรูปกราฟของคุณ
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      รองรับไฟล์ PNG, JPG, WEBP (สูงสุด 8MB)
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Custom Trader Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  หมายเหตุเพิ่มเติม / ข้อกังวลส่วนตัว (ไม่บังคับ):
                </label>
                <textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  rows={2}
                  placeholder="เช่น กังวลข่าวตัวเลข CPI คืนนี้, ราคากำลังติดแนวต้านสำคัญ H4 2400"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 transition shadow-xl shadow-cyan-950/50 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>AI กำลังรวบรวมข่าวสาร วอลุ่ม แท่งเทียน & แพทเทิร์น...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>วิเคราะห์สภาวะตลาด & หาหน้าเทรดที่ได้เปรียบ</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* RESULTS DISPLAY */
            <div className="space-y-5 animate-fadeIn">
              
              {/* Asset Header & Refresh */}
              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400">
                    <BarChart className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      การประเมินสภาวะตลาดประจำวัน (Daily Market Report)
                    </span>
                    <h4 className="text-base font-black text-slate-100">{analysisResult.symbol}</h4>
                  </div>
                </div>

                {/* Market Condition Badge */}
                {(() => {
                  const badgeInfo = getMarketConditionBadge(analysisResult.marketCondition);
                  return (
                    <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${badgeInfo.bgColor}`}>
                      {badgeInfo.icon}
                      <span>{badgeInfo.label}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Primary Market Bias / Advantage Banner */}
              {(() => {
                const sideCard = getPreferredSideCard(analysisResult.preferredSide);
                return (
                  <div className={`rounded-3xl border p-5 shadow-2xl bg-gradient-to-br ${sideCard.gradient} space-y-3`}>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider ${sideCard.badge}`}>
                        Primary Market Advantage
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(analysisResult.timestamp).toLocaleDateString('th-TH', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <h3 className={`text-lg sm:text-xl font-black ${sideCard.textColor}`}>
                      {sideCard.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {sideCard.subtitle}
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-200 leading-relaxed">
                      <span className="font-bold text-slate-400 block mb-1">เหตุผลความได้เปรียบทางสถิติ (Bias Analysis):</span>
                      <p className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                        {analysisResult.advantageSummary}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Daily Executive Summary (บทสรุปภาพรวมประจำวัน) */}
              {analysisResult.dailyExecutiveSummary && (
                <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-2xl border border-cyan-500/30 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-extrabold text-cyan-300">
                      บทสรุปผู้บริหารประจำวัน (Executive Daily Summary):
                    </h4>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 font-medium">
                    {analysisResult.dailyExecutiveSummary}
                  </p>
                </div>
              )}

              {/* News & Macro Fundamental Analysis */}
              {analysisResult.newsAndMacro && (
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-200 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-400" />
                      ข่าวสารเศรษฐกิจ & แรงสนับสนุนมหภาค (Macro Fundamental Drivers):
                    </h4>
                    {getSentimentBadge(analysisResult.newsAndMacro.sentimentScore)}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    {analysisResult.newsAndMacro.summary}
                  </p>

                  {analysisResult.newsAndMacro.catalysts && analysisResult.newsAndMacro.catalysts.length > 0 && (
                    <div className="space-y-1 text-xs">
                      <span className="text-[11px] font-bold text-slate-400">🔥 ข่าวสำคัญ / ตัวแปรขับเคลื่อนราคาหลัก:</span>
                      <ul className="space-y-1">
                        {analysisResult.newsAndMacro.catalysts.map((cat, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-slate-300">
                            <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{cat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Volume & Trading Session Dynamics */}
              {analysisResult.volumeAndSessions && (
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    วอลุ่มการเทรด & ช่วงเวลาตลาด (Session & Volume Dynamics):
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-xl space-y-1">
                      <span className="font-bold text-purple-300 text-[11px] flex items-center gap-1">
                        ⏰ ช่วงเวลาการเทรดที่ได้เปรียบ:
                      </span>
                      <p className="text-slate-300 leading-relaxed">{analysisResult.volumeAndSessions.sessionAdvice}</p>
                    </div>

                    <div className="bg-slate-900/70 border border-slate-800 p-3 rounded-xl space-y-1">
                      <span className="font-bold text-cyan-300 text-[11px] flex items-center gap-1">
                        ⚡ Killzone & ช่วงผันผวนสูง:
                      </span>
                      <p className="text-slate-300 leading-relaxed">{analysisResult.volumeAndSessions.activeSessionKillzone}</p>
                    </div>
                  </div>

                  <div className="bg-purple-950/20 border border-purple-500/20 p-3 rounded-xl text-xs text-purple-200">
                    <span className="font-bold text-purple-300 block mb-0.5">📊 สภาวะวอลุ่มการซื้อขาย (Volume Analysis):</span>
                    <span>{analysisResult.volumeAndSessions.volumeAnalysis}</span>
                  </div>
                </div>
              )}

              {/* Price Action & Candle Patterns */}
              {analysisResult.priceActionPatterns && (
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-200 flex items-center gap-2">
                    <CandlestickChart className="w-4 h-4 text-teal-400" />
                    รูปแบบแท่งเทียน & Chart Patterns (Price Action Structure):
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-teal-950/20 border border-teal-500/20 p-3 rounded-xl space-y-1">
                      <span className="font-bold text-teal-300 text-[11px]">🕯️ รูปแบบแท่งเทียนเด่น:</span>
                      <p className="text-slate-300 leading-relaxed">{analysisResult.priceActionPatterns.candlestickPattern}</p>
                    </div>

                    <div className="bg-cyan-950/20 border border-cyan-500/20 p-3 rounded-xl space-y-1">
                      <span className="font-bold text-cyan-300 text-[11px]">📐 Chart Pattern:</span>
                      <p className="text-slate-300 leading-relaxed">{analysisResult.priceActionPatterns.chartPattern}</p>
                    </div>

                    <div className="bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-xl space-y-1">
                      <span className="font-bold text-emerald-300 text-[11px]">🏗️ โครงสร้างตลาด:</span>
                      <p className="text-slate-300 leading-relaxed">{analysisResult.priceActionPatterns.marketStructure}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Chart Image Analysis Note (If attached) */}
              {analysisResult.chartImageAnalysisNote && (
                <div className="bg-gradient-to-r from-cyan-950/60 to-teal-950/60 border border-cyan-500/40 p-4 rounded-2xl text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-300 font-extrabold">
                    <ImageIcon className="w-4 h-4" />
                    <span>ผลการวิเคราะห์เจาะลึกเพิ่มเติมจากรูปภาพกราฟที่แนบ:</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-cyan-500/20">
                    {analysisResult.chartImageAnalysisNote}
                  </p>
                </div>
              )}

              {/* Key Levels Section (Demand / Supply / Pivot) */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-200 flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-400" />
                  กรอบระดับราคาสำคัญประจำวัน (Key Support & Resistance Levels):
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Supply / Resistance */}
                  <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-3 space-y-1.5">
                    <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                      🔴 แนวต้านสำคัญ / Supply Zones:
                    </span>
                    <ul className="space-y-1 text-slate-300">
                      {analysisResult.keyLevels.resistanceZones.map((res, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                          <span>{res}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Demand / Support */}
                  <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 space-y-1.5">
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      🟢 แนวรับสำคัญ / Demand Zones:
                    </span>
                    <ul className="space-y-1 text-slate-300">
                      {analysisResult.keyLevels.supportZones.map((sup, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span>{sup}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {analysisResult.keyLevels.pivotPoint && (
                  <div className="text-[11px] bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-slate-300 flex items-center justify-between">
                    <span className="font-bold text-slate-400">จุดเปลี่ยนสภาวะ (Pivot Key Level):</span>
                    <span className="font-mono text-cyan-300 font-bold">{analysisResult.keyLevels.pivotPoint}</span>
                  </div>
                )}
              </div>

              {/* Daily Strategy & Trading Plan */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-200 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  คำแนะนำกลยุทธ์การเทรดประจำวัน (Daily Trade Execution Plan):
                </h4>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed font-medium">
                  {analysisResult.dailyStrategy}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {analysisResult.tradingPlan.buyPlan && (
                    <div className="bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-xl space-y-1">
                      <span className="font-bold text-emerald-400 text-[11px]">🟢 แผนการเข้า BUY:</span>
                      <p className="text-slate-300 leading-relaxed">{analysisResult.tradingPlan.buyPlan}</p>
                    </div>
                  )}

                  {analysisResult.tradingPlan.sellPlan && (
                    <div className="bg-rose-950/20 border border-rose-500/20 p-3 rounded-xl space-y-1">
                      <span className="font-bold text-rose-400 text-[11px]">🔴 แผนการเข้า SELL:</span>
                      <p className="text-slate-300 leading-relaxed">{analysisResult.tradingPlan.sellPlan}</p>
                    </div>
                  )}
                </div>

                {analysisResult.tradingPlan.noTradeCondition && (
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300 block mb-0.5">เงื่อนไขการงดเทรด (No-Trade Rule):</span>
                      <span>{analysisResult.tradingPlan.noTradeCondition}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Risk Factors */}
              {analysisResult.riskFactors.length > 0 && (
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-2 text-xs">
                  <h4 className="font-extrabold text-slate-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    ปัจจัยความเสี่ยง & ข่าวเศรษฐกิจประจำวันที่ต้องระวัง:
                  </h4>
                  <ul className="space-y-1 text-slate-300">
                    {analysisResult.riskFactors.map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span>วิเคราะห์สินทรัพย์อื่น / เปลี่ยนข้อมูล</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

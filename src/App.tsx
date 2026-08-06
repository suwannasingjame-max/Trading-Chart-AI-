import React, { useState, useEffect } from 'react';
import { ChartImageInput, StrategyType, AnalysisResult, UserProfile, SubscriptionPlanType, AnalysisMode } from './types';
import { compressAllChartImages, runClientGeminiAnalysis } from './lib/geminiAnalyzer';
import { SAMPLE_PRESETS, SCALPING_SAMPLE_PRESETS, SamplePreset } from './data/samplePresets';
import { Navbar } from './components/Navbar';
import { StrategySelector } from './components/StrategySelector';
import { ChartUploader } from './components/ChartUploader';
import { AnalysisSummaryHeader } from './components/AnalysisSummaryHeader';
import { AnnotatedChartViewer } from './components/AnnotatedChartViewer';
import { SummaryTable } from './components/SummaryTable';
import { PositionSizeCalculator } from './components/PositionSizeCalculator';
import { AnalysisHistoryModal } from './components/AnalysisHistoryModal';
import { HelpModal } from './components/HelpModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { EaStoreModal } from './components/EaStoreModal';
import { PositionAuditModal } from './components/PositionAuditModal';
import { DailyMarketAnalysisModal } from './components/DailyMarketAnalysisModal';
import { GeminiApiKeyCard } from './components/GeminiApiKeyCard';
import { PasscodeModal } from './components/PasscodeModal';
import { TradingViewModal } from './components/TradingViewModal';
import { Sparkles, Play, RefreshCw, AlertCircle, ShieldCheck, ArrowRight, CheckCircle2, LayoutDashboard, Bot, BarChart2, Zap, Compass, TrendingUp } from 'lucide-react';

export default function App() {
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('STANDARD');
  const [strategy, setStrategy] = useState<StrategyType>('SMC');
  const [images, setImages] = useState<ChartImageInput>({
    h4Image: null,
    h1Image: null,
    m30Image: null,
    m15Image: null,
    m5Image: null,
    m1Image: null,
  });
  const [customNotes, setCustomNotes] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isEaStoreOpen, setIsEaStoreOpen] = useState<boolean>(false);
  const [isPositionAuditOpen, setIsPositionAuditOpen] = useState<boolean>(false);
  const [isDailyAnalysisOpen, setIsDailyAnalysisOpen] = useState<boolean>(false);
  const [isPasscodeOpen, setIsPasscodeOpen] = useState<boolean>(false);
  const [isTradingViewOpen, setIsTradingViewOpen] = useState<boolean>(false);

  // User Profile State (Open Access - No Login Required)
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('trading_chart_ai_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse user profile from localStorage', e);
    }
    return {
      id: 'usr_active',
      name: 'Trader AI',
      email: 'trader@ai.app',
      plan: 'PRO',
      dailyAnalysisCount: 0,
      dailyQuotaLimit: 9999,
      isLoggedIn: true,
    };
  });

  // Save User Profile Helper
  const saveUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    try {
      localStorage.setItem('trading_chart_ai_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error('Failed to save user profile to localStorage', e);
    }
  };

  // Update API Key handler
  const handleUpdateApiKey = (newKey: string) => {
    const updated: UserProfile = {
      ...user,
      apiKey: newKey,
    };
    saveUser(updated);
  };

  // Passcode / VIP License Handlers
  const handleActivatePasscode = (passcode: string, plan: string, expiresAt?: string) => {
    const updatedUser: UserProfile = {
      ...user,
      plan: plan === 'PRO_ANNUAL' ? 'PRO_ANNUAL' : 'PRO_MONTHLY',
      dailyQuotaLimit: 9999,
      activatedPasscode: passcode,
      activatedAt: new Date().toISOString(),
      subscriptionExpiresAt: expiresAt,
    };
    saveUser(updatedUser);
  };

  const handleDeactivatePasscode = () => {
    const updatedUser: UserProfile = {
      ...user,
      plan: 'FREE',
      dailyQuotaLimit: 3,
      activatedPasscode: undefined,
      activatedAt: undefined,
      subscriptionExpiresAt: undefined,
    };
    saveUser(updatedUser);
  };

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('trading_chart_ai_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse history from localStorage', e);
    }
  }, []);

  // Save history helper
  const saveToHistory = (newResult: AnalysisResult) => {
    const updated = [newResult, ...history.filter((h) => h.id !== newResult.id)].slice(0, 15);
    setHistory(updated);
    try {
      localStorage.setItem('trading_chart_ai_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('trading_chart_ai_history');
  };

  // Preset Selection Handler
  const handleSelectPreset = (preset: SamplePreset) => {
    setStrategy(preset.strategy);
    const isScalpPreset = preset.id.includes('m1_scalp') || preset.symbol.includes('M1 Scalp');
    if (isScalpPreset) {
      setAnalysisMode('SCALPING');
      setImages({
        h4Image: preset.h4DataUrl,
        h1Image: preset.h1DataUrl,
        m30Image: preset.h1DataUrl,
        m15Image: preset.m15DataUrl,
        m5Image: preset.m15DataUrl,
        m1Image: preset.m15DataUrl,
      });
    } else {
      setAnalysisMode('STANDARD');
      setImages({
        h4Image: preset.h4DataUrl,
        h1Image: preset.h1DataUrl,
        m30Image: null,
        m15Image: preset.m15DataUrl,
        m5Image: null,
        m1Image: null,
      });
    }
    setErrorMsg(null);
  };

  // Primary AI Analysis Execution Handler
  const handleRunAnalysis = async () => {
    if (!images.h4Image && !images.h1Image && !images.m30Image && !images.m15Image && !images.m5Image && !images.m1Image) {
      setErrorMsg('กรุณาอัปโหลดรูปภาพกราฟอย่างน้อย 1 Timeframe');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStep('กำลังบีบอัดรูปภาพและเตรียมข้อมูลส่ง AI...');

    try {
      // 1. Compress base64 images so they are lightweight (< 1MB total instead of 15MB+)
      const optimizedImages = await compressAllChartImages(images);

      const stepText = analysisMode === 'SCALPING'
        ? 'กำลังประมวลผลโครงสร้างราคาสายซิ่ง 6 Timeframes (H4, H1, M30, M15, M5, M1) เพื่อเข้าเทรดสไนเปอร์ M1...'
        : 'กำลังประมวลผลโครงสร้างราคา Multi-Timeframe (H4 → H1 → M15)...';
      
      setTimeout(() => setLoadingStep(stepText), 800);
      setTimeout(() => setLoadingStep(`วิเคราะห์ตามระบบ ${strategy} (ค้นหาจุดเด้ง / SL แคบ / R:R สูง)...`), 2200);

      let result: AnalysisResult | null = null;

      // 2. If user provided a custom API Key, try direct client-side Gemini call first
      if (user.apiKey && user.apiKey.trim()) {
        try {
          result = await runClientGeminiAnalysis({
            images: optimizedImages,
            strategy,
            analysisMode,
            customNotes,
            apiKey: user.apiKey,
          });
        } catch (clientErr: any) {
          console.warn('Direct client-side Gemini call encountered an issue, trying server endpoint:', clientErr?.message);
        }
      }

      // 3. Fallback to server endpoint if client call was skipped or failed
      if (!result) {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            h4Image: optimizedImages.h4Image,
            h1Image: optimizedImages.h1Image,
            m30Image: optimizedImages.m30Image,
            m15Image: optimizedImages.m15Image,
            m5Image: optimizedImages.m5Image,
            m1Image: optimizedImages.m1Image,
            strategy,
            analysisMode,
            customNotes,
            customApiKey: user.apiKey,
          }),
        });

        if (!response.ok) {
          let errorMsgText = 'การวิเคราะห์ล้มเหลว กรุณาลองใหม่อีกครั้ง';
          try {
            const errorData = await response.json();
            errorMsgText = errorData.error || errorMsgText;
          } catch {
            errorMsgText = `เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ (${response.status} ${response.statusText})`;
          }

          // If server failed (e.g. 500 on Vercel) and user has API key, retry client side
          if (user.apiKey && user.apiKey.trim()) {
            result = await runClientGeminiAnalysis({
              images: optimizedImages,
              strategy,
              analysisMode,
              customNotes,
              apiKey: user.apiKey,
            });
          } else {
            throw new Error(
              `${errorMsgText} • หากคุณใช้งานผ่าน Vercel / เว็บไซต์ที่โฮสต์ภายนอก กรุณากรอก Google Gemini API Key ส่วนตัวในกล่องสีทองด้านบนเพื่อเปิดการวิเคราะห์ AI ฟรีได้ทันที!`
            );
          }
        } else {
          const resultData = await response.json();
          result = {
            ...resultData,
            analysisMode,
          };
        }
      }

      if (result) {
        setCurrentAnalysis(result);
        saveToHistory(result);

        // Scroll to results smooth
        setTimeout(() => {
          document.getElementById('analysis-result-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }

    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0718] text-slate-100 font-sans selection:bg-yellow-400 selection:text-purple-950 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenEaStore={() => setIsEaStoreOpen(true)}
        onOpenPositionAudit={() => setIsPositionAuditOpen(true)}
        onOpenDailyAnalysis={() => setIsDailyAnalysisOpen(true)}
        onOpenPasscode={() => setIsPasscodeOpen(true)}
        onOpenTradingView={() => setIsTradingViewOpen(true)}
        historyCount={history.length}
        user={user}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Intro Hero Header (Compact & Functional) */}
        <div className="bg-gradient-to-r from-[#1b0d3d] via-[#150a30] to-[#2a1708] p-5 rounded-2xl border-2 border-yellow-500/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
          {/* Subtle ambient lighting */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-black bg-yellow-400 text-purple-950 border border-yellow-300 shadow-sm">
                AI Trading Vision v3.6
              </span>
              <span className="text-xs font-semibold text-yellow-200/90">• Multi-Timeframe Chart Analysis Engine</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-100 flex items-center gap-2 flex-wrap">
              <span>วิเคราะห์จุดเข้าเทรดจากรูปภาพกราฟ Multi-Timeframe</span>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-yellow-400 text-purple-950 border border-yellow-300 shadow-sm">
                {analysisMode === 'SCALPING' ? '⚡ โหมดเทรดสายซิ่ง (M15-M5-M1)' : '🎯 โหมดมาตรฐาน (H4-H1-M15)'}
              </span>
            </h1>
            <p className="text-xs text-purple-100/90 leading-relaxed">
              อัปโหลดรูปภาพกราฟ (โหมดมาตรฐาน H4-H1-M15 หรือ ⚡ โหมดสายซิ่ง M15-M5-M1 เข้าเทรด M1 โดนลากน้อย) ให้ AI คำนวณ Entry, SL, TP สรุปเงื่อนไขและวาดบนกราฟ
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap relative z-10">
            <button
              onClick={() => setIsDailyAnalysisOpen(true)}
              className="text-xs font-black px-3.5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-purple-950 border border-yellow-300 shadow-md flex items-center gap-1.5 transition"
            >
              <Compass className="w-4 h-4 text-purple-950" />
              <span>วิเคราะห์สภาวะตลาดประจำวัน</span>
            </button>
            <button
              onClick={() => setIsPositionAuditOpen(true)}
              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-purple-950/90 hover:bg-purple-900 text-yellow-300 border border-yellow-500/40 shadow-md flex items-center gap-1.5 transition"
            >
              <BarChart2 className="w-4 h-4 text-yellow-400" />
              <span>วิเคราะห์ออเดอร์ที่เข้าแล้ว</span>
            </button>
            <button
              onClick={() => setIsHelpOpen(true)}
              className="text-xs font-bold px-3 py-2 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-yellow-200 border border-purple-700 transition shrink-0"
            >
              📖 คู่มือวิธีใช้
            </button>
          </div>
        </div>

        {/* STEP 1: Select Strategy */}
        <StrategySelector
          selectedStrategy={strategy}
          onSelectStrategy={setStrategy}
        />

        {/* STEP 2: Upload Chart Images across 3 Timeframes */}
        <ChartUploader
          images={images}
          onChangeImages={setImages}
          onSelectPreset={handleSelectPreset}
          analysisMode={analysisMode}
          onChangeAnalysisMode={setAnalysisMode}
        />

        {/* Google Gemini Personal API Key Setting Card */}
        <GeminiApiKeyCard
          apiKey={user.apiKey || ''}
          onSaveApiKey={handleUpdateApiKey}
          onOpenPasscode={() => setIsPasscodeOpen(true)}
        />

        {/* Additional User Notes Input */}
        <div className="bg-gradient-to-br from-[#180e35] via-[#120a2a] to-[#1c0f3c] rounded-2xl p-4 border-2 border-yellow-500/30 shadow-md">
          <label className="text-xs font-bold text-yellow-300 block mb-1.5 flex items-center gap-1.5">
            <span>คำแนะนำเพิ่มเติมสำหรับ AI (ระบุจุดที่สนใจ หรือแผนเฉพาะ - Optional):</span>
          </label>
          <input
            type="text"
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="เช่น 'เน้นมองหาจุดซื้อ Buy ที่โซน Demand ข้างล่าง' หรือ 'ช่วยเช็ค Liquidity Sweep ล่าสุด'"
            className="w-full bg-[#090514] border border-yellow-500/40 focus:border-yellow-400 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-yellow-200/40 focus:outline-none transition shadow-inner"
          />
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-red-950/60 border border-red-500/50 p-4 rounded-xl text-red-200 text-xs flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            onClick={handleRunAnalysis}
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-2xl text-sm font-black transition-all duration-300 shadow-xl flex items-center justify-center gap-3 border ${
              isLoading
                ? 'bg-purple-950 text-purple-400 border-purple-900 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-purple-950 border-yellow-300 shadow-purple-950/80 purple-gold-glow hover:scale-[1.005] active:scale-[0.995]'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-purple-950" />
                <span>{loadingStep}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-purple-950" />
                <span>วิเคราะห์กราฟ 3 TF ด้วย AI ทันที (Analyze Charts)</span>
                <ArrowRight className="w-5 h-5 text-purple-950" />
              </>
            )}
          </button>
        </div>

        {/* ANALYSIS RESULTS SECTION */}
        {currentAnalysis && (
          <div id="analysis-result-section" className="space-y-6 pt-6 border-t border-purple-900/60">
            {/* Summary Banner Header */}
            <AnalysisSummaryHeader result={currentAnalysis} />

            {/* Visual Annotated Chart Viewer */}
            <AnnotatedChartViewer result={currentAnalysis} />

            {/* Decision Logic & Conditions Summary Table */}
            <SummaryTable result={currentAnalysis} />

            {/* Position Size & Risk Calculator */}
            <PositionSizeCalculator
              tradeSetup={currentAnalysis.tradeSetup}
              symbol={currentAnalysis.symbol}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-purple-900/40 bg-[#090514] text-center text-xs text-purple-300/60 space-y-2">
        <p className="cursor-default" onDoubleClick={() => setIsAdminOpen(true)}>
          Trading Chart AI Analyzer • AI Multi-Timeframe Trading System Analysis
        </p>
        <div className="flex items-center justify-center gap-4 text-[11px]">
          <button onClick={() => setIsHelpOpen(true)} className="hover:text-yellow-400 underline">
            คู่มือวิธีใช้
          </button>
        </div>
        <p className="text-[10px] text-purple-300/40">
          คำเตือน: การเทรดสัญญาซื้อขายล่วงหน้า ออปชัน และ Forex มีความเสี่ยงสูง ผลวิเคราะห์ AI เป็นเพียงเครื่องมือช่วยคัดกรองสัญญาณ โปรดบริหารความเสี่ยง (Risk Management) ทุกครั้งก่อนส่งคำสั่ง
        </p>
      </footer>

      {/* Modals */}
      <AnalysisHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={(item) => setCurrentAnalysis(item)}
        onClearHistory={handleClearHistory}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      <EaStoreModal
        isOpen={isEaStoreOpen}
        onClose={() => setIsEaStoreOpen(false)}
        user={user}
      />

      <PositionAuditModal
        isOpen={isPositionAuditOpen}
        onClose={() => setIsPositionAuditOpen(false)}
        user={user}
      />

      <DailyMarketAnalysisModal
        isOpen={isDailyAnalysisOpen}
        onClose={() => setIsDailyAnalysisOpen(false)}
        user={user}
      />

      <PasscodeModal
        isOpen={isPasscodeOpen}
        onClose={() => setIsPasscodeOpen(false)}
        user={user}
        onActivatePasscode={handleActivatePasscode}
        onDeactivatePasscode={handleDeactivatePasscode}
      />

      <TradingViewModal
        isOpen={isTradingViewOpen}
        onClose={() => setIsTradingViewOpen(false)}
        defaultSymbol="FPMARKETS:XAUUSD"
        user={user}
        initialStrategy={strategy}
        initialAnalysisMode={analysisMode}
        onAnalysisResult={(result) => {
          setCurrentAnalysis(result);
          setHistory((prev) => [result, ...prev]);
          try {
            const updated = [result, ...history];
            localStorage.setItem('trading_chart_ai_history', JSON.stringify(updated.slice(0, 30)));
          } catch (e) {
            console.warn('Failed to save live chart analysis history', e);
          }
        }}
      />
    </div>
  );
}



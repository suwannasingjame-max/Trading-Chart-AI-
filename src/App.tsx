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
import { Sparkles, Play, RefreshCw, AlertCircle, ShieldCheck, ArrowRight, CheckCircle2, LayoutDashboard, Bot, BarChart2, Zap, Compass } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenEaStore={() => setIsEaStoreOpen(true)}
        onOpenPositionAudit={() => setIsPositionAuditOpen(true)}
        onOpenDailyAnalysis={() => setIsDailyAnalysisOpen(true)}
        onOpenPasscode={() => setIsPasscodeOpen(true)}
        historyCount={history.length}
        user={user}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Intro Hero Header (Compact & Functional) */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AI Trading Vision v3.6
              </span>
              <span className="text-xs text-slate-400">• Multi-Timeframe Chart Analysis Engine</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-100 flex items-center gap-2 flex-wrap">
              <span>วิเคราะห์จุดเข้าเทรดจากรูปภาพกราฟ Multi-Timeframe</span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {analysisMode === 'SCALPING' ? '⚡ โหมดเทรดสายซิ่ง (M15-M5-M1)' : '🎯 โหมดมาตรฐาน (H4-H1-M15)'}
              </span>
            </h1>
            <p className="text-xs text-slate-300">
              อัปโหลดรูปภาพกราฟ (โหมดมาตรฐาน H4-H1-M15 หรือ ⚡ โหมดสายซิ่ง M15-M5-M1 เข้าเทรด M1 โดนลากน้อย) ให้ AI คำนวณ Entry, SL, TP สรุปเงื่อนไขและวาดบนกราฟ
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => setIsDailyAnalysisOpen(true)}
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 text-emerald-300 border border-emerald-500/40 shadow-md flex items-center gap-1.5 transition"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>วิเคราะห์สภาวะตลาดประจำวัน</span>
            </button>
            <button
              onClick={() => setIsPositionAuditOpen(true)}
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-emerald-500/20 hover:from-cyan-500/30 hover:to-emerald-500/30 text-cyan-300 border border-cyan-500/40 shadow-md flex items-center gap-1.5 transition"
            >
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <span>วิเคราะห์ออเดอร์ที่เข้าแล้ว</span>
            </button>
            <button
              onClick={() => setIsHelpOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shrink-0"
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
        <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 shadow-md">
          <label className="text-xs font-bold text-slate-200 block mb-1.5 flex items-center gap-1.5">
            <span>คำแนะนำเพิ่มเติมสำหรับ AI (ระบุจุดที่สนใจ หรือแผนเฉพาะ - Optional):</span>
          </label>
          <input
            type="text"
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="เช่น 'เน้นมองหาจุดซื้อ Buy ที่โซน Demand ข้างล่าง' หรือ 'ช่วยเช็ค Liquidity Sweep ล่าสุด'"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-red-950/40 border border-red-500/40 p-4 rounded-xl text-red-300 text-xs flex items-center justify-between gap-2">
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
                ? 'bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 border-emerald-400/50 shadow-emerald-950/50 hover:scale-[1.005] active:scale-[0.995]'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                <span>{loadingStep}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>วิเคราะห์กราฟ 3 TF ด้วย AI ทันที (Analyze Charts)</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* ANALYSIS RESULTS SECTION */}
        {currentAnalysis && (
          <div id="analysis-result-section" className="space-y-6 pt-6 border-t border-slate-800">
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
      <footer className="mt-12 py-6 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-500 space-y-2">
        <p className="cursor-default" onDoubleClick={() => setIsAdminOpen(true)}>
          Trading Chart AI Analyzer • AI Multi-Timeframe Trading System Analysis
        </p>
        <div className="flex items-center justify-center gap-4 text-[11px]">
          <button onClick={() => setIsHelpOpen(true)} className="hover:text-emerald-400 underline">
            คู่มือวิธีใช้
          </button>
        </div>
        <p className="text-[10px] text-slate-600">
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
    </div>
  );
}



import React, { useState, useEffect } from 'react';
import { ChartImageInput, StrategyType, AnalysisResult, UserProfile, SubscriptionPlanType, AnalysisMode } from './types';
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
import { AuthModal } from './components/AuthModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { EaStoreModal } from './components/EaStoreModal';
import { PositionAuditModal } from './components/PositionAuditModal';
import { GeminiApiKeyCard } from './components/GeminiApiKeyCard';
import { Sparkles, Play, RefreshCw, AlertCircle, ShieldCheck, ArrowRight, CheckCircle2, LayoutDashboard, Bot, BarChart2, Zap } from 'lucide-react';

export default function App() {
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('STANDARD');
  const [strategy, setStrategy] = useState<StrategyType>('SMC');
  const [images, setImages] = useState<ChartImageInput>({
    h4Image: null,
    h1Image: null,
    m15Image: null,
  });
  const [customNotes, setCustomNotes] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isEaStoreOpen, setIsEaStoreOpen] = useState<boolean>(false);
  const [isPositionAuditOpen, setIsPositionAuditOpen] = useState<boolean>(false);

  // User Profile State
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
      id: 'user_guest_' + Date.now().toString().slice(-4),
      name: 'นักเทรดทั่วไป',
      email: 'guest@trader.ai',
      plan: 'FREE',
      dailyAnalysisCount: 0,
      dailyQuotaLimit: 9999,
      isLoggedIn: false,
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

  // Login Handler
  const handleLoginSuccess = (userData: { id?: string; name: string; email: string; plan?: SubscriptionPlanType; apiKey?: string }) => {
    const updated: UserProfile = {
      ...user,
      id: userData.id || user.id || 'usr_' + Date.now(),
      name: userData.name,
      email: userData.email,
      plan: userData.plan || 'FREE',
      apiKey: userData.apiKey !== undefined ? userData.apiKey : user.apiKey,
      dailyQuotaLimit: 9999,
      isLoggedIn: true,
    };
    saveUser(updated);
  };

  // Update API Key handler
  const handleUpdateApiKey = (newKey: string) => {
    const updated: UserProfile = {
      ...user,
      apiKey: newKey,
    };
    saveUser(updated);
  };

  // Sync user profile status from backend (Realtime Pro VIP Sync)
  const syncUserFromBackend = async (targetEmail?: string) => {
    const checkEmail = targetEmail || user.email;
    if (!checkEmail || checkEmail.includes('guest@trader.ai')) return;
    try {
      const res = await fetch(`/api/auth/me?email=${encodeURIComponent(checkEmail)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser((prev) => {
            if (
              prev.plan !== data.user.plan ||
              prev.name !== data.user.name ||
              prev.id !== data.user.id
            ) {
              const updated: UserProfile = {
                ...prev,
                id: data.user.id || prev.id,
                name: data.user.name || prev.name,
                email: data.user.email || prev.email,
                plan: data.user.plan || prev.plan,
                dailyQuotaLimit: 9999,
                isLoggedIn: true,
              };
              try {
                localStorage.setItem('trading_chart_ai_user', JSON.stringify(updated));
              } catch (e) {}
              return updated;
            }
            return prev;
          });
        }
      }
    } catch (e) {
      console.error('Failed to sync user from backend:', e);
    }
  };

  // Periodically sync user status when logged in
  useEffect(() => {
    if (user.isLoggedIn && user.email) {
      syncUserFromBackend(user.email);
      const interval = setInterval(() => {
        syncUserFromBackend(user.email);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [user.isLoggedIn, user.email]);

  // Sync when admin modal closes
  useEffect(() => {
    if (!isAdminOpen && user.isLoggedIn && user.email) {
      syncUserFromBackend(user.email);
    }
  }, [isAdminOpen]);

  // Logout Handler
  const handleLogout = () => {
    const updated: UserProfile = {
      id: 'user_guest_' + Date.now().toString().slice(-4),
      name: 'นักเทรดทั่วไป',
      email: 'guest@trader.ai',
      plan: 'FREE',
      dailyAnalysisCount: 0,
      dailyQuotaLimit: 9999,
      isLoggedIn: false,
    };
    saveUser(updated);
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
    if (preset.id.includes('m1_scalp') || preset.symbol.includes('M1 Scalp')) {
      setAnalysisMode('SCALPING');
    } else {
      setAnalysisMode('STANDARD');
    }
    setImages({
      h4Image: preset.h4DataUrl,
      h1Image: preset.h1DataUrl,
      m15Image: preset.m15DataUrl,
    });
    setErrorMsg(null);
  };

  // Primary AI Analysis Execution Handler
  const handleRunAnalysis = async () => {
    if (!images.h4Image && !images.h1Image && !images.m15Image) {
      setErrorMsg('กรุณาอัปโหลดรูปภาพกราฟอย่างน้อย 1 Timeframe');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStep('กำลังโหลดรูปภาพและเตรียมข้อมูลส่ง AI...');

    try {
      const stepText = analysisMode === 'SCALPING'
        ? 'กำลังประมวลผลโครงสร้างราคาสายซิ่ง M15 -> M5 -> M1 (เข้าเทรดสไนเปอร์ M1)...'
        : 'กำลังประมวลผลโครงสร้างราคา Multi-Timeframe (H4 -> H1 -> M15)...';
      
      setTimeout(() => setLoadingStep(stepText), 1000);
      setTimeout(() => setLoadingStep(`วิเคราะห์ตามระบบ ${strategy} (ค้นหาจุดเด้ง / SL แคบ / R:R สูง)...`), 2500);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          h4Image: images.h4Image,
          h1Image: images.h1Image,
          m15Image: images.m15Image,
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
        throw new Error(errorMsgText);
      }

      const resultData = await response.json();
      const result: AnalysisResult = {
        ...resultData,
        analysisMode,
      };

      setCurrentAnalysis(result);
      saveToHistory(result);

      // Increment Quota if Free plan
      if (user.plan === 'FREE') {
        const updatedUser = {
          ...user,
          dailyAnalysisCount: user.dailyAnalysisCount + 1,
        };
        saveUser(updatedUser);
      }

      // Scroll to results smooth
      setTimeout(() => {
        document.getElementById('analysis-result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);

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
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenEaStore={() => setIsEaStoreOpen(true)}
        onOpenPositionAudit={() => setIsPositionAuditOpen(true)}
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
              📖 คู่มือวิเคราะห์กราฟ
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
          <button onClick={() => setIsAuthOpen(true)} className="hover:text-emerald-400 underline">
            บัญชีผู้ใช้งาน
          </button>
          <span>•</span>
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

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        onLoginSuccess={handleLoginSuccess}
        onUpdateApiKey={handleUpdateApiKey}
        onLogout={handleLogout}
        isMandatory={false}
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
    </div>
  );
}


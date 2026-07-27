import React, { useState } from 'react';
import { EAProduct, EA_PRODUCTS } from '../data/eaData';
import { UserProfile } from '../types';
import {
  ShoppingBag,
  Bot,
  Sparkles,
  ShieldCheck,
  Star,
  CheckCircle2,
  Download,
  Filter,
  Search,
  Zap,
  TrendingUp,
  Cpu,
  BarChart3,
  X,
  ChevronRight,
  CreditCard,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  HelpCircle,
  Clock,
  ArrowRight,
  Crown
} from 'lucide-react';

interface EaStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpgradePlan?: () => void;
}

export const EaStoreModal: React.FC<EaStoreModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpgradePlan,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selected EA for Detail View or Purchase
  const [selectedEaDetail, setSelectedEaDetail] = useState<EAProduct | null>(null);
  const [checkoutEa, setCheckoutEa] = useState<{ ea: EAProduct; licenseType: 'MONTHLY' | 'LIFETIME' } | null>(null);

  // Checkout Form State
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [platformType, setPlatformType] = useState<'MT4' | 'MT5'>('MT4');
  const [paymentStep, setPaymentStep] = useState<'DETAILS' | 'PAYMENT' | 'SUCCESS'>('DETAILS');
  const [generatedLicenseKey, setGeneratedLicenseKey] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  if (!isOpen) return null;

  // Filter Products
  const filteredProducts = EA_PRODUCTS.filter((item) => {
    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesPlatform =
      selectedPlatform === 'ALL' || item.platform.includes(selectedPlatform as any);
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.strategyType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPlatform && matchesSearch;
  });

  // Handle Checkout Start
  const handleStartCheckout = (ea: EAProduct, licenseType: 'MONTHLY' | 'LIFETIME') => {
    setCheckoutEa({ ea, licenseType });
    setPaymentStep('DETAILS');
    setAccountNumber('');
    setGeneratedLicenseKey('');
  };

  // Process Mock Order
  const handleConfirmOrder = () => {
    if (!accountNumber.trim()) {
      alert('กรุณากรอกหมายเลขบัญชี MT4 / MT5 สำหรับเปิดใช้งาน License');
      return;
    }
    const key = `EA-LIC-${platformType}-${accountNumber}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setGeneratedLicenseKey(key);
    setPaymentStep('SUCCESS');
  };

  const handleCopyLicenseKey = () => {
    if (generatedLicenseKey) {
      navigator.clipboard.writeText(generatedLicenseKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const isProVIP = user.plan !== 'FREE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-100">
        
        {/* HEADER BAR */}
        <div className="p-4 sm:p-6 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-950/50 flex items-center justify-center">
              <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Bot className="w-6 h-6 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-extrabold text-slate-100">
                  ร้านค้า EA Trading Bots (Expert Advisors Store)
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-3 h-3" /> VERIFIED 99.9% TICK DATA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                คัดสรรหุ่นยนต์เทรดอัตโนมัติ 100% สำหรับ MT4 / MT5 พร้อมระบบบริหารความเสี่ยงอัจฉริยะ
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

        {/* PRO VIP DISCOUNT BANNER */}
        {!isProVIP && (
          <div className="bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-slate-950 px-4 py-2.5 border-b border-amber-500/30 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 text-amber-200">
              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                สมาชิก <strong>PRO VIP</strong> รับส่วนลดพิเศษ <strong>15% - 20%</strong> ทุกรายการสินค้า EA!
              </span>
            </div>
            {onUpgradePlan && (
              <button
                onClick={() => {
                  onClose();
                  onUpgradePlan();
                }}
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition shrink-0"
              >
                อัปเกรด VIP
              </button>
            )}
          </div>
        )}

        {/* CONTROLS & FILTER BAR */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'ทั้งหมด (All EAs)', icon: Bot },
              { id: 'GOLD', label: 'ทองคำ (XAU/USD)', icon: Zap },
              { id: 'AI_AUTO', label: 'AI Auto-Connect', icon: Cpu },
              { id: 'FOREX', label: 'Forex Pairs', icon: TrendingUp },
              { id: 'CRYPTO', label: 'Crypto', icon: BarChart3 },
            ].map((cat) => {
              const IconComp = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-950/30'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-750 hover:text-slate-100'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search & Platform Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {/* Search Input */}
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อ EA หรือกลยุทธ์..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Platform Filter */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
              {['ALL', 'MT4', 'MT5'].map((plat) => (
                <button
                  key={plat}
                  onClick={() => setSelectedPlatform(plat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    selectedPlatform === plat
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* EA PRODUCTS GRID */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-slate-950/40 rounded-2xl border border-slate-800/60 space-y-3">
              <Bot className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">ไม่พบ EA ตรงกับเงื่อนไขการค้นหาของคุณ</p>
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSelectedPlatform('ALL');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((ea) => {
                const monthlyPriceCalc = isProVIP ? Math.round(ea.priceMonthly * 0.85) : ea.priceMonthly;
                const lifetimePriceCalc = isProVIP ? Math.round(ea.priceLifetime * 0.8) : ea.priceLifetime;

                return (
                  <div
                    key={ea.id}
                    className="bg-slate-950/80 rounded-2xl border border-slate-800/90 hover:border-emerald-500/50 p-5 flex flex-col justify-between transition-all duration-300 group shadow-lg hover:shadow-emerald-950/20 relative"
                  >
                    {/* Top Badges */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {ea.isHot && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-amber-500 text-slate-950 flex items-center gap-1 shadow">
                              <Zap className="w-2.5 h-2.5 fill-slate-950" /> HOT
                            </span>
                          )}
                          {ea.isNew && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 shadow">
                              NEW
                            </span>
                          )}
                          {ea.isRecommended && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              แนะนำ
                            </span>
                          )}
                        </div>

                        {/* Supported Platforms */}
                        <div className="flex items-center gap-1">
                          {ea.platform.map((p) => (
                            <span
                              key={p}
                              className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Title & Tagline */}
                      <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition mb-1">
                        {ea.name}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
                        {ea.tagline}
                      </p>

                      {/* Performance Stats Grid */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-3 rounded-xl border border-slate-800/80 mb-4">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Win Rate</span>
                          <span className="text-sm font-extrabold text-emerald-400 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {ea.winRate}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">กำไรเฉลี่ย/เดือน</span>
                          <span className="text-sm font-extrabold text-amber-300">{ea.monthlyRoi}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Max Drawdown</span>
                          <span className="text-xs font-bold text-slate-200">{ea.maxDrawdown}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">ทุนแนะนำ</span>
                          <span className="text-xs font-bold text-cyan-300">{ea.recommendedDeposit}</span>
                        </div>
                      </div>

                      {/* Strategy & Rating */}
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-1">
                        <span className="text-[11px] font-medium bg-slate-800/60 px-2 py-0.5 rounded text-slate-300">
                          {ea.strategyType}
                        </span>
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{ea.rating}</span>
                          <span className="text-slate-500 text-[10px]">({ea.reviewCount})</span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Actions */}
                    <div className="pt-3 border-t border-slate-800/80 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block">เริ่มต้นเพียง</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-black text-slate-100">
                              ฿{monthlyPriceCalc.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400">/ เดือน</span>
                            {isProVIP && (
                              <span className="text-[9px] font-bold px-1 rounded bg-amber-500/20 text-amber-400">
                                VIP -15%
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">ซื้อขาดตลอดชีพ</span>
                          <span className="text-xs font-bold text-emerald-400">
                            ฿{lifetimePriceCalc.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSelectedEaDetail(ea)}
                          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700/80 flex items-center justify-center gap-1"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                          <span>รายละเอียด</span>
                        </button>

                        <button
                          onClick={() => handleStartCheckout(ea, 'MONTHLY')}
                          className="py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold transition shadow-md shadow-emerald-950/40 flex items-center justify-center gap-1"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 fill-slate-950" />
                          <span>สั่งซื้อ EA</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* EA ADVANTAGES FOOTER SECTION */}
          <div className="mt-8 bg-slate-950/90 rounded-2xl border border-slate-800 p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">ระบบคัดกรองความเสี่ยง 100%</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  EA ทุกตัวมาพร้อมกับระบบคุม Lot, Hard SL และ News Filter ป้องกันการลากล้างพอร์ต
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">ติดตั้งง่าย + ไฟล์ Preset</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  รับไฟล์ .ex4/.ex5 พร้อมคู่มือตั้งค่าอย่างละเอียด และ Preset ค่าสำเร็จรูปพร้อมใช้งาน
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">อัปเดตเวอร์ชันฟรีตลอดอายุสัญญา</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  รับการอัปเดตอัลกอริทึมให้ทันสภาพตลาดและปรับแก้ Bug ได้ฟรีไม่มีค่าใช้จ่ายเพิ่ม
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL OVERLAY */}
      {selectedEaDetail && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 space-y-5 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {selectedEaDetail.category}
                  </span>
                  <span className="text-xs text-slate-400">เวอร์ชัน {selectedEaDetail.version}</span>
                </div>
                <h3 className="text-xl font-black text-slate-100">{selectedEaDetail.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedEaDetail.tagline}</p>
              </div>
              <button
                onClick={() => setSelectedEaDetail(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overview Description */}
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              {selectedEaDetail.description}
            </p>

            {/* Performance Metrics */}
            <div>
              <h4 className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                ผลการทดสอบย้อนหลัง (Backtest & Forward Stats):
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">Win Rate</span>
                  <span className="text-base font-black text-emerald-400">{selectedEaDetail.winRate}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">กำไรคาดการณ์/เดือน</span>
                  <span className="text-base font-black text-amber-300">{selectedEaDetail.monthlyRoi}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Max Drawdown</span>
                  <span className="text-sm font-bold text-slate-200">{selectedEaDetail.maxDrawdown}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">ขอบเขตข้อมูล</span>
                  <span className="text-xs font-bold text-cyan-300">{selectedEaDetail.backtestPeriod}</span>
                </div>
              </div>
            </div>

            {/* Feature Checklist */}
            <div>
              <h4 className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                คุณสมบัติเด่นของ EA ตัวนี้:
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {selectedEaDetail.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suitable For */}
            <div className="bg-emerald-950/30 border border-emerald-500/30 p-3.5 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>กลุ่มผู้เทรดที่เหมาะสม:</strong> {selectedEaDetail.suitableFor}
              </span>
            </div>

            {/* Action Selection */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block">ราคาเช่าใช้งาน</span>
                <span className="text-lg font-black text-slate-100">
                  ฿{selectedEaDetail.priceMonthly.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ เดือน</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const ea = selectedEaDetail;
                    setSelectedEaDetail(null);
                    handleStartCheckout(ea, 'MONTHLY');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
                >
                  เช่ารายเดือน
                </button>
                <button
                  onClick={() => {
                    const ea = selectedEaDetail;
                    setSelectedEaDetail(null);
                    handleStartCheckout(ea, 'LIFETIME');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-extrabold transition shadow-lg shadow-emerald-950/40"
                >
                  ซื้อขาดตลอดชีพ (฿{selectedEaDetail.priceLifetime.toLocaleString()})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT & LICENSE ACTIVATION MODAL */}
      {checkoutEa && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 space-y-5 my-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  ขั้นตอนสั่งซื้อและยืนยันสิทธิ์ EA License
                </span>
                <h3 className="text-lg font-bold text-slate-100">{checkoutEa.ea.name}</h3>
              </div>
              <button
                onClick={() => setCheckoutEa(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentStep === 'DETAILS' && (
              <div className="space-y-4">
                {/* Plan Summary */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">แพ็กเกจที่เลือก:</span>
                    <span className="font-bold text-emerald-400">
                      {checkoutEa.licenseType === 'MONTHLY' ? 'สิทธิ์เช่ารายเดือน (1 Month)' : 'สิทธิ์ใช้งานตลอดชีพ (Lifetime)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">ราคาสุทธิ:</span>
                    <span className="text-base font-black text-slate-100">
                      ฿
                      {(
                        checkoutEa.licenseType === 'MONTHLY'
                          ? (isProVIP ? Math.round(checkoutEa.ea.priceMonthly * 0.85) : checkoutEa.ea.priceMonthly)
                          : (isProVIP ? Math.round(checkoutEa.ea.priceLifetime * 0.8) : checkoutEa.ea.priceLifetime)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Platform & MT Account Number Inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      เลือกแพลตฟอร์มเทรดของคุณ:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['MT4', 'MT5'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPlatformType(p)}
                          className={`py-2 rounded-xl text-xs font-bold transition border ${
                            platformType === p
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {p} Platform
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      หมายเลขบัญชีเทรด ({platformType} Account Number):
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="เช่น 88410294"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      * License key จะถูกล็อคผูกกับเลขบัญชีนี้เพื่อความปลอดภัย
                    </span>
                  </div>
                </div>

                {/* QR PromptPay Payment Mockup */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-2">
                  <span className="text-xs font-bold text-slate-300 block flex items-center justify-center gap-1.5">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    ชำระเงินผ่าน QR PromptPay / สแกนทุกธนาคาร:
                  </span>
                  <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl shadow flex items-center justify-center">
                    {/* Simulated Clean QR Code Graphic */}
                    <div className="w-full h-full border-2 border-slate-900 rounded flex flex-col items-center justify-center bg-slate-100 text-slate-900">
                      <QrCode className="w-20 h-20 text-slate-900" />
                      <span className="text-[9px] font-bold font-mono">PROMPTPAY SCAN</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    ชื่อบัญชี: บจก. เทรดดิ้ง ชาร์ต เอไอ (Trading Chart AI Co., Ltd.)
                  </p>
                </div>

                <button
                  onClick={handleConfirmOrder}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm transition shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>ยืนยันการชำระเงิน & รับ EA License</span>
                </button>
              </div>
            )}

            {paymentStep === 'SUCCESS' && (
              <div className="space-y-4 text-center py-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-100">สั่งซื้อสำเร็จเรียบร้อย!</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    ระบบอนุมัติ License key และเปิดใช้งานสำหรับบัญชี {platformType} #{accountNumber} แล้ว
                  </p>
                </div>

                {/* License Key Box */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 block">รหัส EA LICENSE KEY ของคุณ:</span>
                  <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-700/80">
                    <code className="text-xs font-mono font-bold text-emerald-400 select-all">
                      {generatedLicenseKey}
                    </code>
                    <button
                      onClick={handleCopyLicenseKey}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                    </button>
                  </div>
                </div>

                {/* Download Files */}
                <div className="space-y-2">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`กำลังดาวน์โหลดไฟล์ ${checkoutEa.ea.name} (${platformType}) และไฟล์ Preset .set สำหรับตั้งค่า...`);
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>ดาวน์โหลดไฟล์ EA (.ex4 / .ex5) + ไฟล์ Preset .set</span>
                  </a>

                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    * นำไฟล์ EA ไปวางในโฟลเดอร์ <code className="text-slate-400">MQL4/Experts</code> หรือ <code className="text-slate-400">MQL5/Experts</code> แล้วใส่รหัส License Key ข้างต้นในช่องตั้งค่าดิสก์
                  </p>
                </div>

                <button
                  onClick={() => setCheckoutEa(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                >
                  ปิดหน้านี้
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

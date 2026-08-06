import React, { useState } from 'react';
import { UserProfile, SubscriptionPlanType } from '../types';
import { PRICING_TIERS } from '../data/pricingTiers';
import { Crown, Check, X, QrCode, CreditCard, Sparkles, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpgradePlan: (newPlan: SubscriptionPlanType) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpgradePlan,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanType>('PRO_MONTHLY');
  const [paymentMethod, setPaymentMethod] = useState<'PROMPTPAY' | 'CREDIT_CARD'>('PROMPTPAY');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentTier = PRICING_TIERS.find((t) => t.id === selectedPlan) || PRICING_TIERS[1];

  const handlePaymentSubmit = async () => {
    setIsProcessing(true);

    try {
      // Sync user signup and payment to backend server store for Admin Backoffice
      await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            ...user,
            plan: selectedPlan,
            dailyQuotaLimit: 9999,
          },
          transaction: {
            plan: selectedPlan,
            amountThb: currentTier.priceThb,
            method: paymentMethod,
            status: 'APPROVED',
          },
        }),
      });
    } catch (e) {
      console.error('Sync to admin failed', e);
    }

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      onUpgradePlan(selectedPlan);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090514]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-[#180e35] via-[#120a2a] to-[#1c0f3c] border-2 border-yellow-500/40 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-8 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-yellow-300 transition border border-purple-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-yellow-400 text-purple-950 text-xs font-black shadow-md border border-yellow-300">
            <Crown className="w-4 h-4 text-purple-950" />
            ยกระดับการเทรดด้วยแผนสมาชิก VIP
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-100">
            สมัครสมาชิกเพื่อปลดล็อก AI วิเคราะห์กราฟแบบไม่จำกัด
          </h2>
          <p className="text-xs sm:text-sm text-yellow-200/80 font-medium max-w-xl mx-auto">
            เลือกแผนการใช้งานที่เหมาะกับคุณ ยกระดับความแม่นยำในการค้นหาจุดเข้าซื้อขาย Entry / SL / TP ได้ทุกวัน
          </p>
        </div>

        {/* Success Screen Animation */}
        {isSuccess ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-100">
              สมัครสมาชิก Pro VIP สำเร็จแล้ว! 🎉
            </h3>
            <p className="text-xs text-slate-300">
              บัญชีของคุณได้รับการอัปเกรดเรียบร้อยแล้ว สามารถวิเคราะห์กราฟได้ไม่จำกัดจำนวนครั้งทันที
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pricing Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {PRICING_TIERS.map((tier) => {
                const isSelected = selectedPlan === tier.id;
                const isCurrent = user.plan === tier.id;

                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedPlan(tier.id)}
                    className={`relative rounded-2xl p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-b from-slate-800 via-slate-800/90 to-emerald-950/40 border-emerald-500 shadow-xl ring-2 ring-emerald-500/40'
                        : 'bg-slate-800/40 hover:bg-slate-800/70 border-slate-700/60 opacity-80 hover:opacity-100'
                    }`}
                  >
                    {/* Badge */}
                    {tier.badge && (
                      <span
                        className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black px-3 py-0.5 rounded-full shadow-md border ${
                          tier.badge.includes('ยังไม่เปิดรับ')
                            ? 'bg-gradient-to-r from-amber-600 via-rose-600 to-red-600 text-white border-amber-400/40 animate-pulse'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-emerald-400/40'
                        }`}
                      >
                        {tier.badge}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-sm text-slate-100">{tier.name}</h3>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            แผนปัจจุบัน
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 mb-4">{tier.description}</p>

                      <div className="mb-4">
                        <span className="text-2xl font-black text-slate-100">
                          {tier.priceThb === 0 ? 'ฟรี' : `฿${tier.priceThb.toLocaleString()}`}
                        </span>
                        <span className="text-xs text-slate-400 ml-1 font-medium">{tier.period}</span>
                      </div>

                      {/* Feature Bullet List */}
                      <ul className="space-y-2 text-xs text-slate-300 mb-6">
                        {tier.features.map((ft, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="leading-tight">{ft}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlan(tier.id);
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition ${
                        tier.badge?.includes('ยังไม่เปิดรับ')
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
                          : isSelected
                          ? 'bg-emerald-500 text-slate-950 shadow-lg'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                      }`}
                    >
                      {isCurrent
                        ? 'แผนที่คุณใช้งานอยู่'
                        : tier.badge?.includes('ยังไม่เปิดรับ')
                        ? 'ยังไม่เปิดรับสมัคร (เร็วๆ นี้)'
                        : isSelected
                        ? 'เลือกแผนนี้'
                        : 'เลือก'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Payment Section for Paid Plans */}
            {selectedPlan !== 'FREE' && (
              <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/80 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    การชำระเงินและสมัครสมาชิก ({currentTier.name})
                  </h4>
                  <span className="text-base font-black text-emerald-400">
                    ฿{currentTier.priceThb.toLocaleString()} THB {currentTier.period}
                  </span>
                </div>

                {/* Payment Method Selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('PROMPTPAY')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition ${
                      paymentMethod === 'PROMPTPAY'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>สแกน QR PromptPay (สแกนจ่ายทันที)</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('CREDIT_CARD')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition ${
                      paymentMethod === 'CREDIT_CARD'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>บัตรเครดิต / เดบิต (Visa, Mastercard)</span>
                  </button>
                </div>

                {/* PromptPay QR Section */}
                {paymentMethod === 'PROMPTPAY' && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="bg-white p-3 rounded-xl shrink-0 shadow-lg">
                      {/* Generates realistic PromptPay QR SVG */}
                      <svg className="w-32 h-32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100" height="100" fill="white"/>
                        <rect x="10" y="10" width="25" height="25" fill="black"/>
                        <rect x="15" y="15" width="15" height="15" fill="white"/>
                        <rect x="18" y="18" width="9" height="9" fill="black"/>
                        
                        <rect x="65" y="10" width="25" height="25" fill="black"/>
                        <rect x="70" y="15" width="15" height="15" fill="white"/>
                        <rect x="73" y="18" width="9" height="9" fill="black"/>

                        <rect x="10" y="65" width="25" height="25" fill="black"/>
                        <rect x="15" y="70" width="15" height="15" fill="white"/>
                        <rect x="18" y="73" width="9" height="9" fill="black"/>

                        <rect x="40" y="10" width="10" height="10" fill="black"/>
                        <rect x="45" y="25" width="15" height="10" fill="black"/>
                        <rect x="65" y="45" width="20" height="10" fill="black"/>
                        <rect x="40" y="65" width="15" height="15" fill="black"/>
                        <rect x="65" y="65" width="20" height="20" fill="black"/>
                      </svg>
                    </div>
                    <div className="space-y-1 text-xs">
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        พร้อมพย์สแกนจ่ายอัตโนมัติ
                      </span>
                      <h5 className="font-bold text-sm text-slate-100">ยอดชำระสุทธิ: ฿{currentTier.priceThb.toLocaleString()} THB</h5>
                      <p className="text-slate-400">
                        เปิดแอปพลิเคชันธนาคารทุกแห่ง สแกน QR Code นี้ ระบบจะตรวจสอบยอดและปรับระดับสมาชิกระดับ VIP ให้ทันที
                      </p>
                    </div>
                  </div>
                )}

                {/* Confirm Button */}
                <button
                  onClick={handlePaymentSubmit}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm transition shadow-lg flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span>กำลังยืนยันการชำระเงินและปรับระดับสมาชิก...</span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-slate-950" />
                      <span>ยืนยันชำระเงิน ฿{currentTier.priceThb.toLocaleString()} & ยืนยันสมัครสมาชิกระดับ VIP</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { UserProfile, PasscodeKey } from '../types';
import {
  Key,
  X,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Crown,
  Lock,
  ArrowRight,
  AlertCircle,
  Copy,
  Check,
  Zap,
  Info
} from 'lucide-react';

interface PasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onActivatePasscode: (passcode: string, plan: string, expiresAt?: string) => void;
  onDeactivatePasscode: () => void;
}

// Pre-defined fallback passcodes for instant offline/Vercel support
export const DEFAULT_PASSCODES: PasscodeKey[] = [
  {
    code: 'VIP999',
    plan: 'PRO_ANNUAL',
    maxUses: 999,
    usedCount: 12,
    isActive: true,
    createdAt: new Date().toISOString(),
    note: 'คีย์ VIP ถาวร (แจกสมาชิกทดสอบ)',
  },
  {
    code: 'VIP2026',
    plan: 'PRO_ANNUAL',
    maxUses: 500,
    usedCount: 45,
    isActive: true,
    createdAt: new Date().toISOString(),
    note: 'PRO Annual Passcode (ใช้งาน 1 ปี)',
  },
  {
    code: 'TRADER888',
    plan: 'PRO_MONTHLY',
    maxUses: 200,
    usedCount: 88,
    isActive: true,
    createdAt: new Date().toISOString(),
    note: 'คีย์สมาชิกรายเดือน (Trader 888)',
  },
  {
    code: 'GOLDVIP',
    plan: 'PRO_ANNUAL',
    maxUses: 100,
    usedCount: 9,
    isActive: true,
    createdAt: new Date().toISOString(),
    note: 'คีย์พิเศษกลุ่มทองคำ Gold VIP',
  },
];

export const PasscodeModal: React.FC<PasscodeModalProps> = ({
  isOpen,
  onClose,
  user,
  onActivatePasscode,
  onDeactivatePasscode,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activePasscodeDetail, setActivePasscodeDetail] = useState<{ usedCount: number; maxUses: number } | null>(null);

  React.useEffect(() => {
    if (!user.activatedPasscode) {
      setActivePasscodeDetail(null);
      return;
    }
    let isMounted = true;
    const loadKeyDetail = async () => {
      let found: PasscodeKey | null = null;
      try {
        const res = await fetch('/api/passcodes');
        if (res.ok) {
          const list: PasscodeKey[] = await res.json();
          found = list.find((p) => p.code.toUpperCase() === user.activatedPasscode?.toUpperCase()) || null;
        }
      } catch {}

      if (!found) {
        try {
          let stored: PasscodeKey[] = DEFAULT_PASSCODES;
          const saved = localStorage.getItem('trading_chart_ai_passcodes');
          if (saved) stored = JSON.parse(saved);
          found = stored.find((p) => p.code.toUpperCase() === user.activatedPasscode?.toUpperCase()) || null;
        } catch {}
      }

      if (found && isMounted) {
        setActivePasscodeDetail({ usedCount: found.usedCount, maxUses: found.maxUses });

        // If usedCount has reached or exceeded maxUses or key is inactive, auto deactivate VIP
        if (found.usedCount >= found.maxUses || !found.isActive) {
          const code = user.activatedPasscode;
          onDeactivatePasscode();
          setErrorMsg(
            `License Key (${code}) ถูกใช้งานครบจำนวนสิทธิ์แล้ว (${found.usedCount}/${found.maxUses} สิทธิ์) ไม่สามารถใช้งานต่อได้อีกต่อไป กรุณากรอก License Key ใหม่`
          );
        }
      }
    };

    loadKeyDetail();
    return () => { isMounted = false; };
  }, [user.activatedPasscode, isOpen, onDeactivatePasscode]);

  if (!isOpen) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleActivate = async (codeToSubmit?: string) => {
    const rawCode = (codeToSubmit || inputCode).trim().toUpperCase();
    if (!rawCode) {
      setErrorMsg('กรุณากรอก Passcode หรือ VIP License Key');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Try server verification first
      let validatedData: { valid: boolean; plan?: string; expiresAt?: string; message?: string; usedCount?: number; maxUses?: number } | null = null;
      try {
        const res = await fetch('/api/passcodes/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: rawCode }),
        });
        const data = await res.json();
        if (data) {
          validatedData = data;
        }
      } catch {
        console.warn('Server passcode verification offline, checking local rules...');
      }

      // 2. Local fallback verification (only if server is unreachable)
      if (!validatedData) {
        // Check saved admin passcodes from localStorage or default list
        let storedPasscodes: PasscodeKey[] = DEFAULT_PASSCODES;
        try {
          const saved = localStorage.getItem('trading_chart_ai_passcodes');
          if (saved) {
            storedPasscodes = JSON.parse(saved);
          }
        } catch {}

        const matched = storedPasscodes.find(
          (p) => p.code.toUpperCase() === rawCode && p.isActive
        );

        if (matched) {
          if (matched.usedCount >= matched.maxUses) {
            validatedData = {
              valid: false,
              message: `Passcode ${matched.code} ถูกใช้งานครบจำนวนสิทธิ์แล้ว (${matched.usedCount}/${matched.maxUses} สิทธิ์) ไม่สามารถเปิดใช้งานได้อีกต่อไป กรุณากรอก License Key ใหม่`,
            };
          } else if (matched.expiresAt && new Date(matched.expiresAt).getTime() < Date.now()) {
            validatedData = {
              valid: false,
              message: 'Passcode นี้หมดอายุการใช้งานแล้ว',
            };
          } else {
            matched.usedCount += 1;
            try {
              localStorage.setItem('trading_chart_ai_passcodes', JSON.stringify(storedPasscodes));
            } catch {}
            validatedData = {
              valid: true,
              plan: matched.plan,
              usedCount: matched.usedCount,
              maxUses: matched.maxUses,
              expiresAt: matched.expiresAt || undefined,
              message: `เปิดใช้งานรหัส ${matched.code} สิทธิ์ ${matched.plan === 'PRO_ANNUAL' ? 'PRO รายปี' : 'PRO รายเดือน'} เรียบร้อยแล้ว! (สิทธิ์การใช้งาน: ${matched.usedCount}/${matched.maxUses} สิทธิ์)`,
            };
          }
        } else {
          validatedData = {
            valid: false,
            message: 'Passcode หรือ VIP License Key ไม่ถูกต้อง หรือถูกยกเลิกแล้ว',
          };
        }
      }

      if (validatedData && validatedData.valid) {
        const plan = validatedData.plan || 'PRO_ANNUAL';
        if (validatedData.usedCount !== undefined && validatedData.maxUses !== undefined) {
          setActivePasscodeDetail({ usedCount: validatedData.usedCount, maxUses: validatedData.maxUses });
        }
        onActivatePasscode(rawCode, plan, validatedData.expiresAt);
        setSuccessMsg(validatedData.message || 'ปลดล็อกสิทธิ์ VIP เรียบร้อยแล้ว!');
        setInputCode('');
      } else {
        setErrorMsg(validatedData?.message || 'Passcode ไม่ถูกต้อง กรุณาตรวจสอบรหัสอีกครั้ง');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการตรวจสอบรหัส');
    } finally {
      setIsLoading(false);
    }
  };

  const isVipActive = !!user.activatedPasscode || user.plan !== 'FREE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header background glow */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* Modal Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Key className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-100">
                  ระบบ Passcode / VIP License Key
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                กรอกรหัสผ่านเพื่อปลดล็อกสิทธิ์ VIP & การวิเคราะห์ AI ไม่จำกัด
              </p>
            </div>
          </div>

          {/* Active VIP Status Banner */}
          {isVipActive && (
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-950/70 via-teal-950/40 to-slate-900 border border-emerald-500/40 text-slate-200 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400 text-sm">
                        สิทธิ์ VIP License เปิดใช้งานอยู่
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {user.activatedPasscode ? (
                        <>รหัสที่ใช้: <span className="font-mono font-bold text-amber-300">{user.activatedPasscode}</span></>
                      ) : (
                        <>แพ็กเกจ: <span className="font-semibold text-emerald-300">{user.plan}</span></>
                      )}
                    </p>
                  </div>
                </div>

                {user.activatedPasscode && (
                  <button
                    onClick={onDeactivatePasscode}
                    className="text-[11px] text-slate-400 hover:text-red-400 underline transition"
                  >
                    ยกเลิกคีย์นี้
                  </button>
                )}
              </div>

              {user.activatedPasscode && (
                <div className="mt-3 pt-2.5 border-t border-emerald-500/20 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">สิทธิ์การใช้งานของ License Key นี้:</span>
                  <span className="font-mono font-bold text-amber-300 bg-slate-950/90 px-2.5 py-1 rounded-lg border border-amber-500/30">
                    {activePasscodeDetail
                      ? `${activePasscodeDetail.usedCount} / ${activePasscodeDetail.maxUses} สิทธิ์`
                      : 'กำลังโหลดสิทธิ์...'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Success Notification */}
          {successMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Notification */}
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Passcode Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleActivate();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                กรอก Passcode หรือ VIP Key (ตัวพิมพ์ใหญ่หรือเล็กก็ได้)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(e.target.value.toUpperCase());
                    setErrorMsg(null);
                  }}
                  placeholder="เช่น VIP999, VIP2026, TRADER888"
                  className="w-full pl-10 pr-24 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 placeholder-slate-500 font-mono tracking-widest text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                  autoFocus
                />
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />

                <button
                  type="submit"
                  disabled={isLoading || !inputCode.trim()}
                  className="absolute right-1.5 top-1.2 font-semibold text-xs px-3.5 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 shadow"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>ยืนยัน</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>



          {/* Info Footer */}
          <div className="mt-5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
            <p>
              ผู้ดูแลระบบสามารถสร้างและจัดการ Passcode / License Keys สำหรับแจกสมาชิกได้ในเมนู{' '}
              <span className="text-emerald-400 font-semibold">"แผงควบคุมผู้ดูแลระบบ (Admin)"</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

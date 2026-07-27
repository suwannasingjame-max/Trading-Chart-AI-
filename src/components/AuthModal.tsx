import React, { useState, useEffect } from 'react';
import { UserProfile, SubscriptionPlanType } from '../types';
import { User, LogIn, UserPlus, X, Mail, Lock, ShieldCheck, Key, Check, HelpCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onLoginSuccess: (userData: { id?: string; name: string; email: string; plan?: SubscriptionPlanType; apiKey?: string }) => void;
  onUpdateApiKey?: (apiKey: string) => void;
  onLogout: () => void;
  isMandatory?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onLoginSuccess,
  onUpdateApiKey,
  onLogout,
  isMandatory = false,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [customApiKey, setCustomApiKey] = useState(user.apiKey || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedKeySuccess, setSavedKeySuccess] = useState(false);

  useEffect(() => {
    if (user.apiKey) {
      setCustomApiKey(user.apiKey);
    }
  }, [user.apiKey]);

  if (!isOpen && !isMandatory) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      return;
    }

    if (isRegister && password.length < 4) {
      setErrorMsg('กรุณาตั้งรหัสผ่านอย่างน้อย 4 ตัวอักษร');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'การดำเนินการล้มเหลว กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง');
        return;
      }

      if (data.user) {
        onLoginSuccess({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          plan: data.user.plan,
          apiKey: customApiKey.trim(),
        });
        onClose();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUserApiKey = () => {
    if (onUpdateApiKey) {
      onUpdateApiKey(customApiKey.trim());
      setSavedKeySuccess(true);
      setTimeout(() => setSavedKeySuccess(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          title="ปิดหน้าต่าง"
        >
          <X className="w-5 h-5" />
        </button>

        {user.isLoggedIn ? (
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center font-bold text-xl">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h3 className="font-bold text-lg text-slate-100">{user.name}</h3>
              <p className="text-xs text-slate-400">{user.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                สถานะแผน: {user.plan === 'FREE' ? 'สมาชิกฟรี (Free)' : 'สมาชิก Pro VIP'}
              </div>
            </div>

            {/* Personal Gemini API Key Setting Block */}
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 text-left space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  Google Gemini API Key ของคุณ
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-cyan-400 hover:underline"
                >
                  ขอ Key ฟรีที่นี่ ↗
                </a>
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                ระบุ API Key ส่วนตัวเพื่อใช้โควตาของบัญชีคุณเองโดยตรง (จะถูกบันทึกไว้ในเบราว์เซอร์ของคุณอย่างปลอดภัย)
              </p>
              <button
                type="button"
                onClick={handleSaveUserApiKey}
                className="w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                {savedKeySuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    บันทึก API Key เรียบร้อยแล้ว!
                  </>
                ) : (
                  <>
                    <Key className="w-3.5 h-3.5" />
                    บันทึก API Key ส่วนตัว
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs border border-red-500/20 transition"
              >
                ออกจากระบบ (Logout)
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20 mb-1">
                <Lock className="w-3.5 h-3.5" />
                ยินดีต้อนรับสู่ระบบสมาชิก
              </div>
              <h3 className="text-lg font-extrabold text-slate-100">
                {isRegister ? 'สมัครสมาชิกผู้ใช้งานใหม่' : 'เข้าสู่ระบบบัญชีผู้ใช้'}
              </h3>
              <p className="text-xs text-slate-400">
                เข้าสู่ระบบหรือสมัครสมาชิกเพื่อซิงก์สิทธิ์ Pro VIP และประวัติวิเคราะห์กราฟ
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {isRegister && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    ชื่อผู้ใช้งาน (Name)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required={isRegister}
                      placeholder="เช่น สมชาย สายเทรด"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  อีเมล (Email)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="trader@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  รหัสผ่าน (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Personal Gemini API Key Input (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    Google Gemini API Key (ตัวเลือกเสริม / Optional)
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-cyan-400 hover:underline"
                  >
                    รับ API Key ฟรี
                  </a>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="AIzaSy... (เว้นว่างไว้หากใช้ระบบส่วนกลาง)"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  คุณสามารถใส่ Gemini API Key ส่วนตัวเพื่อใช้โควตาวิเคราะห์ของคุณเองได้ทันที
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition mt-2"
              >
                {isRegister ? 'สร้างบัญชีผู้ใช้ใหม่' : 'เข้าสู่ระบบ'}
              </button>
            </form>

            {/* Quick Demo Login Option */}
            <div className="pt-2 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => {
                  onLoginSuccess({
                    id: 'usr_demo',
                    name: 'Trader Pro (Demo)',
                    email: 'demo.trader@example.com',
                    plan: 'PRO_MONTHLY',
                    apiKey: customApiKey,
                  });
                  onClose();
                }}
                className="text-xs text-emerald-400 font-semibold hover:underline"
              >
                ⚡ เข้าสู่ระบบบัญชีตัวอย่างเดโม (Demo Instant Login)
              </button>
            </div>

            <div className="text-center text-xs text-slate-400">
              {isRegister ? 'มีบัญชีอยู่แล้ว?' : 'ยังไม่มีบัญชี?'}{' '}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-emerald-400 font-bold underline ml-1"
              >
                {isRegister ? 'เข้าสู่ระบบ' : 'สมัครสมาชิกใหม่'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

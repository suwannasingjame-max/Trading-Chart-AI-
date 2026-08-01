import React, { useState, useEffect } from 'react';
import { UserProfile, SubscriptionPlanType } from '../types';
import { User, LogIn, UserPlus, X, Mail, Lock, ShieldCheck, Key, Check, HelpCircle, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onLoginSuccess: (userData: { id?: string; name: string; email: string; plan?: SubscriptionPlanType; apiKey?: string; picture?: string }) => void;
  onUpdateApiKey?: (apiKey: string) => void;
  onLogout: () => void;
  isMandatory?: boolean;
}

const GoogleLogo = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

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
  
  // Google Login Custom Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');

  useEffect(() => {
    if (user.apiKey) {
      setCustomApiKey(user.apiKey);
    }
  }, [user.apiKey]);

  if (!isOpen && !isMandatory) return null;

  const processGoogleAuth = async (googlePayload: { email: string; name?: string; picture?: string; googleId?: string }) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googlePayload),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (e) {
        data = { error: 'การตอบกลับจากระบบไม่ถูกต้อง' };
      }

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'การเข้าสู่ระบบด้วยบัญชี Google ล้มเหลว');
        return;
      }

      if (data.user) {
        onLoginSuccess({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          plan: data.user.plan,
          apiKey: customApiKey.trim(),
          picture: data.user.picture,
        });
        setShowGoogleModal(false);
        onClose();
      }
    } catch (err: any) {
      console.error('Google login fetch error:', err);
      setErrorMsg('เกิดข้อผิดพลาดในการเชื่อมต่อ Google Single Sign-On');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleButtonClick = () => {
    // Attempt Google Identity Services (GSI) Client API if initialized
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: '108821991203-demo.apps.googleusercontent.com',
          callback: (response: any) => {
            if (response.credential) {
              try {
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const payload = JSON.parse(jsonPayload);
                processGoogleAuth({
                  email: payload.email,
                  name: payload.name || payload.given_name,
                  picture: payload.picture,
                  googleId: payload.sub,
                });
                return;
              } catch (e) {
                console.error('JWT parse error', e);
              }
            }
          },
        });
        (window as any).google.accounts.id.prompt();
      } catch (err) {
        console.warn('GSI prompt error', err);
      }
    }

    // Open clean interactive Google Account chooser dialog
    setShowGoogleModal(true);
  };

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
        body: JSON.stringify({
          name: name ? name.trim() : '',
          email: email ? email.trim() : '',
          password
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        data = { error: `เซิร์ฟเวอร์ตอบกลับรหัสสถานะ ${res.status}` };
      }

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'การสมัครสมาชิกหรือเข้าสู่ระบบล้มเหลว กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง');
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
      setErrorMsg(err?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง');
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
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center font-bold text-xl overflow-hidden shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h3 className="font-bold text-lg text-slate-100">{user.name}</h3>
              <p className="text-xs text-slate-400">{user.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                สถานะ: สมาชิกผู้ใช้งานทั่วไป (Standard Account)
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
                ระบุ API Key ส่วนตัวเพื่อใช้โควตาและเครดิตของบัญชีคุณเองโดยตรงในการวิเคราะห์กราฟ
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
                {isRegister ? 'สมัครสมาชิกผู้ใช้งาน' : 'เข้าสู่ระบบบัญชีผู้ใช้'}
              </h3>
              <p className="text-xs text-slate-400">
                เข้าสู่ระบบหรือสมัครสมาชิกด้วย Google หรืออีเมลเพื่อเปิดใช้งาน AI
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Google Sign-In Button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleButtonClick}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-100 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2.5 shadow-md hover:border-slate-500 transition group"
              >
                <GoogleLogo />
                <span>เข้าสู่ระบบด้วยบัญชี Google</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 opacity-80 group-hover:scale-110 transition-transform" />
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-800 w-full"></div>
                <span className="bg-slate-900 px-3 text-[11px] font-medium text-slate-500 whitespace-nowrap">
                  หรือใช้อีเมลและรหัสผ่าน
                </span>
                <div className="border-t border-slate-800 w-full"></div>
              </div>
            </div>

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
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition mt-2 disabled:opacity-50"
              >
                {isRegister ? 'สร้างบัญชีผู้ใช้ใหม่' : 'เข้าสู่ระบบด้วยอีเมล'}
              </button>
            </form>

            {/* Quick Demo Login Option */}
            <div className="pt-2 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => {
                  onLoginSuccess({
                    id: 'usr_demo',
                    name: 'Trader Demo',
                    email: 'demo.trader@example.com',
                    plan: 'FREE',
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

      {/* Google Sign-In Quick Account Chooser Dialog */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 mx-auto flex items-center justify-center shadow-inner">
                <GoogleLogo />
              </div>
              <h4 className="text-base font-extrabold text-slate-100">เลือกบัญชี Google เพื่อเข้าสู่ระบบ</h4>
              <p className="text-xs text-slate-400">
                เลือกบัญชี Google หรือระบุอีเมล Google Account เพื่อเข้าใช้งานทันที
              </p>
            </div>

            {/* Fast 1-Click Popular Google Accounts */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400 block">บัญชี Google ที่พร้อมใช้ในระบบ:</span>
              
              <button
                type="button"
                onClick={() => processGoogleAuth({ email: 'somchai.trader@gmail.com', name: 'สมชาย สายเทรด (Google)' })}
                className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 p-3 rounded-2xl flex items-center gap-3 transition text-left group"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-black text-sm flex items-center justify-center shadow-md">
                  G
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-100 truncate group-hover:text-cyan-300">
                    สมชาย สายเทรด
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">somchai.trader@gmail.com</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => processGoogleAuth({ email: 'user.trader.google@gmail.com', name: 'Trader (Google Account)' })}
                className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 p-3 rounded-2xl flex items-center gap-3 transition text-left group"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-black text-sm flex items-center justify-center shadow-md">
                  G
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-100 truncate group-hover:text-emerald-300">
                    Google Trader User
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">user.trader.google@gmail.com</div>
                </div>
              </button>
            </div>

            {/* Custom Google Email Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (googleEmailInput.trim()) {
                  processGoogleAuth({
                    email: googleEmailInput.trim(),
                    name: googleNameInput.trim() || googleEmailInput.split('@')[0],
                  });
                }
              }}
              className="space-y-2 pt-2 border-t border-slate-800"
            >
              <label className="text-[11px] font-bold text-slate-300 block">
                หรือใช้อีเมล Google อื่นๆ ของคุณ:
              </label>
              <input
                type="email"
                required
                placeholder="your.email@gmail.com"
                value={googleEmailInput}
                onChange={(e) => setGoogleEmailInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
              >
                ยืนยันการเข้าสู่ระบบด้วย Google
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


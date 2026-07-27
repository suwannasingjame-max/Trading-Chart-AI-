import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, LogIn, UserPlus, X, Mail, Lock, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onLoginSuccess: (name: string, email: string) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onLoginSuccess,
  onLogout,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const finalName = name || email.split('@')[0] || 'Trader Pro';
    
    // Sync to backend for Admin Backoffice
    try {
      await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            id: 'usr_' + Date.now(),
            name: finalName,
            email,
            plan: 'FREE',
            dailyAnalysisCount: 0,
            dailyQuotaLimit: 9999,
            isLoggedIn: true,
          },
        }),
      });
    } catch (err) {
      console.error('Failed sync on login', err);
    }

    onLoginSuccess(finalName, email);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {user.isLoggedIn ? (
          <div className="text-center space-y-4 py-4">
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

            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
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
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-extrabold text-slate-100">
                {isRegister ? 'สมัครสมาชิกบัญชีผู้ใช้ใหม่' : 'เข้าสู่ระบบบัญชีผู้ใช้'}
              </h3>
              <p className="text-xs text-slate-400">
                เข้าสู่ระบบเพื่อบันทึกประวัติกราฟและเชื่อมต่อแผนสมาชิกระดับ VIP
              </p>
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

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition mt-2"
              >
                {isRegister ? 'สร้างบัญชีผู้ใช้ใหม่' : 'เข้าสู่ระบบ'}
              </button>
            </form>

            {/* Quick Demo Login Option */}
            <div className="pt-3 border-t border-slate-800 text-center">
              <button
                onClick={() => {
                  onLoginSuccess('Trader Pro', 'demo.trader@example.com');
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

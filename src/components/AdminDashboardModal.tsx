import React, { useState, useEffect } from 'react';
import { PaymentTransaction, AnalysisLogItem, SubscriptionPlanType } from '../types';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  X,
  TrendingUp,
  Crown,
  DollarSign,
  ShieldAlert,
  Sliders,
  Check
} from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatThaiDateTime = (isoString?: string) => {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' น.';
  } catch {
    return isoString;
  }
};

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'PAYMENTS' | 'LOGS'>('USERS');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 4,
    totalVipUsers: 2,
    totalRevenueThb: 5490,
    totalAnalysesCount: 128,
    todayAnalysesCount: 14,
    pendingPaymentsCount: 1,
  });

  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [analysisLogs, setAnalysisLogs] = useState<AnalysisLogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [vipQuickQuery, setVipQuickQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const ADMIN_PIN = 'Pasak167/22';

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN || pinInput === 'Pasak167/22') {
      setIsAuthenticated(true);
      setPinError(false);
      fetchAdminData();
    } else {
      setPinError(true);
    }
  };

  // Fetch admin data from backend
  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes, paymentsRes, logsRes] = await Promise.all([
        fetch('/api/admin/stats').then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch('/api/admin/users').then((r) => (r.ok ? r.json() : [])).catch(() => []),
        fetch('/api/admin/payments').then((r) => (r.ok ? r.json() : [])).catch(() => []),
        fetch('/api/admin/analyses').then((r) => (r.ok ? r.json() : [])).catch(() => []),
      ]);

      if (statsRes && typeof statsRes === 'object') setStats(statsRes);
      if (Array.isArray(usersRes)) setUsers(usersRes);
      if (Array.isArray(paymentsRes)) setPayments(paymentsRes);
      if (Array.isArray(logsRes)) setAnalysisLogs(logsRes);
    } catch (err) {
      console.error('Failed to load admin backoffice data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

  // Handle manual plan change by admin
  const handleUpdateUserPlan = async (userId: string, newPlan: SubscriptionPlanType, targetQuery?: string) => {
    try {
      const res = await fetch('/api/admin/users/update-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, plan: newPlan, targetQuery }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage(data.message || 'อัปเดตสิทธิ์ผู้ใช้งานสำเร็จ');
        setTimeout(() => setToastMessage(null), 4500);
        fetchAdminData();
      } else {
        alert(data.error || 'ไม่สามารถปรับเปลี่ยนสิทธิ์ได้');
      }
    } catch (e) {
      console.error('Failed to update user plan', e);
    }
  };

  // Handle payment approval/rejection
  const handleApprovePayment = async (transactionId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const res = await fetch('/api/admin/payments/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, action }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (e) {
      console.error('Failed to update payment status', e);
    }
  };

  if (!isOpen) return null;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-black text-slate-100 mb-1">
            เข้าสู่ระบบผู้ดูแลหลังบ้าน (Admin Lock)
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            กรุณากรอกรหัสความปลอดภัยเพื่อเข้าสู่ระบบหลังบ้าน
          </p>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="กรอกรหัสผ่านปลอดภัย"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                className={`w-full bg-slate-950 border ${
                  pinError ? 'border-red-500 text-red-300' : 'border-slate-800 text-slate-100'
                } rounded-2xl px-4 py-3 text-center text-lg font-mono tracking-widest focus:outline-none focus:border-emerald-500`}
                maxLength={30}
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-red-400 mt-2 font-medium">
                  รหัสผ่านไม่ถูกต้อง! กรุณาลองใหม่อีกครั้ง
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition shadow-lg shadow-emerald-500/20"
            >
              ปลดล็อกระบบหลังบ้าน
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredUsers = (users || []).filter(
    (u) =>
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayments = (payments || []).filter(
    (p) =>
      (p.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.referenceCode || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = (analysisLogs || []).filter(
    (l) =>
      (l.symbol || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.strategy || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.userName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full p-6 shadow-2xl relative my-auto max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100 flex items-center gap-2">
                ระบบจัดการหลังบ้าน (Admin Backoffice Dashboard)
              </h2>
              <p className="text-xs text-slate-400">
                ตรวจสอบรายชื่อสมาชิก ยอดชำระเงิน ประวัติการสมัคร และกิจกรรม AI Analytics แบบเรียลไทม์
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminData}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">รีเฟรช</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Overview Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 shrink-0">
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-400 block mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-400" /> สมาชิกทั้งหมด
            </span>
            <div className="text-xl font-black text-slate-100">{stats.totalUsers} คน</div>
            <span className="text-[10px] text-slate-500">บัญชีผู้ใช้ในระบบ</span>
          </div>

          <div className="bg-gradient-to-br from-amber-950/40 to-slate-800/60 p-3.5 rounded-2xl border border-amber-500/30">
            <span className="text-[11px] font-bold text-amber-400 block mb-1 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" /> สมาชิก Pro VIP
            </span>
            <div className="text-xl font-black text-amber-300">{stats.totalVipUsers} คน</div>
            <span className="text-[10px] text-amber-400/70">สมาชิกลูกค้าชำระเงิน</span>
          </div>

          <div className="bg-gradient-to-br from-emerald-950/40 to-slate-800/60 p-3.5 rounded-2xl border border-emerald-500/30">
            <span className="text-[11px] font-bold text-emerald-400 block mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> ยอดขายสะสม
            </span>
            <div className="text-xl font-black text-emerald-300">
              ฿{stats.totalRevenueThb.toLocaleString()} THB
            </div>
            <span className="text-[10px] text-emerald-400/70">รายได้จากการสมัครสมาชิก</span>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
            <span className="text-[11px] font-bold text-cyan-400 block mb-1 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> AI วิเคราะห์วันนี้
            </span>
            <div className="text-xl font-black text-cyan-300">{stats.todayAnalysesCount} ครั้ง</div>
            <span className="text-[10px] text-slate-500">รวมทั้งหมด {stats.totalAnalysesCount} ครั้ง</span>
          </div>
        </div>

        {/* Tab Navigation & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('USERS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'USERS'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>รายชื่อสมาชิก ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('PAYMENTS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 relative ${
                activeTab === 'PAYMENTS'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>การชำระเงิน ({payments.length})</span>
              {stats.pendingPaymentsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-1 -right-1" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('LOGS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'LOGS'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>ประวัติ AI ({analysisLogs.length})</span>
            </button>
          </div>

          {activeTab === 'USERS' && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาตามชื่อ หรือ อีเมล..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 w-full sm:w-56"
              />
            </div>
          )}
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {/* TAB 1: USERS LIST */}
          {activeTab === 'USERS' && (
            <div className="space-y-4">
              {/* Toast Feedback Alert */}
              {toastMessage && (
                <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-lg shadow-emerald-500/5 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{toastMessage}</span>
                  </div>
                  <button
                    onClick={() => setToastMessage(null)}
                    className="p-1 text-emerald-400 hover:text-emerald-100 rounded-lg hover:bg-emerald-500/20"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* QUICK PRO VIP MANAGER PANEL */}
              <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shrink-0">
                      <Crown className="w-4 h-4 fill-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-100 flex items-center gap-1.5">
                        ระบบจัดการสิทธิ์ Pro VIP ด้วยชื่อ หรือ อีเมลผู้สมัคร
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        พิมพ์ชื่อหรืออีเมลเพื่อเปิดใช้งานสิทธิ์ Pro VIP หรือยกเลิก/ปิดใช้งานได้ทันที
                      </p>
                    </div>
                  </div>
                </div>

                {/* Input & Quick Action Bar */}
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-amber-400/80 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="พิมพ์ชื่อ (เช่น สมชาย) หรือ อีเมลผู้สมัคร..."
                      value={vipQuickQuery}
                      onChange={(e) => setVipQuickQuery(e.target.value)}
                      className="w-full bg-slate-950/90 border border-amber-500/30 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium"
                    />
                    {vipQuickQuery && (
                      <button
                        onClick={() => setVipQuickQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={!vipQuickQuery.trim()}
                      onClick={() => handleUpdateUserPlan('', 'PRO_MONTHLY', vipQuickQuery)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
                    >
                      <Crown className="w-3.5 h-3.5 fill-slate-950" />
                      <span>เปิดใช้งาน Pro VIP</span>
                    </button>

                    <button
                      disabled={!vipQuickQuery.trim()}
                      onClick={() => handleUpdateUserPlan('', 'FREE', vipQuickQuery)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
                    >
                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                      <span>ปิดใช้งาน (ปรับเป็น Free)</span>
                    </button>
                  </div>
                </div>

                {/* Realtime Search Preview */}
                {vipQuickQuery.trim() && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <div className="text-[10px] text-amber-300/80 font-bold flex items-center gap-1">
                      <span>ผลการค้นหาสมาชิกที่ตรงกัน:</span>
                    </div>

                    {users.filter(
                      (u) =>
                        (u.name || '').toLowerCase().includes(vipQuickQuery.toLowerCase()) ||
                        (u.email || '').toLowerCase().includes(vipQuickQuery.toLowerCase())
                    ).length === 0 ? (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center justify-between flex-wrap gap-2">
                        <span>ไม่พบผู้ใช้งานชื่อ/อีเมล "{vipQuickQuery}" ในรายชื่อปัจจุบัน</span>
                        <button
                          onClick={() => handleUpdateUserPlan('', 'PRO_MONTHLY', vipQuickQuery)}
                          className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition"
                        >
                          + เพิ่มและเปิดสิทธิ์ Pro VIP ให้ทันที
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {users
                          .filter(
                            (u) =>
                              (u.name || '').toLowerCase().includes(vipQuickQuery.toLowerCase()) ||
                              (u.email || '').toLowerCase().includes(vipQuickQuery.toLowerCase())
                          )
                          .map((u) => {
                            const isVip = u.plan !== 'FREE';
                            return (
                              <div
                                key={u.id}
                                className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-700">
                                    {u.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="text-xs font-bold text-slate-100">{u.name}</span>
                                    <span className="text-[10px] font-mono text-slate-400 ml-2">({u.email})</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isVip ? (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30">
                                      Pro VIP
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-medium border border-slate-700">
                                      FREE
                                    </span>
                                  )}

                                  {isVip ? (
                                    <button
                                      onClick={() => handleUpdateUserPlan(u.id, 'FREE')}
                                      className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-[10px] font-bold border border-red-500/30"
                                    >
                                      ปิดใช้งาน (เป็น Free)
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUpdateUserPlan(u.id, 'PRO_MONTHLY')}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-bold border border-emerald-500/30"
                                    >
                                      เปิดใช้งาน Pro VIP
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">ชื่อสมาชิก & อีเมล</th>
                      <th className="p-3">วันเวลาที่สมัครสมาชิก</th>
                      <th className="p-3">วันเวลาเข้าใช้งานล่าสุด</th>
                      <th className="p-3">สถานะแผน</th>
                      <th className="p-3">โควตาวิเคราะห์</th>
                      <th className="p-3 text-right">ปรับเปลี่ยนสิทธิ์</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-500">
                          ไม่พบข้อมูลสมาชิก
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isVip = u.plan !== 'FREE';
                        return (
                          <tr key={u.id} className="hover:bg-slate-800/40">
                            <td className="p-3">
                              <div className="font-bold text-slate-100 flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-700">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-slate-100">{u.name}</div>
                                  <div className="text-[10px] font-mono text-slate-400">{u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 font-mono text-slate-300 text-[11px]">
                              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                                {formatThaiDateTime(u.joinedAt)}
                              </div>
                            </td>
                            <td className="p-3 font-mono text-slate-300 text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-emerald-300 font-semibold">{formatThaiDateTime(u.lastActive)}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              {isVip ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-500/30">
                                  <Crown className="w-3 h-3 fill-amber-400" />
                                  {u.plan === 'PRO_ANNUAL' ? 'Pro VIP (รายปี)' : 'Pro VIP (รายเดือน)'}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold border border-slate-700">
                                  FREE (สมาชิกฟรี)
                                </span>
                              )}
                            </td>
                            <td className="p-3 font-mono">
                              <span className="text-emerald-400 font-bold">{u.dailyAnalysisCount}</span>
                              <span className="text-slate-500"> / {u.dailyQuotaLimit > 900 ? '∞' : u.dailyQuotaLimit}</span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {u.plan === 'FREE' ? (
                                  <button
                                    onClick={() => handleUpdateUserPlan(u.id, 'PRO_MONTHLY')}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold border border-emerald-500/30"
                                  >
                                    + ปรับเป็น VIP
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUpdateUserPlan(u.id, 'FREE')}
                                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-semibold border border-slate-700"
                                  >
                                    - ปรับเป็น Free
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: PAYMENTS LIST */}
          {activeTab === 'PAYMENTS' && (
            <div className="space-y-3">
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">รหัสสลิป/อ้างอิง</th>
                      <th className="p-3">ชื่อลูกค้า</th>
                      <th className="p-3">วันเวลาที่ชำระเงิน</th>
                      <th className="p-3">แผนสมาชิก</th>
                      <th className="p-3">ยอดเงิน (บาท)</th>
                      <th className="p-3">ช่องทาง</th>
                      <th className="p-3">สถานะ</th>
                      <th className="p-3 text-right">การอนุมัติ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-slate-500">
                          ยังไม่มีประวัติการชำระเงิน
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono text-emerald-400 font-bold">{tx.referenceCode}</td>
                          <td className="p-3 font-bold text-slate-100">
                            <div>{tx.userName}</div>
                            <span className="text-[10px] font-normal text-slate-400">{tx.userEmail}</span>
                          </td>
                          <td className="p-3 font-mono text-slate-300 text-[11px]">
                            {formatThaiDateTime(tx.timestamp)}
                          </td>
                          <td className="p-3 font-semibold text-slate-200">
                            {tx.plan === 'PRO_ANNUAL' ? 'Pro VIP (รายปี)' : 'Pro VIP (รายเดือน)'}
                          </td>
                          <td className="p-3 font-black text-slate-100">฿{tx.amountThb.toLocaleString()}</td>
                          <td className="p-3 text-slate-400 font-medium">
                            {tx.method === 'PROMPTPAY' ? 'QR PromptPay' : 'Credit Card'}
                          </td>
                          <td className="p-3">
                            {tx.status === 'APPROVED' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                <CheckCircle2 className="w-3 h-3" /> ชำระเรียบร้อย
                              </span>
                            ) : tx.status === 'PENDING' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
                                <Clock className="w-3 h-3" /> รอตรวจสอบสลิป
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                                <XCircle className="w-3 h-3" /> ไม่ผ่าน
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {tx.status === 'PENDING' && (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleApprovePayment(tx.id, 'APPROVE')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-black hover:bg-emerald-400 transition"
                                >
                                  อนุมัติทันที
                                </button>
                                <button
                                  onClick={() => handleApprovePayment(tx.id, 'REJECT')}
                                  className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 text-[10px]"
                                >
                                  ปฏิเสธ
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ANALYSIS LOGS */}
          {activeTab === 'LOGS' && (
            <div className="space-y-3">
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">วันเวลาวิเคราะห์</th>
                      <th className="p-3">ผู้ใช้งาน</th>
                      <th className="p-3">ชื่อคู่เงิน / สินทรัพย์</th>
                      <th className="p-3">ระบบการเทรด</th>
                      <th className="p-3">สัญญาณ (Signal)</th>
                      <th className="p-3">ความมั่นใจ (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-500">
                          ยังไม่มีบันทึกกิจกรรม AI
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-800/40">
                          <td className="p-3 text-slate-300 font-mono text-[11px]">
                            {formatThaiDateTime(log.timestamp)}
                          </td>
                          <td className="p-3 font-semibold text-slate-200">{log.userName || 'สมาชิก'}</td>
                          <td className="p-3 font-bold text-slate-100">{log.symbol}</td>
                          <td className="p-3 font-mono text-cyan-400">{log.strategy}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                log.signal === 'BUY'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : log.signal === 'SELL'
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {log.signal}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-200">{log.confidenceScore}%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span> Trading Chart AI Analytics Server • Real-time Backoffice Sync</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition"
          >
            ปิดหน้าจอหลังบ้าน
          </button>
        </div>
      </div>
    </div>
  );
};

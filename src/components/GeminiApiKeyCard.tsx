import React, { useState, useEffect } from 'react';
import { Key, Check, ExternalLink, ShieldCheck, Eye, EyeOff, Sparkles } from 'lucide-react';

interface GeminiApiKeyCardProps {
  apiKey: string;
  onSaveApiKey: (newKey: string) => void;
  onOpenPasscode?: () => void;
}

export const GeminiApiKeyCard: React.FC<GeminiApiKeyCardProps> = ({
  apiKey,
  onSaveApiKey,
  onOpenPasscode,
}) => {
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setInputKey(apiKey || '');
  }, [apiKey]);

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleClear = () => {
    setInputKey('');
    onSaveApiKey('');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const hasKey = Boolean(inputKey && inputKey.trim().length > 10);

  return (
    <div id="gemini-key-section" className="bg-slate-900/90 rounded-2xl p-4.5 border border-amber-500/30 shadow-lg space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <span>Google Gemini API Key ของคุณ</span>
              {hasKey ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  พร้อมใช้งาน (Key ส่วนตัว)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  จำเป็นต้องระบุ (ไม่มีโควตาส่วนกลาง)
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {hasKey
                ? 'ระบบจะใช้ Gemini API Key และเครดิตบัญชี Google Gemini ของคุณโดยเฉพาะในการวิเคราะห์'
                : 'กรุณาใส่ API Key ส่วนตัวเพื่อวิเคราะห์กราฟ (ใช้เครดิตและโควตาบัญชีของคุณเองแบบของใครของมัน)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenPasscode && (
            <button
              type="button"
              onClick={onOpenPasscode}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 shrink-0 bg-amber-950/50 hover:bg-amber-900/60 px-2.5 py-1 rounded-lg border border-amber-700/60 transition shadow-sm"
            >
              <Key className="w-3 h-3 text-amber-400" />
              <span>🔑 กรอก Passcode / VIP Key</span>
            </button>
          )}

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 hover:underline shrink-0 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-800/50 transition"
          >
            <span>รับ API Key ฟรีที่ Google AI Studio</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
        <div className="relative flex-1">
          <input
            type={showKey ? 'text' : 'password'}
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="วาง Gemini API Key ของคุณที่นี่ (เช่น AIzaSy...)"
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-3.5 pr-10 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
            title={showKey ? 'ซ่อน API Key' : 'แสดง API Key'}
          >
            {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-slate-950" />
                <span>บันทึกแล้ว!</span>
              </>
            ) : (
              <>
                <Key className="w-3.5 h-3.5 text-slate-950" />
                <span>บันทึก Key</span>
              </>
            )}
          </button>

          {hasKey && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 text-xs font-semibold border border-slate-700 transition"
              title="ล้างข้อมูล API Key"
            >
              ลบ
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

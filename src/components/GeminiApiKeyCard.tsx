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
    <div id="gemini-key-section" className="bg-gradient-to-br from-[#180e35] via-[#120a2a] to-[#1c0f3c] rounded-2xl p-4.5 border-2 border-yellow-500/40 shadow-xl space-y-3 relative overflow-hidden">
      {/* Ambient yellow accent glow */}
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-yellow-400 text-purple-950 font-black shadow-md shadow-yellow-500/20">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2 flex-wrap">
              <span>Google Gemini API Key ของคุณ</span>
              {hasKey ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-yellow-400 text-purple-950 border border-yellow-300 flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3 h-3 text-purple-950" />
                  พร้อมใช้งาน (Key ส่วนตัว)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                  จำเป็นต้องระบุ (ไม่มีโควตาส่วนกลาง)
                </span>
              )}
            </h3>
            <p className="text-[11px] text-yellow-200/80 mt-0.5">
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
              className="inline-flex items-center gap-1 text-[11px] font-black text-purple-950 shrink-0 bg-yellow-400 hover:bg-yellow-300 px-3 py-1.5 rounded-lg border border-yellow-300 transition shadow-md"
            >
              <Key className="w-3 h-3 text-purple-950" />
              <span>🔑 กรอก Passcode / VIP Key</span>
            </button>
          )}

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-yellow-300 hover:text-yellow-200 hover:underline shrink-0 bg-purple-900/80 hover:bg-purple-800 px-3 py-1.5 rounded-lg border border-purple-700 transition"
          >
            <span>รับ API Key ฟรีที่ Google AI Studio</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1 relative z-10">
        <div className="relative flex-1">
          <input
            type={showKey ? 'text' : 'password'}
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="วาง Gemini API Key ของคุณที่นี่ (เช่น AIzaSy...)"
            className="w-full bg-[#090514] border border-yellow-500/40 focus:border-yellow-400 rounded-xl pl-3.5 pr-10 py-2 text-xs text-slate-100 placeholder-yellow-200/40 focus:outline-none transition shadow-inner"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-yellow-400 hover:text-yellow-300 p-1"
            title={showKey ? 'ซ่อน API Key' : 'แสดง API Key'}
          >
            {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-purple-950 font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 border border-yellow-300"
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-purple-950" />
                <span>บันทึกแล้ว!</span>
              </>
            ) : (
              <>
                <Key className="w-3.5 h-3.5 text-purple-950" />
                <span>บันทึก Key</span>
              </>
            )}
          </button>

          {hasKey && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 rounded-xl bg-purple-950 hover:bg-purple-900 text-yellow-300 hover:text-red-400 text-xs font-bold border border-purple-800 transition"
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

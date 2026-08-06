import React, { useRef, useState } from 'react';
import { ChartImageInput, AnalysisMode } from '../types';
import { SAMPLE_PRESETS, SCALPING_SAMPLE_PRESETS, SamplePreset } from '../data/samplePresets';
import { Upload, Image as ImageIcon, Trash2, Eye, Sparkles, CheckCircle2, Zap, Target } from 'lucide-react';

interface ChartUploaderProps {
  images: ChartImageInput;
  onChangeImages: (images: ChartImageInput) => void;
  onSelectPreset: (preset: SamplePreset) => void;
  analysisMode: AnalysisMode;
  onChangeAnalysisMode: (mode: AnalysisMode) => void;
}

interface TimeframeConfig {
  key: keyof ChartImageInput;
  title: string;
  badge: string;
  role: string;
  bgGrad: string;
  borderColor: string;
}

const STANDARD_TIMEFRAMES: TimeframeConfig[] = [
  {
    key: 'h4Image',
    title: 'TF H4 (4-Hour)',
    badge: 'Higher Timeframe',
    role: 'วิเคราะห์โครงสร้างใหญ่ (Macro Structure) & Trend หลัก',
    bgGrad: 'from-amber-500/10 to-orange-500/5',
    borderColor: 'border-amber-500/30',
  },
  {
    key: 'h1Image',
    title: 'TF H1 (1-Hour)',
    badge: 'Intermediate Timeframe',
    role: 'วิเคราะห์โซนสำคัญ (Order Block, FVG, Pattern, ChoCH)',
    bgGrad: 'from-blue-500/10 to-indigo-500/5',
    borderColor: 'border-blue-500/30',
  },
  {
    key: 'm15Image',
    title: 'TF M15 (15-Minute)',
    badge: 'Lower Timeframe',
    role: 'วิเคราะห์จุดเข้าเทรดจริง (Entry Trigger, SL, TP)',
    bgGrad: 'from-emerald-500/10 to-teal-500/5',
    borderColor: 'border-emerald-500/30',
  },
];

const SCALPING_TIMEFRAMES: TimeframeConfig[] = [
  {
    key: 'h4Image',
    title: 'TF H4 (4-Hour)',
    badge: 'Macro Trend & Structure',
    role: 'วิเคราะห์โครงสร้างใหญ่และเทรนด์หลักภาพกว้าง คุมทิศทางราคา',
    bgGrad: 'from-amber-500/10 to-orange-500/5',
    borderColor: 'border-amber-500/30',
  },
  {
    key: 'h1Image',
    title: 'TF H1 (1-Hour)',
    badge: 'Primary Trend & Level',
    role: 'วิเคราะห์กรอบราคาและแนวรับแนวต้าน/Order Block ระดับชั่วโมง',
    bgGrad: 'from-blue-500/10 to-indigo-500/5',
    borderColor: 'border-blue-500/30',
  },
  {
    key: 'm30Image',
    title: 'TF M30 (30-Minute)',
    badge: 'Key Zone คุมราคา',
    role: 'วิเคราะห์โซน Supply/Demand และจุดพักตัวภาพกลาง M30',
    bgGrad: 'from-purple-500/10 to-indigo-500/5',
    borderColor: 'border-purple-500/30',
  },
  {
    key: 'm15Image',
    title: 'TF M15 (15-Minute)',
    badge: 'Pullback & Setup Zone',
    role: 'วิเคราะห์จุดย่อเด้งตามเทรนด์หลัก & FVG/Order Block M15',
    bgGrad: 'from-cyan-500/10 to-blue-500/5',
    borderColor: 'border-cyan-500/30',
  },
  {
    key: 'm5Image',
    title: 'TF M5 (5-Minute)',
    badge: 'Micro Trigger Zone',
    role: 'วิเคราะห์การกลับตัวย่อย Micro ChoCH/OB เพื่อเตรียมเข้าเทรด',
    bgGrad: 'from-teal-500/10 to-emerald-500/5',
    borderColor: 'border-teal-500/30',
  },
  {
    key: 'm1Image',
    title: '⚡ TF M1 (1-Min Sniper Entry)',
    badge: 'Precision Trigger M1',
    role: 'จุดเข้าเทรด M1 คมกริบ โดนลากน้อยที่สุด เน้นกำไร R:R สูงสุด (Sniper Entry M1)',
    bgGrad: 'from-emerald-500/20 via-teal-500/10 to-emerald-500/5',
    borderColor: 'border-emerald-500/50',
  },
];

export const ChartUploader: React.FC<ChartUploaderProps> = ({
  images,
  onChangeImages,
  onSelectPreset,
  analysisMode,
  onChangeAnalysisMode,
}) => {
  const [activePreview, setActivePreview] = useState<{ title: string; url: string } | null>(null);
  const [dragActiveTF, setDragActiveTF] = useState<string | null>(null);

  const isScalping = analysisMode === 'SCALPING';
  const currentTfConfigs = isScalping ? SCALPING_TIMEFRAMES : STANDARD_TIMEFRAMES;
  const currentPresets = isScalping ? SCALPING_SAMPLE_PRESETS : SAMPLE_PRESETS;

  const fileInputRefs = {
    h4Image: useRef<HTMLInputElement>(null),
    h1Image: useRef<HTMLInputElement>(null),
    m30Image: useRef<HTMLInputElement>(null),
    m15Image: useRef<HTMLInputElement>(null),
    m5Image: useRef<HTMLInputElement>(null),
    m1Image: useRef<HTMLInputElement>(null),
  };

  const handleFileChange = (tfKey: keyof ChartImageInput, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น (PNG, JPG, WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onChangeImages({
        ...images,
        [tfKey]: dataUrl,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (tfKey: keyof ChartImageInput, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveTF(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(tfKey, e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (tfKey: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveTF(tfKey);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveTF(null);
  };

  const handleRemove = (tfKey: keyof ChartImageInput) => {
    onChangeImages({
      ...images,
      [tfKey]: null,
    });
  };

  // Count uploaded images
  const uploadedCount = currentTfConfigs.filter((tf) => Boolean(images[tf.key])).length;

  return (
    <div className="bg-gradient-to-br from-[#180e35] via-[#120a2a] to-[#1c0f3c] rounded-2xl p-5 border-2 border-yellow-500/40 shadow-2xl backdrop-blur-sm space-y-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-16 -left-16 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Mode Switcher Bar */}
      <div className="bg-[#0b0618]/90 p-3 rounded-xl border border-yellow-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-yellow-300 flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            เลือกโหมดการวิเคราะห์:
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onChangeAnalysisMode('STANDARD')}
            className={`px-3.5 py-2 rounded-lg text-xs font-black transition flex items-center justify-center gap-2 border ${
              !isScalping
                ? 'bg-yellow-400 text-purple-950 border-yellow-300 shadow-md shadow-yellow-500/30 ring-2 ring-yellow-400/50'
                : 'bg-purple-950/80 text-yellow-300/80 border-purple-800 hover:bg-purple-900 hover:text-yellow-300'
            }`}
          >
            <Target className={`w-4 h-4 ${!isScalping ? 'text-purple-950' : 'text-yellow-400'}`} />
            <span>🎯 โหมดมาตรฐาน (H4, H1, M15)</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeAnalysisMode('SCALPING')}
            className={`px-3.5 py-2 rounded-lg text-xs font-black transition flex items-center justify-center gap-2 border ${
              isScalping
                ? 'bg-yellow-400 text-purple-950 border-yellow-300 shadow-lg shadow-yellow-500/40 ring-2 ring-yellow-400'
                : 'bg-purple-950/80 text-yellow-300/80 border-purple-800 hover:bg-purple-900 hover:text-yellow-300'
            }`}
          >
            <Zap className={`w-4 h-4 ${isScalping ? 'text-purple-950 animate-pulse' : 'text-yellow-400'}`} />
            <span>⚡ โหมดเทรดสายซิ่ง (6 TF: H4 - M1)</span>
          </button>
        </div>
      </div>

      {/* Header & Quick Preset Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-yellow-500/30 relative z-10">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-yellow-400 text-purple-950 text-xs font-black shadow-md shadow-yellow-500/30">
              2
            </span>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>
                {isScalping
                  ? 'อัปโหลดรูปภาพกราฟสายซิ่ง (6 Timeframes: H4, H1, M30, M15, M5, M1)'
                  : 'อัปโหลดรูปภาพกราฟ 3 Timeframe (H4, H1, M15)'}
              </span>
              {isScalping && (
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-yellow-400 text-purple-950 border border-yellow-300 shadow-sm">
                  ⚡ 6-TF Full Analysis + Entry M1
                </span>
              )}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-yellow-400 text-purple-950 border border-yellow-300 shadow-sm">
              อัปโหลดแล้ว {uploadedCount}/{currentTfConfigs.length}
            </span>
          </div>
          <p className="text-xs text-yellow-200/90 mt-1">
            {isScalping
              ? 'แนบรูปภาพกราฟครบทุกกรอบเวลา H4, H1, M30, M15, M5 และ M1 เพื่อวิเคราะห์ทิศทางและจุดเข้าสไนเปอร์ M1 ที่คมกริบที่สุด'
              : 'ลากและวางรูปภาพภาพกราฟ TradingView / MetaTrader หรือแนบไฟล์แยกตาม Timeframe'}
          </p>
        </div>

        {/* 1-Click Sample Preset Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-yellow-300 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            ทดลองด่วน:
          </span>
          {currentPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className="px-3 py-1 text-xs font-bold rounded-lg bg-yellow-400 hover:bg-yellow-300 text-purple-950 border border-yellow-300 shadow-md transition shrink-0 flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-purple-950" />
              <span>{preset.symbol}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Timeframe Cards Grid */}
      <div className={`grid grid-cols-1 ${isScalping ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-3'} gap-4 relative z-10`}>
        {currentTfConfigs.map((tf) => {
          const imageSrc = images[tf.key];
          const isDragging = dragActiveTF === tf.key;

          return (
            <div
              key={tf.key}
              className={`relative rounded-xl p-3.5 border-2 transition-all duration-200 flex flex-col justify-between ${
                isDragging
                  ? 'border-yellow-400 bg-purple-900/80 scale-[1.02] shadow-xl'
                  : imageSrc
                  ? 'border-yellow-400/80 bg-purple-950/90 shadow-xl shadow-purple-950/80'
                  : `border-yellow-500/30 bg-purple-950/50 hover:border-yellow-400 hover:bg-purple-900/50`
              }`}
              onDragOver={(e) => handleDragOver(tf.key, e)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(tf.key, e)}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-black text-slate-100 block">{tf.title}</span>
                  <span className="text-[10px] font-semibold text-yellow-300">{tf.badge}</span>
                </div>
                {imageSrc ? (
                  <span className="flex items-center gap-1 text-[10px] font-black text-purple-950 bg-yellow-400 px-2.5 py-0.5 rounded-full border border-yellow-300 shadow-sm">
                    <CheckCircle2 className="w-3 h-3 text-purple-950" /> พร้อมวิเคราะห์
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-yellow-200/80 bg-purple-950/90 px-2 py-0.5 rounded-full border border-yellow-500/30">
                    ยังไม่อัปโหลด
                  </span>
                )}
              </div>

              {/* Card Body - Upload or Preview */}
              {imageSrc ? (
                <div className="relative group rounded-lg overflow-hidden border-2 border-yellow-500/50 bg-[#090514] aspect-video flex items-center justify-center my-2 shadow-md">
                  <img
                    src={imageSrc}
                    alt={tf.title}
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-[#090514]/85 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setActivePreview({ title: tf.title, url: imageSrc })}
                      className="p-2 rounded-lg bg-yellow-400 text-purple-950 hover:bg-yellow-300 text-xs font-bold flex items-center gap-1 border border-yellow-300 shadow"
                      title="ดูภาพขยาย"
                    >
                      <Eye className="w-4 h-4 text-purple-950" />
                      <span>ขยาย</span>
                    </button>
                    <button
                      onClick={() => handleRemove(tf.key)}
                      className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 text-xs font-bold flex items-center gap-1 shadow"
                      title="ลบรูปนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>ลบ</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRefs[tf.key].current?.click()}
                  className="cursor-pointer border-2 border-dashed border-yellow-500/40 hover:border-yellow-400 rounded-lg p-5 my-2 text-center transition flex flex-col items-center justify-center gap-2 group min-h-[140px] bg-purple-950/30 hover:bg-purple-900/30"
                >
                  <div className="p-2.5 rounded-xl bg-yellow-400 text-purple-950 font-black shadow-md shadow-yellow-500/20 group-hover:scale-110 transition">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-yellow-200 block group-hover:text-yellow-300">
                      คลิกอัปโหลด หรือลากรูปวางที่นี่
                    </span>
                    <span className="text-[11px] text-yellow-100/70 mt-0.5 block">{tf.role}</span>
                  </div>
                </div>
              )}

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRefs[tf.key]}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(tf.key, e.target.files[0]);
                  }
                }}
              />

              {/* Card Footer Note */}
              <div className="mt-1 pt-2 border-t border-purple-900/60 text-[10px] text-purple-300/70">
                {tf.role}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Image Preview Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-50 bg-[#090514]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#130a2a] border border-purple-800 rounded-2xl max-w-4xl w-full p-4 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-purple-800">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-yellow-400" />
                รูปภาพตัวอย่าง: {activePreview.title}
              </h3>
              <button
                onClick={() => setActivePreview(null)}
                className="px-3 py-1 rounded-lg bg-purple-900 hover:bg-purple-800 text-purple-200 text-xs font-medium border border-purple-700"
              >
                ปิดหน้าต่าง
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 flex items-center justify-center">
              <img
                src={activePreview.url}
                alt={activePreview.title}
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
